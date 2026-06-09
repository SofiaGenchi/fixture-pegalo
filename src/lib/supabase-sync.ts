import { supabase, isSupabaseConfigured } from "./supabase-client";
import { matches } from "./data/matches";

export async function syncMatchesToSupabase() {
  if (!isSupabaseConfigured) return;

  try {
    // Check if matches table already has data
    const { count, error } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true });

    if (error) {
      // The table might not exist yet or there is an RLS issue
      console.error("Error checking matches table in Supabase:", error.message);
      return;
    }

    if (count === 0) {
      console.log("Seeding matches table in Supabase with official fixture...");
      
      // Map local matches objects to the Supabase column formats
      const mappedMatches = matches.map((m) => ({
        id: m.id,
        stage: m.stage,
        group_id: m.groupId || null,
        home_team_id: m.homeTeamId,
        away_team_id: m.awayTeamId,
        match_date: m.matchDate,
        stadium: m.stadium,
        city: m.city,
        country: m.country,
        status: m.status,
        home_score: m.homeScore ?? null,
        away_score: m.awayScore ?? null,
      }));

      // Insert in chunks to avoid payload size constraints
      const chunkSize = 50;
      for (let i = 0; i < mappedMatches.length; i += chunkSize) {
        const chunk = mappedMatches.slice(i, i + chunkSize);
        const { error: insertError } = await supabase
          .from("matches")
          .insert(chunk);
          
        if (insertError) {
          console.error("Error seeding matches chunk:", insertError.message);
          return;
        }
      }
      console.log("Matches successfully seeded to Supabase!");
    }
  } catch (e) {
    console.error("Unexpected error during matches synchronization:", e);
  }
}
