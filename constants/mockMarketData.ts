import { MarketIndex, StockQuote, NewsArticle } from '../types';

/**
 * BullBridge — Mock Market Baseline Data
 * Expanded to 10 items per section to ensure a full "Top 10" display 24/7.
 */

export const MOCK_INDICES: MarketIndex[] = [
  { name: 'NIFTY 50', ticker: '^NSEI', value: 22453.35, change: 124.60, changePercent: 0.56 },
  { name: 'SENSEX', ticker: '^BSESN', value: 73876.82, change: 350.80, changePercent: 0.48 },
  { name: 'NIFTY Bank', ticker: '^NSEBANK', value: 47624.25, change: -12.40, changePercent: -0.03 }
];

export const MOCK_GAINERS: StockQuote[] = [
  { ticker: 'RELIANCE.NS', name: 'Reliance Industries', price: 2985.40, change: 45.30, changePercent: 1.54 },
  { ticker: 'TCS.NS', name: 'Tata Consultancy Services', price: 3942.20, change: 58.60, changePercent: 1.51 },
  { ticker: 'HDFCBANK.NS', name: 'HDFC Bank', price: 1524.30, change: 18.40, changePercent: 1.22 },
  { ticker: 'ICICIBANK.NS', name: 'ICICI Bank', price: 1084.15, change: 12.30, changePercent: 1.15 },
  { ticker: 'INFY.NS', name: 'Infosys Ltd', price: 1478.90, change: 15.60, changePercent: 1.07 },
  { ticker: 'TITAN.NS', name: 'Titan Company', price: 3742.10, change: 35.20, changePercent: 0.95 },
  { ticker: 'SUNPHARMA.NS', name: 'Sun Pharma', price: 1542.30, change: 14.10, changePercent: 0.92 },
  { ticker: 'BAJFINANCE.NS', name: 'Bajaj Finance', price: 7242.15, change: 62.40, changePercent: 0.87 },
  { ticker: 'WIPRO.NS', name: 'Wipro Ltd', price: 482.40, change: 3.15, changePercent: 0.65 },
  { ticker: 'LT.NS', name: 'Larsen & Toubro', price: 3482.30, change: 21.40, changePercent: 0.62 }
];

export const MOCK_LOSERS: StockQuote[] = [
  { ticker: 'HINDUNILVR.NS', name: 'Hindustan Unilever', price: 2342.10, change: -45.30, changePercent: -1.89 },
  { ticker: 'ITC.NS', name: 'ITC Limited', price: 428.40, change: -8.15, changePercent: -1.86 },
  { ticker: 'SBIN.NS', name: 'State Bank of India', price: 762.30, change: -12.40, changePercent: -1.60 },
  { ticker: 'AXISBANK.NS', name: 'Axis Bank', price: 1042.80, change: -15.20, changePercent: -1.44 },
  { ticker: 'ASIANPAINT.NS', name: 'Asian Paints', price: 2842.15, change: -38.60, changePercent: -1.34 },
  { ticker: 'MARUTI.NS', name: 'Maruti Suzuki', price: 11442.20, change: -142.30, changePercent: -1.23 },
  { ticker: 'JSWSTEEL.NS', name: 'JSW Steel', price: 842.15, change: -8.40, changePercent: -0.99 },
  { ticker: 'COALINDIA.NS', name: 'Coal India Ltd', price: 442.30, change: -4.10, changePercent: -0.92 },
  { ticker: 'BHARTIARTL.NS', name: 'Bharti Airtel', price: 1242.10, change: -11.20, changePercent: -0.89 },
  { ticker: 'NESTLEIND.NS', name: 'Nestle India', price: 2542.30, change: -21.40, changePercent: -0.83 }
];

export const MOCK_ACTIVE: StockQuote[] = [
  { ticker: 'ZOMATO.NS', name: 'Zomato Ltd', price: 184.20, change: 5.40, changePercent: 3.02 },
  { ticker: 'IRFC.NS', name: 'Indian Railway Finance', price: 142.80, change: 2.15, changePercent: 1.53 },
  { ticker: 'TATASTEEL.NS', name: 'Tata Steel', price: 164.30, change: 1.20, changePercent: 0.74 },
  { ticker: 'JINDALSTEL.NS', name: 'Jindal Steel & Power', price: 894.15, change: -4.30, changePercent: -0.48 },
  { ticker: 'HDFCBANK.NS', name: 'HDFC Bank', price: 1524.30, change: 18.40, changePercent: 1.22 },
  { ticker: 'RVNL.NS', name: 'Rail Vikas Nigam', price: 262.15, change: -12.40, changePercent: -4.51 },
  { ticker: 'YESBANK.NS', name: 'Yes Bank', price: 24.30, change: 0.15, changePercent: 0.62 },
  { ticker: 'SUZLON.NS', name: 'Suzlon Energy', price: 42.10, change: 1.10, changePercent: 2.68 },
  { ticker: 'ADANIENT.NS', name: 'Adani Enterprises', price: 3242.15, change: -45.20, changePercent: -1.37 },
  { ticker: 'PAYTM.NS', name: 'Paytm (OCL)', price: 382.40, change: -5.15, changePercent: -1.33 }
];

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'mock-1',
    title: 'Nifty 50 Hits All-Time High Amid Strong FII Inflows',
    source: 'Financial Express',
    timestamp: new Date().toISOString(),
    url: 'https://www.financialexpress.com',
    sentiment: 'positive',
    relatedTickers: ['^NSEI', 'RELIANCE.NS']
  },
  {
    id: 'mock-2',
    title: 'RBI Keeps Rates Unchanged: Impact on Banking Sector',
    source: 'Economic Times',
    timestamp: new Date().toISOString(),
    url: 'https://economictimes.indiatimes.com',
    sentiment: 'neutral',
    relatedTickers: ['^NSEBANK', 'HDFCBANK.NS', 'SBIN.NS']
  },
  {
    id: 'mock-3',
    title: 'IT Stocks Rally on Better Than Expected Global Outlook',
    source: 'Moneycontrol',
    timestamp: new Date().toISOString(),
    url: 'https://www.moneycontrol.com',
    sentiment: 'positive',
    relatedTickers: ['TCS.NS', 'INFY.NS', 'WIPRO.NS']
  }
];
