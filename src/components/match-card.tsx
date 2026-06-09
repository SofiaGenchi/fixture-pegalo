"use client";

import { useState, useEffect } from "react";
import { Match, Prediction } from "@/lib/data/matches";
import { getTeamById } from "@/lib/data/teams";
import {
  formatDateAR,
  formatTimeAR,
  getStatusLabel,
  getStatusColor,
  getPrediction,
  savePrediction,
  calculatePoints,
  getPointsLabel,
  getPointsBg,
} from "@/lib/data/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";

interface MatchCardProps {
  match: Match;
  showGroup?: boolean;
  compact?: boolean;
}

export function MatchCard({ match, showGroup = true, compact = false }: MatchCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const homeTeam = getTeamById(match.homeTeamId);
  const awayTeam = getTeamById(match.awayTeamId);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);

  useEffect(() => {
    const loadPrediction = async () => {
      const p = await getPrediction(match.id);
      if (p) {
        setPrediction(p);
        setHomeGoals(p.homeScore);
        setAwayGoals(p.awayScore);
      } else {
        setPrediction(null);
        setHomeGoals(0);
        setAwayGoals(0);
      }
    };
    loadPrediction();
  }, [match.id, user]);

  const handleStartPredict = () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setIsEditing(true);
  };

  if (!homeTeam || !awayTeam) return null;

  const matchDate = new Date(match.matchDate);
  const isPast = matchDate < new Date();
  const canPredict = match.status === "scheduled" && !isPast;

  const pointsEarned =
    match.status === "finished" && prediction && match.homeScore !== undefined && match.awayScore !== undefined
      ? calculatePoints(prediction.homeScore, prediction.awayScore, match.homeScore, match.awayScore)
      : null;

  const handleSave = async () => {
    const newPrediction: Prediction = {
      matchId: match.id,
      homeScore: homeGoals,
      awayScore: awayGoals,
    };
    await savePrediction(newPrediction);
    setPrediction(newPrediction);
    setIsEditing(false);
  };

  return (
    <div className="group rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-primary/5">
      {/* Top row: group + date + status */}
      <div className="mb-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {showGroup && match.groupId && (
            <span className="font-semibold text-primary">
              Grupo {match.groupId}
            </span>
          )}
          <span className="text-muted-foreground">
            {formatDateAR(match.matchDate)} · {formatTimeAR(match.matchDate)} ARG
          </span>
        </div>
        <Badge
          variant="secondary"
          className={`text-[10px] font-semibold ${getStatusColor(match.status)}`}
        >
          {getStatusLabel(match.status)}
        </Badge>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-2">
        {/* Home team */}
        <div className="flex flex-1 flex-col items-center gap-1 text-center min-w-0">
          <span className="text-2xl leading-none">{homeTeam.flag}</span>
          <span className="text-xs font-medium truncate w-full">
            {homeTeam.nameEs}
          </span>
        </div>

        {/* Score / VS */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {match.status === "finished" ? (
            <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2">
              <span className="text-xl font-bold tabular-nums">{match.homeScore}</span>
              <span className="text-sm text-muted-foreground">-</span>
              <span className="text-xl font-bold tabular-nums">{match.awayScore}</span>
            </div>
          ) : match.status === "live" ? (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 ring-1 ring-red-500/30">
              <span className="text-xl font-bold tabular-nums text-red-600 dark:text-red-400">{match.homeScore ?? 0}</span>
              <span className="text-sm text-red-400">-</span>
              <span className="text-xl font-bold tabular-nums text-red-600 dark:text-red-400">{match.awayScore ?? 0}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-2">
              <span className="text-sm font-semibold text-muted-foreground">VS</span>
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-1 flex-col items-center gap-1 text-center min-w-0">
          <span className="text-2xl leading-none">{awayTeam.flag}</span>
          <span className="text-xs font-medium truncate w-full">
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
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-lg font-bold hover:bg-muted/80 active:scale-95 transition-all"
        aria-label="Restar gol"
      >
        −
      </button>
      <div className="flex h-9 w-10 items-center justify-center rounded-lg bg-card border border-border text-lg font-bold tabular-nums">
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(20, value + 1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-lg font-bold hover:bg-muted/80 active:scale-95 transition-all"
        aria-label="Sumar gol"
      >
        +
      </button>
    </div>
  );
}
