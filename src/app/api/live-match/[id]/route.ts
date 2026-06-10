import { NextResponse } from 'next/server';

const BZZOIRO_API_URL = "https://api.bzzoiro.com/api/v2";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = process.env.BZZOIRO_API_KEY;
  if (!token) {
    return NextResponse.json({ error: "Bzzoiro API Key is missing" }, { status: 500 });
  }

  const { id } = await params;
  
  try {
    const headers = {
      "Authorization": `Token ${token}`,
      "Content-Type": "application/json"
    };

    // 1. Fetch event status and score
    const eventRes = await fetch(`${BZZOIRO_API_URL}/events/${id}/`, { headers });
    if (!eventRes.ok) throw new Error("Failed to fetch event data");
    const eventData = await eventRes.json();

    // 2. Fetch event incidents
    const incidentsRes = await fetch(`${BZZOIRO_API_URL}/events/${id}/incidents/`, { headers });
    let incidentsData = [];
    if (incidentsRes.ok) {
      incidentsData = await incidentsRes.json();
    }

    return NextResponse.json({ eventData, incidentsData });
  } catch (error: any) {
    console.error("Error fetching live match data from Bzzoiro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
