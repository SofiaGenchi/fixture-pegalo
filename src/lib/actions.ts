"use server";

import { Prediction } from "@/types";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Usually better to use service role on the server if not passing user tokens, or just ANON key if passing user JWT.
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Server action to save a prediction.
 * Requires the client to pass their JWT token since we don't have SSR cookie auth set up yet.
 */
export async function savePredictionAction(
  prediction: Prediction, 
  token?: string
): Promise<{ success: boolean; error?: string }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { success: false, error: "Supabase not configured." };
  }

  if (!token) {
    return { success: false, error: "Unauthorized: No token provided." };
  }

  try {
    // We create a one-off Supabase client for the server action
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "Unauthorized: Invalid token." };
    }

    const { error } = await supabase.from("predictions").upsert(
      {
        user_id: user.id,
        match_id: prediction.matchId,
        home_score: prediction.homeScore,
        away_score: prediction.awayScore,
        penalty_winner: prediction.penaltyWinner,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,match_id" }
    );

    if (error) {
      console.error("Error upserting prediction:", error);
      return { success: false, error: "Failed to save prediction in database." };
    }

    return { success: true };
  } catch (e) {
    console.error("Unexpected error in savePredictionAction:", e);
    return { success: false, error: "Internal server error." };
  }
}
