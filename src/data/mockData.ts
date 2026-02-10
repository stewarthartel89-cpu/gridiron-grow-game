export interface LeagueMember {
  id: string;
  name: string;
  teamName: string;
  avatar: string;
  weeklyDeposit: number;
  totalInvested: number;
  currentValue: number;
  weeklyGrowthPct: number;
  record: { wins: number; losses: number };
  streak: string;
}

export interface Matchup {
  id: string;
  week: number;
  home: LeagueMember;
  away: LeagueMember;
}

const avatarInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase();

export const leagueMembers: LeagueMember[] = [
  {
    id: "1", name: "Marcus Chen", teamName: "Bull Market Bandits", avatar: avatarInitials("Marcus Chen"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2712, weeklyGrowthPct: 4.2,
    record: { wins: 9, losses: 3 }, streak: "W3",
  },
  {
    id: "2", name: "Sarah Williams", teamName: "Diamond Hands", avatar: avatarInitials("Sarah Williams"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2628, weeklyGrowthPct: 2.8,
    record: { wins: 8, losses: 4 }, streak: "W1",
  },
  {
    id: "3", name: "Jake Rodriguez", teamName: "Stonks Only Go Up", avatar: avatarInitials("Jake Rodriguez"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2580, weeklyGrowthPct: -1.3,
    record: { wins: 7, losses: 5 }, streak: "L2",
  },
  {
    id: "4", name: "Emily Park", teamName: "The Index Funders", avatar: avatarInitials("Emily Park"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2544, weeklyGrowthPct: 3.5,
    record: { wins: 7, losses: 5 }, streak: "W2",
  },
  {
    id: "5", name: "Tyler Brooks", teamName: "Bear Trap LLC", avatar: avatarInitials("Tyler Brooks"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2496, weeklyGrowthPct: 1.1,
    record: { wins: 6, losses: 6 }, streak: "L1",
  },
  {
    id: "6", name: "Aisha Johnson", teamName: "Yield Chasers", avatar: avatarInitials("Aisha Johnson"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2460, weeklyGrowthPct: -0.5,
    record: { wins: 6, losses: 6 }, streak: "W1",
  },
  {
    id: "7", name: "Chris Novak", teamName: "Bag Holders Anonymous", avatar: avatarInitials("Chris Novak"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2388, weeklyGrowthPct: 0.9,
    record: { wins: 5, losses: 7 }, streak: "L3",
  },
  {
    id: "8", name: "Dana Mitchell", teamName: "Margin Call Mafia", avatar: avatarInitials("Dana Mitchell"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2352, weeklyGrowthPct: -2.1,
    record: { wins: 4, losses: 8 }, streak: "L1",
  },
];

export const currentWeek = 13;

export const weeklyMatchups: Matchup[] = [
  { id: "m1", week: currentWeek, home: leagueMembers[0], away: leagueMembers[7] },
  { id: "m2", week: currentWeek, home: leagueMembers[1], away: leagueMembers[6] },
  { id: "m3", week: currentWeek, home: leagueMembers[2], away: leagueMembers[5] },
  { id: "m4", week: currentWeek, home: leagueMembers[3], away: leagueMembers[4] },
];
