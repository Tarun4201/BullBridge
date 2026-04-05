/**
 * Bull Bridge — Comprehensive Mock Data
 * NSE/BSE stocks, indices, AI predictions, news, notifications
 */

import { Stock, MarketIndex, NewsArticle, AIPrediction, StockPredictions, Notification, CandleData, StockQuote, User } from '../types';

// ─── Market Indices ──────────────────────────
export const marketIndices: MarketIndex[] = [
  { name: 'NIFTY 50', ticker: '^NSEI', value: 23145.80, change: 187.45, changePercent: 0.82 },
  { name: 'SENSEX', ticker: '^BSESN', value: 76432.15, change: 612.30, changePercent: 0.81 },
  { name: 'NIFTY Bank', ticker: '^NSEBANK', value: 49876.50, change: -234.10, changePercent: -0.47 },
];

// ─── NSE/BSE Stocks ──────────────────────────
export const allStocks: Stock[] = [
  {
    ticker: 'RELIANCE.NS', name: 'Reliance Industries', exchange: 'NSE',
    price: 2876.45, change: 42.30, changePercent: 1.49, volume: 12453000,
    dayHigh: 2892.10, dayLow: 2831.50, high52Week: 3217.60, low52Week: 2222.00,
    marketCap: '₹19.4L Cr', pe: 28.5, dividendYield: 0.37, previousClose: 2834.15,
    open: 2840.00, sector: 'Energy',
  },
  {
    ticker: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE',
    price: 3654.20, change: -28.75, changePercent: -0.78, volume: 4521000,
    dayHigh: 3692.00, dayLow: 3641.80, high52Week: 4246.00, low52Week: 3320.00,
    marketCap: '₹13.2L Cr', pe: 31.2, dividendYield: 1.22, previousClose: 3682.95,
    open: 3680.00, sector: 'Tech',
  },
  {
    ticker: 'HDFCBANK.NS', name: 'HDFC Bank', exchange: 'NSE',
    price: 1642.80, change: 18.90, changePercent: 1.16, volume: 8932000,
    dayHigh: 1658.40, dayLow: 1620.10, high52Week: 1880.00, low52Week: 1367.00,
    marketCap: '₹12.5L Cr', pe: 19.8, dividendYield: 1.15, previousClose: 1623.90,
    open: 1625.00, sector: 'Banking',
  },
  {
    ticker: 'INFY.NS', name: 'Infosys', exchange: 'NSE',
    price: 1534.60, change: 22.15, changePercent: 1.46, volume: 7845000,
    dayHigh: 1542.90, dayLow: 1509.20, high52Week: 1962.00, low52Week: 1358.00,
    marketCap: '₹6.3L Cr', pe: 26.4, dividendYield: 2.58, previousClose: 1512.45,
    open: 1515.00, sector: 'Tech',
  },
  {
    ticker: 'ICICIBANK.NS', name: 'ICICI Bank', exchange: 'NSE',
    price: 1098.30, change: 12.45, changePercent: 1.15, volume: 11230000,
    dayHigh: 1105.80, dayLow: 1082.60, high52Week: 1362.00, low52Week: 918.00,
    marketCap: '₹7.7L Cr', pe: 17.6, dividendYield: 0.82, previousClose: 1085.85,
    open: 1087.00, sector: 'Banking',
  },
  {
    ticker: 'HINDUNILVR.NS', name: 'Hindustan Unilever', exchange: 'NSE',
    price: 2412.50, change: -15.80, changePercent: -0.65, volume: 2341000,
    dayHigh: 2435.00, dayLow: 2398.60, high52Week: 2859.00, low52Week: 2137.00,
    marketCap: '₹5.7L Cr', pe: 55.2, dividendYield: 1.65, previousClose: 2428.30,
    open: 2430.00, sector: 'FMCG',
  },
  {
    ticker: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE',
    price: 756.20, change: 8.35, changePercent: 1.12, volume: 15670000,
    dayHigh: 762.80, dayLow: 745.10, high52Week: 912.00, low52Week: 602.00,
    marketCap: '₹6.7L Cr', pe: 10.2, dividendYield: 1.72, previousClose: 747.85,
    open: 748.00, sector: 'Banking',
  },
  {
    ticker: 'BHARTIARTL.NS', name: 'Bharti Airtel', exchange: 'NSE',
    price: 1678.90, change: 34.20, changePercent: 2.08, volume: 5432000,
    dayHigh: 1695.40, dayLow: 1642.30, high52Week: 1779.00, low52Week: 1099.00,
    marketCap: '₹9.8L Cr', pe: 74.5, dividendYield: 0.48, previousClose: 1644.70,
    open: 1648.00, sector: 'Telecom',
  },
  {
    ticker: 'ITC.NS', name: 'ITC Limited', exchange: 'NSE',
    price: 432.15, change: -3.25, changePercent: -0.75, volume: 18920000,
    dayHigh: 438.90, dayLow: 429.80, high52Week: 528.00, low52Week: 399.00,
    marketCap: '₹5.4L Cr', pe: 25.8, dividendYield: 3.12, previousClose: 435.40,
    open: 435.00, sector: 'FMCG',
  },
  {
    ticker: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', exchange: 'NSE',
    price: 1876.40, change: -22.60, changePercent: -1.19, volume: 3210000,
    dayHigh: 1905.20, dayLow: 1868.30, high52Week: 2083.00, low52Week: 1544.00,
    marketCap: '₹3.7L Cr', pe: 21.3, dividendYield: 0.11, previousClose: 1899.00,
    open: 1898.00, sector: 'Banking',
  },
  {
    ticker: 'LT.NS', name: 'Larsen & Toubro', exchange: 'NSE',
    price: 3245.80, change: 56.70, changePercent: 1.78, volume: 2890000,
    dayHigh: 3268.40, dayLow: 3185.20, high52Week: 3938.00, low52Week: 3050.00,
    marketCap: '₹4.5L Cr', pe: 33.6, dividendYield: 0.82, previousClose: 3189.10,
    open: 3192.00, sector: 'Infrastructure',
  },
  {
    ticker: 'WIPRO.NS', name: 'Wipro', exchange: 'NSE',
    price: 456.30, change: 8.90, changePercent: 1.99, volume: 9870000,
    dayHigh: 462.80, dayLow: 445.60, high52Week: 587.00, low52Week: 377.00,
    marketCap: '₹2.4L Cr', pe: 22.7, dividendYield: 0.22, previousClose: 447.40,
    open: 448.00, sector: 'Tech',
  },
  {
    ticker: 'TATAMOTORS.NS', name: 'Tata Motors', exchange: 'NSE',
    price: 768.55, change: -12.40, changePercent: -1.59, volume: 14560000,
    dayHigh: 785.60, dayLow: 762.30, high52Week: 1071.00, low52Week: 610.00,
    marketCap: '₹2.8L Cr', pe: 8.4, dividendYield: 0.39, previousClose: 780.95,
    open: 782.00, sector: 'Auto',
  },
  {
    ticker: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', exchange: 'NSE',
    price: 1782.40, change: 29.60, changePercent: 1.69, volume: 3450000,
    dayHigh: 1798.90, dayLow: 1748.20, high52Week: 1967.00, low52Week: 1218.00,
    marketCap: '₹4.3L Cr', pe: 38.9, dividendYield: 0.56, previousClose: 1752.80,
    open: 1755.00, sector: 'Pharma',
  },
  {
    ticker: 'AXISBANK.NS', name: 'Axis Bank', exchange: 'NSE',
    price: 1124.70, change: 15.30, changePercent: 1.38, volume: 7890000,
    dayHigh: 1132.40, dayLow: 1106.80, high52Week: 1340.00, low52Week: 995.00,
    marketCap: '₹3.5L Cr', pe: 14.2, dividendYield: 0.09, previousClose: 1109.40,
    open: 1110.00, sector: 'Banking',
  },
];

// ─── Trending / Top Stocks ───────────────────
export const topGainers: StockQuote[] = [
  { ticker: 'BHARTIARTL.NS', name: 'Bharti Airtel', price: 1678.90, change: 34.20, changePercent: 2.08 },
  { ticker: 'WIPRO.NS', name: 'Wipro', price: 456.30, change: 8.90, changePercent: 1.99 },
  { ticker: 'LT.NS', name: 'Larsen & Toubro', price: 3245.80, change: 56.70, changePercent: 1.78 },
  { ticker: 'SUNPHARMA.NS', name: 'Sun Pharma', price: 1782.40, change: 29.60, changePercent: 1.69 },
  { ticker: 'RELIANCE.NS', name: 'Reliance Industries', price: 2876.45, change: 42.30, changePercent: 1.49 },
];

export const topLosers: StockQuote[] = [
  { ticker: 'TATAMOTORS.NS', name: 'Tata Motors', price: 768.55, change: -12.40, changePercent: -1.59 },
  { ticker: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', price: 1876.40, change: -22.60, changePercent: -1.19 },
  { ticker: 'TCS.NS', name: 'Tata Consultancy', price: 3654.20, change: -28.75, changePercent: -0.78 },
  { ticker: 'ITC.NS', name: 'ITC Limited', price: 432.15, change: -3.25, changePercent: -0.75 },
  { ticker: 'HINDUNILVR.NS', name: 'Hindustan Unilever', price: 2412.50, change: -15.80, changePercent: -0.65 },
];

export const mostActive: StockQuote[] = [
  { ticker: 'ITC.NS', name: 'ITC Limited', price: 432.15, change: -3.25, changePercent: -0.75 },
  { ticker: 'SBIN.NS', name: 'State Bank of India', price: 756.20, change: 8.35, changePercent: 1.12 },
  { ticker: 'TATAMOTORS.NS', name: 'Tata Motors', price: 768.55, change: -12.40, changePercent: -1.59 },
  { ticker: 'RELIANCE.NS', name: 'Reliance Industries', price: 2876.45, change: 42.30, changePercent: 1.49 },
  { ticker: 'ICICIBANK.NS', name: 'ICICI Bank', price: 1098.30, change: 12.45, changePercent: 1.15 },
];

// ─── AI Predictions ──────────────────────────
export const stockPredictions: Record<string, StockPredictions> = {
  'RELIANCE.NS': {
    ticker: 'RELIANCE.NS',
    timestamp: '2026-03-25T15:30:00+05:30',
    predictions: [
      { model: 'LSTM', direction: 'BULLISH', targetPrice: 2935.20, confidence: 72, horizon: 'T+1', factors: ['Strong volume', 'RSI momentum', 'EMA crossover'], accuracy: 64.8 },
      { model: 'XGBoost', direction: 'BULLISH', targetPrice: 2912.80, confidence: 78, horizon: 'T+1', factors: ['Volume ratio spike', 'MACD signal', 'Sector strength'], accuracy: 67.2 },
      { model: 'Ensemble', direction: 'BULLISH', targetPrice: 2921.50, confidence: 76, horizon: 'T+1', factors: ['Model consensus', 'Weighted average', 'High agreement'], accuracy: 69.5 },
    ],
  },
  'TCS.NS': {
    ticker: 'TCS.NS',
    timestamp: '2026-03-25T15:30:00+05:30',
    predictions: [
      { model: 'LSTM', direction: 'BEARISH', targetPrice: 3612.40, confidence: 65, horizon: 'T+1', factors: ['Declining momentum', 'Below EMA 50', 'IT spending slowdown'], accuracy: 64.8 },
      { model: 'XGBoost', direction: 'BEARISH', targetPrice: 3598.90, confidence: 58, horizon: 'T+1', factors: ['Weak RSI', 'Negative MACD', 'Sector rotation'], accuracy: 67.2 },
      { model: 'Ensemble', direction: 'BEARISH', targetPrice: 3604.80, confidence: 62, horizon: 'T+1', factors: ['Model consensus', 'Weighted bearish', 'Moderate confidence'], accuracy: 69.5 },
    ],
  },
  'HDFCBANK.NS': {
    ticker: 'HDFCBANK.NS',
    timestamp: '2026-03-25T15:30:00+05:30',
    predictions: [
      { model: 'LSTM', direction: 'BULLISH', targetPrice: 1678.30, confidence: 70, horizon: 'T+1', factors: ['Banking sector strength', 'NPA improvement', 'Credit growth'], accuracy: 64.8 },
      { model: 'XGBoost', direction: 'BULLISH', targetPrice: 1690.50, confidence: 74, horizon: 'T+1', factors: ['Volume trends', 'RSI above 50', 'Sector outperformance'], accuracy: 67.2 },
      { model: 'Ensemble', direction: 'BULLISH', targetPrice: 1685.60, confidence: 73, horizon: 'T+1', factors: ['Strong agreement', 'Banking momentum', 'Weighted bullish'], accuracy: 69.5 },
    ],
  },
  'INFY.NS': {
    ticker: 'INFY.NS',
    timestamp: '2026-03-25T15:30:00+05:30',
    predictions: [
      { model: 'LSTM', direction: 'BULLISH', targetPrice: 1568.70, confidence: 61, horizon: 'T+1', factors: ['Mean reversion', 'Support level', 'Deal pipeline'], accuracy: 64.8 },
      { model: 'XGBoost', direction: 'BEARISH', targetPrice: 1518.40, confidence: 55, horizon: 'T+1', factors: ['Weak momentum', 'Below SMA 200', 'IT spending concern'], accuracy: 67.2 },
      { model: 'Ensemble', direction: 'BULLISH', targetPrice: 1548.20, confidence: 52, horizon: 'T+1', factors: ['Split opinion', 'Low confidence', 'Monitor closely'], accuracy: 69.5 },
    ],
  },
};

// Generate predictions for all stocks that don't have explicit ones
allStocks.forEach(stock => {
  if (!stockPredictions[stock.ticker]) {
    const isBull = stock.change > 0;
    stockPredictions[stock.ticker] = {
      ticker: stock.ticker,
      timestamp: '2026-03-25T15:30:00+05:30',
      predictions: [
        { model: 'LSTM', direction: isBull ? 'BULLISH' : 'BEARISH', targetPrice: stock.price * (isBull ? 1.018 : 0.985), confidence: 55 + Math.floor(Math.random() * 25), horizon: 'T+1', factors: ['Pattern analysis', 'Time series trend', 'Volume profile'], accuracy: 64.8 },
        { model: 'XGBoost', direction: isBull ? 'BULLISH' : 'BEARISH', targetPrice: stock.price * (isBull ? 1.022 : 0.982), confidence: 58 + Math.floor(Math.random() * 22), horizon: 'T+1', factors: ['Feature importance', 'Gradient signal', 'Technical factors'], accuracy: 67.2 },
        { model: 'Ensemble', direction: isBull ? 'BULLISH' : 'BEARISH', targetPrice: stock.price * (isBull ? 1.020 : 0.983), confidence: 57 + Math.floor(Math.random() * 23), horizon: 'T+1', factors: ['Model consensus', 'Blended prediction', 'Confidence aligned'], accuracy: 69.5 },
      ],
    };
  }
});

// ─── News Articles ───────────────────────────
export const newsArticles: NewsArticle[] = [
  {
    id: '1', title: 'NIFTY 50 surges past 23,000 as banking stocks rally on RBI policy outcome',
    source: 'Economic Times', timestamp: '2026-03-25T14:30:00+05:30',
    url: 'https://economictimes.com', sentiment: 'positive', relatedTickers: ['^NSEI', 'HDFCBANK.NS', 'ICICIBANK.NS'],
    summary: 'Markets rallied sharply after RBI kept repo rates unchanged, signaling supportive monetary policy.',
  },
  {
    id: '2', title: 'Reliance Industries Q4 profit beats estimates; Jio subscriber adds accelerate',
    source: 'Moneycontrol', timestamp: '2026-03-25T12:15:00+05:30',
    url: 'https://moneycontrol.com', sentiment: 'positive', relatedTickers: ['RELIANCE.NS'],
    summary: 'Net profit rose 14% YoY driven by telecom and retail segments. Jio added 8.2M subscribers.',
  },
  {
    id: '3', title: 'IT sector under pressure as US recession fears mount; TCS, Infosys slip',
    source: 'LiveMint', timestamp: '2026-03-25T11:45:00+05:30',
    url: 'https://livemint.com', sentiment: 'negative', relatedTickers: ['TCS.NS', 'INFY.NS', 'WIPRO.NS'],
    summary: 'US macro uncertainty is weighing on IT services demand. Analysts cut FY27 estimates for large-cap IT.',
  },
  {
    id: '4', title: 'Bharti Airtel crosses 500M subscriber milestone; stock hits all-time high',
    source: 'Business Standard', timestamp: '2026-03-25T10:30:00+05:30',
    url: 'https://business-standard.com', sentiment: 'positive', relatedTickers: ['BHARTIARTL.NS'],
    summary: 'ARPU expansion and 5G rollout driving subscriber growth. Brokerages maintain buy ratings.',
  },
  {
    id: '5', title: 'Auto sector outlook: Tata Motors faces margin pressure from EV investments',
    source: 'NDTV Profit', timestamp: '2026-03-25T09:45:00+05:30',
    url: 'https://ndtvprofit.com', sentiment: 'negative', relatedTickers: ['TATAMOTORS.NS'],
    summary: 'Margins may remain under pressure due to heavy capex on EV platform. JLR outlook cautious.',
  },
  {
    id: '6', title: 'Sun Pharma sees strong US generics traction; specialty pipeline advancing',
    source: 'ET Healthcare', timestamp: '2026-03-25T09:00:00+05:30',
    url: 'https://economictimes.com', sentiment: 'positive', relatedTickers: ['SUNPHARMA.NS'],
    summary: 'US generics business grew 18% YoY. Key ANDA approvals expected in next quarter.',
  },
  {
    id: '7', title: 'India GDP growth forecast raised to 7.2% for FY27 by IMF',
    source: 'Reuters', timestamp: '2026-03-24T18:00:00+05:30',
    url: 'https://reuters.com', sentiment: 'positive', relatedTickers: ['^NSEI', '^BSESN'],
    summary: 'IMF upgraded India growth estimate citing infrastructure spending and digital transformation.',
  },
  {
    id: '8', title: 'FII inflows turn positive after 4 months; ₹12,400 crore net buying in March',
    source: 'Moneycontrol', timestamp: '2026-03-24T16:30:00+05:30',
    url: 'https://moneycontrol.com', sentiment: 'positive', relatedTickers: ['^NSEI'],
    summary: 'Foreign institutional investors return to Indian equities as dollar weakness continues.',
  },
];

// ─── Notifications ───────────────────────────
export const notifications: Notification[] = [
  { id: '1', type: 'ai_signal', title: 'AI Signal: RELIANCE.NS', message: 'Ensemble model confidence exceeds 76% — BULLISH direction for T+1', timestamp: '2026-03-25T15:35:00+05:30', read: false, ticker: 'RELIANCE.NS' },
  { id: '2', type: 'price_alert', title: 'Price Alert: BHARTIARTL.NS', message: 'Bharti Airtel crossed ₹1,675 — your target price reached', timestamp: '2026-03-25T14:20:00+05:30', read: false, ticker: 'BHARTIARTL.NS' },
  { id: '3', type: 'breaking_news', title: 'Breaking: RBI Policy', message: 'RBI keeps repo rate unchanged at 6.5% — markets rally', timestamp: '2026-03-25T12:00:00+05:30', read: true },
  { id: '4', type: 'percent_move', title: '% Alert: WIPRO.NS', message: 'Wipro moved +1.99% today — exceeds your 1.5% threshold', timestamp: '2026-03-25T11:30:00+05:30', read: false, ticker: 'WIPRO.NS' },
  { id: '5', type: 'market_status', title: 'Market Open', message: 'NSE market opened at 9:15 AM IST. Happy trading!', timestamp: '2026-03-25T09:15:00+05:30', read: true },
  { id: '6', type: 'earnings', title: 'Earnings Alert: TCS.NS', message: 'TCS Q4 results due in 3 days — stay tuned for AI prediction update', timestamp: '2026-03-24T18:00:00+05:30', read: true, ticker: 'TCS.NS' },
  { id: '7', type: 'ai_signal', title: 'AI Signal: HDFCBANK.NS', message: 'XGBoost model: 74% confidence BULLISH for HDFC Bank T+1', timestamp: '2026-03-24T15:35:00+05:30', read: true, ticker: 'HDFCBANK.NS' },
  { id: '8', type: 'breaking_news', title: 'IMF Upgrade', message: 'IMF raises India GDP growth forecast to 7.2% for FY27', timestamp: '2026-03-24T15:00:00+05:30', read: true },
];

// ─── Candle Data Generator ───────────────────
export function generateCandleData(basePrice: number, days: number = 90): CandleData[] {
  const data: CandleData[] = [];
  let currentPrice = basePrice * 0.92;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends

    const volatility = 0.025;
    const drift = 0.0008;
    const change = (Math.random() - 0.48) * volatility + drift;
    const open = currentPrice;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.012);
    const low = Math.min(open, close) * (1 - Math.random() * 0.012);
    const volume = Math.floor(5000000 + Math.random() * 15000000);

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }

  return data;
}

// ─── Mock User ───────────────────────────────
export const mockUser: User = {
  id: 'usr_001',
  email: 'demo@bullbridge.app',
  name: 'Arjun Sharma',
  experienceLevel: 'Intermediate',
  sectors: ['Tech', 'Banking', 'Pharma'],
  joinedDate: '2026-03-01',
  hasAcknowledgedDisclaimer: false,
};

// ─── Default Watchlist ───────────────────────
export const defaultWatchlist: string[] = [
  'RELIANCE.NS',
  'TCS.NS',
  'HDFCBANK.NS',
  'INFY.NS',
  'ICICIBANK.NS',
];

// ─── Sectors ─────────────────────────────────
export const sectors = ['Tech', 'Banking', 'Pharma', 'Energy', 'Auto', 'FMCG', 'Telecom', 'Infrastructure'];
