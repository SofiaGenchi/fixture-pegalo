"use client";

import { useState, useEffect } from "react";
import { getNextMatch } from "@/lib/data/matches";
import { getTeamById } from "@/lib/data/teams";
import { formatDateAR, formatTimeAR } from "@/lib/data/utils";

export function Countdown() {
  const nextMatch = getNextMatch();
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pegalo-blue via-primary to-pegalo-red p-[1px]">
      <div className="rounded-[calc(1rem-1px)] bg-gradient-to-br from-pegalo-blue/95 via-primary/95 to-pegalo-red/90 px-5 py-5 text-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-white/5" />
        </div>

        <div className="relative">
          <p className="mb-1 text-center text-xs font-semibold uppercase tracking-widest text-white/70">
            Próximo partido
          </p>

          {/* Teams */}
          <div className="my-3 flex items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl">{homeTeam.flag}</span>
              <span className="text-xs font-semibold">{homeTeam.code}</span>
            </div>
            <span className="text-lg font-bold text-white/40">VS</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl">{awayTeam.flag}</span>
              <span className="text-xs font-semibold">{awayTeam.code}</span>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center justify-center gap-2">
            <TimeBlock value={timeLeft.days} label="Días" />
            <span className="text-xl font-bold text-white/40 mt-[-12px]">:</span>
            <TimeBlock value={timeLeft.hours} label="Hrs" />
            <span className="text-xl font-bold text-white/40 mt-[-12px]">:</span>
            <TimeBlock value={timeLeft.minutes} label="Min" />
            <span className="text-xl font-bold text-white/40 mt-[-12px]">:</span>
            <TimeBlock value={timeLeft.seconds} label="Seg" />
          </div>

          {/* Match info */}
          <p className="mt-3 text-center text-[11px] text-white/60">
            {formatDateAR(nextMatch.matchDate)} · {formatTimeAR(nextMatch.matchDate)} ARG
            {nextMatch.groupId && ` · Grupo ${nextMatch.groupId}`}
          </p>
        </div>
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
        <span className="text-xl font-bold tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-1 text-[9px] font-medium uppercase tracking-wider text-white/50">
        {label}
      </span>
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
