import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json(
      { error: 'Faltan credenciales de entorno de Supabase (Service Key requerida para RLS)' },
      { status: 500 }
    );
  }

  try {
    // 1. Obtener datos de la API pública gratuita (no requiere API Key)
    const apiRes = await fetch('https://worldcup26.ir/get/games', {
      next: { revalidate: 0 } // No cachear la llamada en Next.js
    });

    const data = await apiRes.json();

    if (!data.games || data.games.length === 0) {
      return NextResponse.json({ message: 'No se encontraron partidos en la API.' });
    }

    // 2. Mapear la respuesta de la API a nuestro esquema de Supabase
    const mappedMatches = data.games.map((f: any) => ({
      id: parseInt(f.id),
      stage: mapStage(f.type),
      group_id: f.group || null,
      home_team_id: parseInt(f.home_team_id),
      away_team_id: parseInt(f.away_team_id),
      // Convertir '06/11/2026 13:00' a formato ISO
      match_date: parseDate(f.local_date),
      stadium: `Estadio ${f.stadium_id}`, // Podríamos hacer fetch a /get/stadiums para el nombre real
      city: 'Sede Oficial',
      country: '', 
      status: mapStatus(f.finished, f.time_elapsed),
      home_score: f.home_score === "null" ? null : parseInt(f.home_score),
      away_score: f.away_score === "null" ? null : parseInt(f.away_score),
    }));

    // 3. Upsert en Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { error: dbError } = await supabase.from('matches').upsert(mappedMatches);

    if (dbError) {
      return NextResponse.json({ error: 'Error guardando en Supabase', details: dbError }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Se actualizaron ${mappedMatches.length} partidos exitosamente usando la API pública gratuita.`
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
  }
}

// Utilidades de mapeo
function mapStatus(finished: string, timeElapsed: string): string {
  if (finished === 'TRUE') return 'finished';
  if (timeElapsed === 'notstarted') return 'scheduled';
  return 'live';
}

function mapStage(type: string): string {
  if (type === 'group') return 'group';
  if (type === 'R16') return 'round_of_16';
  if (type === 'R32') return 'round_of_32';
  if (type === 'quarter') return 'quarter';
  if (type === 'semi') return 'semi';
  if (type === 'third') return 'third';
  if (type === 'final') return 'final';
  return 'group';
}

function parseDate(localDateStr: string): string {
  // Espera formato "MM/DD/YYYY HH:mm" ej "06/11/2026 13:00"
  try {
    const [datePart, timePart] = localDateStr.split(' ');
    const [month, day, year] = datePart.split('/');
    const [hour, minute] = timePart.split(':');
    
    const d = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour) + 6, parseInt(minute)));
    return d.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}
