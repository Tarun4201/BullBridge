/**
 * Bull Bridge — Stock Store (Zustand)
 * Market data, trending stocks, search, predictions cache
 */

import { create } from 'zustand';
import { Stock, MarketIndex, StockQuote, NewsArticle, StockPredictions, CandleData, TrendTab } from '../types';
import { StockAPI, MarketAPI, PredictionAPI, NewsAPI } from '../services/api';

interface StockState {
  // Market data
  indices: MarketIndex[];
  topGainers: StockQuote[];
  topLosers: StockQuote[];
  mostActive: StockQuote[];
  activeTrendTab: TrendTab;
  
  // Search
  searchQuery: string;
  searchResults: Stock[];
  recentSearches: string[];
  
  // News
  news: NewsArticle[];
  
  // Current stock detail
  currentStock: Stock | null;
  currentCandleData: CandleData[];
  currentPredictions: StockPredictions | null;
  currentStockNews: NewsArticle[];
  
  // Loading
  isLoadingMarket: boolean;
  isLoadingSearch: boolean;
  isLoadingDetail: boolean;

  // Actions
  loadMarketData: () => Promise<void>;
  setTrendTab: (tab: TrendTab) => void;
  searchStocks: (query: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  addRecentSearch: (ticker: string) => void;
  loadStockDetail: (ticker: string) => Promise<void>;
  loadNews: () => Promise<void>;
}

export const useStockStore = create<StockState>((set, get) => ({
  indices: [],
  topGainers: [],
  topLosers: [],
  mostActive: [],
  activeTrendTab: 'gainers',
  searchQuery: '',
  searchResults: [],
  recentSearches: ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS'],
  news: [],
  currentStock: null,
  currentCandleData: [],
  currentPredictions: null,
  currentStockNews: [],
  isLoadingMarket: false,
  isLoadingSearch: false,
  isLoadingDetail: false,

  loadMarketData: async () => {
    set({ isLoadingMarket: true });
    try {
      const [indices, gainers, losers, active, news] = await Promise.all([
        MarketAPI.getIndices(),
        MarketAPI.getTopGainers(),
        MarketAPI.getTopLosers(),
        MarketAPI.getMostActive(),
        NewsAPI.getLatest(),
      ]);
      set({ indices, topGainers: gainers, topLosers: losers, mostActive: active, news, isLoadingMarket: false });
    } catch {
      set({ isLoadingMarket: false });
    }
  },

  setTrendTab: (tab) => set({ activeTrendTab: tab }),

  searchStocks: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    set({ isLoadingSearch: true });
    try {
      const results = await StockAPI.search(query);
      set({ searchResults: results, isLoadingSearch: false });
    } catch {
      set({ isLoadingSearch: false });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  addRecentSearch: (ticker) => {
    set((state) => ({
      recentSearches: [ticker, ...state.recentSearches.filter(t => t !== ticker)].slice(0, 5),
    }));
  },

  loadStockDetail: async (ticker) => {
    set({ isLoadingDetail: true, currentStock: null, currentCandleData: [], currentPredictions: null, currentStockNews: [] });
    try {
      const [stock, candles, predictions, news] = await Promise.all([
        StockAPI.getByTicker(ticker),
        StockAPI.getCandleData(ticker),
        PredictionAPI.getByTicker(ticker),
        NewsAPI.getByTicker(ticker),
      ]);
      set({
        currentStock: stock || null,
        currentCandleData: candles,
        currentPredictions: predictions || null,
        currentStockNews: news,
        isLoadingDetail: false,
      });
    } catch {
      set({ isLoadingDetail: false });
    }
  },

  loadNews: async () => {
    const news = await NewsAPI.getLatest();
    set({ news });
  },
}));
