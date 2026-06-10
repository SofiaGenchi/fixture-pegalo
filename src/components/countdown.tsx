"use client";

import { useState, useEffect } from "react";
import { Match } from "@/types";
import { getNextMatch } from "@/lib/data/matches";
import { getTeamById } from "@/lib/data/teams";
import { formatDateAR, formatTimeAR } from "@/lib/data/utils";

export function Countdown({ matches }: { matches?: Match[] }) {
  const nextMatch = matches && matches.length > 0
    ? matches
        .filter(m => new Date(m.matchDate) > new Date() && m.status === 'scheduled')
        .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())[0]
    : getNextMatch();
    
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(nextMatch?.matchDate));


  useEffect(() => {
    if (!nextMatch) return;
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(nextMatch.matchDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [nextMatch]);

  if (!nextMatch) return null;

  const homeTeam = getTeamById(nextMatch.homeTeamId);
  const awayTeam = getTeamById(nextMatch.awayTeamId);

  if (!homeTeam || !awayTeam) return null;

  return (
    <div className="py-6 mb-2 border-b border-border/40">
      <div className="text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Próximo partido
        </p>

        <div className="flex flex-col items-center justify-center gap-4">
          {/* Teams */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl leading-none">{homeTeam.flag}</span>
            <span className="text-sm font-bold">{homeTeam.nameEs}</span>
            <span className="text-[10px] font-black text-muted-foreground px-1">VS</span>
            <span className="text-sm font-bold">{awayTeam.nameEs}</span>
            <span className="text-2xl leading-none">{awayTeam.flag}</span>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center justify-center gap-1 font-mono text-2xl font-black tracking-tight text-primary">
            <span>{String(timeLeft.days).padStart(2, '0')}</span><span className="text-muted-foreground/50">:</span>
            <span>{String(timeLeft.hours).padStart(2, '0')}</span><span className="text-muted-foreground/50">:</span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}</span><span className="text-muted-foreground/50">:</span>
            <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Match info */}
        <p className="mt-4 text-center text-[11px] font-medium text-muted-foreground">
          {formatDateAR(nextMatch.matchDate)} · {formatTimeAR(nextMatch.matchDate)} ARG
          {nextMatch.groupId && ` · Grupo ${nextMatch.groupId}`}
        </p>
      </div>
    </div>
  );
}

function getTimeLeft(dateStr?: string) {
  if (!dateStr) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  const now = new Date().getTime();
  const target = new Date(dateStr).getTime();
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
