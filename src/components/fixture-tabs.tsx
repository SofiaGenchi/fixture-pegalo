"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MatchCard } from "@/components/match-card";
import { Match, Prediction, Team } from "@/types";
import { getTeamsByGroup, groups, teams } from "@/lib/data/teams";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-client";
import { getAllPredictions } from "@/lib/services/predictions.service";
import { getMatches } from "@/lib/services/matches.service";
import { Button } from "@/components/ui/button";

type Stage = "groups" | "round_of_32" | "round_of_16" | "quarter" | "semi" | "final";

const stages: { value: Stage; label: string }[] = [
  { value: "groups", label: "Grupos" },
  { value: "round_of_32", label: "32avos" },
  { value: "round_of_16", label: "8vos" },
  { value: "quarter", label: "4tos" },
  { value: "semi", label: "Semis" },
  { value: "final", label: "Final" },
];

interface FixtureTabsProps {
  initialMatches: Match[];
}

export function FixtureTabs({ initialMatches }: FixtureTabsProps) {
  const searchParams = useSearchParams();
  const initialStage = (searchParams?.get("stage") as Stage) || "groups";
  const initialGroup = searchParams?.get("group") || "A";

  const [activeStage, setActiveStage] = useState<Stage>(initialStage);
  const [activeGroup, setActiveGroup] = useState(initialGroup);
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const fetchUserPredictions = async () => {
    const userPredictions = await getAllPredictions();
    setPredictions(userPredictions);
  };

  useEffect(() => {
    fetchUserPredictions();
  }, []);

  const fetchMatches = async () => {
    const data = await getMatches();
    setMatches(data);
  };

  useEffect(() => {
    let matchesChannel: any = null;
    if (isSupabaseConfigured) {
      matchesChannel = supabase
        .channel('public:matches:fixture')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
          fetchMatches();
        })
        .subscribe();
    }

    return () => {
      if (matchesChannel) {
        supabase.removeChannel(matchesChannel);
      }
    };
  }, []);

  const scrollToToday = () => {
    const now = new Date();
    const upcoming = matches.find(m => new Date(m.matchDate) >= now);
    if (upcoming) {
      if (upcoming.stage === 'group') {
        setActiveStage('groups');
        if (upcoming.groupId) setActiveGroup(upcoming.groupId);
      } else {
        setActiveStage(upcoming.stage as Stage);
      }
      setTimeout(() => {
        const el = document.getElementById(`match-${upcoming.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  const renderMatchList = (matchList: Match[], showGroupLabel: boolean = false) => {
    if (matchList.length === 0) return null;
    
    const grouped: Record<string, Match[]> = {};
    matchList.forEach(m => {
      const d = new Date(m.matchDate).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
      const capitalized = d.charAt(0).toUpperCase() + d.slice(1);
      if (!grouped[capitalized]) grouped[capitalized] = [];
      grouped[capitalized].push(m);
    });

    return (
      <div className="space-y-6 mt-4 animate-in fade-in duration-300">
        {Object.entries(grouped).map(([dateLabel, dayMatches]) => (
          <div key={dateLabel} className="space-y-3 relative">
            <div className="sticky top-14 z-10 -mx-4 px-4 py-2 bg-background/90 backdrop-blur-md border-y border-border/40">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                {dateLabel}
              </h4>
            </div>
            {dayMatches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                showGroup={showGroupLabel} 
                onPredictionSaved={fetchUserPredictions} 
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">📅 Fixture Mundial 2026</h1>
        <div className="relative w-full sm:w-64">
          <TeamSearch onSelect={(t) => {
            setActiveStage("groups");
            setActiveGroup(t.groupId);
          }} />
        </div>
      </div>

      {/* Stage tabs */}
      <Tabs
        value={activeStage}
        onValueChange={(v) => setActiveStage(v as Stage)}
      >
        <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 h-auto p-1 rounded-xl">
          {stages.map((stage) => (
            <TabsTrigger
              key={stage.value}
              value={stage.value}
              className="text-xs px-3 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {stage.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="groups" className="mt-4 space-y-4">
          {/* Group selector */}
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mb-4">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`flex h-10 w-full items-center justify-center rounded-xl text-xs font-bold transition-all duration-200 shadow-sm border border-border/30 ${
                  activeGroup === g
                    ? "bg-primary text-primary-foreground shadow-md scale-105 border-primary"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Group standings */}
          <GroupStandings groupId={activeGroup} matches={matches} title={`Grupo ${activeGroup}`} />

          {/* Predicted Group standings */}
          {(() => {
            const groupMatches = matches.filter((m) => m.groupId === activeGroup);
            const predictedMatchIds = predictions.map((p) => p.matchId);
            const allPredicted = groupMatches.length > 0 && groupMatches.every((m) => predictedMatchIds.includes(m.id));

            if (allPredicted) {
              const predictedMatches = groupMatches.map((m) => {
                const pred = predictions.find((p) => p.matchId === m.id);
                return {
                  ...m,
                  status: "finished" as const,
                  homeScore: pred?.homeScore ?? m.homeScore,
                  awayScore: pred?.awayScore ?? m.awayScore,
                };
              });

              return (
                <div className="mt-6 mb-2">
                  <GroupStandings
                    groupId={activeGroup}
                    matches={predictedMatches}
                    title="Mis Predicciones"
                    isPrediction
                  />
                </div>
              );
            }
            return null;
          })()}

          {/* Matches */}
          {renderMatchList(matches.filter(m => m.groupId === activeGroup), false)}
        </TabsContent>

        {/* Knockout stages */}
        {stages.slice(1).map((stage) => {
          const stageMatches = matches.filter(m => m.stage === stage.value);
          return (
            <TabsContent key={stage.value} value={stage.value} className="mt-4 space-y-3">
              {stageMatches.length > 0 ? (
                renderMatchList(stageMatches, false)
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 p-12 text-center">
                  <span className="text-4xl mb-3">🏟️</span>
                  <h3 className="text-sm font-bold mb-1">{stage.label}</h3>
                  <p className="text-xs text-muted-foreground">
                    Se definirá próximamente.
                  </p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Jump to Today Button */}
      <div className="fixed bottom-20 right-4 z-50 lg:bottom-6">
        <Button 
          size="sm" 
          onClick={scrollToToday}
          className="rounded-full shadow-xl bg-primary text-primary-foreground hover:scale-105 transition-transform"
        >
          📍 Ir a Hoy
        </Button>
      </div>
    </div>
  );
}

function GroupStandings({ groupId, matches, title, isPrediction }: { groupId: string, matches: Match[], title?: string, isPrediction?: boolean }) {
  const teams = getTeamsByGroup(groupId);

  const standings = teams.map((team) => {
    const groupMatches = matches.filter(
      (m) => m.groupId === groupId && m.status === "finished"
    );

    let played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0;

    groupMatches.forEach((m) => {
      if (m.homeTeamId === team.id) {
        played++;
        gf += m.homeScore ?? 0;
        ga += m.awayScore ?? 0;
        if ((m.homeScore ?? 0) > (m.awayScore ?? 0)) won++;
        else if ((m.homeScore ?? 0) === (m.awayScore ?? 0)) drawn++;
        else lost++;
      } else if (m.awayTeamId === team.id) {
        played++;
        gf += m.awayScore ?? 0;
        ga += m.homeScore ?? 0;
        if ((m.awayScore ?? 0) > (m.homeScore ?? 0)) won++;
        else if ((m.awayScore ?? 0) === (m.homeScore ?? 0)) drawn++;
        else lost++;
      }
    });

    return {
      team,
      played,
      won,
      drawn,
      lost,
      gf,
      ga,
      gd: gf - ga,
      pts: won * 3 + drawn,
    };
  }).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

  return (
    <div className={`rounded-2xl border ${isPrediction ? 'border-primary/50 shadow-md shadow-primary/10' : 'border-border/60'} bg-card overflow-hidden`}>
      <div className={`${isPrediction ? 'bg-primary/10' : 'bg-muted/50'} px-4 py-2 flex items-center justify-between`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider ${isPrediction ? 'text-primary' : 'text-muted-foreground'}`}>
          {title || `Grupo ${groupId}`}
        </h3>
        {isPrediction && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">SIMULACIÓN</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/30 text-muted-foreground">
              <th className="py-2 pl-4 pr-2 text-left font-medium">#</th>
              <th className="py-2 text-left font-medium">Equipo</th>
              <th className="py-2 px-2 text-center font-medium">PJ</th>
              <th className="py-2 px-2 text-center font-medium">G</th>
              <th className="py-2 px-2 text-center font-medium">E</th>
              <th className="py-2 px-2 text-center font-medium">P</th>
              <th className="py-2 px-2 text-center font-medium">DG</th>
              <th className="py-2 pr-4 text-center font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr
                key={s.team.id}
                className={`border-b border-border/20 last:border-0 ${
                  i < 2 ? "bg-emerald-500/10" : i === 2 ? "bg-amber-500/10" : "bg-red-500/10"
                }`}
              >
                <td className="py-2.5 pl-4 pr-2 font-bold">{i + 1}</td>
                <td className="py-2.5">
                  <span className="flex items-center gap-2">
                    <span className="text-base">{s.team.flag}</span>
                    <span className="font-medium">{s.team.code}</span>
                  </span>
                </td>
                <td className="py-2.5 px-2 text-center tabular-nums">{s.played}</td>
                <td className="py-2.5 px-2 text-center tabular-nums">{s.won}</td>
                <td className="py-2.5 px-2 text-center tabular-nums">{s.drawn}</td>
                <td className="py-2.5 px-2 text-center tabular-nums">{s.lost}</td>
                <td className="py-2.5 px-2 text-center tabular-nums">
                  {s.gd > 0 ? `+${s.gd}` : s.gd}
                </td>
                <td className="py-2.5 pr-4 text-center font-bold">{s.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamSearch({ onSelect }: { onSelect: (t: Team) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filteredTeams = query.length > 0 
    ? teams.filter(t => 
        t.name.toLowerCase().includes(query.toLowerCase()) || 
        t.nameEs.toLowerCase().includes(query.toLowerCase()) ||
        t.code.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="relative">
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm">
          🔍
        </span>
        <input
          type="text"
          placeholder="Buscar selección..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => { if (query) setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="w-full rounded-full border border-border/80 bg-card pl-9 pr-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>
      
      {open && filteredTeams.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg p-1">
          {filteredTeams.map(t => (
            <button
              key={t.id}
              onClick={() => {
                onSelect(t);
                setQuery("");
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{t.flag}</span>
                <span className="font-medium text-foreground">{t.nameEs}</span>
              </div>
              <span className="text-xs text-muted-foreground font-bold">
                Grupo {t.groupId}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
