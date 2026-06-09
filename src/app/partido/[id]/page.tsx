"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMatchById } from "@/lib/data/matches";
import { teams } from "@/lib/data/teams";
import { fetchLiveMatchData, MatchEvent, LiveMatchData } from "@/lib/data/live-events";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = parseInt(params.id as string, 10);
  
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const loadMatchData = async () => {
      if (!isNaN(matchId)) {
        const m = getMatchById(matchId);
        if (m) {
          setMatch(m);

          // If the match has a bzzoiro API ID associated, fetch real live data
          if (m.bzzoiroId) {
            setIsLoadingLive(true);
            const liveData = await fetchLiveMatchData(m.bzzoiroId);
            if (liveData) {
              setMatch((prev: any) => ({
                ...prev,
                status: liveData.status,
                homeScore: liveData.homeScore,
                awayScore: liveData.awayScore,
                currentMinute: liveData.currentMinute,
                half: liveData.half,
              }));
              setEvents(liveData.events);
            }
            setIsLoadingLive(false);
          }
        }
      }
    };

    loadMatchData();

    // Poll every 60 seconds
    intervalId = setInterval(loadMatchData, 60000);

    return () => clearInterval(intervalId);
  }, [matchId]);

  if (!match) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const homeTeam = teams.find((t) => t.id === match.homeTeamId);
  const awayTeam = teams.find((t) => t.id === match.awayTeamId);

  // Sorting events by minute descending
  const sortedEvents = [...events].sort((a, b) => b.minute - a.minute);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "goal": return "⚽";
      case "yellow_card": return "🟨";
      case "red_card": return "🟥";
      case "sub": return "🔄";
      default: return "📌";
    }
  };

  const getEventText = (event: MatchEvent) => {
    if (event.type === "sub") {
      return (
        <span>
          <span className="font-bold text-green-600">IN:</span> {event.player} <br/>
          <span className="font-bold text-red-600">OUT:</span> {event.playerOut}
        </span>
      );
    }
    return (
      <span>
        {event.player} <span className="text-muted-foreground text-[10px] uppercase ml-1">{event.detail}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
          &larr; Volver
        </Button>
        <Link href={`/fixture?stage=groups&group=${match.groupId}`}>
          <Button variant="outline" size="sm" className="font-semibold border-primary/20 text-primary hover:bg-primary/5">
            Ver Grupo {match.groupId}
          </Button>
        </Link>
      </div>

      {/* Main Banner */}
      <div className="relative overflow-hidden rounded-[2rem] border border-border/40 bg-card p-6 md:p-10 shadow-xl">
        {/* Background Decorative Mesh */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          
          {/* Status & Minute Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-background/50 backdrop-blur-md px-4 py-1.5 border border-border/50 text-xs font-bold uppercase tracking-wider">
            {match.status === "live" && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
            {match.status === "live" ? (
              <span className="text-red-500">En Vivo <span className="ml-1 text-foreground">{match.currentMinute ? `${match.currentMinute}'` : ''} {match.half ? `(${match.half})` : ''}</span></span>
            ) : match.status === "finished" ? (
              <span className="text-muted-foreground">Finalizado</span>
            ) : (
              <span className="text-primary">Próximamente</span>
            )}
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-between w-full max-w-lg gap-4">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-16 h-16 md:w-24 md:h-24 relative rounded-full bg-white/5 border border-border/50 p-2 shadow-inner flex items-center justify-center">
                <span className="text-4xl md:text-6xl">{homeTeam?.flag}</span>
              </div>
              <h2 className="text-sm md:text-lg font-black tracking-tight text-center leading-tight">
                {homeTeam?.name}
              </h2>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              <div className="text-5xl md:text-7xl font-black tracking-tighter text-foreground drop-shadow-sm flex items-center gap-3">
                <span>{match.homeScore ?? "-"}</span>
                <span className="text-muted-foreground/30 text-3xl md:text-5xl">:</span>
                <span>{match.awayScore ?? "-"}</span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-16 h-16 md:w-24 md:h-24 relative rounded-full bg-white/5 border border-border/50 p-2 shadow-inner flex items-center justify-center">
                <span className="text-4xl md:text-6xl">{awayTeam?.flag}</span>
              </div>
              <h2 className="text-sm md:text-lg font-black tracking-tight text-center leading-tight">
                {awayTeam?.name}
              </h2>
            </div>
          </div>

          {/* Match Info */}
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-mono text-muted-foreground uppercase tracking-widest text-center">
            <span>🏟️ {match.stadium}</span>
            <span>📍 {match.city}</span>
            <span>📅 {new Date(match.matchDate).toLocaleDateString()}</span>
          </div>

        </div>
      </div>

      {/* Match Details Tabs */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Timeline (Events) */}
        <div className="space-y-4 max-w-2xl mx-auto w-full">
          <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground text-center">Línea de Tiempo</h3>
          <div className="glass-panel rounded-3xl p-6">
            {sortedEvents.length > 0 ? (
              <div className="relative border-l border-border/50 ml-4 space-y-6">
                {sortedEvents.map((evt) => {
                  const isHome = evt.teamId === "home" || evt.teamId === homeTeam?.id.toString();
                  return (
                    <div key={evt.id} className="relative pl-6">
                      {/* Timeline Dot & Icon */}
                      <span className="absolute -left-3 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-card border border-border text-[10px] shadow-sm">
                        {getEventIcon(evt.type)}
                      </span>
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-primary">{evt.minute}' {evt.half ? `(${evt.half})` : ''}</span>
                        <div className="text-sm font-medium mt-0.5">
                          {isHome ? <span className="font-bold text-foreground mr-1">{homeTeam?.code}</span> : null}
                          {getEventText(evt)}
                          {!isHome ? <span className="font-bold text-foreground ml-1">{awayTeam?.code}</span> : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                No hay eventos registrados en este momento.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
