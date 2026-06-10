import { supabase, isSupabaseConfigured } from "@/lib/supabase-client";
import { Prediction } from "@/types";
import { 
  getPredictionSync as localGetPrediction, 
  getAllPredictionsSync as localGetAllPredictions 
} from "@/lib/data/utils";

export async function getPrediction(matchId: number): Promise<Prediction | undefined> {
  if (!isSupabaseConfigured) {
    return localGetPrediction(matchId);
  }
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return undefined;

    const { data, error } = await supabase
      .from("predictions")
      .select("match_id, home_score, away_score, penalty_winner, points_earned")
      .eq("user_id", session.user.id)
      .eq("match_id", matchId)
      .maybeSingle();

    if (error || !data) return undefined;
    
    return {
      matchId: data.match_id,
      homeScore: data.home_score,
      awayScore: data.away_score,
      penaltyWinner: data.penalty_winner,
      pointsEarned: data.points_earned,
    };
  } catch (e) {
    console.error("Error getting prediction:", e);
    return undefined;
  }
}

export async function getAllPredictions(): Promise<Prediction[]> {
  if (!isSupabaseConfigured) {
    return localGetAllPredictions();
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    const { data, error } = await supabase
      .from("predictions")
      .select("match_id, home_score, away_score, penalty_winner, points_earned")
      .eq("user_id", session.user.id);

    if (error || !data) return [];
    
    return data.map((d: any) => ({
      matchId: d.match_id,
      homeScore: d.home_score,
      awayScore: d.away_score,
      penaltyWinner: d.penalty_winner,
      pointsEarned: d.points_earned,
    }));
  } catch (e) {
    console.error("Error getting all predictions:", e);
    return [];
  }
}
