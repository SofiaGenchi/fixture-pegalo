import { getMatches } from "@/lib/services/matches.service";
import { supabaseServer } from "@/lib/supabase-server";
import { RankingClient } from "@/components/ranking-client";

export const revalidate = 0; // Dynamic rendering

export const metadata = {
  title: "Tabla de Posiciones y Ranking - PEGALO Mundial 2026",
  description: "Mirá la tabla de posiciones oficial del torneo de pronósticos de PEGALO. Acumulá puntos con tus predicciones exactas y escalá en el ranking del Mundial.",
  openGraph: {
    title: "Tabla de Posiciones y Ranking - PEGALO Mundial 2026",
    description: "Fijate quién lidera el torneo de pronósticos y sumá tus puntos.",
    images: [{ url: "/icon.png" }],
  },
};

export default async function RankingPage() {
  const matches = await getMatches();
  
  let standings: any[] = [];
  
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from("user_standings_mv")
        .select("user_id, username, points, exact_results, total_predictions, rank")
        .order("rank", { ascending: true })
        .limit(1000);
        
      if (data && !error) {
        standings = data;
      }
    } catch (e) {
      console.error("Failed to fetch standings from server:", e);
    }
  }

  return (
    <RankingClient 
      initialStandings={standings} 
      initialMatches={matches} 
    />
  );
}
