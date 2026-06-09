import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Missing Supabase keys' }, { status: 500 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch global rankings bypassing RLS
    const { data: standingsData, error: standingsErr } = await supabase
      .from("user_standings")
      .select("user_id, username, points, exact_results, total_predictions, rank")
      .order("rank", { ascending: true })
      .limit(1000);

    if (standingsErr) {
      return NextResponse.json({ error: standingsErr.message }, { status: 500 });
    }

    return NextResponse.json({ standings: standingsData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
