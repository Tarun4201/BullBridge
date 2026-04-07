/**
 * Bull Bridge — useReasoning Hook
 * Triggers AI reasoning AFTER stock data loads.
 * Completely independent from stock loading state.
 *
 * Safety:
 *  - Uses individual Zustand selectors (no full-store subscription)
 *  - Deep-copies stock data before passing to reasoning service
 *  - Own loading state (isLoadingReasoning) — never touches isLoadingDetail
 *  - Uses stock ticker (stable string) as primary dependency
 *  - Abort-safe via generation counter (no stale results)
 *  - Full try/catch — any failure returns null silently
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useStockStore } from '../stores/stockStore';
import { ReasoningResult } from '../types';

export function useReasoning() {
  const [reasoning, setReasoning] = useState<ReasoningResult | null>(null);
  const [isLoadingReasoning, setIsLoadingReasoning] = useState(false);

  // Use INDIVIDUAL selectors — avoids subscribing to the entire store
  // This prevents re-renders from unrelated store changes (search, market, etc.)
  const currentStock = useStockStore(s => s.currentStock);
  const currentPredictions = useStockStore(s => s.currentPredictions);
  const currentCandleData = useStockStore(s => s.currentCandleData);
  const isLoadingDetail = useStockStore(s => s.isLoadingDetail);

  // Use the ticker string (primitive) as a stable dependency
  // Object references (currentStock) change identity on every store set() call
  const stockTicker = currentStock?.ticker ?? null;

  // Generation counter to discard stale results
  const generationRef = useRef(0);
  // Track mount status
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    // Reset reasoning when loading starts or stock changes
    if (isLoadingDetail || !stockTicker) {
      setReasoning(null);
      setIsLoadingReasoning(false);
      return;
    }

    const currentGeneration = ++generationRef.current;

    const runReasoning = async () => {
      // Guard: don't proceed if already unmounted
      if (!isMountedRef.current) return;

      setIsLoadingReasoning(true);
      try {
        // Read fresh data from store at invocation time (not from stale closure)
        const state = useStockStore.getState();
        const stock = state.currentStock;
        const predictions = state.currentPredictions;
        const candles = state.currentCandleData;

        // Final safety check
        if (!stock) {
          if (currentGeneration === generationRef.current && isMountedRef.current) {
            setIsLoadingReasoning(false);
          }
          return;
        }

        // Deep-copy all data — reasoning service NEVER sees original references
        const stockCopy = JSON.parse(JSON.stringify(stock));
        const predictionsCopy = predictions
          ? JSON.parse(JSON.stringify(predictions))
          : null;
        const candleCopy = JSON.parse(JSON.stringify(candles));

        // Lazy import to avoid blocking initial bundle load
        const { analyzeStock } = await import('../services/reasoningService');
        const result = await analyzeStock(stockCopy, predictionsCopy, candleCopy);

        // Only apply result if this is still the current generation AND mounted
        if (currentGeneration === generationRef.current && isMountedRef.current) {
          setReasoning(result);
        }
      } catch (error) {
        // Silent failure — reasoning should NEVER crash the stock screen
        console.warn('[useReasoning] Error (non-fatal):', error);
      } finally {
        if (currentGeneration === generationRef.current && isMountedRef.current) {
          setIsLoadingReasoning(false);
        }
      }
    };

    // Small delay to ensure stock UI has rendered first
    const timerId = setTimeout(runReasoning, 50);
    return () => clearTimeout(timerId);
  }, [stockTicker, isLoadingDetail]);

  return { reasoning, isLoadingReasoning };
}
