export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  allocation: number;
}

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
  holdings: Holding[];
  weeklyHistory: number[];
}

const avatarInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase();

export const leagueMembers: LeagueMember[] = [
  {
    id: "1", name: "Marcus Chen", teamName: "Bull Market Bandits", avatar: avatarInitials("Marcus Chen"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2712, weeklyGrowthPct: 4.2,
    record: { wins: 9, losses: 3 }, streak: "W3",
    holdings: [
      { symbol: "VOO", name: "Vanguard S&P 500", shares: 3.2, avgCost: 420, currentPrice: 448, allocation: 53 },
      { symbol: "AAPL", name: "Apple Inc.", shares: 2.5, avgCost: 178, currentPrice: 195, allocation: 18 },
      { symbol: "NVDA", name: "NVIDIA Corp.", shares: 1.8, avgCost: 280, currentPrice: 340, allocation: 22 },
      { symbol: "BTC", name: "Bitcoin ETF", shares: 0.5, avgCost: 42, currentPrice: 48, allocation: 7 },
    ],
    weeklyHistory: [0.8, 1.2, -0.5, 2.1, 1.5, -1.2, 3.1, 0.4, -0.8, 2.3, 1.8, -0.3, 4.2],
  },
  {
    id: "2", name: "Sarah Williams", teamName: "Diamond Hands", avatar: avatarInitials("Sarah Williams"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2628, weeklyGrowthPct: 2.8,
    record: { wins: 8, losses: 4 }, streak: "W1",
    holdings: [
      { symbol: "QQQ", name: "Invesco QQQ Trust", shares: 2.8, avgCost: 380, currentPrice: 405, allocation: 43 },
      { symbol: "MSFT", name: "Microsoft Corp.", shares: 1.5, avgCost: 370, currentPrice: 395, allocation: 23 },
      { symbol: "AMZN", name: "Amazon.com Inc.", shares: 2.0, avgCost: 155, currentPrice: 168, allocation: 13 },
      { symbol: "VTI", name: "Vanguard Total Market", shares: 2.2, avgCost: 230, currentPrice: 242, allocation: 21 },
    ],
    weeklyHistory: [1.5, -0.3, 2.0, 0.8, -1.1, 1.8, 0.5, 2.2, -0.7, 1.3, 0.6, 1.9, 2.8],
  },
  {
    id: "3", name: "Jake Rodriguez", teamName: "Stonks Only Go Up", avatar: avatarInitials("Jake Rodriguez"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2580, weeklyGrowthPct: -1.3,
    record: { wins: 7, losses: 5 }, streak: "L2",
    holdings: [
      { symbol: "TSLA", name: "Tesla Inc.", shares: 2.1, avgCost: 240, currentPrice: 225, allocation: 35 },
      { symbol: "GME", name: "GameStop Corp.", shares: 15, avgCost: 22, currentPrice: 18, allocation: 10 },
      { symbol: "SPY", name: "SPDR S&P 500", shares: 2.5, avgCost: 450, currentPrice: 462, allocation: 43 },
      { symbol: "COIN", name: "Coinbase Global", shares: 1.8, avgCost: 180, currentPrice: 195, allocation: 12 },
    ],
    weeklyHistory: [2.8, 3.5, -2.1, 1.0, -0.5, 4.2, -3.1, 1.8, 0.5, -1.8, 2.2, -0.9, -1.3],
  },
  {
    id: "4", name: "Emily Park", teamName: "The Index Funders", avatar: avatarInitials("Emily Park"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2544, weeklyGrowthPct: 3.5,
    record: { wins: 7, losses: 5 }, streak: "W2",
    holdings: [
      { symbol: "VTI", name: "Vanguard Total Market", shares: 4.5, avgCost: 228, currentPrice: 242, allocation: 42 },
      { symbol: "VXUS", name: "Vanguard Intl Stock", shares: 5.0, avgCost: 55, currentPrice: 58, allocation: 22 },
      { symbol: "BND", name: "Vanguard Total Bond", shares: 4.2, avgCost: 72, currentPrice: 73, allocation: 24 },
      { symbol: "VNQ", name: "Vanguard Real Estate", shares: 1.5, avgCost: 82, currentPrice: 85, allocation: 12 },
    ],
    weeklyHistory: [0.5, 0.8, 0.3, 1.0, 0.7, -0.2, 0.9, 1.1, 0.4, 0.6, 1.2, 0.8, 3.5],
  },
  {
    id: "5", name: "Tyler Brooks", teamName: "Bear Trap LLC", avatar: avatarInitials("Tyler Brooks"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2496, weeklyGrowthPct: 1.1,
    record: { wins: 6, losses: 6 }, streak: "L1",
    holdings: [
      { symbol: "SCHD", name: "Schwab US Dividend", shares: 8.0, avgCost: 74, currentPrice: 78, allocation: 50 },
      { symbol: "O", name: "Realty Income Corp.", shares: 5.0, avgCost: 54, currentPrice: 56, allocation: 22 },
      { symbol: "KO", name: "Coca-Cola Co.", shares: 4.0, avgCost: 58, currentPrice: 60, allocation: 19 },
      { symbol: "JNJ", name: "Johnson & Johnson", shares: 0.8, avgCost: 155, currentPrice: 160, allocation: 9 },
    ],
    weeklyHistory: [0.3, -0.5, 0.8, 0.2, 1.1, -0.3, 0.6, -0.8, 1.2, 0.4, -0.2, 0.7, 1.1],
  },
  {
    id: "6", name: "Aisha Johnson", teamName: "Yield Chasers", avatar: avatarInitials("Aisha Johnson"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2460, weeklyGrowthPct: -0.5,
    record: { wins: 6, losses: 6 }, streak: "W1",
    holdings: [
      { symbol: "JEPI", name: "JPMorgan Equity Premium", shares: 10, avgCost: 55, currentPrice: 56, allocation: 45 },
      { symbol: "JEPQ", name: "JPMorgan Nasdaq Premium", shares: 5, avgCost: 48, currentPrice: 49, allocation: 20 },
      { symbol: "MAIN", name: "Main Street Capital", shares: 3, avgCost: 42, currentPrice: 44, allocation: 11 },
      { symbol: "VYM", name: "Vanguard High Dividend", shares: 2.5, avgCost: 110, currentPrice: 112, allocation: 24 },
    ],
    weeklyHistory: [0.6, 0.2, -0.4, 0.8, -0.1, 0.5, -0.7, 0.3, 0.9, -0.3, 0.4, 0.1, -0.5],
  },
  {
    id: "7", name: "Chris Novak", teamName: "Bag Holders Anonymous", avatar: avatarInitials("Chris Novak"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2388, weeklyGrowthPct: 0.9,
    record: { wins: 5, losses: 7 }, streak: "L3",
    holdings: [
      { symbol: "SOFI", name: "SoFi Technologies", shares: 20, avgCost: 8, currentPrice: 9.5, allocation: 15 },
      { symbol: "PLTR", name: "Palantir Technologies", shares: 8, avgCost: 18, currentPrice: 22, allocation: 14 },
      { symbol: "VOO", name: "Vanguard S&P 500", shares: 2.8, avgCost: 420, currentPrice: 448, allocation: 52 },
      { symbol: "AMD", name: "AMD Inc.", shares: 1.5, avgCost: 140, currentPrice: 155, allocation: 19 },
    ],
    weeklyHistory: [-1.2, 2.5, -0.8, 1.3, -2.0, 0.5, 1.8, -1.5, 0.7, -0.3, 1.1, -0.6, 0.9],
  },
  {
    id: "8", name: "Dana Mitchell", teamName: "Margin Call Mafia", avatar: avatarInitials("Dana Mitchell"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2352, weeklyGrowthPct: -2.1,
    record: { wins: 4, losses: 8 }, streak: "L1",
    holdings: [
      { symbol: "ARKK", name: "ARK Innovation ETF", shares: 6, avgCost: 48, currentPrice: 42, allocation: 20 },
      { symbol: "MARA", name: "Marathon Digital", shares: 10, avgCost: 15, currentPrice: 12, allocation: 10 },
      { symbol: "SPY", name: "SPDR S&P 500", shares: 2.0, avgCost: 450, currentPrice: 462, allocation: 55 },
      { symbol: "SQ", name: "Block Inc.", shares: 2.5, avgCost: 65, currentPrice: 70, allocation: 15 },
    ],
    weeklyHistory: [-0.5, 1.8, -2.5, 3.2, -1.8, 0.3, -2.8, 1.5, -0.9, -1.2, 2.0, -1.5, -2.1],
  },
];

export interface Matchup {
  id: string;
  week: number;
  home: LeagueMember;
  away: LeagueMember;
}

export const currentWeek = 13;

export const weeklyMatchups: Matchup[] = [
  { id: "m1", week: currentWeek, home: leagueMembers[0], away: leagueMembers[7] },
  { id: "m2", week: currentWeek, home: leagueMembers[1], away: leagueMembers[6] },
  { id: "m3", week: currentWeek, home: leagueMembers[2], away: leagueMembers[5] },
  { id: "m4", week: currentWeek, home: leagueMembers[3], away: leagueMembers[4] },
];
