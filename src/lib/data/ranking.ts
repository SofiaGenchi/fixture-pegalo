export interface RankingUser {
  rank: number;
  name: string;
  points: number;
  exactResults: number;
  correctWinners: number;
  totalPredictions: number;
  isCurrentUser?: boolean;
}

export const mockRanking: RankingUser[] = [
  { rank: 1,  name: "Martín G.",    points: 18, exactResults: 4, correctWinners: 6,  totalPredictions: 8 },
  { rank: 2,  name: "Lucía R.",     points: 15, exactResults: 3, correctWinners: 6,  totalPredictions: 8 },
  { rank: 3,  name: "Santiago M.",  points: 14, exactResults: 3, correctWinners: 5,  totalPredictions: 8 },
  { rank: 4,  name: "Valentina P.", points: 13, exactResults: 2, correctWinners: 7,  totalPredictions: 8 },
  { rank: 5,  name: "Tomás A.",     points: 12, exactResults: 2, correctWinners: 6,  totalPredictions: 7 },
  { rank: 6,  name: "Camila L.",    points: 11, exactResults: 2, correctWinners: 5,  totalPredictions: 8 },
  { rank: 7,  name: "Nicolás F.",   points: 10, exactResults: 1, correctWinners: 7,  totalPredictions: 8 },
  { rank: 8,  name: "Sofía D.",     points: 9,  exactResults: 1, correctWinners: 6,  totalPredictions: 7 },
  { rank: 9,  name: "Mateo B.",     points: 8,  exactResults: 1, correctWinners: 5,  totalPredictions: 8 },
  { rank: 10, name: "Isabella C.",  points: 7,  exactResults: 0, correctWinners: 7,  totalPredictions: 8 },
  { rank: 11, name: "Joaquín V.",   points: 6,  exactResults: 0, correctWinners: 6,  totalPredictions: 7 },
  { rank: 12, name: "Emilia S.",    points: 5,  exactResults: 0, correctWinners: 5,  totalPredictions: 6 },
];

export const currentUserRanking: RankingUser = {
  rank: 47,
  name: "Vos",
  points: 3,
  exactResults: 1,
  correctWinners: 0,
  totalPredictions: 2,
  isCurrentUser: true,
};
