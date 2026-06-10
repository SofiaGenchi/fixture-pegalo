"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Match, Prediction } from "@/types";
import { calculatePoints } from "@/lib/data/utils";
import { getAllPredictions } from "@/lib/services/predictions.service";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-client";
import Link from "next/link";
import { PointsInfoSheet } from "@/components/points-info-sheet";

interface RankingClientProps {
  initialStandings: any[];
  initialMatches: Match[];
}

export function RankingClient({ initialStandings, initialMatches }: RankingClientProps) {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [matches] = useState<Match[]>(initialMatches);
  const [standingsList] = useState<any[]>(initialStandings);
  const [userStanding, setUserStanding] = useState<{ points: number; rank: number; exactResults: number; totalPredictions: number } | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const preds = await getAllPredictions();
      setPredictions(preds);

      if (isSupabaseConfigured && user) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const singleStanding = standingsList.find((s: any) => s.user_id === session.user.id);
            if (singleStanding) {
              setUserStanding({
                points: singleStanding.points,
                rank: singleStanding.rank,
                exactResults: singleStanding.exact_results,
                totalPredictions: singleStanding.total_predictions,
              });
            } else {
              // Fallback query directly in case they are not in top list or standing was cached
              const { data } = await supabase
                .from("user_standings_mv")
                .select("points, rank, exact_results, total_predictions")
                .eq("user_id", session.user.id)
                .maybeSingle();
              if (data) {
                setUserStanding({
                  points: data.points,
                  rank: data.rank,
                  exactResults: data.exact_results,
                  totalPredictions: data.total_predictions,
                });
              }
            }
          }
        } catch (e) {
          console.error("Error fetching user standing:", e);
        }
      }
    };

    loadUserData();
  }, [user, standingsList]);

  // Fallback points calculation for local mode
  let userPoints = 0;
  let userExact = 0;
  let userTotal = predictions.length;

  predictions.forEach((p) => {
    const match = matches.find(m => m.id === p.matchId);
    if (match?.status === "finished" && match.homeScore !== undefined && match.awayScore !== undefined) {
      const pts = calculatePoints(p.homeScore, p.awayScore, match.homeScore, match.awayScore);
      userPoints += pts;
      if (pts === 3) userExact++;
    }
  });

  const userRank = userPoints > 0 ? 8 : 15;

  const firstPlace = standingsList[0] || { username: "1º Lugar", points: 0 };
  const secondPlace = standingsList[1] || { username: "2º Lugar", points: 0 };
  const thirdPlace = standingsList[2] || { username: "3º Lugar", points: 0 };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🏆 Ranking PEGALO</h1>
        <PointsInfoSheet />
      </div>

      {/* Current user position - sticky card */}
      {user ? (
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary font-mono">
                #{userStanding?.rank ?? userRank}
              </div>
              <div>
                <p className="text-sm font-bold">{user.username} (Vos)</p>
                <p className="text-xs text-muted-foreground">
                  {userStanding?.totalPredictions ?? userTotal} pronósticos · {userStanding?.exactResults ?? userExact} exactos
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary font-mono">{userStanding?.points ?? userPoints}</p>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                puntos
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-foreground">¿Querés competir en el Ranking?</p>
            <p className="text-[11px] text-muted-foreground">
              Iniciá sesión o creá tu cuenta para empezar a acumular puntos.
            </p>
          </div>
          <Link href="/login?redirect=/ranking" className="sm:shrink-0">
            <Button size="sm" className="h-8 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95">
              Ingresar / Crear Cuenta
            </Button>
          </Link>
        </div>
      )}

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 py-2">
        {/* 2nd place */}
        <PodiumCard user={secondPlace} position={2} height="h-24" />
        {/* 1st place */}
        <PodiumCard user={firstPlace} position={1} height="h-32" />
        {/* 3rd place */}
        <PodiumCard user={thirdPlace} position={3} height="h-20" />
      </div>

      {/* Full ranking list */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Ranking General
          </span>
          <span className="text-[10px] text-muted-foreground">
            {standingsList.length} participantes
          </span>
        </div>

        {standingsList.length > 0 ? (
          standingsList.map((u, i) => (
            <Link
              href={`/perfil/${encodeURIComponent(u.username)}`}
              key={u.user_id || i}
              className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/40 cursor-pointer ${
                i !== standingsList.length - 1 ? "border-b border-border/20" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (
                    <span className="text-xs text-muted-foreground font-mono">{u.rank}</span>
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium">{u.username}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {u.total_predictions} pronósticos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {u.exact_results > 0 && (
                    <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {u.exact_results} exactos
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-bold tabular-nums min-w-[3ch] text-right text-primary font-mono">
                  {u.points}
                </span>
                <span className="text-[10px] text-muted-foreground">pts</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            El ranking está vacío en este momento. ¡Regístrate y sé el primero en sumar puntos!
          </div>
        )}
      </div>

      {/* PEGALO Branding */}
      <div className="flex flex-col items-center justify-center gap-2 py-6 text-xs text-muted-foreground border-t border-border/30 mt-6">
        <div className="flex items-center gap-2">
          <span>Ranking powered by</span>
          <span className="font-bold text-foreground">PEGALO</span>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <a href="https://www.adhesivospegalo.com.ar/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">
            Sitio Web Oficial
          </a>
          <a href="https://www.instagram.com/adhesivospegalo" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">
            Instagram
          </a>
        </div>
      </div>
    </div>
  );
}

function PodiumCard({
  user,
  position,
  height,
}: {
  user: { username: string; points: number };
  position: number;
  height: string;
}) {
  const medals = ["", "🥇", "🥈", "🥉"];
  const gradients = [
    "",
    "from-amber-400/20 via-amber-300/10 to-transparent",
    "from-gray-300/20 via-gray-200/10 to-transparent",
    "from-orange-400/20 via-orange-300/10 to-transparent",
  ];

  const displayName = user.username || "";

  return (
    <Link href={`/perfil/${encodeURIComponent(displayName)}`} className="flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-105">
      <span className="text-2xl">{medals[position]}</span>
      <div
        className={`${height} w-20 rounded-t-xl bg-gradient-to-b ${gradients[position]} border border-border/60 flex flex-col items-center justify-end p-2`}
      >
        <p className="text-xs font-bold text-center truncate w-full">
          {displayName.split(" ")[0]}
        </p>
        <p className="text-lg font-bold text-primary font-mono">{user.points}</p>
        <p className="text-[9px] text-muted-foreground group-hover:text-foreground transition-colors">pts</p>
      </div>
    </Link>
  );
}
