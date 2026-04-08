import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stock, MarketIndex, StockQuote, NewsArticle, StockPredictions, CandleData, TrendTab } from '../types';
import { StockAPI, MarketAPI, PredictionAPI, NewsAPI } from '../services/api';
import { generateDynamicPredictions } from '../utils/predictionGenerator';
import { MOCK_INDICES, MOCK_GAINERS, MOCK_LOSERS, MOCK_ACTIVE, MOCK_NEWS } from '../constants/mockMarketData';

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

export const useStockStore = create<StockState>()(
  persist(
    (set, get) => ({
      indices: [],
      topGainers: [],
      topLosers: [],
      mostActive: [],
      news: [],

      activeTrendTab: 'gainers',
      searchQuery: '',
      searchResults: [],
      recentSearches: ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS'],
      currentStock: null,
      currentCandleData: [],
      currentPredictions: null,
      currentStockNews: [],
      isLoadingMarket: false,
      isLoadingSearch: false,
      isLoadingDetail: false,

      loadMarketData: async () => {
        set({ isLoadingMarket: true });
        
        // 1. Fetch Indices first (Dashboard Priority)
        try {
          const indices = await MarketAPI.getIndices();
          if (indices.length > 0) set({ indices });
        } catch (e) { console.warn('[StockStore] Indices fetch failed', e); }

        // 2. Fetch Market Snapshot (Shared between Gainers/Losers/Active)
        try {
          // These now use the 60s shared cache in MarketAPI, making this high-speed
          const [liveGainers, liveLosers, liveActive] = await Promise.all([
            MarketAPI.getTopGainers(),
            MarketAPI.getTopLosers(),
            MarketAPI.getMostActive(),
          ]);

          set({ 
            topGainers: liveGainers,
            topLosers: liveLosers,
            mostActive: liveActive,
          });
        } catch (e) { console.warn('[StockStore] Trending stocks fetch failed', e); }

        // 3. Fetch News
        try {
          const news = await NewsAPI.getLatest();
          if (news.length > 0) set({ news });
        } catch (e) { console.warn('[StockStore] News fetch failed', e); }

        set({ isLoadingMarket: false });
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
        set({ 
          isLoadingDetail: true, 
          currentCandleData: [], 
          currentPredictions: null, 
          currentStockNews: [],
        });
        
        const timeoutPromise = new Promise((resolve) => 
          setTimeout(() => {
            if (get().isLoadingDetail) {
              set({ isLoadingDetail: false });
              resolve(null);
            }
          }, 8000)
        );

        try {
          await Promise.race([
            Promise.all([
              StockAPI.getByTicker(ticker),
              StockAPI.getCandleData(ticker),
              PredictionAPI.getByTicker(ticker),
              NewsAPI.getByTicker(ticker),
            ]).then(([liveStock, candles, predictions, news]) => {
              // Strictly live data only
              const finalPredictions = (predictions && predictions.predictions.length > 0) 
                 ? predictions 
                 : (liveStock ? generateDynamicPredictions(liveStock, candles) : null);

              set({
                currentStock: liveStock ? {
                  ...liveStock,
                  marketCap: liveStock.marketCap || '-',
                  dividendYield: liveStock.dividendYield || 0,
                  pb: liveStock.pb || 0,
                  eps: liveStock.eps || 0,
                } : null,
                currentCandleData: candles,
                currentPredictions: finalPredictions as StockPredictions,
                currentStockNews: news,
                isLoadingDetail: false,
              });
            }),
            timeoutPromise
          ]);
        } catch (error) {
          console.warn('[StockStore] Detail fetch failed:', error);
          set({ isLoadingDetail: false });
        }
      },

      loadNews: async () => {
        try {
          const news = await NewsAPI.getLatest();
          if (news.length > 0) set({ news });
        } catch (e) { console.warn('[StockStore] loadNews failed', e); }
      },
    }),
    {
      name: 'bullbridge-stock-storage-v2', // Versioned name to force immediate cache purge
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // No more mock force-applications per user request
      },
      version: 2, 
      partialize: (state) => ({
        indices: state.indices,
        topGainers: state.topGainers,
        topLosers: state.topLosers,
        mostActive: state.mostActive,
        news: state.news,
        recentSearches: state.recentSearches,
      }),
    }
  )
);
