import { getMatches } from "@/lib/services/matches.service";
import { supabaseServer } from "@/lib/supabase-server";
import { DashboardClient } from "@/components/dashboard-client";

// Revalidation rule: this page should render dynamically (always fresh match scores)
export const revalidate = 0;

export const metadata = {
  title: "PEGALO - Pronósticos del Mundial 2026",
  description: "Sumate al fixture de PEGALO. Pronosticá los partidos, sumá puntos y competí con tus amigos en el ranking oficial del Mundial 2026.",
  openGraph: {
    title: "PEGALO - Fixture Mundial 2026",
    description: "Pronosticá los partidos y liderá la tabla de posiciones.",
    images: [{ url: "/icon.png" }],
  },
};

export default async function HomePage() {
  const matches = await getMatches();
  
  let topStandings: any[] = [];
  
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from("user_standings_mv")
        .select("*")
        .order("rank", { ascending: true })
        .limit(5);
        
      if (data && !error) {
        topStandings = data;
      }
    } catch (e) {
      console.error("Failed to fetch top standings from server:", e);
    }
  }

  return (
    <DashboardClient 
      initialMatches={matches} 
      initialTopStandings={topStandings} 
    />
  );
}
