export type EventType = "goal" | "yellow_card" | "red_card" | "sub";

export interface MatchEvent {
  id: string;
  matchId: string;
  teamId: string;
  type: EventType;
  minute: number;
  half?: string; // e.g. "1T", "2T"
  player: string;
  playerOut?: string; // For substitutions
  detail?: string;
}

export interface LiveMatchData {
  status: "scheduled" | "live" | "finished" | "postponed";
  homeScore: number;
  awayScore: number;
  currentMinute?: number;
  half?: string;
  events: MatchEvent[];
}

const BZZOIRO_API_URL = "https://api.bzzoiro.com/api/v2";

/**
 * Fetches live data and incidents for a match from the Bzzoiro API.
 * Requires NEXT_PUBLIC_BZZOIRO_API_KEY to be set in .env
 */
export async function fetchLiveMatchData(bzzoiroEventId: number): Promise<LiveMatchData | null> {
  const token = process.env.NEXT_PUBLIC_BZZOIRO_API_KEY;
  if (!token) {
    console.warn("⚠️ Bzzoiro API Key is missing. Please set NEXT_PUBLIC_BZZOIRO_API_KEY.");
    return null;
  }

  try {
    const headers = {
      "Authorization": `Token ${token}`,
      "Content-Type": "application/json"
    };

    // 1. Fetch event status and score
    const eventRes = await fetch(`${BZZOIRO_API_URL}/events/${bzzoiroEventId}/`, { headers });
    if (!eventRes.ok) throw new Error("Failed to fetch event data");
    const eventData = await eventRes.json();

    // 2. Fetch event incidents
    const incidentsRes = await fetch(`${BZZOIRO_API_URL}/events/${bzzoiroEventId}/incidents/`, { headers });
    let incidentsData = [];
    if (incidentsRes.ok) {
      incidentsData = await incidentsRes.json();
    }

    // Map Bzzoiro incidents to our MatchEvent type
    const mappedEvents: MatchEvent[] = incidentsData.map((inc: any) => ({
      id: inc.id?.toString() || Math.random().toString(36).substr(2, 9),
      matchId: bzzoiroEventId.toString(),
      teamId: inc.team_id?.toString() || "", // Adjust based on Bzzoiro API mapping
      type: mapBzzoiroIncidentType(inc.incident_class || inc.type),
      minute: inc.time || inc.minute || 0,
      half: inc.time_extra ? "ET" : "1T", // Simplified for now
      player: inc.player?.name || inc.text || "Jugador",
      playerOut: inc.player_out?.name,
      detail: inc.reason || "",
    }));

    // Map Bzzoiro status string to our MatchStatus
    let status: LiveMatchData["status"] = "scheduled";
    const bzStatus = (eventData.status || "").toLowerCase();
    if (bzStatus === "inprogress" || bzStatus === "live") status = "live";
    else if (bzStatus === "finished" || bzStatus === "ended") status = "finished";
    else if (bzStatus === "postponed") status = "postponed";

    return {
      status,
      homeScore: eventData.home_score ?? 0,
      awayScore: eventData.away_score ?? 0,
      currentMinute: eventData.current_minute,
      half: eventData.period || "", // E.g., '1H', '2H'
      events: mappedEvents,
    };
  } catch (error) {
    console.error("Error fetching live match data from Bzzoiro:", error);
    return null;
  }
}

/** Helper to map external API incident types to our internal ones */
function mapBzzoiroIncidentType(type: string): EventType {
  const t = (type || "").toLowerCase();
  if (t.includes("goal")) return "goal";
  if (t.includes("yellow")) return "yellow_card";
  if (t.includes("red")) return "red_card";
  if (t.includes("sub")) return "sub";
  return "goal"; // default fallback
}
