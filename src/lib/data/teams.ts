import { Team, GroupId } from "@/types";
export const teams: Team[] = [
  { id: 2, name: "South Africa", nameEs: "Sudáfrica", code: "RSA", flag: "🇿🇦", groupId: "A" },
  { id: 9, name: "Brazil", nameEs: "Brasil", code: "BRA", flag: "🇧🇷", groupId: "C" },
  { id: 12, name: "Scotland", nameEs: "Escocia", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", groupId: "C" },
  { id: 16, name: "Turkey", nameEs: "Turquía", code: "TUR", flag: "🇹🇷", groupId: "D" },
  { id: 19, name: "Ivory Coast", nameEs: "Costa de Marfil", code: "CIV", flag: "🇨🇮", groupId: "E" },
  { id: 21, name: "Netherlands", nameEs: "Países Bajos", code: "NED", flag: "🇳🇱", groupId: "F" },
  { id: 30, name: "Cape Verde", nameEs: "Cabo Verde", code: "CPV", flag: "🇨🇻", groupId: "H" },
  { id: 33, name: "France", nameEs: "Francia", code: "FRA", flag: "🇫🇷", groupId: "I" },
  { id: 24, name: "Tunisia", nameEs: "Túnez", code: "TUN", flag: "🇹🇳", groupId: "F" },
  { id: 26, name: "Egypt", nameEs: "Egipto", code: "EGY", flag: "🇪🇬", groupId: "G" },
  { id: 35, name: "Iraq", nameEs: "Irak", code: "IRQ", flag: "🇮🇶", groupId: "I" },
  { id: 41, name: "Portugal", nameEs: "Portugal", code: "POR", flag: "🇵🇹", groupId: "K" },
  { id: 43, name: "Uzbekistan", nameEs: "Uzbekistán", code: "UZB", flag: "🇺🇿", groupId: "K" },
  { id: 44, name: "Colombia", nameEs: "Colombia", code: "COL", flag: "🇨🇴", groupId: "K" },
  { id: 20, name: "Ecuador", nameEs: "Ecuador", code: "ECU", flag: "🇪🇨", groupId: "E" },
  { id: 22, name: "Japan", nameEs: "Japón", code: "JPN", flag: "🇯🇵", groupId: "F" },
  { id: 28, name: "New Zealand", nameEs: "Nueva Zelanda", code: "NZL", flag: "🇳🇿", groupId: "G" },
  { id: 31, name: "Saudi Arabia", nameEs: "Arabia Saudita", code: "KSA", flag: "🇸🇦", groupId: "H" },
  { id: 39, name: "Austria", nameEs: "Austria", code: "AUT", flag: "🇦🇹", groupId: "J" },
  { id: 47, name: "Ghana", nameEs: "Ghana", code: "GHA", flag: "🇬🇭", groupId: "L" },
  { id: 3, name: "South Korea", nameEs: "Corea del Sur", code: "KOR", flag: "🇰🇷", groupId: "A" },
  { id: 29, name: "Spain", nameEs: "España", code: "ESP", flag: "🇪🇸", groupId: "H" },
  { id: 36, name: "Norway", nameEs: "Noruega", code: "NOR", flag: "🇳🇴", groupId: "I" },
  { id: 37, name: "Argentina", nameEs: "Argentina", code: "ARG", flag: "🇦🇷", groupId: "J" },
  { id: 42, name: "Democratic Republic of the Congo", nameEs: "RD Congo", code: "COD", flag: "🇨🇩", groupId: "K" },
  { id: 45, name: "England", nameEs: "Inglaterra", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", groupId: "L" },
  { id: 4, name: "Czech Republic", nameEs: "República Checa", code: "CZE", flag: "🇨🇿", groupId: "A" },
  { id: 5, name: "Canada", nameEs: "Canadá", code: "CAN", flag: "🇨🇦", groupId: "B" },
  { id: 7, name: "Qatar", nameEs: "Qatar", code: "QAT", flag: "🇶🇦", groupId: "B" },
  { id: 8, name: "Switzerland", nameEs: "Suiza", code: "SUI", flag: "🇨🇭", groupId: "B" },
  { id: 10, name: "Morocco", nameEs: "Marruecos", code: "MAR", flag: "🇲🇦", groupId: "C" },
  { id: 14, name: "Paraguay", nameEs: "Paraguay", code: "PAR", flag: "🇵🇾", groupId: "D" },
  { id: 18, name: "Curaçao", nameEs: "Curazao", code: "CUW", flag: "🇨🇼", groupId: "E" },
  { id: 23, name: "Sweden", nameEs: "Suecia", code: "SWE", flag: "🇸🇪", groupId: "F" },
  { id: 38, name: "Algeria", nameEs: "Argelia", code: "ALG", flag: "🇩🇿", groupId: "J" },
  { id: 40, name: "Jordan", nameEs: "Jordania", code: "JOR", flag: "🇯🇴", groupId: "J" },
  { id: 11, name: "Haiti", nameEs: "Haití", code: "HAI", flag: "🇭🇹", groupId: "C" },
  { id: 17, name: "Germany", nameEs: "Alemania", code: "GER", flag: "🇩🇪", groupId: "E" },
  { id: 32, name: "Uruguay", nameEs: "Uruguay", code: "URU", flag: "🇺🇾", groupId: "H" },
  { id: 34, name: "Senegal", nameEs: "Senegal", code: "SEN", flag: "🇸🇳", groupId: "I" },
  { id: 48, name: "Panama", nameEs: "Panamá", code: "PAN", flag: "🇵🇦", groupId: "L" },
  { id: 1, name: "Mexico", nameEs: "México", code: "MEX", flag: "🇲🇽", groupId: "A" },
  { id: 6, name: "Bosnia and Herzegovina", nameEs: "Bosnia y Herzegovina", code: "BIH", flag: "🇧🇦", groupId: "B" },
  { id: 13, name: "United States", nameEs: "Estados Unidos", code: "USA", flag: "🇺🇸", groupId: "D" },
  { id: 15, name: "Australia", nameEs: "Australia", code: "AUS", flag: "🇦🇺", groupId: "D" },
  { id: 25, name: "Belgium", nameEs: "Bélgica", code: "BEL", flag: "🇧🇪", groupId: "G" },
  { id: 27, name: "Iran", nameEs: "Irán", code: "IRN", flag: "🇮🇷", groupId: "G" },
  { id: 46, name: "Croatia", nameEs: "Croacia", code: "CRO", flag: "🇭🇷", groupId: "L" },
  { id: 999, name: "To Be Decided", nameEs: "Por definir", code: "TBD", flag: "❓", groupId: "" },
];

export const groups: GroupId[] = ["A","B","C","D","E","F","G","H","I","J","K","L"];

export function getTeamById(id: number): Team | undefined {
  return teams.find(t => t.id === id);
}

export function getTeamsByGroup(groupId: string): Team[] {
  return teams.filter(t => t.groupId === groupId);
}
