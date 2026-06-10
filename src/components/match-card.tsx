"use client";

import { useState, useEffect } from "react";
import { Match, Prediction } from "@/types";
import { getTeamById } from "@/lib/data/teams";
import {
  formatDateAR,
  formatTimeAR,
  getStatusLabel,
  getStatusColor,
  calculatePoints,
  getPointsLabel,
  getPointsBg,
  savePredictionSync,
} from "@/lib/data/utils";
import { getPrediction } from "@/lib/services/predictions.service";
import { savePredictionAction } from "@/lib/actions";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { useRouter, usePathname } from "next/navigation";

interface MatchCardProps {
  match: Match;
  showGroup?: boolean;
  compact?: boolean;
  onPredictionSaved?: () => void;
}

export function MatchCard({ match, showGroup = true, compact = false, onPredictionSaved }: MatchCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const homeTeam = getTeamById(match.homeTeamId);
  const awayTeam = getTeamById(match.awayTeamId);

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [penaltyWinner, setPenaltyWinner] = useState<'home' | 'away' | undefined>(undefined);

  useEffect(() => {
    const loadPrediction = async () => {
      const p = await getPrediction(match.id);
      if (p) {
        setPrediction(p);
        setHomeGoals(p.homeScore);
        setAwayGoals(p.awayScore);
        setPenaltyWinner(p.penaltyWinner);
      } else {
        setPrediction(null);
        setHomeGoals(0);
        setAwayGoals(0);
        setPenaltyWinner(undefined);
      }
    };
    loadPrediction();
  }, [match.id, user]);

  const handleStartPredict = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname + "#match-" + match.id)}`);
      return;
    }
    setIsEditing(true);
  };

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Force a re-render every minute to auto-close predictions on time
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!homeTeam || !awayTeam) return null;

  const matchDate = new Date(match.matchDate);
  const isPast = matchDate < now;
  const canPredict = match.status === "scheduled" && !isPast;

  // Calculate time remaining for urgency badge
  const msDiff = matchDate.getTime() - now.getTime();
  const hoursLeft = Math.floor(msDiff / (1000 * 60 * 60));
  const minsLeft = Math.floor((msDiff % (1000 * 60 * 60)) / (1000 * 60));
  const showUrgency = msDiff > 0 && msDiff < 1000 * 60 * 60 * 2; // less than 2 hours

  const pointsEarned =
    match.status === "finished" && prediction && match.homeScore !== undefined && match.awayScore !== undefined
      ? calculatePoints(prediction.homeScore, prediction.awayScore, match.homeScore, match.awayScore)
      : null;

  const handleSave = async () => {
    const newPrediction: Prediction = {
      matchId: match.id,
      homeScore: homeGoals,
      awayScore: awayGoals,
      penaltyWinner: (match.stage !== 'group' && homeGoals === awayGoals) ? penaltyWinner : undefined,
    };

    if (!isSupabaseConfigured) {
      savePredictionSync(newPrediction);
      setPrediction(newPrediction);
      setIsEditing(false);
      toast("Pronóstico guardado localmente", "success");
      onPredictionSaved?.();
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const result = await savePredictionAction(newPrediction, token);
      
      if (result.success) {
        setPrediction(newPrediction);
        setIsEditing(false);
        toast("Pronóstico guardado", "success");
        onPredictionSaved?.();
      } else {
        toast(result.error || "Error al guardar el pronóstico", "error");
      }
    } catch (e) {
      toast("Error de conexión al guardar", "error");
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    router.push(`/partido/${match.id}`);
  };

  return (
    <div id={`match-${match.id}`} className="group relative py-4 border-b border-border/40 last:border-0 transition-colors hover:bg-muted/20 active:bg-muted/30">
      {/* Clickable Area for Navigation */}
      <div 
        className="cursor-pointer"
        onClick={handleClick}
      >
      {/* Top row: group + date + status */}
      <div className="mb-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {showGroup && match.groupId && (
            <span className="font-semibold text-primary">
              Grupo {match.groupId}
            </span>
          )}
          <span className="text-muted-foreground hidden sm:inline">
            {formatDateAR(match.matchDate)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {showUrgency && canPredict && (
            <span className="text-[10px] font-bold text-red-500 animate-pulse bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
              Cierra en {hoursLeft}h {minsLeft}m
            </span>
          )}
          <Badge
            variant="secondary"
            className={`text-[10px] font-semibold ${getStatusColor(match.status)}`}
          >
            {getStatusLabel(match.status)}
          </Badge>
        </div>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-3">
        {/* Home team */}
        <div className="flex flex-1 items-center justify-end gap-2 text-right min-w-0">
          <span className="text-sm font-semibold truncate">
            {homeTeam.nameEs}
          </span>
          <span className="text-2xl leading-none drop-shadow-sm">{homeTeam.flag}</span>
        </div>

        {/* Score / VS */}
        <div className="flex-shrink-0 w-20 text-center">
          {match.status === "finished" ? (
            <span className="text-lg font-black tracking-widest">{match.homeScore}-{match.awayScore}</span>
          ) : match.status === "live" ? (
            <span className="text-lg font-black tracking-widest text-red-500 animate-pulse">{match.homeScore ?? 0}-{match.awayScore ?? 0}</span>
          ) : (
            <span className="text-sm font-bold text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">{formatTimeAR(match.matchDate)}</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-1 items-center justify-start gap-2 text-left min-w-0">
          <span className="text-2xl leading-none drop-shadow-sm">{awayTeam.flag}</span>
          <span className="text-sm font-semibold truncate">
            {awayTeam.nameEs}
          </span>
        </div>
      </div>

      {/* Venue */}
      {!compact && (
        <div className="mt-2 text-center text-[11px] text-muted-foreground">
          📍 {match.stadium}, {match.city}
        </div>
      )}
      </div> {/* End Clickable Area */}

      {/* Prediction section */}
      {!compact && (
        <div className="mt-3 border-t border-border/40 pt-3">
          {isEditing ? (
            <div className="space-y-3">
              <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tu Pronóstico
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{homeTeam.flag} {homeTeam.code}</span>
                  <GoalStepper value={homeGoals} onChange={setHomeGoals} />
                </div>
                <span className="text-lg font-bold text-muted-foreground mt-4">-</span>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{awayTeam.flag} {awayTeam.code}</span>
                  <GoalStepper value={awayGoals} onChange={setAwayGoals} />
                </div>
              </div>
              
              {/* Penalty selector for knockout stage draws */}
              {match.stage !== 'group' && homeGoals === awayGoals && (
                <div className="flex flex-col items-center gap-2 mt-2 bg-muted/30 p-2 rounded-xl">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Ganador en Penales</span>
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant={penaltyWinner === 'home' ? 'default' : 'outline'} 
                      size="sm" 
                      className={`flex-1 text-xs ${penaltyWinner === 'home' ? 'bg-primary' : ''}`}
                      onClick={() => setPenaltyWinner('home')}
                    >
                      {homeTeam.code}
                    </Button>
                    <Button 
                      variant={penaltyWinner === 'away' ? 'default' : 'outline'} 
                      size="sm" 
                      className={`flex-1 text-xs ${penaltyWinner === 'away' ? 'bg-primary' : ''}`}
                      onClick={() => setPenaltyWinner('away')}
                    >
                      {awayTeam.code}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-xs bg-primary hover:bg-primary/90"
                  onClick={handleSave}
                >
                  ✅ Confirmar
                </Button>
              </div>
            </div>
          ) : prediction ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Tu pronóstico:</span>
                <span className="font-bold">
                  {homeTeam.code} {prediction.homeScore} - {prediction.awayScore} {awayTeam.code}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {pointsEarned !== null && (
                  <Badge className={`text-[10px] ${getPointsBg(pointsEarned)}`}>
                    +{pointsEarned} pts · {getPointsLabel(pointsEarned)}
                  </Badge>
                )}
                {canPredict && (
                  <button
                    onClick={handleStartPredict}
                    className="text-xs text-primary hover:underline"
                  >
                    ✏️ Editar
                  </button>
                )}
              </div>
            </div>
          ) : canPredict ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={handleStartPredict}
            >
              🎯 Pronosticar
            </Button>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              {match.status === "finished"
                ? "No pronosticaste este partido"
                : "Predicciones cerradas"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function GoalStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const handleVibrate = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          handleVibrate();
          onChange(Math.max(0, value - 1));
        }}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-2xl font-bold hover:bg-muted/80 active:scale-95 transition-all shadow-sm border border-border/50"
        aria-label="Restar gol"
      >
        −
      </button>
      <div className="flex h-12 w-14 items-center justify-center rounded-xl bg-card border border-border text-2xl font-bold tabular-nums shadow-sm">
        {value}
      </div>
      <button
        type="button"
        onClick={() => {
          handleVibrate();
          onChange(Math.min(20, value + 1));
        }}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-2xl font-bold hover:bg-muted/80 active:scale-95 transition-all shadow-sm border border-border/50"
        aria-label="Sumar gol"
      >
        +
      </button>
    </div>
  );
}
