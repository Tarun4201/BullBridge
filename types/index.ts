/**
 * Bull Bridge — TypeScript Type Definitions
 */

// ─── Stock Types ─────────────────────────────
export interface FinancialYear {
  year: string;
  revenue: number;
  profit: number;
}

export interface PeerStock {
  name: string;
  ticker: string;
  marketCap: string;
  pe: number;
  price: number;
}

export interface Shareholding {
  promoters: number;
  fii: number;
  dii: number;
  public: number;
}

export interface Stock {
  ticker: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  high52Week: number;
  low52Week: number;
  marketCap: string;
  pe: number;
  dividendYield: number;
  previousClose: number;
  open: number;
  sector: string;
  about?: string;
  pros?: string[];
  cons?: string[];
  peers?: PeerStock[];
  financials?: FinancialYear[];
  shareholding?: Shareholding;
}

export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ─── AI Prediction Types ─────────────────────
export type Direction = 'BULLISH' | 'BEARISH';
export type ModelName = 'LSTM' | 'XGBoost' | 'Ensemble';

export interface AIPrediction {
  model: ModelName;
  direction: Direction;
  targetPrice: number;
  confidence: number; // 0-100
  horizon: 'T+1' | 'T+5';
  factors: string[];
  accuracy: number; // historical accuracy %
}

export interface StockPredictions {
  ticker: string;
  timestamp: string;
  predictions: AIPrediction[];
}

// ─── News Types ──────────────────────────────
export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  url: string;
  imageUrl?: string;
  sentiment: Sentiment;
  relatedTickers: string[];
  summary?: string;
}

// ─── User Types ──────────────────────────────
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  experienceLevel: ExperienceLevel;
  sectors: string[];
  joinedDate: string;
  hasAcknowledgedDisclaimer: boolean;
}

// ─── Notification Types ──────────────────────
export type NotificationType = 
  | 'price_alert'
  | 'percent_move'
  | 'ai_signal'
  | 'earnings'
  | 'market_status'
  | 'breaking_news';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  ticker?: string;
  data?: Record<string, any>;
}

// ─── Market Types ────────────────────────────
export interface MarketIndex {
  name: string;
  ticker: string;
  value: number;
  change: number;
  changePercent: number;
}

// ─── Navigation Types ────────────────────────
export type TimeFrame = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX';
export type ChartType = 'candle' | 'line';
export type TrendTab = 'gainers' | 'losers' | 'active';
