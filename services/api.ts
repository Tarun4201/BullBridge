/**
 * Bull Bridge — API Service Layer (100% Live)
 * Direct integration with Yahoo Finance and existing backend.
 * No mock data fallbacks.
 */

import { Stock, MarketIndex, StockQuote, NewsArticle, StockPredictions, CandleData } from '../types';
import { API_BASE_URL, checkBackendHealth } from './apiHealth';

const TRENDING_SYMBOLS = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'SBIN.NS', 'BHARTIARTL.NS'];

// ─── Yahoo Finance Live API Layer ─────────────

// Free and open endpoint that does not require cookie crumb validation
async function fetchYahooQuote(ticker: string): Promise<Partial<Stock> | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price = meta.regularMarketPrice ?? meta.chartPreviousClose ?? 0;
    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? 0;
    const change = price - previousClose;
    const changePercent = previousClose ? (change / previousClose * 100) : 0;

    return {
      ticker: meta.symbol,
      name: meta.longName || meta.shortName || meta.symbol,
      exchange: meta.exchangeName || 'NSE',
      price: parseFloat(price.toFixed(2)),
      previousClose: parseFloat(previousClose.toFixed(2)),
      open: meta.regularMarketOpen ?? price,
      dayHigh: meta.regularMarketDayHigh ?? price,
      dayLow: meta.regularMarketDayLow ?? price,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: meta.regularMarketVolume ?? 0,
      marketCap: '-',
      pe: 0,
      dividendYield: 0,
      low52Week: meta.fiftyTwoWeekLow ?? 0,
      high52Week: meta.fiftyTwoWeekHigh ?? 0,
    };
  } catch {
    return null;
  }
}

async function fetchYahooQuotes(tickers: string[]): Promise<Partial<Stock>[]> {
  const promises = tickers.map(t => fetchYahooQuote(t));
  const results = await Promise.all(promises);
  return results.filter(r => r !== null) as Partial<Stock>[];
}

/**
 * Stock API
 */
export const StockAPI = {
  /** Get all available stocks (not supported without mock data, returns trending) */
  async getAll(): Promise<Stock[]> {
    const quotes = await fetchYahooQuotes(TRENDING_SYMBOLS);
    return quotes as Stock[];
  },

  /** Get a single stock by ticker */
  async getByTicker(ticker: string): Promise<Stock | undefined> {
    const quotes = await fetchYahooQuotes([ticker]);
    if (quotes && quotes.length > 0) {
      return quotes[0] as Stock;
    }
    return undefined;
  },

  /** Search stocks using live Yahoo Finance search */
  async search(query: string): Promise<Stock[]> {
    if (!query) return [];
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&country=India`, {
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!res.ok) return [];
      
      const json = await res.json();
      const quotes = json?.quotes || [];
      
      return quotes.map((q: any) => ({
        ticker: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchDisp || q.exchange || 'Unknown',
        price: 0, change: 0, changePercent: 0, volume: 0,
        dayHigh: 0, dayLow: 0, high52Week: 0, low52Week: 0,
        marketCap: '-', pe: 0, dividendYield: 0, previousClose: 0, open: 0, sector: q.sector || '-'
      } as Stock));
    } catch {
      return [];
    }
  },

  /** Get OHLCV candle data for a ticker using Yahoo Finance */
  async getCandleData(ticker: string, days: number = 90): Promise<CandleData[]> {
    try {
      const range = days <= 5 ? "5d" : days <= 30 ? "1mo" : days <= 90 ? "3mo" : days <= 180 ? "6mo" : "1y";
      const interval = days <= 5 ? "15m" : "1d";
      
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=${interval}`, {
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!res.ok) return [];

      const json = await res.json();
      const result = json?.chart?.result?.[0];
      if (!result) return [];

      const timestamps = result.timestamp || [];
      const quote = result.indicators?.quote?.[0] || {};
      
      const candles: CandleData[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quote.open[i] !== null && quote.close[i] !== null) {
          candles.push({
            date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
            open: parseFloat(quote.open[i].toFixed(2)),
            high: parseFloat(quote.high[i].toFixed(2)),
            low: parseFloat(quote.low[i].toFixed(2)),
            close: parseFloat(quote.close[i].toFixed(2)),
            volume: quote.volume[i] || 0,
          });
        }
      }
      return candles;
    } catch {
      return [];
    }
  },
};

/**
 * Market API
 */
export const MarketAPI = {
  /** Get market indices live */
  async getIndices(): Promise<MarketIndex[]> {
    const quotes = await fetchYahooQuotes(['^NSEI', '^BSESN', '^NSEBANK']);
    return quotes.map(q => ({
      name: q.ticker === '^NSEI' ? 'NIFTY 50' : q.ticker === '^BSESN' ? 'SENSEX' : 'NIFTY Bank',
      ticker: q.ticker || '',
      value: q.price || 0,
      change: q.change || 0,
      changePercent: q.changePercent || 0,
    }));
  },

  /** Get top gainers from trending list */
  async getTopGainers(): Promise<StockQuote[]> {
    const quotes = await fetchYahooQuotes(TRENDING_SYMBOLS);
    return quotes
      .filter(q => (q.changePercent || 0) > 0)
      .sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0)) as StockQuote[];
  },

  /** Get top losers from trending list */
  async getTopLosers(): Promise<StockQuote[]> {
    const quotes = await fetchYahooQuotes(TRENDING_SYMBOLS);
    return quotes
      .filter(q => (q.changePercent || 0) < 0)
      .sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0)) as StockQuote[];
  },

  /** Get most active stocks from trending list */
  async getMostActive(): Promise<StockQuote[]> {
    const quotes = await fetchYahooQuotes(TRENDING_SYMBOLS);
    return quotes
      .sort((a, b) => (b.volume || 0) - (a.volume || 0)) as StockQuote[];
  },
};

/**
 * AI Predictions API
 */
export const PredictionAPI = {
  /** Get predictions for a ticker - Returns undefined if backend fails, no mock fallback */
  async getByTicker(ticker: string): Promise<StockPredictions | undefined> {
    const health = await checkBackendHealth();
    if (health.status === 'ok') {
      try {
        const res = await fetch(`${API_BASE_URL}/ai/predict/${ticker}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn(`[API Error] Failed to fetch AI prediction for ${ticker}`, err);
      }
    }
    return undefined; // No mock fallback
  },

  /** Get predictions for multiple tickers */
  async getBatch(tickers: string[]): Promise<StockPredictions[]> {
    return []; // Batches omitted when no mock data available, requires real backend endpoint
  },
};

/**
 * News API
 */
export const NewsAPI = {
  /** Get latest market news */
  async getLatest(limit: number = 8): Promise<NewsArticle[]> {
    try {
      const res = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=India+Market&newsCount=${limit}`);
      if (!res.ok) return [];
      const json = await res.json();
      return (json.news || []).map((n: any) => ({
        id: n.uuid,
        title: n.title,
        source: n.publisher || 'Yahoo Finance',
        timestamp: new Date((n.providerPublishTime || 0) * 1000).toISOString(),
        url: n.link,
        sentiment: 'neutral',
        summary: '',
        relatedTickers: n.relatedTickers || [],
      }));
    } catch {
      return [];
    }
  },

  /** Get news for a specific stock */
  async getByTicker(ticker: string): Promise<NewsArticle[]> {
    const health = await checkBackendHealth();
    if (health.status === 'ok') {
      try {
        const res = await fetch(`${API_BASE_URL}/stocks/${ticker}/news`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn(`[API Error] Failed to fetch news for ${ticker}`, err);
      }
    }
    return []; // No mock fallback
  },
};
