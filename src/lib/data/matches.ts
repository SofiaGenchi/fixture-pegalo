export type MatchStage = 'group' | 'round_of_32' | 'round_of_16' | 'quarter' | 'semi' | 'third' | 'final';
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed';

export interface Match {
  id: number;
  stage: MatchStage;
  groupId?: string;
  homeTeamId: number;
  awayTeamId: number;
  /** ISO string in UTC */
  matchDate: string;
  stadium: string;
  city: string;
  country: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  currentMinute?: number;
  half?: string; // "1T", "2T", "ET", "PEN"
  bzzoiroId?: number; // Maps to Bzzoiro API event ID
}

export interface Prediction {
  matchId: number;
  homeScore: number;
  awayScore: number;
  pointsEarned?: number;
}

export interface GroupStanding {
  teamId: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

// All times stored as UTC. Dates are approximate. Real fixture will be seeded from API.
// We provide enough group stage matches to demonstrate the app.
// Format: matchDate is UTC ISO string. Display converts to Argentina (UTC-3).

export const matches: Match[] = [
  // ─── GRUPO A ───
  { id: 1,  stage: 'group', groupId: 'A', homeTeamId: 1,  awayTeamId: 2,  matchDate: '2026-06-11T19:00:00Z', stadium: 'Estadio Azteca', city: 'Ciudad de México', country: 'MX', status: 'scheduled' },
  { id: 2,  stage: 'group', groupId: 'A', homeTeamId: 3,  awayTeamId: 4,  matchDate: '2026-06-12T01:00:00Z', stadium: 'AT&T Stadium', city: 'Dallas', country: 'US', status: 'scheduled' },
  { id: 3,  stage: 'group', groupId: 'A', homeTeamId: 1,  awayTeamId: 3,  matchDate: '2026-06-16T22:00:00Z', stadium: 'Estadio Azteca', city: 'Ciudad de México', country: 'MX', status: 'scheduled' },
  { id: 4,  stage: 'group', groupId: 'A', homeTeamId: 4,  awayTeamId: 2,  matchDate: '2026-06-16T19:00:00Z', stadium: 'AT&T Stadium', city: 'Dallas', country: 'US', status: 'scheduled' },
  { id: 5,  stage: 'group', groupId: 'A', homeTeamId: 2,  awayTeamId: 3,  matchDate: '2026-06-21T22:00:00Z', stadium: 'Estadio Azteca', city: 'Ciudad de México', country: 'MX', status: 'scheduled' },
  { id: 6,  stage: 'group', groupId: 'A', homeTeamId: 4,  awayTeamId: 1,  matchDate: '2026-06-21T22:00:00Z', stadium: 'AT&T Stadium', city: 'Dallas', country: 'US', status: 'scheduled' },

  // ─── GRUPO B ───
  { id: 7,  stage: 'group', groupId: 'B', homeTeamId: 5,  awayTeamId: 6,  matchDate: '2026-06-11T22:00:00Z', stadium: 'BC Place', city: 'Vancouver', country: 'CA', status: 'scheduled' },
  { id: 8,  stage: 'group', groupId: 'B', homeTeamId: 7,  awayTeamId: 8,  matchDate: '2026-06-12T19:00:00Z', stadium: 'BMO Field', city: 'Toronto', country: 'CA', status: 'scheduled' },
  { id: 9,  stage: 'group', groupId: 'B', homeTeamId: 5,  awayTeamId: 7,  matchDate: '2026-06-17T01:00:00Z', stadium: 'BC Place', city: 'Vancouver', country: 'CA', status: 'scheduled' },
  { id: 10, stage: 'group', groupId: 'B', homeTeamId: 8,  awayTeamId: 6,  matchDate: '2026-06-17T19:00:00Z', stadium: 'BMO Field', city: 'Toronto', country: 'CA', status: 'scheduled' },
  { id: 11, stage: 'group', groupId: 'B', homeTeamId: 6,  awayTeamId: 7,  matchDate: '2026-06-22T22:00:00Z', stadium: 'BC Place', city: 'Vancouver', country: 'CA', status: 'scheduled' },
  { id: 12, stage: 'group', groupId: 'B', homeTeamId: 8,  awayTeamId: 5,  matchDate: '2026-06-22T22:00:00Z', stadium: 'BMO Field', city: 'Toronto', country: 'CA', status: 'scheduled' },

  // ─── GRUPO C ───
  { id: 13, stage: 'group', groupId: 'C', homeTeamId: 9,  awayTeamId: 10, matchDate: '2026-06-12T22:00:00Z', stadium: 'Rose Bowl', city: 'Los Angeles', country: 'US', status: 'scheduled' },
  { id: 14, stage: 'group', groupId: 'C', homeTeamId: 11, awayTeamId: 12, matchDate: '2026-06-12T19:00:00Z', stadium: 'Levi\'s Stadium', city: 'San Francisco', country: 'US', status: 'scheduled' },
  { id: 15, stage: 'group', groupId: 'C', homeTeamId: 9,  awayTeamId: 11, matchDate: '2026-06-17T22:00:00Z', stadium: 'Rose Bowl', city: 'Los Angeles', country: 'US', status: 'scheduled' },
  { id: 16, stage: 'group', groupId: 'C', homeTeamId: 12, awayTeamId: 10, matchDate: '2026-06-17T19:00:00Z', stadium: 'Levi\'s Stadium', city: 'San Francisco', country: 'US', status: 'scheduled' },
  { id: 17, stage: 'group', groupId: 'C', homeTeamId: 10, awayTeamId: 11, matchDate: '2026-06-22T19:00:00Z', stadium: 'Rose Bowl', city: 'Los Angeles', country: 'US', status: 'scheduled' },
  { id: 18, stage: 'group', groupId: 'C', homeTeamId: 12, awayTeamId: 9,  matchDate: '2026-06-22T19:00:00Z', stadium: 'Levi\'s Stadium', city: 'San Francisco', country: 'US', status: 'scheduled' },

  // ─── GRUPO D ───
  { id: 19, stage: 'group', groupId: 'D', homeTeamId: 13, awayTeamId: 14, matchDate: '2026-06-12T01:00:00Z', stadium: 'MetLife Stadium', city: 'New York/New Jersey', country: 'US', status: 'scheduled' },
  { id: 20, stage: 'group', groupId: 'D', homeTeamId: 15, awayTeamId: 16, matchDate: '2026-06-13T19:00:00Z', stadium: 'Lincoln Financial Field', city: 'Philadelphia', country: 'US', status: 'scheduled' },
  { id: 21, stage: 'group', groupId: 'D', homeTeamId: 13, awayTeamId: 15, matchDate: '2026-06-18T01:00:00Z', stadium: 'MetLife Stadium', city: 'New York/New Jersey', country: 'US', status: 'scheduled' },
  { id: 22, stage: 'group', groupId: 'D', homeTeamId: 16, awayTeamId: 14, matchDate: '2026-06-18T19:00:00Z', stadium: 'Lincoln Financial Field', city: 'Philadelphia', country: 'US', status: 'scheduled' },
  { id: 23, stage: 'group', groupId: 'D', homeTeamId: 14, awayTeamId: 15, matchDate: '2026-06-23T22:00:00Z', stadium: 'MetLife Stadium', city: 'New York/New Jersey', country: 'US', status: 'scheduled' },
  { id: 24, stage: 'group', groupId: 'D', homeTeamId: 16, awayTeamId: 13, matchDate: '2026-06-23T22:00:00Z', stadium: 'Lincoln Financial Field', city: 'Philadelphia', country: 'US', status: 'scheduled' },

  // ─── GRUPO E ───
  { id: 25, stage: 'group', groupId: 'E', homeTeamId: 17, awayTeamId: 18, matchDate: '2026-06-13T01:00:00Z', stadium: 'NRG Stadium', city: 'Houston', country: 'US', status: 'scheduled' },
  { id: 26, stage: 'group', groupId: 'E', homeTeamId: 19, awayTeamId: 20, matchDate: '2026-06-13T19:00:00Z', stadium: 'Hard Rock Stadium', city: 'Miami', country: 'US', status: 'scheduled' },
  { id: 27, stage: 'group', groupId: 'E', homeTeamId: 17, awayTeamId: 19, matchDate: '2026-06-18T22:00:00Z', stadium: 'NRG Stadium', city: 'Houston', country: 'US', status: 'scheduled' },
  { id: 28, stage: 'group', groupId: 'E', homeTeamId: 20, awayTeamId: 18, matchDate: '2026-06-18T19:00:00Z', stadium: 'Hard Rock Stadium', city: 'Miami', country: 'US', status: 'scheduled' },
  { id: 29, stage: 'group', groupId: 'E', homeTeamId: 18, awayTeamId: 19, matchDate: '2026-06-23T19:00:00Z', stadium: 'NRG Stadium', city: 'Houston', country: 'US', status: 'scheduled' },
  { id: 30, stage: 'group', groupId: 'E', homeTeamId: 20, awayTeamId: 17, matchDate: '2026-06-23T19:00:00Z', stadium: 'Hard Rock Stadium', city: 'Miami', country: 'US', status: 'scheduled' },

  // ─── GRUPO F ───
  { id: 31, stage: 'group', groupId: 'F', homeTeamId: 21, awayTeamId: 22, matchDate: '2026-06-13T22:00:00Z', stadium: 'Gillette Stadium', city: 'Boston', country: 'US', status: 'scheduled' },
  { id: 32, stage: 'group', groupId: 'F', homeTeamId: 23, awayTeamId: 24, matchDate: '2026-06-14T01:00:00Z', stadium: 'CenturyLink Field', city: 'Seattle', country: 'US', status: 'scheduled' },
  { id: 33, stage: 'group', groupId: 'F', homeTeamId: 21, awayTeamId: 23, matchDate: '2026-06-19T22:00:00Z', stadium: 'Gillette Stadium', city: 'Boston', country: 'US', status: 'scheduled' },
  { id: 34, stage: 'group', groupId: 'F', homeTeamId: 24, awayTeamId: 22, matchDate: '2026-06-19T19:00:00Z', stadium: 'CenturyLink Field', city: 'Seattle', country: 'US', status: 'scheduled' },
  { id: 35, stage: 'group', groupId: 'F', homeTeamId: 22, awayTeamId: 23, matchDate: '2026-06-24T22:00:00Z', stadium: 'Gillette Stadium', city: 'Boston', country: 'US', status: 'scheduled' },
  { id: 36, stage: 'group', groupId: 'F', homeTeamId: 24, awayTeamId: 21, matchDate: '2026-06-24T22:00:00Z', stadium: 'CenturyLink Field', city: 'Seattle', country: 'US', status: 'scheduled' },

  // ─── GRUPO G ───
  { id: 37, stage: 'group', groupId: 'G', homeTeamId: 25, awayTeamId: 26, matchDate: '2026-06-14T19:00:00Z', stadium: 'BBVA Stadium', city: 'Monterrey', country: 'MX', status: 'scheduled' },
  { id: 38, stage: 'group', groupId: 'G', homeTeamId: 27, awayTeamId: 28, matchDate: '2026-06-14T22:00:00Z', stadium: 'Arrowhead Stadium', city: 'Kansas City', country: 'US', status: 'scheduled' },
  { id: 39, stage: 'group', groupId: 'G', homeTeamId: 25, awayTeamId: 27, matchDate: '2026-06-19T19:00:00Z', stadium: 'BBVA Stadium', city: 'Monterrey', country: 'MX', status: 'scheduled' },
  { id: 40, stage: 'group', groupId: 'G', homeTeamId: 28, awayTeamId: 26, matchDate: '2026-06-19T22:00:00Z', stadium: 'Arrowhead Stadium', city: 'Kansas City', country: 'US', status: 'scheduled' },
  { id: 41, stage: 'group', groupId: 'G', homeTeamId: 26, awayTeamId: 27, matchDate: '2026-06-24T19:00:00Z', stadium: 'BBVA Stadium', city: 'Monterrey', country: 'MX', status: 'scheduled' },
  { id: 42, stage: 'group', groupId: 'G', homeTeamId: 28, awayTeamId: 25, matchDate: '2026-06-24T19:00:00Z', stadium: 'Arrowhead Stadium', city: 'Kansas City', country: 'US', status: 'scheduled' },

  // ─── GRUPO H ───
  { id: 43, stage: 'group', groupId: 'H', homeTeamId: 29, awayTeamId: 30, matchDate: '2026-06-14T01:00:00Z', stadium: 'Estadio Guadalajara', city: 'Guadalajara', country: 'MX', status: 'scheduled' },
  { id: 44, stage: 'group', groupId: 'H', homeTeamId: 31, awayTeamId: 32, matchDate: '2026-06-15T19:00:00Z', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'US', status: 'scheduled' },
  { id: 45, stage: 'group', groupId: 'H', homeTeamId: 29, awayTeamId: 31, matchDate: '2026-06-20T22:00:00Z', stadium: 'Estadio Guadalajara', city: 'Guadalajara', country: 'MX', status: 'scheduled' },
  { id: 46, stage: 'group', groupId: 'H', homeTeamId: 32, awayTeamId: 30, matchDate: '2026-06-20T19:00:00Z', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'US', status: 'scheduled' },
  { id: 47, stage: 'group', groupId: 'H', homeTeamId: 30, awayTeamId: 31, matchDate: '2026-06-25T19:00:00Z', stadium: 'Estadio Guadalajara', city: 'Guadalajara', country: 'MX', status: 'scheduled' },
  { id: 48, stage: 'group', groupId: 'H', homeTeamId: 32, awayTeamId: 29, matchDate: '2026-06-25T19:00:00Z', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'US', status: 'scheduled' },

  // ─── GRUPO I ───
  { id: 49, stage: 'group', groupId: 'I', homeTeamId: 33, awayTeamId: 34, matchDate: '2026-06-15T22:00:00Z', stadium: 'Rose Bowl', city: 'Los Angeles', country: 'US', status: 'scheduled' },
  { id: 50, stage: 'group', groupId: 'I', homeTeamId: 35, awayTeamId: 36, matchDate: '2026-06-15T19:00:00Z', stadium: 'Levi\'s Stadium', city: 'San Francisco', country: 'US', status: 'scheduled' },
  { id: 51, stage: 'group', groupId: 'I', homeTeamId: 33, awayTeamId: 35, matchDate: '2026-06-20T22:00:00Z', stadium: 'Rose Bowl', city: 'Los Angeles', country: 'US', status: 'scheduled' },
  { id: 52, stage: 'group', groupId: 'I', homeTeamId: 36, awayTeamId: 34, matchDate: '2026-06-20T19:00:00Z', stadium: 'Levi\'s Stadium', city: 'San Francisco', country: 'US', status: 'scheduled' },
  { id: 53, stage: 'group', groupId: 'I', homeTeamId: 34, awayTeamId: 35, matchDate: '2026-06-25T22:00:00Z', stadium: 'Rose Bowl', city: 'Los Angeles', country: 'US', status: 'scheduled' },
  { id: 54, stage: 'group', groupId: 'I', homeTeamId: 36, awayTeamId: 33, matchDate: '2026-06-25T22:00:00Z', stadium: 'Levi\'s Stadium', city: 'San Francisco', country: 'US', status: 'scheduled' },

  // ─── GRUPO J ───
  { id: 55, stage: 'group', groupId: 'J', homeTeamId: 37, awayTeamId: 38, matchDate: '2026-06-15T01:00:00Z', stadium: 'Hard Rock Stadium', city: 'Miami', country: 'US', status: 'scheduled' },
  { id: 56, stage: 'group', groupId: 'J', homeTeamId: 39, awayTeamId: 40, matchDate: '2026-06-16T01:00:00Z', stadium: 'NRG Stadium', city: 'Houston', country: 'US', status: 'scheduled' },
  { id: 57, stage: 'group', groupId: 'J', homeTeamId: 37, awayTeamId: 39, matchDate: '2026-06-21T01:00:00Z', stadium: 'Hard Rock Stadium', city: 'Miami', country: 'US', status: 'scheduled' },
  { id: 58, stage: 'group', groupId: 'J', homeTeamId: 40, awayTeamId: 38, matchDate: '2026-06-21T19:00:00Z', stadium: 'NRG Stadium', city: 'Houston', country: 'US', status: 'scheduled' },
  { id: 59, stage: 'group', groupId: 'J', homeTeamId: 38, awayTeamId: 39, matchDate: '2026-06-26T22:00:00Z', stadium: 'Hard Rock Stadium', city: 'Miami', country: 'US', status: 'scheduled' },
  { id: 60, stage: 'group', groupId: 'J', homeTeamId: 40, awayTeamId: 37, matchDate: '2026-06-26T22:00:00Z', stadium: 'NRG Stadium', city: 'Houston', country: 'US', status: 'scheduled' },

  // ─── GRUPO K ───
  { id: 61, stage: 'group', groupId: 'K', homeTeamId: 41, awayTeamId: 42, matchDate: '2026-06-16T01:00:00Z', stadium: 'MetLife Stadium', city: 'New York/New Jersey', country: 'US', status: 'scheduled' },
  { id: 62, stage: 'group', groupId: 'K', homeTeamId: 43, awayTeamId: 44, matchDate: '2026-06-16T19:00:00Z', stadium: 'Gillette Stadium', city: 'Boston', country: 'US', status: 'scheduled' },
  { id: 63, stage: 'group', groupId: 'K', homeTeamId: 41, awayTeamId: 43, matchDate: '2026-06-21T01:00:00Z', stadium: 'MetLife Stadium', city: 'New York/New Jersey', country: 'US', status: 'scheduled' },
  { id: 64, stage: 'group', groupId: 'K', homeTeamId: 44, awayTeamId: 42, matchDate: '2026-06-21T19:00:00Z', stadium: 'Gillette Stadium', city: 'Boston', country: 'US', status: 'scheduled' },
  { id: 65, stage: 'group', groupId: 'K', homeTeamId: 42, awayTeamId: 43, matchDate: '2026-06-26T19:00:00Z', stadium: 'MetLife Stadium', city: 'New York/New Jersey', country: 'US', status: 'scheduled' },
  { id: 66, stage: 'group', groupId: 'K', homeTeamId: 44, awayTeamId: 41, matchDate: '2026-06-26T19:00:00Z', stadium: 'Gillette Stadium', city: 'Boston', country: 'US', status: 'scheduled' },

  // ─── GRUPO L ───
  { id: 67, stage: 'group', groupId: 'L', homeTeamId: 45, awayTeamId: 46, matchDate: '2026-06-16T22:00:00Z', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'US', status: 'scheduled' },
  { id: 68, stage: 'group', groupId: 'L', homeTeamId: 47, awayTeamId: 48, matchDate: '2026-06-17T01:00:00Z', stadium: 'Arrowhead Stadium', city: 'Kansas City', country: 'US', status: 'scheduled' },
  { id: 69, stage: 'group', groupId: 'L', homeTeamId: 45, awayTeamId: 47, matchDate: '2026-06-22T01:00:00Z', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'US', status: 'scheduled' },
  { id: 70, stage: 'group', groupId: 'L', homeTeamId: 48, awayTeamId: 46, matchDate: '2026-06-22T19:00:00Z', stadium: 'Arrowhead Stadium', city: 'Kansas City', country: 'US', status: 'scheduled' },
  { id: 71, stage: 'group', groupId: 'L', homeTeamId: 46, awayTeamId: 47, matchDate: '2026-06-27T22:00:00Z', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'US', status: 'scheduled' },
  { id: 72, stage: 'group', groupId: 'L', homeTeamId: 48, awayTeamId: 45, matchDate: '2026-06-27T22:00:00Z', stadium: 'Arrowhead Stadium', city: 'Kansas City', country: 'US', status: 'scheduled' },
];

export function getMatchesByGroup(groupId: string): Match[] {
  return matches.filter(m => m.groupId === groupId);
}

export function getMatchesByStage(stage: MatchStage): Match[] {
  return matches.filter(m => m.stage === stage);
}

export function getMatchById(id: number): Match | undefined {
  return matches.find(m => m.id === id);
}

export function getTodayMatches(): Match[] {
  const now = new Date();
  return matches.filter(m => {
    const d = new Date(m.matchDate);
    return d.toDateString() === now.toDateString();
  });
}

export function getNextMatch(): Match | undefined {
  const now = new Date();
  return matches
    .filter(m => new Date(m.matchDate) > now && m.status === 'scheduled')
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())[0];
}

export function getUpcomingMatches(limit: number = 5): Match[] {
  const now = new Date();
  return matches
    .filter(m => new Date(m.matchDate) > now)
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
    .slice(0, limit);
}

export function getRecentResults(limit: number = 5): Match[] {
  return matches
    .filter(m => m.status === 'finished')
    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
    .slice(0, limit);
}
