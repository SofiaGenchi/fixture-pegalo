import { supabase as clientSupabase, isSupabaseConfigured } from "@/lib/supabase-client";
import { supabaseServer } from "@/lib/supabase-server";
import { matches as staticMatches } from "@/lib/data/matches";
import { Match, MatchStage, MatchStatus } from "@/types";

const getDbClient = () => {
  if (typeof window === "undefined" && supabaseServer) {
    return supabaseServer;
  }
  return clientSupabase;
};

export async function getMatches(): Promise<Match[]> {
  if (!isSupabaseConfigured) {
    return staticMatches;
  }
  
  const db = getDbClient();
  if (!db) {
    return staticMatches;
  }
  
  const { data, error } = await db
    .from("matches")
    .select("*")
    .order("match_date", { ascending: true });
    
  if (error || !data) {
    console.error("Error fetching matches from Supabase:", error);
    return staticMatches; // fallback to static on error
  }
  
  return data.map((d: any) => ({
     id: d.id, 
     stage: d.stage as MatchStage, 
     groupId: d.group_id, 
     homeTeamId: d.home_team_id, 
     awayTeamId: d.away_team_id,
     matchDate: d.match_date, 
     stadium: d.stadium, 
     city: d.city, 
     country: d.country, 
     status: d.status as MatchStatus,
     homeScore: d.home_score, 
     awayScore: d.away_score,
     homePenaltyScore: d.home_penalty_score,
     awayPenaltyScore: d.away_penalty_score,
     currentMinute: d.current_minute,
     half: d.half,
     bzzoiroId: d.bzzoiro_id
  }));
}

export async function getMatchById(id: number): Promise<Match | undefined> {
  const allMatches = await getMatches();
  return allMatches.find(m => m.id === id);
}

