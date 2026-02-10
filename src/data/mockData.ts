export type Sector = "Tech" | "Healthcare" | "Energy" | "Financials" | "Consumer" | "Index/ETF" | "International" | "Real Estate" | "Crypto" | "Industrials";

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  allocation: number;
  sector: Sector;
  weeksHeld: number;
  isActive: boolean; // active lineup vs bench
}

export interface GameModifiers {
  diversityScore: number; // 0-100
  diversityPenalty: number; // multiplier, e.g. 0.9 if failing
  stackingBonus: number; // bonus for correlated diversified plays
  volatilityBonus: number; // bonus for high-vol outperformance
  totalMultiplier: number; // final scoring multiplier
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
  adjustedGrowthPct: number;
  record: { wins: number; losses: number };
  streak: string;
  holdings: Holding[];
  weeklyHistory: number[];
  xp: number;
  level: number;
  badges: string[];
  gameModifiers: GameModifiers;
  sectorExposure: Record<Sector, number>;
}

const avatarInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase();

const calcSectorExposure = (holdings: Holding[]): Record<Sector, number> => {
  const sectors: Sector[] = ["Tech", "Healthcare", "Energy", "Financials", "Consumer", "Index/ETF", "International", "Real Estate", "Crypto", "Industrials"];
  const result = {} as Record<Sector, number>;
  sectors.forEach(s => {
    result[s] = holdings.filter(h => h.sector === s).reduce((sum, h) => sum + h.allocation, 0);
  });
  return result;
};

const makeModifiers = (diversityScore: number, stacking: number = 0, volatility: number = 0): GameModifiers => {
  const diversityPenalty = diversityScore >= 60 ? 1.0 : 0.9;
  const totalMultiplier = diversityPenalty + stacking + volatility;
  return { diversityScore, diversityPenalty, stackingBonus: stacking, volatilityBonus: volatility, totalMultiplier: Math.max(0.5, Math.min(1.3, totalMultiplier)) };
};

const marcus: Holding[] = [
  { symbol: "VOO", name: "Vanguard S&P 500", shares: 3.2, avgCost: 420, currentPrice: 448, allocation: 38, sector: "Index/ETF", weeksHeld: 12, isActive: true },
  { symbol: "AAPL", name: "Apple Inc.", shares: 2.5, avgCost: 178, currentPrice: 195, allocation: 18, sector: "Tech", weeksHeld: 8, isActive: true },
  { symbol: "NVDA", name: "NVIDIA Corp.", shares: 1.8, avgCost: 280, currentPrice: 340, allocation: 22, sector: "Tech", weeksHeld: 5, isActive: true },
  { symbol: "BTC", name: "Bitcoin ETF", shares: 0.5, avgCost: 42, currentPrice: 48, allocation: 7, sector: "Crypto", weeksHeld: 3, isActive: true },
  { symbol: "JNJ", name: "Johnson & Johnson", shares: 1.0, avgCost: 155, currentPrice: 160, allocation: 8, sector: "Healthcare", weeksHeld: 6, isActive: false },
  { symbol: "XLE", name: "Energy Select SPDR", shares: 2.0, avgCost: 85, currentPrice: 88, allocation: 7, sector: "Energy", weeksHeld: 4, isActive: false },
];

const sarah: Holding[] = [
  { symbol: "QQQ", name: "Invesco QQQ Trust", shares: 2.8, avgCost: 380, currentPrice: 405, allocation: 35, sector: "Index/ETF", weeksHeld: 10, isActive: true },
  { symbol: "MSFT", name: "Microsoft Corp.", shares: 1.5, avgCost: 370, currentPrice: 395, allocation: 18, sector: "Tech", weeksHeld: 9, isActive: true },
  { symbol: "AMZN", name: "Amazon.com Inc.", shares: 2.0, avgCost: 155, currentPrice: 168, allocation: 13, sector: "Consumer", weeksHeld: 7, isActive: true },
  { symbol: "VTI", name: "Vanguard Total Market", shares: 2.2, avgCost: 230, currentPrice: 242, allocation: 16, sector: "Index/ETF", weeksHeld: 11, isActive: true },
  { symbol: "UNH", name: "UnitedHealth Group", shares: 0.5, avgCost: 480, currentPrice: 510, allocation: 10, sector: "Healthcare", weeksHeld: 4, isActive: true },
  { symbol: "JPM", name: "JPMorgan Chase", shares: 1.2, avgCost: 170, currentPrice: 185, allocation: 8, sector: "Financials", weeksHeld: 3, isActive: false },
];

const jake: Holding[] = [
  { symbol: "TSLA", name: "Tesla Inc.", shares: 2.1, avgCost: 240, currentPrice: 225, allocation: 35, sector: "Consumer", weeksHeld: 12, isActive: true },
  { symbol: "GME", name: "GameStop Corp.", shares: 15, avgCost: 22, currentPrice: 18, allocation: 10, sector: "Consumer", weeksHeld: 10, isActive: true },
  { symbol: "SPY", name: "SPDR S&P 500", shares: 2.5, avgCost: 450, currentPrice: 462, allocation: 38, sector: "Index/ETF", weeksHeld: 13, isActive: true },
  { symbol: "COIN", name: "Coinbase Global", shares: 1.8, avgCost: 180, currentPrice: 195, allocation: 12, sector: "Crypto", weeksHeld: 8, isActive: true },
  { symbol: "RIOT", name: "Riot Platforms", shares: 5, avgCost: 12, currentPrice: 14, allocation: 5, sector: "Crypto", weeksHeld: 6, isActive: false },
];

const emily: Holding[] = [
  { symbol: "VTI", name: "Vanguard Total Market", shares: 4.5, avgCost: 228, currentPrice: 242, allocation: 30, sector: "Index/ETF", weeksHeld: 13, isActive: true },
  { symbol: "VXUS", name: "Vanguard Intl Stock", shares: 5.0, avgCost: 55, currentPrice: 58, allocation: 18, sector: "International", weeksHeld: 13, isActive: true },
  { symbol: "BND", name: "Vanguard Total Bond", shares: 4.2, avgCost: 72, currentPrice: 73, allocation: 15, sector: "Financials", weeksHeld: 13, isActive: true },
  { symbol: "VNQ", name: "Vanguard Real Estate", shares: 1.5, avgCost: 82, currentPrice: 85, allocation: 9, sector: "Real Estate", weeksHeld: 10, isActive: true },
  { symbol: "XLV", name: "Health Care Select", shares: 2.0, avgCost: 140, currentPrice: 148, allocation: 14, sector: "Healthcare", weeksHeld: 8, isActive: true },
  { symbol: "XLE", name: "Energy Select SPDR", shares: 2.0, avgCost: 85, currentPrice: 90, allocation: 14, sector: "Energy", weeksHeld: 6, isActive: false },
];

const tyler: Holding[] = [
  { symbol: "SCHD", name: "Schwab US Dividend", shares: 8.0, avgCost: 74, currentPrice: 78, allocation: 40, sector: "Index/ETF", weeksHeld: 13, isActive: true },
  { symbol: "O", name: "Realty Income Corp.", shares: 5.0, avgCost: 54, currentPrice: 56, allocation: 18, sector: "Real Estate", weeksHeld: 11, isActive: true },
  { symbol: "KO", name: "Coca-Cola Co.", shares: 4.0, avgCost: 58, currentPrice: 60, allocation: 15, sector: "Consumer", weeksHeld: 10, isActive: true },
  { symbol: "JNJ", name: "Johnson & Johnson", shares: 0.8, avgCost: 155, currentPrice: 160, allocation: 8, sector: "Healthcare", weeksHeld: 9, isActive: true },
  { symbol: "XOM", name: "Exxon Mobil", shares: 1.5, avgCost: 105, currentPrice: 112, allocation: 11, sector: "Energy", weeksHeld: 7, isActive: true },
  { symbol: "BAC", name: "Bank of America", shares: 3.0, avgCost: 32, currentPrice: 35, allocation: 8, sector: "Financials", weeksHeld: 5, isActive: false },
];

const aisha: Holding[] = [
  { symbol: "JEPI", name: "JPMorgan Equity Premium", shares: 10, avgCost: 55, currentPrice: 56, allocation: 35, sector: "Index/ETF", weeksHeld: 12, isActive: true },
  { symbol: "JEPQ", name: "JPMorgan Nasdaq Premium", shares: 5, avgCost: 48, currentPrice: 49, allocation: 15, sector: "Index/ETF", weeksHeld: 10, isActive: true },
  { symbol: "MAIN", name: "Main Street Capital", shares: 3, avgCost: 42, currentPrice: 44, allocation: 8, sector: "Financials", weeksHeld: 8, isActive: true },
  { symbol: "VYM", name: "Vanguard High Dividend", shares: 2.5, avgCost: 110, currentPrice: 112, allocation: 18, sector: "Index/ETF", weeksHeld: 11, isActive: true },
  { symbol: "PFE", name: "Pfizer Inc.", shares: 5, avgCost: 28, currentPrice: 30, allocation: 10, sector: "Healthcare", weeksHeld: 6, isActive: true },
  { symbol: "NEE", name: "NextEra Energy", shares: 1.5, avgCost: 65, currentPrice: 68, allocation: 14, sector: "Energy", weeksHeld: 4, isActive: false },
];

const chris: Holding[] = [
  { symbol: "SOFI", name: "SoFi Technologies", shares: 20, avgCost: 8, currentPrice: 9.5, allocation: 12, sector: "Financials", weeksHeld: 13, isActive: true },
  { symbol: "PLTR", name: "Palantir Technologies", shares: 8, avgCost: 18, currentPrice: 22, allocation: 11, sector: "Tech", weeksHeld: 11, isActive: true },
  { symbol: "VOO", name: "Vanguard S&P 500", shares: 2.8, avgCost: 420, currentPrice: 448, allocation: 40, sector: "Index/ETF", weeksHeld: 13, isActive: true },
  { symbol: "AMD", name: "AMD Inc.", shares: 1.5, avgCost: 140, currentPrice: 155, allocation: 15, sector: "Tech", weeksHeld: 9, isActive: true },
  { symbol: "LIT", name: "Global X Lithium ETF", shares: 3, avgCost: 45, currentPrice: 48, allocation: 9, sector: "Industrials", weeksHeld: 5, isActive: true },
  { symbol: "RIVN", name: "Rivian Automotive", shares: 5, avgCost: 15, currentPrice: 17, allocation: 13, sector: "Consumer", weeksHeld: 4, isActive: false },
];

const dana: Holding[] = [
  { symbol: "ARKK", name: "ARK Innovation ETF", shares: 6, avgCost: 48, currentPrice: 42, allocation: 16, sector: "Index/ETF", weeksHeld: 13, isActive: true },
  { symbol: "MARA", name: "Marathon Digital", shares: 10, avgCost: 15, currentPrice: 12, allocation: 8, sector: "Crypto", weeksHeld: 12, isActive: true },
  { symbol: "SPY", name: "SPDR S&P 500", shares: 2.0, avgCost: 450, currentPrice: 462, allocation: 40, sector: "Index/ETF", weeksHeld: 13, isActive: true },
  { symbol: "SQ", name: "Block Inc.", shares: 2.5, avgCost: 65, currentPrice: 70, allocation: 12, sector: "Financials", weeksHeld: 10, isActive: true },
  { symbol: "DKNG", name: "DraftKings Inc.", shares: 3, avgCost: 35, currentPrice: 38, allocation: 14, sector: "Consumer", weeksHeld: 7, isActive: true },
  { symbol: "BABA", name: "Alibaba Group", shares: 2, avgCost: 80, currentPrice: 85, allocation: 10, sector: "International", weeksHeld: 3, isActive: false },
];

export const leagueMembers: LeagueMember[] = [
  {
    id: "1", name: "Marcus Chen", teamName: "Bull Market Bandits", avatar: avatarInitials("Marcus Chen"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2712, weeklyGrowthPct: 4.2, adjustedGrowthPct: 4.2,
    record: { wins: 9, losses: 3 }, streak: "W3",
    holdings: marcus, weeklyHistory: [0.8, 1.2, -0.5, 2.1, 1.5, -1.2, 3.1, 0.4, -0.8, 2.3, 1.8, -0.3, 4.2],
    xp: 2850, level: 12, badges: ["🏆 Season 1 Champ", "🔥 3-Win Streak", "📈 Best Week"],
    gameModifiers: makeModifiers(72, 0, 0.03),
    sectorExposure: calcSectorExposure(marcus),
  },
  {
    id: "2", name: "Sarah Williams", teamName: "Diamond Hands", avatar: avatarInitials("Sarah Williams"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2628, weeklyGrowthPct: 2.8, adjustedGrowthPct: 2.8,
    record: { wins: 8, losses: 4 }, streak: "W1",
    holdings: sarah, weeklyHistory: [1.5, -0.3, 2.0, 0.8, -1.1, 1.8, 0.5, 2.2, -0.7, 1.3, 0.6, 1.9, 2.8],
    xp: 2420, level: 10, badges: ["🎯 Diversified Pro", "📊 Consistent"],
    gameModifiers: makeModifiers(85, 0.02, 0),
    sectorExposure: calcSectorExposure(sarah),
  },
  {
    id: "3", name: "Jake Rodriguez", teamName: "Stonks Only Go Up", avatar: avatarInitials("Jake Rodriguez"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2580, weeklyGrowthPct: -1.3, adjustedGrowthPct: -1.56,
    record: { wins: 7, losses: 5 }, streak: "L2",
    holdings: jake, weeklyHistory: [2.8, 3.5, -2.1, 1.0, -0.5, 4.2, -3.1, 1.8, 0.5, -1.8, 2.2, -0.9, -1.3],
    xp: 1980, level: 8, badges: ["💎 Diamond Hands", "🎰 High Roller"],
    gameModifiers: makeModifiers(38, 0, 0.08),
    sectorExposure: calcSectorExposure(jake),
  },
  {
    id: "4", name: "Emily Park", teamName: "The Index Funders", avatar: avatarInitials("Emily Park"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2544, weeklyGrowthPct: 3.5, adjustedGrowthPct: 3.57,
    record: { wins: 7, losses: 5 }, streak: "W2",
    holdings: emily, weeklyHistory: [0.5, 0.8, 0.3, 1.0, 0.7, -0.2, 0.9, 1.1, 0.4, 0.6, 1.2, 0.8, 3.5],
    xp: 2650, level: 11, badges: ["🎯 Diversified Pro", "🛡️ Steady Eddie", "📚 Scholar"],
    gameModifiers: makeModifiers(95, 0.05, 0),
    sectorExposure: calcSectorExposure(emily),
  },
  {
    id: "5", name: "Tyler Brooks", teamName: "Bear Trap LLC", avatar: avatarInitials("Tyler Brooks"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2496, weeklyGrowthPct: 1.1, adjustedGrowthPct: 1.1,
    record: { wins: 6, losses: 6 }, streak: "L1",
    holdings: tyler, weeklyHistory: [0.3, -0.5, 0.8, 0.2, 1.1, -0.3, 0.6, -0.8, 1.2, 0.4, -0.2, 0.7, 1.1],
    xp: 1750, level: 7, badges: ["💰 Dividend King"],
    gameModifiers: makeModifiers(78, 0, 0),
    sectorExposure: calcSectorExposure(tyler),
  },
  {
    id: "6", name: "Aisha Johnson", teamName: "Yield Chasers", avatar: avatarInitials("Aisha Johnson"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2460, weeklyGrowthPct: -0.5, adjustedGrowthPct: -0.5,
    record: { wins: 6, losses: 6 }, streak: "W1",
    holdings: aisha, weeklyHistory: [0.6, 0.2, -0.4, 0.8, -0.1, 0.5, -0.7, 0.3, 0.9, -0.3, 0.4, 0.1, -0.5],
    xp: 1620, level: 7, badges: ["💰 Dividend King", "🛡️ Steady Eddie"],
    gameModifiers: makeModifiers(68, 0, 0),
    sectorExposure: calcSectorExposure(aisha),
  },
  {
    id: "7", name: "Chris Novak", teamName: "Bag Holders Anonymous", avatar: avatarInitials("Chris Novak"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2388, weeklyGrowthPct: 0.9, adjustedGrowthPct: 0.95,
    record: { wins: 5, losses: 7 }, streak: "L3",
    holdings: chris, weeklyHistory: [-1.2, 2.5, -0.8, 1.3, -2.0, 0.5, 1.8, -1.5, 0.7, -0.3, 1.1, -0.6, 0.9],
    xp: 1380, level: 6, badges: ["⚡ EV Stack"],
    gameModifiers: makeModifiers(62, 0.04, 0.02),
    sectorExposure: calcSectorExposure(chris),
  },
  {
    id: "8", name: "Dana Mitchell", teamName: "Margin Call Mafia", avatar: avatarInitials("Dana Mitchell"),
    weeklyDeposit: 50, totalInvested: 2400, currentValue: 2352, weeklyGrowthPct: -2.1, adjustedGrowthPct: -2.1,
    record: { wins: 4, losses: 8 }, streak: "L1",
    holdings: dana, weeklyHistory: [-0.5, 1.8, -2.5, 3.2, -1.8, 0.3, -2.8, 1.5, -0.9, -1.2, 2.0, -1.5, -2.1],
    xp: 980, level: 4, badges: ["🎰 High Roller"],
    gameModifiers: makeModifiers(55, 0, 0.05),
    sectorExposure: calcSectorExposure(dana),
  },
];

export interface Matchup {
  id: string;
  week: number;
  home: LeagueMember;
  away: LeagueMember;
}

export const currentWeek = 13;
export const seasonLength = 17;

export const weeklyMatchups: Matchup[] = [
  { id: "m1", week: currentWeek, home: leagueMembers[0], away: leagueMembers[7] },
  { id: "m2", week: currentWeek, home: leagueMembers[1], away: leagueMembers[6] },
  { id: "m3", week: currentWeek, home: leagueMembers[2], away: leagueMembers[5] },
  { id: "m4", week: currentWeek, home: leagueMembers[3], away: leagueMembers[4] },
];

export interface ActivityItem {
  id: string;
  type: "trade" | "matchup_result" | "deposit" | "badge" | "trash_talk" | "lineup_alert";
  userId: string;
  userName: string;
  teamName: string;
  message: string;
  timestamp: string;
  emoji?: string;
}

export const activityFeed: ActivityItem[] = [
  { id: "a1", type: "trash_talk", userId: "1", userName: "Marcus Chen", teamName: "Bull Market Bandits", message: "3 wins in a row baby! Who's stopping me? 🔥", timestamp: "2m ago", emoji: "🔥" },
  { id: "a2", type: "trade", userId: "3", userName: "Jake Rodriguez", teamName: "Stonks Only Go Up", message: "Bought 5 more shares of COIN. Crypto winter is over.", timestamp: "15m ago", emoji: "💰" },
  { id: "a3", type: "matchup_result", userId: "2", userName: "Sarah Williams", teamName: "Diamond Hands", message: "Beat Bag Holders Anonymous this week! +2.8% vs +0.9%", timestamp: "1h ago", emoji: "✅" },
  { id: "a4", type: "badge", userId: "4", userName: "Emily Park", teamName: "The Index Funders", message: "Earned the 🎯 Diversified Pro badge!", timestamp: "2h ago", emoji: "🏅" },
  { id: "a5", type: "deposit", userId: "5", userName: "Tyler Brooks", teamName: "Bear Trap LLC", message: "Weekly $50 deposit invested into SCHD and XOM.", timestamp: "3h ago", emoji: "💵" },
  { id: "a6", type: "trash_talk", userId: "8", userName: "Dana Mitchell", teamName: "Margin Call Mafia", message: "ARKK is about to explode. Mark my words. 📈", timestamp: "4h ago", emoji: "📈" },
  { id: "a7", type: "lineup_alert", userId: "3", userName: "Jake Rodriguez", teamName: "Stonks Only Go Up", message: "⚠️ Lineup diversity score: 38/100. Scoring penalty active!", timestamp: "5h ago", emoji: "⚠️" },
  { id: "a8", type: "trade", userId: "6", userName: "Aisha Johnson", teamName: "Yield Chasers", message: "Added PFE to the portfolio. Healthcare exposure ↑", timestamp: "6h ago", emoji: "🏥" },
  { id: "a9", type: "matchup_result", userId: "7", userName: "Chris Novak", teamName: "Bag Holders Anonymous", message: "Lost again... 3 Ls in a row. Time to shake up the lineup.", timestamp: "8h ago", emoji: "😤" },
  { id: "a10", type: "trash_talk", userId: "1", userName: "Marcus Chen", teamName: "Bull Market Bandits", message: "@Dana your ARKK position is looking like my fantasy football bench 😂", timestamp: "10h ago", emoji: "😂" },
];

export interface LeagueSettings {
  name: string;
  weeklyDeposit: number;
  seasonLength: number;
  currentWeek: number;
  memberCount: number;
  maxMembers: number;
  commissioner: string;
  diversityStrictness: "relaxed" | "standard" | "strict";
  playoffTeams: number;
  playoffStartWeek: number;
  allowCrypto: boolean;
  allowInternational: boolean;
  maxSingleSectorPct: number;
  minSectorsRequired: number;
}

export const leagueSettings: LeagueSettings = {
  name: "Capital League",
  weeklyDeposit: 50,
  seasonLength: 17,
  currentWeek: 13,
  memberCount: 8,
  maxMembers: 10,
  commissioner: "Marcus Chen",
  diversityStrictness: "standard",
  playoffTeams: 4,
  playoffStartWeek: 14,
  allowCrypto: true,
  allowInternational: true,
  maxSingleSectorPct: 40,
  minSectorsRequired: 3,
};
