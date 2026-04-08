import { Stock, PeerStock } from '../types';

/**
 * BullBridge — Stock Insights Utility
 * Provides industry-mapped peers and generates realistic financial/shareholding 
 * data based on a company's real market scaling and sector.
 */

export interface StockDetails {
  about: string;
  history: string;
  pros: string[];
  cons: string[];
  peers: PeerStock[];
  financials: { year: string; revenue: number; profit: number }[];
  shareholding: { promoters: number; fii: number; dii: number; public: number };
  eps: number;
  pb: number;
}

// ─── Real Industry-Mapped Peer Matrix (Top NSE Stocks) ─────────────────────
const PEER_MATRIX: Record<string, string[]> = {
  // Reliance Industries (Energy/O2C)
  'RELIANCE.NS': ['ONGC.NS', 'IOC.NS', 'BPCL.NS'],
  // IT Giants
  'TCS.NS': ['INFY.NS', 'WIPRO.NS', 'HCLTECH.NS'],
  'INFY.NS': ['TCS.NS', 'WIPRO.NS', 'HCLTECH.NS'],
  'WIPRO.NS': ['TCS.NS', 'INFY.NS', 'HCLTECH.NS'],
  'HCLTECH.NS': ['TCS.NS', 'INFY.NS', 'WIPRO.NS'],
  // Banking
  'HDFCBANK.NS': ['ICICIBANK.NS', 'KOTAKBANK.NS', 'AXISBANK.NS', 'SBIN.NS'],
  'ICICIBANK.NS': ['HDFCBANK.NS', 'KOTAKBANK.NS', 'AXISBANK.NS', 'SBIN.NS'],
  'SBIN.NS': ['PNB.NS', 'BOB.NS', 'CANBK.NS', 'HDFCBANK.NS'],
  'KOTAKBANK.NS': ['HDFCBANK.NS', 'ICICIBANK.NS', 'AXISBANK.NS'],
  'AXISBANK.NS': ['ICICIBANK.NS', 'HDFCBANK.NS', 'KOTAKBANK.NS'],
  // Auto
  'TATAMOTORS.NS': ['M&M.NS', 'MARUTI.NS', 'ASHOKLEY.NS'],
  'M&M.NS': ['TATAMOTORS.NS', 'MARUTI.NS', 'ESCORT.NS'],
  'MARUTI.NS': ['TATAMOTORS.NS', 'M&M.NS', 'HYUNDAI.NS'],
  // FMCG / Metals / Others
  'HINDUNILVR.NS': ['ITC.NS', 'NESTLEIND.NS', 'BRITANNIA.NS'],
  'ITC.NS': ['HINDUNILVR.NS', 'NESTLEIND.NS', 'VSTIND.NS'],
  'TATASTEEL.NS': ['JSWSTEEL.NS', 'HINDALCO.NS', 'SAIL.NS'],
  'JSWSTEEL.NS': ['TATASTEEL.NS', 'SAIL.NS', 'JSL.NS'],
  // Default Generic Peers by ticker suffix for unmapped stocks
  'DEFAULT_NSE': ['NIFTY_ETFBANK.NS', 'BSE_SENSEX.NS'],
};

const SECTOR_DATA: Record<string, Partial<StockDetails>> = {
  'Banking': {
    about: 'Leading financial institution providing a wide range of banking services, including retail, corporate, and investment banking across India.',
    history: 'Established as a key player in the Indian financial modernization, it has grown through strategic technology adoption and credit expansion.',
    pros: ['Strong CASA ratio and liquidity', 'Consistent NIM margins', 'Robust digital infrastructure'],
    cons: ['Credit risk in unsecured segments', 'Interest rate sensitivity'],
  },
  'Technology': {
    about: 'Global technology leader specializing in IT services, consulting, and business solutions with primary focus on digital transformation.',
    history: 'Pioneered the global delivery model in India, evolving from a software house to a comprehensive high-end consulting partner.',
    pros: ['High FCF generation and zero debt', 'Strong order book from global clients', 'Leadership in AI and Cloud segments'],
    cons: ['High employee attrition risk', 'Exposure to global macro slowdown'],
  },
  'Automobile': {
    about: 'Major automotive manufacturer with presence in passenger, commercial, and electric vehicle segments globally.',
    history: 'Evolved from basic engineering to a premium global brand with strong focus on EV innovation and sustainable mobility.',
    pros: ['Market leadership in EV segments', 'Strong rural and urban distribution', 'Synergies from global acquisitions'],
    cons: ['Cyclical nature of auto demand', 'High raw material price volatility'],
  },
};

/**
 * Generates realistic P&L rows scaled to the stock's actual price/size
 */
function generateFinancials(stock: Stock) {
  const scale = (stock.price * stock.volume) / 1e7 || 5000; // Rough scaling factor
  return [
    { year: '2024', revenue: Math.round(scale * 1.2), profit: Math.round(scale * 0.15) },
    { year: '2023', revenue: Math.round(scale * 1.05), profit: Math.round(scale * 0.12) },
    { year: '2022', revenue: Math.round(scale * 0.9), profit: Math.round(scale * 0.1) },
  ];
}

/**
 * Generates realistic shareholding distribution based on sector
 */
function generateShareholding(sector: string) {
  if (sector === 'Banking') return { promoters: 22, fii: 35, dii: 28, public: 15 };
  if (sector === 'Technology') return { promoters: 72, fii: 12, dii: 10, public: 6 };
  if (sector === 'Energy') return { promoters: 50, fii: 23, dii: 15, public: 12 };
  return { promoters: 45, fii: 20, dii: 20, public: 15 }; // Default
}

export function getStockInsights(stock: Stock): StockDetails {
  const sector = stock.sector || 'General';
  const data = SECTOR_DATA[sector] || {
    about: `${stock.name} is a key player in the ${sector} industry on the ${stock.exchange}.`,
    history: `Founded as part of India's industrial growth, it has established a significant footprint in domestic and regional markets.`,
    pros: ['Strong market position in its niche', 'Experienced management team'],
    cons: ['Intense sector competition', 'Regulatory dependency'],
  };

  // Resolve Real Peers
  const peerTickers = PEER_MATRIX[stock.ticker] || PEER_MATRIX['DEFAULT_NSE'];
  const peers: PeerStock[] = peerTickers.map(t => ({
    name: t.replace('.NS', '').replace('.BO', ''),
    ticker: t,
    price: parseFloat((stock.price * (0.8 + Math.random() * 0.4)).toFixed(2)),
    pe: parseFloat((stock.pe * (0.9 + Math.random() * 0.2) || 15).toFixed(1)),
    marketCap: stock.marketCap 
  }));

  return {
    about: data.about!,
    history: data.history!,
    pros: data.pros!,
    cons: data.cons!,
    peers,
    financials: generateFinancials(stock),
    shareholding: generateShareholding(sector),
    eps: stock.eps || 12.5,
    pb: stock.pb || 1.8,
  };
}
