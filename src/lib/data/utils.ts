import { Prediction } from './matches';
import { supabase, isSupabaseConfigured } from '../supabase-client';

/**
 * Calculate points earned for a prediction.
 * - Exact result: 3 pts
 * - Correct goal difference: 2 pts  
 * - Correct winner: 1 pt
 * - Miss: 0 pts
 */
export function calculatePoints(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number
): number {
  // Exact result
  if (predHome === realHome && predAway === realAway) return 3;
  
  // Correct goal difference
  if ((predHome - predAway) === (realHome - realAway)) return 2;
  
  // Correct winner
  const predWinner = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw';
  const realWinner = realHome > realAway ? 'home' : realHome < realAway ? 'away' : 'draw';
  if (predWinner === realWinner) return 1;
  
  return 0;
}

export function getPointsLabel(points: number): string {
  switch (points) {
    case 3: return 'Resultado exacto';
    case 2: return 'Diferencia correcta';
    case 1: return 'Ganador correcto';
    default: return 'Sin puntos';
  }
}

export function getPointsColor(points: number): string {
  switch (points) {
    case 3: return 'text-emerald-500';
    case 2: return 'text-blue-500';
    case 1: return 'text-amber-500';
    default: return 'text-muted-foreground';
  }
}

export function getPointsBg(points: number): string {
  switch (points) {
    case 3: return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 2: return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 1: return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    default: return 'bg-muted text-muted-foreground';
  }
}

// Format date to Argentina time (UTC-3)
export function formatDateAR(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: 'numeric',
    month: 'short',
  });
}

export function formatTimeAR(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatFullDateAR(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    group: 'Fase de Grupos',
    round_of_32: 'Octavos de Final',
    round_of_16: 'Octavos de Final',
    quarter: 'Cuartos de Final',
    semi: 'Semifinal',
    third: 'Tercer Puesto',
    final: 'Final',
  };
  return labels[stage] || stage;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    scheduled: 'Programado',
    live: 'EN VIVO',
    finished: 'Finalizado',
    postponed: 'Pospuesto',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'live': return 'bg-red-500 text-white animate-pulse';
    case 'finished': return 'bg-muted text-muted-foreground';
    case 'scheduled': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'postponed': return 'bg-amber-500/10 text-amber-600';
    default: return 'bg-muted text-muted-foreground';
  }
}

// Local storage helpers for predictions (before Supabase integration)
const PREDICTIONS_KEY = 'pegalo_predictions';
const USER_KEY = 'pegalo_current_user';

export function getPredictionsKey(): string {
  if (typeof window === 'undefined') return PREDICTIONS_KEY;
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u && u.username) {
        return `${PREDICTIONS_KEY}_${u.username.toLowerCase()}`;
      }
    } catch (e) {}
  }
  return PREDICTIONS_KEY;
}

// Internal synchronous helpers for fallback mode
function getAllPredictionsSync(): Prediction[] {
  if (typeof window === 'undefined') return [];
  const key = getPredictionsKey();
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

export async function savePrediction(prediction: Prediction): Promise<void> {
  if (!isSupabaseConfigured) {
    // LocalStorage Fallback
    const key = getPredictionsKey();
    const predictions = getAllPredictionsSync();
    const existing = predictions.findIndex(p => p.matchId === prediction.matchId);
    if (existing >= 0) {
      predictions[existing] = prediction;
    } else {
      predictions.push(prediction);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(predictions));
    }
    return;
  }

  // Supabase Live
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase.from("predictions").upsert(
      {
        user_id: session.user.id,
        match_id: prediction.matchId,
        home_score: prediction.homeScore,
        away_score: prediction.awayScore,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,match_id" }
    );

    if (error) {
      console.error("Error upserting prediction in Supabase:", error.message);
    }
  } catch (e) {
    console.error("Unexpected error saving prediction:", e);
  }
}

export async function getAllPredictions(): Promise<Prediction[]> {
  if (!isSupabaseConfigured) {
    return getAllPredictionsSync();
  }

  // Supabase Live
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    const { data, error } = await supabase
      .from("predictions")
      .select("match_id, home_score, away_score")
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error fetching predictions from Supabase:", error.message);
      return [];
    }

    return (data || []).map((p: any) => ({
      matchId: p.match_id,
      homeScore: p.home_score,
      awayScore: p.away_score,
    }));
  } catch (e) {
    console.error("Unexpected error getting predictions:", e);
    return [];
  }
}

export async function getPrediction(matchId: number): Promise<Prediction | undefined> {
  if (!isSupabaseConfigured) {
    return getAllPredictionsSync().find(p => p.matchId === matchId);
  }

  // Supabase Live
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return undefined;

    const { data, error } = await supabase
      .from("predictions")
      .select("match_id, home_score, away_score")
      .eq("user_id", session.user.id)
      .eq("match_id", matchId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching single prediction from Supabase:", error.message);
      return undefined;
    }

    if (!data) return undefined;

    return {
      matchId: data.match_id,
      homeScore: data.home_score,
      awayScore: data.away_score,
    };
  } catch (e) {
    console.error("Unexpected error getting prediction:", e);
    return undefined;
  }
}

export interface UserProfile {
  username: string;
  email: string;
}

export function saveUser(user: UserProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function clearUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY);
  }
}
