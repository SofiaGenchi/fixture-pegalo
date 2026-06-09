import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const revalidate = 15; // Cache for 15 seconds

export async function GET(request: Request, { params }: { params: { username: string } }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Missing Supabase keys' }, { status: 500 });
  }

  try {
    const { username } = params;
    const decodedUsername = decodeURIComponent(username);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Fetch user standing and user_id using the username from user_standings view
    // (We use user_standings because it has both username and the computed points)
    const { data: standing, error: standingErr } = await supabase
      .from('user_standings')
      .select('user_id, username, points, exact_results, total_predictions, rank')
      .ilike('username', decodedUsername)
      .maybeSingle();

    if (standingErr) {
      return NextResponse.json({ error: standingErr.message }, { status: 500 });
    }

    if (!standing) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // 2. Fetch all predictions for this user
    const { data: predictions, error: predsErr } = await supabase
      .from('predictions')
      .select('match_id, home_score, away_score, updated_at')
      .eq('user_id', standing.user_id)
      .order('updated_at', { ascending: false });

    if (predsErr) {
      return NextResponse.json({ error: predsErr.message }, { status: 500 });
    }

    // Return the combined public profile
    return NextResponse.json({
      profile: {
        username: standing.username,
        points: standing.points,
        rank: standing.rank,
        exactResults: standing.exact_results,
        totalPredictions: standing.total_predictions,
      },
      predictions: predictions.map((p) => ({
        matchId: p.match_id,
        homeScore: p.home_score,
        awayScore: p.away_score,
        updatedAt: p.updated_at,
      }))
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
