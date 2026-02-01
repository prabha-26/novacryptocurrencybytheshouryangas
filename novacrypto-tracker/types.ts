export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  sparkline_in_7d?: { price: number[] };
}

export interface Asset {
  id: string;
  coinId: string;
  amount: number;
  avgBuyPrice: number;
}

export interface PortfolioItem extends Asset {
  coinData: CoinData;
  currentValue: number;
  totalCost: number;
  profit: number;
  profitPercentage: number;
}

export interface PortfolioStats {
  totalBalance: number;
  totalInvested: number;
  totalProfit: number;
  totalProfitPercentage: number;
  bestPerformer: PortfolioItem | null;
  worstPerformer: PortfolioItem | null;
}

export interface RiskHeatmapItem {
  asset: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  reason: string;
}

export interface RebalanceSuggestion {
  action: 'BUY' | 'SELL' | 'HOLD';
  asset: string;
  amount?: string;
  reason: string;
}

export interface AIAnalysisResult {
  summary: string;
  healthScore: number; // 0-100
  diversificationScore: number; // 0-100
  riskHeatmap: RiskHeatmapItem[];
  rebalanceSuggestions: RebalanceSuggestion[];
  marketSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Transaction {
  id: string;
  type: 'ADD' | 'REMOVE' | 'DEPOSIT' | 'WITHDRAW';
  coinId?: string; // Optional for banking tx
  coinName?: string; // Optional for banking tx
  coinSymbol?: string; // Optional for banking tx
  amount: number;
  pricePerCoin?: number; // Optional for banking tx
  totalValue: number;
  date: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  joinedAt: number;
  avatar?: string;
  fiatBalance: number;
  // Banking Details
  accountNumber: string; // 16 digits
  mobile: string;        // 10 digits
  ifsc: string;
  panCard: string;       // 10 chars (ABCDE1234F)
}

export interface MarketEvent {
  id: string;
  title: string;
  date: string; // ISO String or relative description
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'ECONOMY' | 'CRYPTO' | 'REGULATION';
}

export interface NewsHeadline {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  url?: string;
}

export type ViewState = 'dashboard' | 'portfolio' | 'analysis' | 'transactions';