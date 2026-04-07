/**
 * Bull Bridge — Advanced AI Reasoning Service
 * Multi-factor analysis engine that consumes stock data (never controls it).
 *
 * Rules:
 *  - Receives COPIES of data — never mutates originals
 *  - Runs AFTER stock data has loaded
 *  - Never touches Zustand store or React state
 *  - 5-second timeout protection
 *  - Silent fallback on any failure
 */

import {
  Stock,
  StockPredictions,
  CandleData,
  ReasoningResult,
  ReasoningSignal,
  RiskLevel,
  Recommendation,
} from '../types';

// ─── Constants ───────────────────────────────

const REASONING_TIMEOUT_MS = 5_000;

const FALLBACK_REASONING: ReasoningResult = {
  summary: 'Unable to generate detailed reasoning at this time. Please check back later.',
  recommendation: 'HOLD',
  signals: [
    {
      factor: 'Analysis Unavailable',
      impact: 'neutral',
      explanation: 'Reasoning engine could not complete analysis. Default conservative stance applied.',
      weight: 0,
    },
  ],
  confidence: 0,
  risk_level: 'medium',
  analysisTimestamp: new Date().toISOString(),
};

// ─── Multi-Factor Analysis Engine ────────────

/**
 * Analyze price trend by comparing current price against key reference points.
 */
function analyzePriceTrend(stock: Stock): ReasoningSignal {
  const { price, open, previousClose, high52Week, low52Week } = stock;

  const range52 = high52Week - low52Week;
  const positionIn52W = range52 > 0 ? ((price - low52Week) / range52) * 100 : 50;
  const vsOpen = ((price - open) / open) * 100;
  const vsPrevClose = ((price - previousClose) / previousClose) * 100;

  let impact: ReasoningSignal['impact'] = 'neutral';
  let explanation = '';

  if (positionIn52W > 75 && vsPrevClose > 0) {
    impact = 'positive';
    explanation = `Trading in the upper quartile of 52-week range (${positionIn52W.toFixed(0)}%). Price is up ${vsPrevClose.toFixed(2)}% from previous close, indicating strong bullish momentum.`;
  } else if (positionIn52W < 25 && vsPrevClose < 0) {
    impact = 'negative';
    explanation = `Trading in the lower quartile of 52-week range (${positionIn52W.toFixed(0)}%). Price is down ${Math.abs(vsPrevClose).toFixed(2)}% from previous close, signaling continued weakness.`;
  } else if (vsOpen > 0.5) {
    impact = 'positive';
    explanation = `Price gained ${vsOpen.toFixed(2)}% since today's open. Currently at ${positionIn52W.toFixed(0)}% of 52-week range.`;
  } else if (vsOpen < -0.5) {
    impact = 'negative';
    explanation = `Price declined ${Math.abs(vsOpen).toFixed(2)}% since today's open. Currently at ${positionIn52W.toFixed(0)}% of 52-week range.`;
  } else {
    explanation = `Price is relatively stable today (${vsOpen >= 0 ? '+' : ''}${vsOpen.toFixed(2)}% from open). Positioned at ${positionIn52W.toFixed(0)}% of 52-week range.`;
  }

  return { factor: 'Price Trend', impact, explanation, weight: 0.25 };
}

/**
 * Analyze intra-day volatility using day range relative to price.
 */
function analyzeVolatility(stock: Stock): ReasoningSignal {
  const { dayHigh, dayLow, previousClose } = stock;
  const dayRange = dayHigh - dayLow;
  const volatilityPct = previousClose > 0 ? (dayRange / previousClose) * 100 : 0;

  let impact: ReasoningSignal['impact'] = 'neutral';
  let explanation = '';
  let riskNote = '';

  if (volatilityPct > 3) {
    impact = 'negative';
    riskNote = 'HIGH volatility';
    explanation = `Day range is ${volatilityPct.toFixed(2)}% of previous close (₹${dayLow.toLocaleString('en-IN')} — ₹${dayHigh.toLocaleString('en-IN')}). ${riskNote} — significant price swings increase short-term risk.`;
  } else if (volatilityPct > 1.5) {
    impact = 'neutral';
    riskNote = 'MODERATE volatility';
    explanation = `Day range is ${volatilityPct.toFixed(2)}% of previous close. ${riskNote} — typical for active trading sessions.`;
  } else {
    impact = 'positive';
    riskNote = 'LOW volatility';
    explanation = `Day range is only ${volatilityPct.toFixed(2)}% of previous close. ${riskNote} — price stability suggests lower immediate risk.`;
  }

  return { factor: 'Volatility', impact, explanation, weight: 0.15 };
}

/**
 * Analyze recent price movement (change percent).
 */
function analyzeRecentMovement(stock: Stock): ReasoningSignal {
  const { change, changePercent, volume } = stock;
  const absChange = Math.abs(changePercent);
  const volumeM = (volume / 1_000_000).toFixed(1);

  let impact: ReasoningSignal['impact'] = 'neutral';
  let explanation = '';

  if (changePercent > 2) {
    impact = 'positive';
    explanation = `Strong upward move of +${changePercent.toFixed(2)}% (₹${change.toFixed(2)}) with ${volumeM}M volume. Momentum favors bulls.`;
  } else if (changePercent > 0.5) {
    impact = 'positive';
    explanation = `Moderate positive movement of +${changePercent.toFixed(2)}% (₹${change.toFixed(2)}) on ${volumeM}M volume.`;
  } else if (changePercent < -2) {
    impact = 'negative';
    explanation = `Significant decline of ${changePercent.toFixed(2)}% (₹${change.toFixed(2)}) with ${volumeM}M volume. Selling pressure evident.`;
  } else if (changePercent < -0.5) {
    impact = 'negative';
    explanation = `Moderate decline of ${changePercent.toFixed(2)}% (₹${change.toFixed(2)}) on ${volumeM}M volume.`;
  } else {
    explanation = `Minimal movement of ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% today. Market is indecisive at this level.`;
  }

  return { factor: 'Recent Movement', impact, explanation, weight: 0.2 };
}

/**
 * Analyze AI prediction consensus across all models.
 */
function analyzePredictionConsensus(predictions: StockPredictions | null): ReasoningSignal {
  if (!predictions || !predictions.predictions || predictions.predictions.length === 0) {
    return {
      factor: 'AI Prediction Consensus',
      impact: 'neutral',
      explanation: 'No AI model predictions available for consensus analysis.',
      weight: 0.25,
    };
  }

  const preds = predictions.predictions;
  const bullishCount = preds.filter(p => p.direction === 'BULLISH').length;
  const bearishCount = preds.filter(p => p.direction === 'BEARISH').length;
  const avgConfidence = preds.reduce((sum, p) => sum + p.confidence, 0) / preds.length;
  const avgAccuracy = preds.reduce((sum, p) => sum + p.accuracy, 0) / preds.length;

  const modelNames = preds.map(p => p.model).join(', ');
  let impact: ReasoningSignal['impact'] = 'neutral';
  let explanation = '';

  if (bullishCount === preds.length) {
    impact = 'positive';
    explanation = `All ${preds.length} models (${modelNames}) are BULLISH with avg confidence ${avgConfidence.toFixed(0)}% and historical accuracy ${avgAccuracy.toFixed(0)}%. Strong consensus.`;
  } else if (bearishCount === preds.length) {
    impact = 'negative';
    explanation = `All ${preds.length} models (${modelNames}) are BEARISH with avg confidence ${avgConfidence.toFixed(0)}% and historical accuracy ${avgAccuracy.toFixed(0)}%. Strong bearish consensus.`;
  } else if (bullishCount > bearishCount) {
    impact = 'positive';
    explanation = `${bullishCount}/${preds.length} models lean BULLISH (avg confidence ${avgConfidence.toFixed(0)}%). Mixed signals — proceed with caution.`;
  } else if (bearishCount > bullishCount) {
    impact = 'negative';
    explanation = `${bearishCount}/${preds.length} models lean BEARISH (avg confidence ${avgConfidence.toFixed(0)}%). Mixed signals — caution advised.`;
  } else {
    explanation = `Models are evenly split (avg confidence ${avgConfidence.toFixed(0)}%). No clear directional consensus from AI models.`;
  }

  return { factor: 'AI Prediction Consensus', impact, explanation, weight: 0.25 };
}

/**
 * Analyze valuation using P/E ratio and dividend yield.
 */
function analyzeValuation(stock: Stock): ReasoningSignal {
  const { pe, dividendYield, sector } = stock;

  let impact: ReasoningSignal['impact'] = 'neutral';
  let explanation = '';

  if (pe <= 0) {
    impact = 'negative';
    explanation = `Negative or zero P/E ratio suggests the company is not profitable. High risk for value investors.`;
  } else if (pe < 15) {
    impact = 'positive';
    explanation = `P/E of ${pe} suggests the stock may be undervalued relative to earnings. Dividend yield at ${dividendYield}%. Sector: ${sector}.`;
  } else if (pe > 40) {
    impact = 'negative';
    explanation = `P/E of ${pe} indicates premium valuation — high growth expectations are already priced in. Dividend yield: ${dividendYield}%. Sector: ${sector}.`;
  } else {
    explanation = `P/E of ${pe} is within a reasonable range. Dividend yield: ${dividendYield}%. Sector: ${sector}.`;
  }

  return { factor: 'Valuation', impact, explanation, weight: 0.15 };
}

// ─── Scoring & Aggregation ───────────────────

function computeConfidence(signals: ReasoningSignal[]): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const sig of signals) {
    const score = sig.impact === 'positive' ? 1 : sig.impact === 'negative' ? -1 : 0;
    weightedSum += score * sig.weight;
    totalWeight += sig.weight;
  }

  // Normalize from [-1, 1] to [0, 100]
  const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  return Math.round(((rawScore + 1) / 2) * 100);
}

function determineRiskLevel(signals: ReasoningSignal[], confidence: number): RiskLevel {
  const negativeCount = signals.filter(s => s.impact === 'negative').length;
  const volatilitySignal = signals.find(s => s.factor === 'Volatility');
  const isHighVolatility = volatilitySignal?.impact === 'negative';

  if (negativeCount >= 3 || (isHighVolatility && confidence < 35)) return 'high';
  if (negativeCount >= 2 || confidence < 45 || isHighVolatility) return 'medium';
  return 'low';
}

function determineRecommendation(confidence: number, riskLevel: RiskLevel): Recommendation {
  if (confidence >= 65 && riskLevel !== 'high') return 'BUY';
  if (confidence <= 35 || riskLevel === 'high') return 'SELL';
  return 'HOLD';
}

function generateSummary(
  stock: Stock,
  recommendation: Recommendation,
  confidence: number,
  riskLevel: RiskLevel,
  signals: ReasoningSignal[]
): string {
  const positiveSignals = signals.filter(s => s.impact === 'positive').map(s => s.factor);
  const negativeSignals = signals.filter(s => s.impact === 'negative').map(s => s.factor);

  const ticker = stock.ticker.replace('.NS', '').replace('.BO', '');
  let summary = `${ticker} receives a ${recommendation} recommendation with ${confidence}% confidence. `;

  if (positiveSignals.length > 0) {
    summary += `Positive factors: ${positiveSignals.join(', ')}. `;
  }
  if (negativeSignals.length > 0) {
    summary += `Concerns: ${negativeSignals.join(', ')}. `;
  }

  summary += `Overall risk is assessed as ${riskLevel.toUpperCase()}.`;
  return summary;
}

// ─── Main Entry Point ────────────────────────

/**
 * Core analysis function. Runs all factor analyzers on deep-copied data.
 * NEVER receives store references — only plain data objects.
 */
async function performAnalysis(
  stock: Stock,
  predictions: StockPredictions | null,
  _candleData: CandleData[] // reserved for future candle-pattern analysis
): Promise<ReasoningResult> {
  // Simulate async processing (in production this could call an ML endpoint)
  await new Promise(resolve => setTimeout(resolve, 800));

  const signals: ReasoningSignal[] = [
    analyzePriceTrend(stock),
    analyzeVolatility(stock),
    analyzeRecentMovement(stock),
    analyzePredictionConsensus(predictions),
    analyzeValuation(stock),
  ];

  const confidence = computeConfidence(signals);
  const riskLevel = determineRiskLevel(signals, confidence);
  const recommendation = determineRecommendation(confidence, riskLevel);
  const summary = generateSummary(stock, recommendation, confidence, riskLevel, signals);

  return {
    summary,
    recommendation,
    signals,
    confidence,
    risk_level: riskLevel,
    analysisTimestamp: new Date().toISOString(),
  };
}

// ─── Public API (with timeout + fallback) ────

import { API_BASE_URL, checkBackendHealth } from './apiHealth';

/**
 * Analyze a stock with full multi-factor reasoning.
 *
 * @param stock        - COPY of stock data (will not be mutated)
 * @param predictions  - COPY of predictions (will not be mutated)
 * @param candleData   - COPY of candle data (will not be mutated)
 * @returns Structured ReasoningResult — always resolves, never throws
 */
export async function analyzeStock(
  stock: Stock,
  predictions: StockPredictions | null,
  candleData: CandleData[]
): Promise<ReasoningResult> {
  const health = await checkBackendHealth();
  if (health.status === 'ok') {
    try {
      const res = await fetch(`${API_BASE_URL}/stock/${stock.ticker}`);
      if (res.ok) {
        const data = await res.json();
        return {
          summary: data.reasoning || FALLBACK_REASONING.summary,
          recommendation: (data.prediction as Recommendation) || FALLBACK_REASONING.recommendation,
          signals: FALLBACK_REASONING.signals,
          confidence: 90,
          risk_level: 'medium',
          analysisTimestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.warn('[ReasoningService] Backend fetch failed, falling back to local computation:', error);
    }
  }

  try {
    const result = await Promise.race([
      performAnalysis(stock, predictions, candleData),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Reasoning timeout')), REASONING_TIMEOUT_MS)
      ),
    ]);
    return result;
  } catch (error) {
    console.warn('[ReasoningService] Analysis failed, returning fallback:', error);
    return {
      ...FALLBACK_REASONING,
      analysisTimestamp: new Date().toISOString(),
    };
  }
}
