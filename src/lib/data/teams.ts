export interface Team {
  id: number;
  name: string;
  nameEs: string;
  code: string;
  flag: string;
  groupId: string;
}

export const teams: Team[] = [
  { id: 2, name: "South Africa", nameEs: "South Africa", code: "RSA", flag: "🇿🇦", groupId: "A" },
  { id: 9, name: "Brazil", nameEs: "Brazil", code: "BRA", flag: "🇧🇷", groupId: "C" },
  { id: 12, name: "Scotland", nameEs: "Scotland", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", groupId: "C" },
  { id: 16, name: "Turkey", nameEs: "Turkey", code: "TUR", flag: "🇹🇷", groupId: "D" },
  { id: 19, name: "Ivory Coast", nameEs: "Ivory Coast", code: "CIV", flag: "🇨🇮", groupId: "E" },
  { id: 21, name: "Netherlands", nameEs: "Netherlands", code: "NED", flag: "🇳🇱", groupId: "F" },
  { id: 30, name: "Cape Verde", nameEs: "Cape Verde", code: "CPV", flag: "🇨🇻", groupId: "H" },
  { id: 33, name: "France", nameEs: "France", code: "FRA", flag: "🇫🇷", groupId: "I" },
  { id: 24, name: "Tunisia", nameEs: "Tunisia", code: "TUN", flag: "🇹🇳", groupId: "F" },
  { id: 26, name: "Egypt", nameEs: "Egypt", code: "EGY", flag: "🇪🇬", groupId: "G" },
  { id: 35, name: "Iraq", nameEs: "Iraq", code: "IRQ", flag: "🇮🇶", groupId: "I" },
  { id: 41, name: "Portugal", nameEs: "Portugal", code: "POR", flag: "🇵🇹", groupId: "K" },
  { id: 43, name: "Uzbekistan", nameEs: "Uzbekistan", code: "UZB", flag: "🇺🇿", groupId: "K" },
  { id: 44, name: "Colombia", nameEs: "Colombia", code: "COL", flag: "🇨🇴", groupId: "K" },
  { id: 20, name: "Ecuador", nameEs: "Ecuador", code: "ECU", flag: "🇪🇨", groupId: "E" },
  { id: 22, name: "Japan", nameEs: "Japan", code: "JPN", flag: "🇯🇵", groupId: "F" },
  { id: 28, name: "New Zealand", nameEs: "New Zealand", code: "NZL", flag: "🇳🇿", groupId: "G" },
  { id: 31, name: "Saudi Arabia", nameEs: "Saudi Arabia", code: "KSA", flag: "🇸🇦", groupId: "H" },
  { id: 39, name: "Austria", nameEs: "Austria", code: "AUT", flag: "🇦🇹", groupId: "J" },
  { id: 47, name: "Ghana", nameEs: "Ghana", code: "GHA", flag: "🇬🇭", groupId: "L" },
  { id: 3, name: "South Korea", nameEs: "South Korea", code: "KOR", flag: "🇰🇷", groupId: "A" },
  { id: 29, name: "Spain", nameEs: "Spain", code: "ESP", flag: "🇪🇸", groupId: "H" },
  { id: 36, name: "Norway", nameEs: "Norway", code: "NOR", flag: "🇳🇴", groupId: "I" },
  { id: 37, name: "Argentina", nameEs: "Argentina", code: "ARG", flag: "🇦🇷", groupId: "J" },
  { id: 42, name: "Democratic Republic of the Congo", nameEs: "Democratic Republic of the Congo", code: "COD", flag: "🇨🇩", groupId: "K" },
  { id: 45, name: "England", nameEs: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", groupId: "L" },
  { id: 4, name: "Czech Republic", nameEs: "Czech Republic", code: "CZE", flag: "🇨🇿", groupId: "A" },
  { id: 5, name: "Canada", nameEs: "Canada", code: "CAN", flag: "🇨🇦", groupId: "B" },
  { id: 7, name: "Qatar", nameEs: "Qatar", code: "QAT", flag: "🇶🇦", groupId: "B" },
  { id: 8, name: "Switzerland", nameEs: "Switzerland", code: "SUI", flag: "🇨🇭", groupId: "B" },
  { id: 10, name: "Morocco", nameEs: "Morocco", code: "MAR", flag: "🇲🇦", groupId: "C" },
  { id: 14, name: "Paraguay", nameEs: "Paraguay", code: "PAR", flag: "🇵🇾", groupId: "D" },
  { id: 18, name: "Curaçao", nameEs: "Curaçao", code: "CUW", flag: "🇨🇼", groupId: "E" },
  { id: 23, name: "Sweden", nameEs: "Sweden", code: "SWE", flag: "🇸🇪", groupId: "F" },
  { id: 38, name: "Algeria", nameEs: "Algeria", code: "ALG", flag: "🇩🇿", groupId: "J" },
  { id: 40, name: "Jordan", nameEs: "Jordan", code: "JOR", flag: "🇯🇴", groupId: "J" },
  { id: 11, name: "Haiti", nameEs: "Haiti", code: "HAI", flag: "🇭🇹", groupId: "C" },
  { id: 17, name: "Germany", nameEs: "Germany", code: "GER", flag: "🇩🇪", groupId: "E" },
  { id: 32, name: "Uruguay", nameEs: "Uruguay", code: "URU", flag: "🇺🇾", groupId: "H" },
  { id: 34, name: "Senegal", nameEs: "Senegal", code: "SEN", flag: "🇸🇳", groupId: "I" },
  { id: 48, name: "Panama", nameEs: "Panama", code: "PAN", flag: "🇵🇦", groupId: "L" },
  { id: 1, name: "Mexico", nameEs: "Mexico", code: "MEX", flag: "🇲🇽", groupId: "A" },
  { id: 6, name: "Bosnia and Herzegovina", nameEs: "Bosnia and Herzegovina", code: "BIH", flag: "🇧🇦", groupId: "B" },
  { id: 13, name: "United States", nameEs: "United States", code: "USA", flag: "🇺🇸", groupId: "D" },
  { id: 15, name: "Australia", nameEs: "Australia", code: "AUS", flag: "🇦🇺", groupId: "D" },
  { id: 25, name: "Belgium", nameEs: "Belgium", code: "BEL", flag: "🇧🇪", groupId: "G" },
  { id: 27, name: "Iran", nameEs: "Iran", code: "IRN", flag: "🇮🇷", groupId: "G" },
  { id: 46, name: "Croatia", nameEs: "Croatia", code: "CRO", flag: "🇭🇷", groupId: "L" },
];

export const groups = ["A","B","C","D","E","F","G","H","I","J","K","L"] as const;
export type GroupId = typeof groups[number];

export function getTeamById(id: number): Team | undefined {
  return teams.find(t => t.id === id);
}

export function getTeamsByGroup(groupId: string): Team[] {
  return teams.filter(t => t.groupId === groupId);
}
