"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Countdown } from "@/components/countdown";
import { MatchCard } from "@/components/match-card";
import { Match } from "@/types";
import { calculatePoints } from "@/lib/data/utils";
import { getAllPredictions } from "@/lib/services/predictions.service";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardClientProps {
  initialMatches: Match[];
  initialTopStandings: any[];
}

export function DashboardClient({ initialMatches, initialTopStandings }: DashboardClientProps) {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [standings, setStandings] = useState<{ points: number; rank: number; exactResults: number; totalPredictions: number } | null>(null);
  const [topStandings, setTopStandings] = useState<any[]>(initialTopStandings);
  const [matches, setMatches] = useState<Match[]>(initialMatches);

  const loadUserData = async () => {
    const preds = await getAllPredictions();
    setPredictions(preds);

    if (isSupabaseConfigured && user) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from("user_standings_mv")
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
  };

  const loadGlobalData = async () => {
    if (isSupabaseConfigured) {
      try {
        const { data: top } = await supabase
          .from("user_standings_mv")
          .select("*")
          .order("rank", { ascending: true })
          .limit(5);
        if (top) {
          setTopStandings(top);
        }

        const { data } = await supabase
          .from("matches")
          .select("*")
          .order("match_date", { ascending: true });
        if (data && data.length > 0) {
          const mapped = data.map((d: any) => ({
             id: d.id, 
             stage: d.stage as any, 
             groupId: d.group_id, 
             homeTeamId: d.home_team_id, 
             awayTeamId: d.away_team_id,
             matchDate: d.match_date, 
             stadium: d.stadium, 
             city: d.city, 
             country: d.country, 
             status: d.status as any,
             homeScore: d.home_score, 
             awayScore: d.away_score,
             homePenaltyScore: d.home_penalty_score,
             awayPenaltyScore: d.away_penalty_score,
             currentMinute: d.current_minute,
             half: d.half
          }));
          setMatches(mapped);
        }
      } catch (e) {
        console.error("Error reloading matches/standings:", e);
      }
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  useEffect(() => {
    let matchesChannel: any = null;
    
    if (isSupabaseConfigured) {
      matchesChannel = supabase
        .channel('public:matches')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
          console.log("Realtime match update received! Reloading data...");
          loadGlobalData();
          loadUserData();
        })
        .subscribe();
    }

    return () => {
      if (matchesChannel) {
        supabase.removeChannel(matchesChannel);
      }
    };
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Countdown using current matches list */}
      <Countdown matches={matches} />

      {/* Quick stats / Login CTA */}
      {user ? (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Puntos" value={(standings?.points ?? totalPoints).toString()} icon="⚡" />
          <StatCard label="Posición" value={`#${standings?.rank ?? (totalPoints > 0 ? "8" : "15")}`} icon="📊" />
          <StatCard label="Aciertos" value={`${standings?.exactResults ?? exactResults}/${standings?.totalPredictions ?? totalPredictions}`} icon="🎯" />
        </div>
      ) : (
        <div className="py-8 text-center flex flex-col items-center justify-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Pronosticá y Ganá
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Guardá tus pronósticos y competí en el ranking de PEGALO.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <Button className="rounded-full font-semibold px-8 py-6 text-sm transition-transform hover:scale-105 active:scale-95">
                  Ingresar a tu cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Results */}
      {recentResults.length > 0 && (
        <section>
          <SectionHeader title="Resultados Recientes" href="/fixture" />
          <div className="space-y-3">
            {recentResults.map((match) => (
              <MatchCard key={match.id} match={match} onPredictionSaved={loadUserData} />
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
            <MatchCard key={match.id} match={match} onPredictionSaved={loadUserData} />
          ))}
        </div>
      </section>

      {/* Top Ranking Preview */}
      <section>
        <SectionHeader title="🏆 Ranking PEGALO" href="/ranking" />
        <div className="rounded-3xl glass-panel overflow-hidden border-border/40">
          {topStandings.length > 0 ? (
            topStandings.map((u, i) => (
              <div
                key={u.user_id}
                className={`flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/30 ${
                  i !== topStandings.length - 1 ? "border-b border-border/30" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background/50 shadow-sm text-sm font-bold">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${u.rank}`}
                  </span>
                  <span className="text-sm font-semibold">{u.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">
                    {u.points} pts
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:inline-block">
                    {u.exact_results} exactos
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Aún no hay usuarios en el ranking. ¡Sé el primero en jugar!
            </div>
          )}
          
          {/* Current user context row */}
          {user ? (
            <div className="flex items-center justify-between border-t border-primary/20 bg-primary/5 px-5 py-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 shadow-sm text-xs font-bold text-primary">
                  {standings?.rank ?? (totalPoints > 0 ? "8" : "-")}
                </span>
                <span className="text-sm font-bold text-primary">
                  {user.username} (Vos)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-primary drop-shadow-sm">
                  {standings?.points ?? totalPoints} pts
                </span>
              </div>
            </div>
          ) : (
            <Link href="/login" className="flex items-center justify-between border-t border-dashed border-border/60 hover:bg-primary/5 px-5 py-4 text-xs font-semibold text-primary transition-all">
              <span>👉 Iniciá sesión para aparecer en el ranking oficial</span>
              <span className="font-bold">Ingresar &rarr;</span>
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
    <div className="flex flex-col items-center justify-center gap-1.5 glass-panel p-4 text-center">
      <span className="text-2xl drop-shadow-sm">{icon}</span>
      <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
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
    <div className="mb-4 flex items-center justify-between px-1">
      <h2 className="text-base font-black tracking-tight text-foreground">{title}</h2>
      <Link
        href={href}
        className="group flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
      >
        Ver todo 
        <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
      </Link>
    </div>
  );
}
