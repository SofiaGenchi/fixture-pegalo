"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { getAllPredictions, calculatePoints } from "@/lib/data/utils";
import { getMatchById } from "@/lib/data/matches";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-client";
import Link from "next/link";

export default function RankingPage() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [standingsList, setStandingsList] = useState<any[]>([]);
  const [userStanding, setUserStanding] = useState<{ points: number; rank: number; exactResults: number; totalPredictions: number } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Load local predictions first
      const preds = await getAllPredictions();
      setPredictions(preds);

      if (isSupabaseConfigured) {
        try {
          // Fetch global rankings from secure API
          const res = await fetch("/api/ranking");
          if (res.ok) {
            const { standings } = await res.json();
            if (standings && standings.length > 0) {
              setStandingsList(
                standings.map((item: any) => ({
                  name: item.username,
                  points: item.points,
                  exactResults: item.exact_results,
                  totalPredictions: item.total_predictions,
                  rank: item.rank,
                }))
              );

              // Find logged in user standing from the fetched list
              if (user) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                  const singleStanding = standings.find((s: any) => s.user_id === session.user.id);
                  if (singleStanding) {
                    setUserStanding({
                      points: singleStanding.points,
                      rank: singleStanding.rank,
                      exactResults: singleStanding.exact_results,
                      totalPredictions: singleStanding.total_predictions,
                    });
                  }
                }
              }
            } else {
              setStandingsList([]);
            }
          } else {
            setStandingsList([]);
          }
        } catch (e) {
          console.error("Error loading rankings from API:", e);
          setStandingsList([]);
        }
      } else {
        setStandingsList([]);
      }
    };

    loadData();
  }, [user]);

  // Fallback points calculation for local mode
  let userPoints = 0;
  let userExact = 0;
  let userTotal = predictions.length;

  predictions.forEach((p) => {
    const match = getMatchById(p.matchId);
    if (match?.status === "finished" && match.homeScore !== undefined && match.awayScore !== undefined) {
      const pts = calculatePoints(p.homeScore, p.awayScore, match.homeScore, match.awayScore);
      userPoints += pts;
      if (pts === 3) userExact++;
    }
  });

  const userRank = userPoints > 0 ? 8 : 15;

  // Render dummy users for podium if list is empty or loading
  const firstPlace = standingsList[0] || { name: "1º Lugar", points: 0 };
  const secondPlace = standingsList[1] || { name: "2º Lugar", points: 0 };
  const thirdPlace = standingsList[2] || { name: "3º Lugar", points: 0 };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">🏆 Ranking PEGALO</h1>

      {/* Current user position - sticky card */}
      {user ? (
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
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
              <p className="text-xl font-bold text-primary">{userStanding?.points ?? userPoints}</p>
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
            <Button size="sm" className="h-8 text-xs font-bold bg-primary text-white hover:bg-primary/95">
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
            <div
              key={u.rank + "-" + i}
              className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/30 ${
                i !== standingsList.length - 1 ? "border-b border-border/20" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (
                    <span className="text-xs text-muted-foreground">{u.rank}</span>
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {u.totalPredictions} pronósticos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {u.exactResults > 0 && (
                    <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {u.exactResults} exactos
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-bold tabular-nums min-w-[3ch] text-right">
                  {u.points}
                </span>
                <span className="text-[10px] text-muted-foreground">pts</span>
              </div>
            </div>
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
  user: { name: string; points: number };
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

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-2xl">{medals[position]}</span>
      <div
        className={`${height} w-20 rounded-t-xl bg-gradient-to-b ${gradients[position]} border border-border/60 flex flex-col items-center justify-end p-2`}
      >
        <p className="text-xs font-bold text-center truncate w-full">
          {user.name.split(" ")[0]}
        </p>
        <p className="text-lg font-bold text-primary">{user.points}</p>
        <p className="text-[9px] text-muted-foreground">pts</p>
      </div>
    </div>
  );
}
