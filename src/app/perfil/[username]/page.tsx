"use client";

import { useState, useEffect } from "react";
import { getPointsBg } from "@/lib/data/utils";
import { Match } from "@/types";
import { getMatches } from "@/lib/services/matches.service";
import { getTeamById } from "@/lib/data/teams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { calculatePoints } from "@/lib/data/utils";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";

export default function PublicProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const decodedUsername = typeof params.username === 'string' ? decodeURIComponent(params.username) : '';
  const isOwnProfile = user?.username === decodedUsername;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [profile, setProfile] = useState<{
    username: string;
    points: number;
    rank: number;
    exactResults: number;
    totalPredictions: number;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/user/${encodeURIComponent(decodedUsername)}`);
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || "Error al cargar el perfil");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setProfile(data.profile);
        setPredictions(data.predictions || []);
        
        const allMatches = await getMatches();
        setMatches(allMatches);
      } catch (err: any) {
        setError(err.message || "Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [decodedUsername]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="text-6xl">🤷</div>
        <h1 className="text-xl font-bold">Perfil no encontrado</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Link href="/ranking">
          <Button variant="outline" className="mt-4">Volver al Ranking</Button>
        </Link>
      </div>
    );
  }

  // Calculate stats points breakdown
  let totalPoints = 0;
  let exactResults = 0;
  let correctDiffs = 0;
  let correctWinners = 0;
  let misses = 0;

  predictions.forEach((p) => {
    const match = matches.find(m => m.id === p.matchId);
    if (match?.status === "finished" && match.homeScore !== undefined && match.awayScore !== undefined) {
      const pts = calculatePoints(p.homeScore, p.awayScore, match.homeScore, match.awayScore);
      totalPoints += pts;
      if (pts === 3) exactResults++;
      else if (pts === 2) correctDiffs++;
      else if (pts === 1) correctWinners++;
      else misses++;
    }
  });

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/ranking">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Ranking
          </Button>
        </Link>
      </div>

      {/* Profile header */}
      <div className="flex items-center gap-4 bg-card/40 border border-border/50 rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <UserAvatar username={profile.username} size="lg" />
        <div className="flex-1 min-w-0 z-10">
          <h1 className="text-xl font-bold truncate text-foreground">{profile.username}</h1>
          <p className="text-xs text-primary font-bold mt-1">
            Perfil Público
          </p>
        </div>
        
        {isOwnProfile && (
          <div className="z-10">
            <Link href="/perfil">
              <Button size="sm" variant="outline" className="text-xs font-bold border-primary/30 hover:bg-primary/10">
                Editar
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border/60 bg-card p-4 text-center">
          <p className="text-3xl font-bold text-primary">{totalPoints}</p>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Puntos Totales</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 text-center">
          <p className="text-3xl font-bold">#{profile.rank}</p>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Posición</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 text-center">
          <p className="text-3xl font-bold text-emerald-500">{exactResults}</p>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Exactos</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 text-center">
          <p className="text-3xl font-bold">{predictions.length}</p>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Pronósticos</p>
        </div>
      </div>


      {/* Points breakdown */}
      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <h3 className="text-sm font-bold mb-3">Desglose de Puntos</h3>
        <div className="space-y-2">
          <PointsRow label="Resultado exacto (+3 pts)" count={exactResults} color="bg-emerald-500" />
          <PointsRow label="Diferencia correcta (+2 pts)" count={correctDiffs} color="bg-blue-500" />
          <PointsRow label="Ganador correcto (+1 pt)" count={correctWinners} color="bg-amber-500" />
          <PointsRow label="Sin puntos" count={misses} color="bg-gray-300 dark:bg-gray-600" />
        </div>
      </div>

      <Separator />

      {/* Predictions history */}
      <div>
        <h3 className="text-sm font-bold mb-3">📋 Pronósticos de {profile.username}</h3>
        {predictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 p-10 text-center">
            <span className="text-3xl mb-2">👀</span>
            <p className="text-sm font-medium">Aún no hay pronósticos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...predictions].reverse().map((p) => {
              const match = matches.find(m => m.id === p.matchId);
              if (!match) return null;
              const home = getTeamById(match.homeTeamId);
              const away = getTeamById(match.awayTeamId);
              if (!home || !away) return null;

              const isFinished = match.status === "finished" && match.homeScore !== undefined && match.awayScore !== undefined;
              
              const pts = isFinished
                  ? calculatePoints(p.homeScore, p.awayScore, match.homeScore!, match.awayScore!)
                  : null;

              return (
                <div
                  key={p.matchId}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-card px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span>{home.flag}</span>
                    <span className="font-medium">
                      {home.code} {p.homeScore}-{p.awayScore} {away.code}
                    </span>
                    <span>{away.flag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isFinished ? (
                      <>
                        <span className="text-[10px] text-muted-foreground">
                          Real: {match.homeScore}-{match.awayScore}
                        </span>
                        {pts !== null && (
                          <Badge className={`text-[9px] ${getPointsBg(pts)}`}>
                            +{pts}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-[9px] bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                        ⏳ Pendiente
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
        <span>Una experiencia</span>
        <span className="font-bold text-foreground">PEGALO</span>
      </div>
    </div>
  );
}

function PointsRow({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-bold tabular-nums">{count}</span>
    </div>
  );
}
