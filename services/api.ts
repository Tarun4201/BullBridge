/**
 * Bull Bridge — API Service Layer (100% Live, No API Keys)
 * Uses Yahoo Finance free endpoints + NSE symbol list for Indian market data.
 */

import { Stock, MarketIndex, StockQuote, NewsArticle, StockPredictions, CandleData } from '../types';
import { API_BASE_URL, checkBackendHealth } from './apiHealth';
import { NIFTY_500_SYMBOLS } from '../constants/nseSymbols';

// ─── Yahoo Finance v8 Chart — Single Quote Fetch ────────────────────────────
// This is the ONLY free, open Yahoo Finance endpoint that returns live prices.
async function fetchYahooQuote(ticker: string): Promise<Partial<Stock> | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
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
    const previousClose = meta.chartPreviousClose ?? 0;
    const change = price - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

    return {
      ticker: meta.symbol,
      name: meta.longName || meta.shortName || meta.symbol,
      exchange: meta.fullExchangeName || meta.exchangeName || 'NSE',
      price: parseFloat(price.toFixed(2)),
      previousClose: parseFloat(previousClose.toFixed(2)),
      open: parseFloat((meta.regularMarketOpen ?? price).toFixed(2)),
      dayHigh: parseFloat((meta.regularMarketDayHigh ?? price).toFixed(2)),
      dayLow: parseFloat((meta.regularMarketDayLow ?? price).toFixed(2)),
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

// ─── Batch Fetcher — concurrent requests in BATCH_SIZE chunks ────────────────
const BATCH_SIZE = 30;

async function fetchYahooQuotesBatch(tickers: string[]): Promise<Partial<Stock>[]> {
  const results: Partial<Stock>[] = [];
  for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
    const batch = tickers.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(t => fetchYahooQuote(t)));
    for (const r of batchResults) {
      if (r !== null) results.push(r);
    }
  }
  return results;
}

// Single-ticker version (used in detail page)
async function fetchYahooQuotes(tickers: string[]): Promise<Partial<Stock>[]> {
  const results = await Promise.all(tickers.map(t => fetchYahooQuote(t)));
  return results.filter(r => r !== null) as Partial<Stock>[];
}

// ─── In-memory cache for Nifty 500 batch data (60s TTL) ─────────────────────
let _niftyCache: { data: Partial<Stock>[]; ts: number } | null = null;
const NIFTY_CACHE_TTL = 60_000;

async function getNiftyQuotes(): Promise<Partial<Stock>[]> {
  if (_niftyCache && Date.now() - _niftyCache.ts < NIFTY_CACHE_TTL) {
    return _niftyCache.data;
  }
  const data = await fetchYahooQuotesBatch(NIFTY_500_SYMBOLS);
  _niftyCache = { data, ts: Date.now() };
  return data;
}

/**
 * Stock API — Individual stock operations
 */
export const StockAPI = {
  /** Get trending NSE stocks */
  async getAll(): Promise<Stock[]> {
    const trending = NIFTY_500_SYMBOLS.slice(0, 10);
    const quotes = await fetchYahooQuotes(trending);
    return quotes as Stock[];
  },

  /** Get a single stock by ticker (with live price) */
  async getByTicker(ticker: string): Promise<Stock | undefined> {
    const quote = await fetchYahooQuote(ticker);
    return quote ? (quote as Stock) : undefined;
  },

  /**
   * Search ALL 3000+ Indian stocks via Yahoo Finance search
   * Yahoo's search DB covers every NSE/BSE listed company — no API key needed.
   */
  async search(query: string): Promise<Stock[]> {
    if (!query || query.trim().length < 1) return [];
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(
        `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=25&newsCount=0&enableFuzzyQuery=false`,
        { signal: controller.signal }
      );
      clearTimeout(timer);
      if (!res.ok) return [];

      const json = await res.json();
      const quotes: any[] = json?.quotes || [];

      // Filter for NSE/BSE equities only
      return quotes
        .filter(q =>
          q.quoteType === 'EQUITY' &&
          (q.exchange === 'NSI' || q.exchange === 'BSE' || q.exchange === 'BOM' ||
           (q.symbol && (q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO'))))
        )
        .map(q => ({
          ticker: q.symbol,
          name: q.shortname || q.longname || q.symbol,
          exchange: q.exchDisp || (q.symbol?.endsWith('.BO') ? 'BSE' : 'NSE'),
          price: 0, change: 0, changePercent: 0, volume: 0,
          dayHigh: 0, dayLow: 0, high52Week: 0, low52Week: 0,
          marketCap: '-', pe: 0, dividendYield: 0, previousClose: 0, open: 0,
          sector: q.sector || q.industry || '-',
        } as Stock));
    } catch {
      return [];
    }
  },

  /** Get OHLCV candle data for a ticker */
  async getCandleData(ticker: string, days: number = 90): Promise<CandleData[]> {
    try {
      const range = days <= 5 ? '5d' : days <= 30 ? '1mo' : days <= 90 ? '3mo' : days <= 180 ? '6mo' : '1y';
      const interval = days <= 5 ? '15m' : '1d';

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=${interval}`,
        { signal: controller.signal }
      );
      clearTimeout(timer);
      if (!res.ok) return [];

      const json = await res.json();
      const result = json?.chart?.result?.[0];
      if (!result) return [];

      const timestamps: number[] = result.timestamp || [];
      const quote = result.indicators?.quote?.[0] || {};
      const candles: CandleData[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        if (quote.open?.[i] != null && quote.close?.[i] != null) {
          candles.push({
            date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
            open: parseFloat(quote.open[i].toFixed(2)),
            high: parseFloat(quote.high[i].toFixed(2)),
            low: parseFloat(quote.low[i].toFixed(2)),
            close: parseFloat(quote.close[i].toFixed(2)),
            volume: quote.volume?.[i] || 0,
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
 * Market API — Indices, Gainers, Losers, Most Active
 */
export const MarketAPI = {
  /** Live NSE/BSE indices */
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

  /**
   * Top 10 Gainers — computed from live Nifty 500 quotes.
   * Fetches all 500 symbols in batches and returns top 10 by % change.
   */
  async getTopGainers(): Promise<StockQuote[]> {
    const quotes = await getNiftyQuotes();
    return quotes
      .filter(q => (q.changePercent ?? 0) > 0)
      .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))
      .slice(0, 10) as StockQuote[];
  },

  /**
   * Top 10 Losers — computed from live Nifty 500 quotes.
   */
  async getTopLosers(): Promise<StockQuote[]> {
    const quotes = await getNiftyQuotes();
    return quotes
      .filter(q => (q.changePercent ?? 0) < 0)
      .sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0))
      .slice(0, 10) as StockQuote[];
  },

  /**
   * Top 10 Most Active by volume from Nifty 500.
   */
  async getMostActive(): Promise<StockQuote[]> {
    const quotes = await getNiftyQuotes();
    return quotes
      .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))
      .slice(0, 10) as StockQuote[];
  },
};

/**
 * AI Predictions API — requires running FastAPI backend
 */
export const PredictionAPI = {
  async getByTicker(ticker: string): Promise<StockPredictions | undefined> {
    const health = await checkBackendHealth();
    if (health.status === 'ok') {
      try {
        const res = await fetch(`${API_BASE_URL}/ai/predict/${ticker}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn(`[API] Prediction failed for ${ticker}`, err);
      }
    }
    return undefined;
  },

  async getBatch(_tickers: string[]): Promise<StockPredictions[]> {
    return [];
  },
};

/**
 * News API
 */
export const NewsAPI = {
  /** Latest Indian market news from Yahoo Finance search */
  async getLatest(limit: number = 10): Promise<NewsArticle[]> {
    try {
      const res = await fetch(
        `https://query2.finance.yahoo.com/v1/finance/search?q=NSE+BSE+India+Stock+Market&newsCount=${limit}&quotesCount=0`
      );
      if (!res.ok) return [];
      const json = await res.json();
      return (json.news || []).map((n: any) => ({
        id: n.uuid,
        title: n.title,
        source: n.publisher || 'Yahoo Finance',
        timestamp: new Date((n.providerPublishTime || 0) * 1000).toISOString(),
        url: n.link,
        sentiment: 'neutral' as const,
        summary: '',
        relatedTickers: n.relatedTickers || [],
      }));
    } catch {
      return [];
    }
  },

  /** Stock-specific news from backend, falls back to Yahoo search */
  async getByTicker(ticker: string): Promise<NewsArticle[]> {
    const health = await checkBackendHealth();
    if (health.status === 'ok') {
      try {
        const res = await fetch(`${API_BASE_URL}/stocks/${ticker}/news`);
        if (res.ok) return await res.json();
      } catch {
        // fall through
      }
    }
    // Fallback: search Yahoo for stock-specific news
    try {
      const res = await fetch(
        `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=6&quotesCount=0`
      );
      if (!res.ok) return [];
      const json = await res.json();
      return (json.news || []).map((n: any) => ({
        id: n.uuid,
        title: n.title,
        source: n.publisher || 'Yahoo Finance',
        timestamp: new Date((n.providerPublishTime || 0) * 1000).toISOString(),
        url: n.link,
        sentiment: 'neutral' as const,
        summary: '',
        relatedTickers: n.relatedTickers || [],
      }));
    } catch {
      return [];
    }
  },
};
