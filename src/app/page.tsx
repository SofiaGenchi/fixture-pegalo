"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Countdown } from "@/components/countdown";
import { MatchCard } from "@/components/match-card";
import { matches as staticMatches, Match } from "@/lib/data/matches";
import { getAllPredictions, calculatePoints } from "@/lib/data/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [standings, setStandings] = useState<{ points: number; rank: number; exactResults: number; totalPredictions: number } | null>(null);
  const [topStandings, setTopStandings] = useState<any[]>([]);
  const [matches, setMatches] = useState<Match[]>(staticMatches);

  useEffect(() => {
    const loadData = async () => {
      const preds = await getAllPredictions();
      setPredictions(preds);

      if (isSupabaseConfigured && user) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data } = await supabase
              .from("user_standings")
              .select("points, rank, exact_results, total_predictions")
              .eq("user_id", session.user.id)
              .maybeSingle();
            
            if (data) {
              setStandings({
                points: data.points,
                rank: data.rank,
                exactResults: data.exact_results,
                totalPredictions: data.total_predictions,
              });
            }
          }
        } catch (e) {
          console.error("Error fetching standings:", e);
        }
      } else {
        setStandings(null);
      }

      if (isSupabaseConfigured) {
        const { data: top } = await supabase.from("user_standings").select("*").order("rank", { ascending: true }).limit(5);
        if (top) {
          setTopStandings(top);
        }
      }

      // Fetch Live Matches
      if (isSupabaseConfigured) {
        const { data } = await supabase.from("matches").select("*").order("match_date", { ascending: true });
        if (data && data.length > 0) {
          const mapped = data.map(d => ({
             id: d.id, stage: d.stage as any, groupId: d.group_id, homeTeamId: d.home_team_id, awayTeamId: d.away_team_id,
             matchDate: d.match_date, stadium: d.stadium, city: d.city, country: d.country, status: d.status as any,
             homeScore: d.home_score, awayScore: d.away_score
          }));
          setMatches(mapped);
        }
      }

    };
    loadData();
  }, [user]);

  const todayStr = new Date().toDateString();
  const todayMatches = matches.filter(m => {
    const d = new Date(m.matchDate);
    return d.toDateString() === todayStr;
  });
  
  const upcomingMatches = matches
    .filter(m => new Date(m.matchDate) > new Date() && m.status === 'scheduled')
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
    .slice(0, 4);
    
  const recentResults = matches
    .filter(m => m.status === 'finished')
    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
    .slice(0, 3);
    
  const displayMatches = todayMatches.length > 0 ? todayMatches : upcomingMatches;

  // Calculate live stats for the logged-in user (local fallback)
  let totalPoints = 0;
  let exactResults = 0;
  let totalPredictions = predictions.length;

  predictions.forEach((p) => {
    const match = matches.find(m => m.id === p.matchId);
    if (match?.status === "finished" && match.homeScore !== undefined && match.awayScore !== undefined) {
      const pts = calculatePoints(p.homeScore, p.awayScore, match.homeScore, match.awayScore);
      totalPoints += pts;
      if (pts === 3) exactResults++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Countdown */}
      <Countdown />

      {/* Quick stats / Login CTA */}
      {user ? (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Puntos" value={(standings?.points ?? totalPoints).toString()} icon="⚡" />
          <StatCard label="Posición" value={`#${standings?.rank ?? (totalPoints > 0 ? "8" : "15")}`} icon="📊" />
          <StatCard label="Aciertos" value={`${standings?.exactResults ?? exactResults}/${standings?.totalPredictions ?? totalPredictions}`} icon="🎯" />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-center space-y-3 shadow-sm">
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-primary">
            <span>⚽</span>
            <span>¡Pronosticá y Ganá con PEGALO!</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Iniciá sesión o creá tu cuenta con usuario, email y contraseña para guardar tus pronósticos y competir en el ranking.
          </p>
          <div className="flex justify-center gap-2">
            <Link href="/login">
              <Button size="sm" className="h-8 text-xs font-bold bg-primary hover:bg-primary/95 text-white">
                Ingresar / Crear Cuenta
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Recent Results */}
      {recentResults.length > 0 && (
        <section>
          <SectionHeader title="Resultados Recientes" href="/fixture" />
          <div className="space-y-3">
            {recentResults.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Today / Upcoming */}
      <section>
        <SectionHeader
          title={todayMatches.length > 0 ? "Partidos de Hoy" : "Próximos Partidos"}
          href="/fixture"
        />
        <div className="space-y-3">
          {displayMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      {/* Top Ranking Preview */}
      <section>
        <SectionHeader title="🏆 Ranking PEGALO" href="/ranking" />
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          {topStandings.length > 0 ? (
            topStandings.map((u, i) => (
              <div
                key={u.user_id}
                className={`flex items-center justify-between px-4 py-3 ${
                  i !== topStandings.length - 1 ? "border-b border-border/30" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${u.rank}`}
                  </span>
                  <span className="text-sm font-medium">{u.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">
                    {u.points} pts
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {u.exact_results} exactos
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Aún no hay usuarios en el ranking. ¡Sé el primero en jugar!
            </div>
          )}
          
          {/* Current user context row */}
          {user ? (
            <div className="flex items-center justify-between border-t-2 border-primary/20 bg-primary/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {standings?.rank ?? (totalPoints > 0 ? "8" : "-")}
                </span>
                <span className="text-sm font-bold text-primary">
                  {user.username} (Vos)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary">
                  {standings?.points ?? totalPoints} pts
                </span>
              </div>
            </div>
          ) : (
            <Link href="/login" className="flex items-center justify-between border-t border-dashed border-border/60 hover:bg-muted/30 px-4 py-3 text-xs font-semibold text-primary transition-all">
              <span>👉 Iniciá sesión para aparecer en el ranking oficial</span>
              <span>Ingresar →</span>
            </Link>
          )}
        </div>
      </section>

      {/* Branding footer */}
      <div className="flex flex-col items-center justify-center gap-2 py-6 text-xs text-muted-foreground border-t border-border/30">
        <div className="flex items-center gap-2">
          <span>Una experiencia</span>
          <span className="font-bold text-foreground">PEGALO</span>
          <span>· Mundial 2026</span>
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

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border/60 bg-card p-3 text-center">
      <span className="text-lg">{icon}</span>
      <span className="text-lg font-bold tracking-tight">{value}</span>
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function SectionHeader({
  title,
  href,
}: {
  title: string;
  href: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-bold">{title}</h2>
      <Link
        href={href}
        className="text-xs font-medium text-primary hover:underline"
      >
        Ver todo →
      </Link>
    </div>
  );
}
