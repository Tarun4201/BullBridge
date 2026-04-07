/**
 * Bull Bridge — Watchlist Store (Zustand)
 * User's saved stocks with add/remove functionality
 */

import { create } from 'zustand';
import { Stock } from '../types';

interface WatchlistState {
  watchlistTickers: string[];
  
  // Actions
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  toggleWatchlist: (ticker: string) => void;
  isInWatchlist: (ticker: string) => boolean;
  getWatchlistTickers: () => string[];
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlistTickers: [],

  addToWatchlist: (ticker) => {
    set((state) => ({
      watchlistTickers: state.watchlistTickers.includes(ticker)
        ? state.watchlistTickers
        : [...state.watchlistTickers, ticker],
    }));
  },

  removeFromWatchlist: (ticker) => {
    set((state) => ({
      watchlistTickers: state.watchlistTickers.filter(t => t !== ticker),
    }));
  },

  toggleWatchlist: (ticker) => {
    const state = get();
    if (state.watchlistTickers.includes(ticker)) {
      state.removeFromWatchlist(ticker);
    } else {
      state.addToWatchlist(ticker);
    }
  },

  isInWatchlist: (ticker) => {
    return get().watchlistTickers.includes(ticker);
  },

  getWatchlistTickers: () => {
    return get().watchlistTickers;
  },
}));
