/**
 * Bull Bridge — API Service Layer
 * Mock API endpoints, structured for easy swap to real FastAPI backend
 */

import { allStocks, stockPredictions, newsArticles, marketIndices, topGainers, topLosers, mostActive, generateCandleData } from '../constants/mockData';
import { Stock, StockPredictions, NewsArticle, MarketIndex, StockQuote, CandleData } from '../types';
import { API_BASE_URL, checkBackendHealth } from './apiHealth';

// Simulated API delay for local fallback
const simulateDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Stock API
 */
export const StockAPI = {
  /** Get all available stocks */
  async getAll(): Promise<Stock[]> {
    await simulateDelay(200);
    return allStocks;
  },

  /** Get a single stock by ticker */
  async getByTicker(ticker: string): Promise<Stock | undefined> {
    const health = await checkBackendHealth();
    if (health.status === 'ok') {
      try {
        const res = await fetch(`${API_BASE_URL}/stock/${ticker}`);
        if (!res.ok) throw new Error('API Error');
        return await res.json();
      } catch (err) {
        // Fallback on unexpected error despite health check passing
        console.warn(`[Backend Down] Error during fetch, falling back to mock data for stock: ${ticker}`, err);
      }
    } else {
      console.warn(`[Backend Down] Falling back to mock data for stock: ${ticker}`);
    }
    await simulateDelay(150);
    return allStocks.find(s => s.ticker === ticker);
  },

  /** Search stocks by name or ticker using live backend proxy */
  async search(query: string): Promise<Stock[]> {
    if (!query) return [];
    
    const health = await checkBackendHealth();
    if (health.status === 'ok') {
      try {
        const res = await fetch(`${API_BASE_URL}/stocks/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          return await res.json();
        }
      } catch {
        console.warn('[Backend Down] Search fallback to offline mock data');
      }
    }
    
    await simulateDelay(100);
    const q = query.toLowerCase();
    return allStocks.filter(
      s => s.name.toLowerCase().includes(q) || s.ticker.toLowerCase().includes(q)
    );
  },

  /** Get OHLCV candle data for a ticker */
  async getCandleData(ticker: string, days: number = 90): Promise<CandleData[]> {
    await simulateDelay(300);
    const stock = allStocks.find(s => s.ticker === ticker);
    return generateCandleData(stock?.price || 1000, days);
  },
};

/**
 * Market API
 */
// Local cache to avoid calling /market/trending 3x per refresh
let _trendingCache: { data: any; ts: number } = { data: null, ts: 0 };
const TRENDING_TTL_MS = 60_000; // 1 min client-side cache

async function fetchTrending() {
  const now = Date.now();
  if (_trendingCache.data && (now - _trendingCache.ts) < TRENDING_TTL_MS) {
    return _trendingCache.data;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/market/trending`);
    if (res.ok) {
      const data = await res.json();
      _trendingCache = { data, ts: Date.now() };
      return data;
    }
  } catch {}
  return null;
}

export const MarketAPI = {
  /** Get market indices */
  async getIndices(): Promise<MarketIndex[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/market/indices`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      await simulateDelay(200);
      return marketIndices;
    }
  },

  /** Get top gainers */
  async getTopGainers(): Promise<StockQuote[]> {
    const data = await fetchTrending();
    if (data?.topGainers) return data.topGainers;
    return topGainers;
  },

  /** Get top losers */
  async getTopLosers(): Promise<StockQuote[]> {
    const data = await fetchTrending();
    if (data?.topLosers) return data.topLosers;
    return topLosers;
  },

  /** Get most active stocks */
  async getMostActive(): Promise<StockQuote[]> {
    const data = await fetchTrending();
    if (data?.mostActive) return data.mostActive;
    return mostActive;
  },
};

/**
 * AI Predictions API
 */
export const PredictionAPI = {
  /** Get predictions for a ticker */
  async getByTicker(ticker: string): Promise<StockPredictions | undefined> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/predict/${ticker}`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      console.warn(`[Backend Down] Using mock AI simulation for ${ticker}`);
      await simulateDelay(200);
      return stockPredictions[ticker];
    }
  },

  /** Get predictions for multiple tickers */
  async getBatch(tickers: string[]): Promise<StockPredictions[]> {
    await simulateDelay(600);
    return tickers
      .map(t => stockPredictions[t])
      .filter(Boolean) as StockPredictions[];
  },
};

/**
 * News API
 */
export const NewsAPI = {
  /** Get latest market news */
  async getLatest(limit: number = 8): Promise<NewsArticle[]> {
    await simulateDelay(300);
    return newsArticles.slice(0, limit);
  },

  /** Get news for a specific stock */
  async getByTicker(ticker: string): Promise<NewsArticle[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/stocks/${ticker}/news`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      await simulateDelay(200);
      return newsArticles.filter(n => n.relatedTickers.includes(ticker));
    }
  },
};
