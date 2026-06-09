"use client";

import { useState, useEffect } from "react";
import { MatchCard } from "@/components/match-card";
import { matches as staticMatches, Match } from "@/lib/data/matches";
import { getTeamsByGroup, groups } from "@/lib/data/teams";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-client";

type Stage = "groups" | "round_of_32" | "round_of_16" | "quarter" | "semi" | "final";

const stages: { value: Stage; label: string }[] = [
  { value: "groups", label: "Grupos" },
  { value: "round_of_32", label: "32avos" },
  { value: "round_of_16", label: "8vos" },
  { value: "quarter", label: "4tos" },
  { value: "semi", label: "Semis" },
  { value: "final", label: "Final" },
];

export default function FixturePage() {
  const [activeStage, setActiveStage] = useState<Stage>("groups");
  const [activeGroup, setActiveGroup] = useState("A");
  const [matches, setMatches] = useState<Match[]>(staticMatches);

  useEffect(() => {
    async function fetchMatches() {
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
    }
    fetchMatches();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">📅 Fixture Mundial 2026</h1>

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
          <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeGroup === g
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Group standings */}
          <GroupStandings groupId={activeGroup} matches={matches} />

          {/* Matches */}
          <div className="space-y-3">
            {matches.filter(m => m.groupId === activeGroup).map((match) => (
              <MatchCard key={match.id} match={match} showGroup={false} />
            ))}
          </div>
        </TabsContent>

        {/* Placeholder for knockout stages */}
        {stages.slice(1).map((stage) => (
          <TabsContent key={stage.value} value={stage.value} className="mt-4">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 p-12 text-center">
              <span className="text-4xl mb-3">🏟️</span>
              <h3 className="text-sm font-bold mb-1">{stage.label}</h3>
              <p className="text-xs text-muted-foreground">
                Se definirá una vez finalizada la fase de grupos.
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function GroupStandings({ groupId, matches }: { groupId: string, matches: Match[] }) {
  const teams = getTeamsByGroup(groupId);

  // Calculate standings from match results
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
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Grupo {groupId}
        </h3>
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
                  i < 2 ? "bg-primary/5" : i === 2 ? "bg-amber-500/5" : ""
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
