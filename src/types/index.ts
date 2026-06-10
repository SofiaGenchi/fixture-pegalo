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
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  currentMinute?: number;
  half?: string; // "1T", "2T", "ET", "PEN"
  bzzoiroId?: number; // Maps to Bzzoiro API event ID
}

export interface Prediction {
  matchId: number;
  homeScore: number;
  awayScore: number;
  penaltyWinner?: 'home' | 'away';
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

export interface Team {
  id: number;
  name: string;
  nameEs: string;
  code: string;
  flag: string;
  groupId: string;
}

export type GroupId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
}
