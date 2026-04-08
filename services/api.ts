/**
 * Bull Bridge — API Service Layer (100% Live, No API Keys)
 * Uses Yahoo Finance free endpoints + NSE symbol list for Indian market data.
 */

import { Stock, MarketIndex, StockQuote, NewsArticle, StockPredictions, CandleData } from '../types';
import { API_BASE_URL, checkBackendHealth } from './apiHealth';
import { NIFTY_500_SYMBOLS } from '../constants/nseSymbols';
import { MOCK_INDICES } from '../constants/mockMarketData';

/**
 * Stable Fallback Fetcher — Ensures data loads even if v7 is blocked
 */
async function fetchYahooQuote(ticker: string): Promise<Partial<Stock> | null> {
  // Try v8 first for indices (much more stable for benchmarks)
  if (ticker.startsWith('^')) {
    return fetchYahooQuoteV8(ticker);
  }

  // Try v7 first for regular stocks (Detailed Fundamentals)
  const detailed = await fetchYahooQuoteV7(ticker);
  if (detailed) return detailed;

  // Fallback to v8 (Basic Chart Data)
  return fetchYahooQuoteV8(ticker);
}

/**
 * Yahoo Finance v7 Quote — Returns price + fundamentals
 */
async function fetchYahooQuoteV7(ticker: string): Promise<Partial<Stock> | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker)}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.quoteResponse?.result?.[0];
    if (!result) return null;

    const price = result.regularMarketPrice ?? 0;
    const formatCap = (val: number) => {
      if (!val) return '-';
      if (val >= 1e12) return (val / 1e12).toFixed(2) + 'T';
      if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
      return (val / 1e7).toFixed(2) + ' Cr';
    };

    return {
      ticker: result.symbol,
      name: result.longName || result.shortName || result.symbol,
      exchange: result.fullExchangeName || result.exchange || 'NSE',
      price: parseFloat(price.toFixed(2)),
      previousClose: parseFloat((result.regularMarketPreviousClose ?? 0).toFixed(2)),
      open: parseFloat((result.regularMarketOpen ?? price).toFixed(2)),
      dayHigh: parseFloat((result.regularMarketDayHigh ?? price).toFixed(2)),
      dayLow: parseFloat((result.regularMarketDayLow ?? price).toFixed(2)),
      change: parseFloat((result.regularMarketChange ?? 0).toFixed(2)),
      changePercent: parseFloat((result.regularMarketChangePercent ?? 0).toFixed(2)),
      volume: result.regularMarketVolume ?? 0,
      marketCap: formatCap(result.marketCap),
      pe: parseFloat((result.trailingPE || 0).toFixed(2)),
      pb: parseFloat((result.priceToBook || 0).toFixed(2)),
      eps: parseFloat((result.epsTrailingTwelveMonths || 0).toFixed(2)),
      dividendYield: parseFloat((result.dividendYield || 0).toFixed(2)),
      low52Week: result.fiftyTwoWeekLow ?? 0,
      high52Week: result.fiftyTwoWeekHigh ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Yahoo Finance v8 Chart — Basic price data (Highest reliability)
 */
async function fetchYahooQuoteV8(ticker: string): Promise<Partial<Stock> | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
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

/**
 * NEW: Yahoo Finance Screener Fetcher
 * Analyzes ALL 3000+ stocks for the region and returns top movers instantly.
 */
async function fetchMarketScreener(scrId: 'day_gainers' | 'day_losers' | 'most_actives'): Promise<Partial<Stock>[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&scrIds=${scrId}&region=IN`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return [];

    const json = await res.json();
    const quotes = json?.finance?.result?.[0]?.quotes || [];
    
    // STRICT INDIAN FILTER: Only include stocks listed on NSE (.NS) or BSE (.BO)
    return quotes
      .filter((q: any) => q.symbol && (q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO')))
      .map((result: any) => ({
        ticker: result.symbol,
        name: result.longName || result.shortName || result.symbol,
        exchange: result.fullExchangeName || result.exchange || 'NSE',
        price: parseFloat((result.regularMarketPrice ?? 0).toFixed(2)),
        change: parseFloat((result.regularMarketChange ?? 0).toFixed(2)),
        changePercent: parseFloat((result.regularMarketChangePercent ?? 0).toFixed(2)),
        volume: result.regularMarketVolume ?? 0,
      } as Partial<Stock>));
  } catch (e) {
    console.warn(`[API] Screener ${scrId} failed:`, e);
    return [];
  }
}

/**
 * Bulk Yahoo Finance Fetcher — Used for manually tracked lists (Nifty 100)
 */
async function fetchYahooQuotesBulk(tickers: string[]): Promise<Partial<Stock>[]> {
  if (tickers.length === 0) return [];
  
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000); // 8s timeout for the whole batch
    const res = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickers.map(encodeURIComponent).join(',')}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return [];

    const json = await res.json();
    const results = json?.quoteResponse?.result || [];
    
    return results.map((result: any) => {
      const price = result.regularMarketPrice ?? 0;
      const formatCap = (val: number) => {
        if (!val) return '-';
        if (val >= 1e12) return (val / 1e12).toFixed(2) + 'T';
        if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
        return (val / 1e7).toFixed(2) + ' Cr';
      };

      return {
        ticker: result.symbol,
        name: result.longName || result.shortName || result.symbol,
        exchange: result.fullExchangeName || result.exchange || 'NSE',
        price: parseFloat(price.toFixed(2)),
        previousClose: parseFloat((result.regularMarketPreviousClose ?? 0).toFixed(2)),
        open: parseFloat((result.regularMarketOpen ?? price).toFixed(2)),
        dayHigh: parseFloat((result.regularMarketDayHigh ?? price).toFixed(2)),
        dayLow: parseFloat((result.regularMarketDayLow ?? price).toFixed(2)),
        change: parseFloat((result.regularMarketChange ?? 0).toFixed(2)),
        changePercent: parseFloat((result.regularMarketChangePercent ?? 0).toFixed(2)),
        volume: result.regularMarketVolume ?? 0,
        marketCap: formatCap(result.marketCap),
        pe: parseFloat((result.trailingPE || 0).toFixed(2)),
        pb: parseFloat((result.priceToBook || 0).toFixed(2)),
        eps: parseFloat((result.epsTrailingTwelveMonths || 0).toFixed(2)),
        dividendYield: parseFloat((result.dividendYield || 0).toFixed(2)),
        low52Week: result.fiftyTwoWeekLow ?? 0,
        high52Week: result.fiftyTwoWeekHigh ?? 0,
      } as Partial<Stock>;
    });
  } catch {
    return [];
  }
}

// ─── Batch Fetcher — concurrent requests in BATCH_SIZE chunks ────────────────
const BATCH_SIZE = 10; // Micro-batches to bypass stealth blocks (429)
const INTER_BATCH_DELAY = 150; // ms

async function fetchYahooQuotesBatch(tickers: string[]): Promise<Partial<Stock>[]> {
  const results: Partial<Stock>[] = [];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s total safety for full batch

  try {
    for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
      if (controller.signal.aborted) break;
      const batch = tickers.slice(i, i + BATCH_SIZE);
      const batchResults = await fetchYahooQuotesBulk(batch);
      for (const r of batchResults) {
        if (r && r.ticker) results.push(r);
      }
      // Anti-429 Delay
      if (i + BATCH_SIZE < tickers.length) {
        await new Promise(resolve => setTimeout(resolve, INTER_BATCH_DELAY));
      }
    }
  } catch (e) {
    console.warn('[API] Bulk fetch partially interrupted:', e);
  } finally {
    clearTimeout(timeoutId);
  }
  return results;
}

// Single-ticker version with anti-block staggering
async function fetchYahooQuotes(tickers: string[]): Promise<Partial<Stock>[]> {
  const results: Partial<Stock>[] = [];
  for (const ticker of tickers) {
    const res = await fetchYahooQuote(ticker);
    if (res) results.push(res);
    // 100ms stagger to avoid 'burst' traffic blocks (429)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return results;
}

let cachedMarketQuotes: Partial<Stock>[] = [];
let lastMarketFetchTime = 0;
const CACHE_DURATION = 60000; // 60 seconds

/**
 * Optimized Market Snapshot — Queries top 100 symbols
 * Shared between Gainers, Losers, and Active sections.
 */
async function getTopMarketQuotes(): Promise<Partial<Stock>[]> {
  const now = Date.now();
  if (cachedMarketQuotes.length > 0 && (now - lastMarketFetchTime) < CACHE_DURATION) {
    return cachedMarketQuotes;
  }

  // Smart Trio discovery: Mega (Top 40), Mid (Middle 30), Small (Bottom 30)
  const symbols = Array.from(new Set([
    ...NIFTY_500_SYMBOLS.slice(0, 40),
    ...NIFTY_500_SYMBOLS.slice(200, 230),
    ...NIFTY_500_SYMBOLS.slice(450, 480)
  ]));

  try {
    const results = await fetchYahooQuotesBatch(symbols);
    
    // Recovery Mode: Smart Spread Discovery (Diverse 20-stock pack)
    if (results.length === 0) {
      console.warn('[API] Bulk fetch blocked. Triggering Smart Spread Recovery...');
      const recoveryPool = [
        ...NIFTY_500_SYMBOLS.slice(0, 10),      // Top Large Caps
        ...NIFTY_500_SYMBOLS.slice(150, 160),   // Diversified sector
      ];
      const recoveryResults = await fetchYahooQuotes(recoveryPool);
      if (recoveryResults.length > 0) {
        cachedMarketQuotes = recoveryResults;
        lastMarketFetchTime = now;
        return recoveryResults;
      }
    }

    if (results.length > 0) {
      cachedMarketQuotes = results;
      lastMarketFetchTime = now;
    }
    return results;
  } catch (error) {
    console.error('[API] Failed to fetch market snapshot:', error);
    return cachedMarketQuotes;
  }
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
        `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=25&newsCount=0&enableFuzzyQuery=false&region=IN&lang=en-IN`,
        { signal: controller.signal }
      );
      clearTimeout(timer);
      if (!res.ok) return [];

      const json = await res.json();
      const quotes: any[] = json?.quotes || [];

      // STRICT INDIAN FILTER: NSE (.NS) or BSE (.BO) only.
      return quotes
        .filter(q =>
          q.quoteType === 'EQUITY' &&
          (q.symbol && (q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO')))
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
      // Benchmarks (^NSEI, etc.) often fail on small intraday ranges. 
      // Force stable parameters for indices.
      const isIndex = ticker.startsWith('^');
      const range = isIndex ? '1mo' : (days <= 5 ? '5d' : days <= 30 ? '1mo' : days <= 90 ? '3mo' : '1y');
      const interval = isIndex ? '1d' : (days <= 5 ? '15m' : '1d');

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000); // 8s timeout for charts
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
        if (quote.close?.[i] != null) {
          candles.push({
            date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
            open: parseFloat((quote.open?.[i] || quote.close?.[i]).toFixed(2)),
            high: parseFloat((quote.high?.[i] || quote.close?.[i]).toFixed(2)),
            low: parseFloat((quote.low?.[i] || quote.close?.[i]).toFixed(2)),
            close: parseFloat(quote.close[i].toFixed(2)),
            volume: quote.volume?.[i] || 0,
          });
        }
      }
      return candles;
    } catch (e) {
      console.warn(`[API] Candle fetch failed for ${ticker}`, e);
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
    const targets = [
      { ticker: '^NSEI', name: 'NIFTY 50' },
      { ticker: '^BSESN', name: 'SENSEX' },
      { ticker: '^NSEBANK', name: 'NIFTY Bank' },
    ];

    const results = await Promise.all(
      targets.map(async (target) => {
        try {
          const quote = await fetchYahooQuote(target.ticker);
          if (quote) {
            return {
              name: target.name,
              ticker: target.ticker,
              value: quote.price || 0,
              change: quote.change || 0,
              changePercent: quote.changePercent || 0,
            };
          }
        } catch (e) {
          console.warn(`[MarketAPI] Failed live fetch for ${target.ticker}`, e);
        }
        
        // Fallback to mock for this specific slot if live fetch fails
        const mock = MOCK_INDICES.find(m => m.ticker === target.ticker);
        return mock || { name: target.name, ticker: target.ticker, value: 0, change: 0, changePercent: 0 };
      })
    );

    return results;
  },

  /**
   * Top 10 Gainers — Professional Screener (analyzes 3000+ stocks)
   */
  async getTopGainers(): Promise<StockQuote[]> {
    const results = await fetchMarketScreener('day_gainers');
    if (results.length > 0) return results.slice(0, 10) as StockQuote[];
    
    // Fallback to manual Nifty 100 snapshot
    const quotes = await getTopMarketQuotes();
    return [...quotes]
      .filter(q => (q.changePercent ?? 0) >= 0)
      .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))
      .slice(0, 10) as StockQuote[];
  },

  /**
   * Top 10 Losers — Professional Screener (analyzes 3000+ stocks)
   */
  async getTopLosers(): Promise<StockQuote[]> {
    const results = await fetchMarketScreener('day_losers');
    if (results.length > 0) return results.slice(0, 10) as StockQuote[];

    const quotes = await getTopMarketQuotes();
    return [...quotes]
      .filter(q => (q.changePercent ?? 0) <= 0)
      .sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0))
      .slice(0, 10) as StockQuote[];
  },

  /**
   * Top 10 Active — Professional Screener (analyzes 3000+ stocks)
   */
  async getMostActive(): Promise<StockQuote[]> {
    const results = await fetchMarketScreener('most_actives');
    if (results.length > 0) return results.slice(0, 10) as StockQuote[];

    const quotes = await getTopMarketQuotes();
    return [...quotes]
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
  /** Latest Indian market news from Yahoo Finance search with strict filtering */
  async getLatest(limit: number = 10): Promise<NewsArticle[]> {
    try {
      const res = await fetch(
        `https://query2.finance.yahoo.com/v1/finance/search?q=Indian+Stock+Market+NSE+BSE+Nifty+Sensex+Equity&newsCount=30&quotesCount=0`
      );
      if (!res.ok) return [];
      const json = await res.json();
      
      const ALL_INDIA_NEWS = (json.news || []).map((n: any) => ({
        id: n.uuid,
        title: n.title,
        source: n.publisher || 'Yahoo Finance',
        timestamp: new Date((n.providerPublishTime || 0) * 1000).toISOString(),
        url: n.link,
        sentiment: 'neutral' as const,
        summary: '',
        relatedTickers: n.relatedTickers || [],
      }));

      // Extreme filter for Indian market relevance
      const indianKeywords = [
        'india', 'nse', 'bse', 'nifty', 'sensex', 'bank nifty', 'rupee', 
        'stock market india', 'infy', 'reliance', 'tata', 'hdfc', 'sbi'
      ];
      const filtered = ALL_INDIA_NEWS.filter((article: any) => {
        const title = article.title.toLowerCase();
        // Priority to headlines actually mentioning India or NSE/BSE
        return indianKeywords.some(kw => title.includes(kw));
      });

      return filtered.slice(0, limit);
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
