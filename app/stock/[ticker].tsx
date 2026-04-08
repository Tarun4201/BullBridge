/**
 * Bull Bridge — Stock Detail Page
 * Price header, candlestick chart, AI predictions (3 models), watchlist, related news
 * SEBI compliant: BULLISH/BEARISH only, disclaimers on all prediction views
 */

import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemeColors, getGradients } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { useStockStore } from '../../stores/stockStore';
import { useWatchlistStore } from '../../stores/watchlistStore';
import { AIPrediction, TimeFrame, NewsArticle } from '../../types';
import { TradingViewWidget } from '../../components/charts/TradingViewWidget';
import { SimpleLineChart } from '../../components/charts/SimpleLineChart';
import { useReasoning } from '../../hooks/useReasoning';
import { ReasoningPanel } from '../../components/reasoning/ReasoningPanel';
import { Skeleton } from '../../components/ui/Skeleton';
import { getStockInsights } from '../../utils/stockInsights';
import { PressableScale } from '../../components/ui/PressableScale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - Spacing.xl * 2;
const CHART_HEIGHT = 380;

const TIME_FRAMES: TimeFrame[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];

/**
 * Error boundary that catches any crash from reasoning and renders nothing.
 * This guarantees reasoning can NEVER take down the stock screen.
 */
class ReasoningErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[ReasoningErrorBoundary] Caught error:', error.message);
  }
  render() { return this.state.hasError ? null : this.props.children; }
}

/**
 * Self-contained reasoning section. The useReasoning hook lives HERE,
 * completely isolated from StockDetailScreen. If this component crashes,
 * the error boundary catches it and the stock screen keeps working.
 */
function SafeReasoningSection() {
  const { reasoning, isLoadingReasoning } = useReasoning();
  return <ReasoningPanel reasoning={reasoning} isLoading={isLoadingReasoning} />;
}

export default function StockDetailScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const Gradients = getGradients(theme);
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const {
    currentStock, currentCandleData, currentPredictions,
    currentStockNews, loadStockDetail, isLoadingDetail,
  } = useStockStore();
  const { isInWatchlist, toggleWatchlist } = useWatchlistStore();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('3M');
  const inWatchlist = ticker ? isInWatchlist(ticker) : false;

  const insights = React.useMemo(() => {
    if (!currentStock) return null;
    return getStockInsights(currentStock);
  }, [currentStock]);

  useEffect(() => {
    if (ticker) loadStockDetail(ticker);
  }, [ticker]);

  if (isLoadingDetail) {
    return (
      <View style={[styles.container, { padding: Spacing.xl, paddingTop: 60 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xl }}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={100} height={30} />
          <Skeleton width={40} height={40} borderRadius={20} />
        </View>
        <Skeleton width="60%" height={32} style={{ marginBottom: Spacing.sm }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl }}>
          <Skeleton width={120} height={40} style={{ marginRight: Spacing.md }} />
          <Skeleton width={80} height={24} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xl }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} width={(SCREEN_WIDTH - Spacing.xl * 3) / 2} height={60} />
          ))}
        </View>
        <Skeleton width="100%" height={CHART_HEIGHT} style={{ marginBottom: Spacing.xl }} />
      </View>
    );
  }

  if (!currentStock && !isLoadingDetail) {
    return (
      <View style={[styles.container, styles.loader]}>
        <Ionicons name="cloud-offline-outline" size={64} color={theme.textMuted} />
        <Text style={[styles.loaderText, { marginTop: Spacing.md, textAlign: 'center', paddingHorizontal: Spacing.xl }]}>
          Live Data Currently Unavailable
        </Text>
        <TouchableOpacity 
          style={[styles.watchlistBtn, { backgroundColor: theme.primary, marginTop: Spacing.lg, paddingHorizontal: Spacing.xl }]}
          onPress={() => ticker && loadStockDetail(ticker)}
        >
          <Text style={{ color: theme.textInverse, fontWeight: 'bold' }}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ marginTop: Spacing.lg }}
          onPress={() => router.back()}
        >
          <Text style={{ color: theme.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Final Guard for TypeScript and crash prevention
  if (!currentStock) return null;

  const price = typeof currentStock.price === 'number' ? currentStock.price : parseFloat(currentStock.price) || 0;
  const change = typeof currentStock.change === 'number' ? currentStock.change : parseFloat(currentStock.change) || 0;
  const changePercent = typeof currentStock.changePercent === 'number' ? currentStock.changePercent : parseFloat(currentStock.changePercent) || 0;
  const isPositive = change >= 0;
  const isIndex = ['^NSEI', '^BSESN', '^NSEBANK'].includes(currentStock.ticker);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <PressableScale onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </PressableScale>
          <Text style={styles.headerTicker}>{currentStock.ticker.replace('.NS', '')}</Text>
          <PressableScale
            style={styles.watchlistBtn}
            onPress={() => ticker && toggleWatchlist(ticker)}
          >
            <Ionicons
              name={inWatchlist ? 'star' : 'star-outline'}
              size={24}
              color={inWatchlist ? theme.warning : theme.textMuted}
            />
          </PressableScale>
        </View>

        {/* Price Header */}
        <View style={styles.priceSection}>
          <Text style={styles.stockNameDetail}>{currentStock.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            <View style={[styles.changePill, { backgroundColor: isPositive ? theme.bullishMuted : theme.bearishMuted }]}>
              <Ionicons name={isPositive ? 'caret-up' : 'caret-down'} size={14} color={isPositive ? theme.bullish : theme.bearish} />
              <Text style={[styles.changeValue, { color: isPositive ? theme.bullish : theme.bearish }]}>
                ₹{Math.abs(change).toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Key Stats */}
        <View style={styles.statsGrid}>
          <StatItem label="Open" value={`₹${(currentStock.open || 0).toLocaleString('en-IN')}`} />
          <StatItem label="Prev Close" value={`₹${(currentStock.previousClose || 0).toLocaleString('en-IN')}`} />
          <StatItem label="Day Range" value={`₹${currentStock.dayLow || 0} - ₹${currentStock.dayHigh || 0}`} />
          <StatItem label="52W Range" value={`₹${currentStock.low52Week || 0} - ₹${currentStock.high52Week || 0}`} />
          <StatItem label="Market Cap" value={currentStock.marketCap || '-'} />
          <StatItem label="P/E Ratio" value={(currentStock.pe || 0).toString()} />
          <StatItem label="P/B Ratio" value={currentStock.pb?.toString() || insights?.pb?.toString() || '-'} />
          <StatItem label="EPS" value={currentStock.eps?.toString() || insights?.eps?.toString() || '-'} />
          <StatItem label="Volume" value={`${((currentStock.volume || 0) / 1000000).toFixed(1)}M`} />
          <StatItem label="Div Yield" value={`${currentStock.dividendYield || 0}%`} />
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Price Chart</Text>
          </View>

          {/* Time Frame Selector */}
          <View style={styles.timeFrameRow}>
            {TIME_FRAMES.map((tf) => (
              <PressableScale
                key={tf}
                style={[styles.timeFrameBtn, selectedTimeFrame === tf && styles.timeFrameBtnActive]}
                onPress={() => setSelectedTimeFrame(tf)}
              >
                <Text style={[styles.timeFrameText, selectedTimeFrame === tf && styles.timeFrameTextActive]}>
                  {tf}
                </Text>
              </PressableScale>
            ))}
          </View>

          {/* Chart Container (Interactive TradingView or Simple native chart) */}
          <View style={styles.chartContainer}>
            {isIndex ? (
              <SimpleLineChart ticker={currentStock.ticker} height={CHART_HEIGHT} />
            ) : (
              <TradingViewWidget ticker={currentStock.ticker} width="100%" height={CHART_HEIGHT} />
            )}
          </View>
        </View>

        {/* About Company & History */}
        {!isIndex && (currentStock.about || insights?.about) && (
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>Company Profile</Text>
            <AboutWithReadMore 
              title="About" 
              text={currentStock.about || insights?.about || ''} 
            />
            {insights?.history && (
              <AboutWithReadMore 
                title="History & Milestones" 
                text={insights.history} 
                style={{ marginTop: Spacing.md }}
              />
            )}
          </View>
        )}

        {/* AI Predictions Panel */}
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <View style={styles.aiTitleRow}>
              <Ionicons name="sparkles" size={20} color={theme.neuralPurple} />
              <Text style={styles.aiTitle}>AI Predictions</Text>
            </View>
            <View style={styles.horizonBadge}>
              <Text style={styles.horizonText}>T+1 (Next Day)</Text>
            </View>
          </View>

          {/* SEBI Disclaimer Banner */}
          <View style={styles.disclaimerBanner}>
            <Ionicons name="warning" size={14} color={theme.warning} />
            <Text style={styles.disclaimerText}>
              AI predictions are for educational purposes only and are not financial advice.
            </Text>
          </View>

          {/* 3 Model Cards */}
          {currentPredictions?.predictions.map((pred) => (
            <PredictionCard key={pred.model} prediction={pred} />
          ))}
        </View>

        {/* AI Reasoning Panel — fully isolated, cannot crash stock screen */}
        <ReasoningErrorBoundary>
          <SafeReasoningSection />
        </ReasoningErrorBoundary>

        {/* Pros & Cons */}
        {!isIndex && (currentStock.pros || insights?.pros) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Analysis</Text>
            <View style={styles.prosConsContainer}>
              <View style={styles.proConColumn}>
                <View style={[styles.proConHeader, { backgroundColor: theme.bullishMuted }]}>
                  <Ionicons name="thumbs-up" size={16} color={theme.bullish} />
                  <Text style={[styles.proConHeaderText, { color: theme.bullish }]}>Pros</Text>
                </View>
                {(currentStock.pros || insights?.pros)?.map((pro, i) => (
                  <View key={`pro-${i}`} style={styles.proConItem}>
                    <Ionicons name="checkmark-circle" size={14} color={theme.bullish} style={{ marginTop: 2 }} />
                    <Text style={styles.proConText}>{pro}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.proConDivider} />
              <View style={styles.proConColumn}>
                <View style={[styles.proConHeader, { backgroundColor: theme.bearishMuted }]}>
                  <Ionicons name="thumbs-down" size={16} color={theme.bearish} />
                  <Text style={[styles.proConHeaderText, { color: theme.bearish }]}>Cons</Text>
                </View>
                {(currentStock.cons || insights?.cons)?.map((con, i) => (
                  <View key={`con-${i}`} style={styles.proConItem}>
                    <Ionicons name="close-circle" size={14} color={theme.bearish} style={{ marginTop: 2 }} />
                    <Text style={styles.proConText}>{con}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Peer Comparison */}
        {!isIndex && (currentStock.peers || insights?.peers) && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
               <Text style={styles.sectionTitle}>Peer Comparison</Text>
               <Text style={styles.insightTag}>Sector Insights</Text>
            </View>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, { flex: 2 }]}>Company</Text>
                <Text style={[styles.tableCellHeader, { flex: 1, textAlign: 'right' }]}>Market Cap</Text>
                <Text style={[styles.tableCellHeader, { flex: 1, textAlign: 'right' }]}>P/E</Text>
              </View>
              {(currentStock.peers || insights?.peers)?.sort((a,b) => (b.pe || 0) - (a.pe || 0)).map((peer, i) => {
                const maxPe = 40; // Reference for bar width
                const peWidth = Math.min(((peer.pe || 0) / maxPe) * 100, 100);
                
                return (
                  <View key={i} style={styles.tableRow}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.peerName}>{peer.name}</Text>
                      <Text style={styles.peerTicker}>{peer.ticker?.replace('.NS', '')}</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.tableCell}>{peer.marketCap}</Text>
                      <View style={styles.visualBarContainer}>
                         <View style={[styles.visualBar, { width: `${Math.random() * 80 + 20}%`, backgroundColor: theme.primaryMuted }]} />
                      </View>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{peer.pe}</Text>
                      <View style={styles.visualBarContainer}>
                         <View style={[styles.visualBar, { width: `${peWidth}%`, backgroundColor: theme.bullishMuted }]} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={styles.comparisonReasoning}>
              <Ionicons name="bulb-outline" size={16} color={theme.primary} />
              <Text style={styles.reasoningText}>
                {currentStock.name} is currently trading at a {currentStock.pe > 20 ? 'premium' : 'discount'} compared to some of its sector peers, reflecting {currentStock.pe > 20 ? 'higher growth expectations' : 'market cautiousness'}.
              </Text>
            </View>
          </View>
        )}

        {/* Profit & Loss */}
        {!isIndex && (currentStock.financials || insights?.financials) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Profit & Loss (Yearly)</Text>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, { flex: 1 }]}>Year</Text>
                <Text style={[styles.tableCellHeader, { flex: 1.5, textAlign: 'right' }]}>Revenue</Text>
                <Text style={[styles.tableCellHeader, { flex: 1.5, textAlign: 'right' }]}>Net Profit</Text>
              </View>
              {(currentStock.financials || insights?.financials)?.map((fin, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>{fin.year}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>₹{fin.revenue} Cr</Text>
                  <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right', color: fin.profit >= 0 ? theme.bullish : theme.bearish }]}>
                    {fin.profit >= 0 ? '+' : '-'}₹{Math.abs(fin.profit)} Cr
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Shareholding Pattern */}
        {!isIndex && (currentStock.shareholding || insights?.shareholding) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Shareholding Pattern</Text>
            <View style={styles.shareholdingCard}>
              <View style={styles.shareBarContainer}>
                <View style={[styles.shareBarSegment, { flex: (currentStock.shareholding?.promoters || insights?.shareholding?.promoters || 0), backgroundColor: theme.primary }]} />
                <View style={[styles.shareBarSegment, { flex: (currentStock.shareholding?.fii || insights?.shareholding?.fii || 0), backgroundColor: theme.bullish }]} />
                <View style={[styles.shareBarSegment, { flex: (currentStock.shareholding?.dii || insights?.shareholding?.dii || 0), backgroundColor: theme.warning }]} />
                <View style={[styles.shareBarSegment, { flex: (currentStock.shareholding?.public || insights?.shareholding?.public || 0), backgroundColor: theme.bearish }]} />
              </View>
              <View style={styles.shareLegends}>
                {Object.entries({
                  'Promoters': { val: currentStock.shareholding?.promoters || insights?.shareholding?.promoters || 0, col: theme.primary },
                  'FII': { val: currentStock.shareholding?.fii || insights?.shareholding?.fii || 0, col: theme.bullish },
                  'DII': { val: currentStock.shareholding?.dii || insights?.shareholding?.dii || 0, col: theme.warning },
                  'Public': { val: currentStock.shareholding?.public || insights?.shareholding?.public || 0, col: theme.bearish }
                }).map(([k, v]) => (
                  <View key={k} style={styles.shareLegendItem}>
                    <View style={[styles.shareLegendDot, { backgroundColor: v.col }]} />
                    <View>
                      <Text style={styles.shareLegendLabel}>{k}</Text>
                      <Text style={styles.shareLegendValue}>{v.val}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Related News */}
        {currentStockNews.length > 0 && (
          <View style={styles.newsSection}>
            <Text style={styles.newsSectionTitle}>Related News</Text>
            {currentStockNews.map((article) => (
              <NewsItem key={article.id} article={article} />
            ))}
          </View>
        )}

        {/* Data Source Footer */}
        <Text style={styles.footerDisclaimer}>
          Data sourced from Yahoo Finance. 15-20 minute delay during market hours.
        </Text>
      </ScrollView>
    </View>
  );
}

// ─── Sub-Components ──────────────────────────

function StatItem({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function PredictionCard({ prediction }: { prediction: AIPrediction }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const isBullish = prediction.direction === 'BULLISH';
  const modelColors: Record<string, string> = {
    LSTM: theme.primary,
    XGBoost: theme.bullish,
    Ensemble: theme.neuralPurple,
  };
  const modelColor = modelColors[prediction.model] || theme.primary;

  return (
    <View style={styles.predCard}>
      <View style={styles.predHeader}>
        <View style={styles.predModelRow}>
          <View style={[styles.modelDot, { backgroundColor: modelColor }]} />
          <Text style={styles.predModelName}>{prediction.model}</Text>
        </View>
        <View style={[styles.directionBadge, {
          backgroundColor: isBullish ? theme.bullishMuted : theme.bearishMuted,
        }]}>
          <Ionicons
            name={isBullish ? 'trending-up' : 'trending-down'}
            size={14}
            color={isBullish ? theme.bullish : theme.bearish}
          />
          <Text style={[styles.directionText, { color: isBullish ? theme.bullish : theme.bearish }]}>
            {prediction.direction}
          </Text>
        </View>
      </View>

      <View style={styles.predBody}>
        <View style={styles.predMetric}>
          <Text style={styles.predMetricLabel}>Target Price</Text>
          <Text style={styles.predMetricValue}>₹{prediction.targetPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.predMetric}>
          <Text style={styles.predMetricLabel}>Confidence</Text>
          <View style={styles.confidenceBar}>
            <View style={[styles.confidenceFill, {
              width: `${prediction.confidence}%`,
              backgroundColor: prediction.confidence >= 70 ? theme.bullish : prediction.confidence >= 50 ? theme.warning : theme.bearish,
            }]} />
          </View>
          <Text style={styles.confidenceValue}>{prediction.confidence}%</Text>
        </View>
        <View style={styles.predMetric}>
          <Text style={styles.predMetricLabel}>Accuracy</Text>
          <Text style={styles.predMetricValue}>{prediction.accuracy}%</Text>
        </View>
      </View>

      <View style={styles.predReasoning}>
        <Text style={styles.predReasoningTitle}>Reasoning:</Text>
        <Text style={styles.predReasoningText}>{prediction.reasoning}</Text>
      </View>

      <View style={styles.factorsRow}>
        {prediction.factors.map((f, i) => (
          <View key={i} style={styles.factorChip}>
            <Text style={styles.factorText}>{f}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function AboutWithReadMore({ title, text, style }: { title: string; text: string; style?: any }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowReadMore = text.length > 200;

  return (
    <View style={[styles.aboutContainer, style]}>
      <Text style={styles.aboutSubTitle}>{title}</Text>
      <Text 
        style={styles.aboutText} 
        numberOfLines={isExpanded ? undefined : 4}
      >
        {text}
      </Text>
      {shouldShowReadMore && (
        <TouchableOpacity 
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.readMoreBtn}
        >
          <Text style={styles.readMoreText}>
            {isExpanded ? 'Show Less' : 'Read More'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function NewsItem({ article }: { article: NewsArticle }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const sentimentColor = article.sentiment === 'positive' ? theme.bullish : article.sentiment === 'negative' ? theme.bearish : theme.textMuted;
  return (
    <TouchableOpacity style={styles.newsItem} activeOpacity={0.7}>
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>{article.title}</Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsSource}>{article.source}</Text>
          <View style={[styles.newsSentiment, { backgroundColor: `${sentimentColor}20` }]}>
            <Text style={[styles.newsSentimentText, { color: sentimentColor }]}>
              {article.sentiment}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingBottom: 100 },
  loader: { flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loaderText: { color: theme.textSecondary, fontSize: Typography.base },
  // Header
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: 56, paddingBottom: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  headerTicker: { fontSize: Typography.lg, fontWeight: Typography.bold, color: theme.textPrimary },
  watchlistBtn: { padding: Spacing.xs },
  // Price
  priceSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  stockNameDetail: { fontSize: Typography.sm, color: theme.textSecondary, marginBottom: Spacing.xs },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  priceValue: { fontSize: Typography['4xl'], fontWeight: Typography.extrabold, color: theme.textPrimary },
  changePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  changeValue: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  // Stats
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginHorizontal: Spacing.xl, marginBottom: Spacing.lg,
    backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: theme.border, overflow: 'hidden',
  },
  statItem: {
    width: '50%', paddingVertical: Spacing.md, paddingHorizontal: Spacing.base,
    borderBottomWidth: 1, borderBottomColor: theme.borderLight,
  },
  statLabel: { fontSize: Typography.xs, color: theme.textMuted, marginBottom: 2 },
  statValue: { fontSize: Typography.sm, color: theme.textPrimary, fontWeight: Typography.semibold },
  // Chart
  chartSection: {
    marginHorizontal: Spacing.xl, marginBottom: Spacing.lg,
    backgroundColor: theme.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.base, borderWidth: 1, borderColor: theme.border,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  chartTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: theme.textPrimary },
  timeFrameRow: {
    flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.md,
  },
  timeFrameBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full, backgroundColor: theme.backgroundTertiary,
  },
  timeFrameBtnActive: { backgroundColor: theme.primaryMuted },
  timeFrameText: { fontSize: Typography.xs, color: theme.textMuted, fontWeight: Typography.semibold },
  timeFrameTextActive: { color: theme.primary },
  chartContainer: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  // AI Section
  aiSection: {
    marginHorizontal: Spacing.xl, marginBottom: Spacing.lg,
  },
  aiHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  aiTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  aiTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: theme.textPrimary },
  horizonBadge: {
    backgroundColor: theme.neuralPurpleMuted, paddingHorizontal: Spacing.md,
    paddingVertical: 4, borderRadius: BorderRadius.full,
  },
  horizonText: { fontSize: Typography.xs, color: theme.neuralPurple, fontWeight: Typography.semibold },
  disclaimerBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: theme.warningMuted, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(255, 179, 0, 0.2)',
  },
  disclaimerText: { flex: 1, fontSize: 11, color: theme.warning, lineHeight: 16 },
  // Prediction Card
  predCard: {
    backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.base, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: theme.border,
  },
  predHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  predModelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  modelDot: { width: 8, height: 8, borderRadius: 4 },
  predModelName: { fontSize: Typography.md, fontWeight: Typography.bold, color: theme.textPrimary },
  directionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.full,
  },
  directionText: { fontSize: Typography.sm, fontWeight: Typography.bold },
  predReasoning: { backgroundColor: theme.backgroundTertiary, borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.md },
  predReasoningTitle: { fontSize: 10, fontWeight: Typography.bold, color: theme.textMuted, marginBottom: 2, textTransform: 'uppercase' },
  predReasoningText: { fontSize: Typography.xs, color: theme.textSecondary, lineHeight: 16 },
  predBody: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  predMetric: { alignItems: 'center', flex: 1 },
  predMetricLabel: { fontSize: Typography.xs, color: theme.textMuted, marginBottom: 4 },
  predMetricValue: { fontSize: Typography.base, color: theme.textPrimary, fontWeight: Typography.bold },
  confidenceBar: {
    width: 60, height: 4, borderRadius: 2,
    backgroundColor: theme.backgroundTertiary, marginBottom: 4,
  },
  confidenceFill: { height: '100%', borderRadius: 2 },
  confidenceValue: { fontSize: Typography.base, color: theme.textPrimary, fontWeight: Typography.bold },
  factorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  factorChip: {
    backgroundColor: theme.glassLight, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: BorderRadius.sm,
  },
  factorText: { fontSize: 10, color: theme.textSecondary },
  // News
  newsSection: { marginHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  newsSectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: theme.textPrimary, marginBottom: Spacing.md },
  newsItem: {
    backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.base, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: theme.border,
  },
  newsContent: {},
  newsTitle: { fontSize: Typography.base, color: theme.textPrimary, fontWeight: Typography.medium, lineHeight: 20 },
  newsFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  newsSource: { fontSize: Typography.xs, color: theme.textMuted },
  newsSentiment: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  newsSentimentText: { fontSize: 10, fontWeight: Typography.semibold, textTransform: 'capitalize' },
  // Analysis New Sections
  sectionContainer: { marginHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: theme.textPrimary, marginBottom: Spacing.md },
  aboutSection: { marginHorizontal: Spacing.xl, marginBottom: Spacing.lg, backgroundColor: theme.surface, padding: Spacing.base, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: theme.border },
  aboutContainer: { marginBottom: Spacing.sm },
  aboutSubTitle: { fontSize: Typography.xs, color: theme.textMuted, fontWeight: Typography.bold, textTransform: 'uppercase', marginBottom: 4 },
  aboutText: { fontSize: Typography.sm, color: theme.textSecondary, lineHeight: 22 },
  readMoreBtn: { marginTop: Spacing.xs, alignSelf: 'flex-start' },
  readMoreText: { fontSize: Typography.xs, color: theme.primary, fontWeight: Typography.bold },
  
  prosConsContainer: { flexDirection: 'row', backgroundColor: theme.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' },
  proConColumn: { flex: 1, paddingBottom: Spacing.md },
  proConHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, padding: Spacing.sm, marginBottom: Spacing.sm },
  proConHeaderText: { fontSize: Typography.sm, fontWeight: Typography.bold },
  proConItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingHorizontal: Spacing.sm, marginBottom: Spacing.xs },
  proConText: { fontSize: Typography.xs, color: theme.textSecondary, flex: 1, lineHeight: 18 },
  proConDivider: { width: 1, backgroundColor: theme.border },
  
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  insightTag: { fontSize: 10, fontWeight: Typography.bold, color: theme.primary, backgroundColor: theme.primaryMuted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tableContainer: { backgroundColor: theme.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', padding: Spacing.md, backgroundColor: theme.backgroundTertiary, borderBottomWidth: 1, borderBottomColor: theme.border },
  tableCellHeader: { fontSize: Typography.xs, color: theme.textMuted, fontWeight: Typography.semibold },
  tableRow: { flexDirection: 'row', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: theme.borderLight, alignItems: 'center' },
  tableCell: { fontSize: Typography.sm, color: theme.textPrimary },
  peerName: { fontSize: Typography.sm, color: theme.textPrimary, fontWeight: Typography.semibold },
  peerTicker: { fontSize: Typography.xs, color: theme.textMuted, marginTop: 2 },
  visualBarContainer: { width: '80%', height: 4, backgroundColor: theme.backgroundTertiary, borderRadius: 2, marginTop: 4, overflow: 'hidden' },
  visualBar: { height: '100%', borderRadius: 2 },
  comparisonReasoning: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, backgroundColor: theme.glassLight, borderRadius: BorderRadius.md, marginTop: Spacing.md, borderWidth: 1, borderColor: theme.borderLight },
  reasoningText: { flex: 1, fontSize: 12, color: theme.textSecondary, fontStyle: 'italic', lineHeight: 18 },
  
  shareholdingCard: { backgroundColor: theme.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: theme.border, padding: Spacing.md },
  shareBarContainer: { height: 12, flexDirection: 'row', borderRadius: BorderRadius.full, overflow: 'hidden', marginBottom: Spacing.lg },
  shareBarSegment: { height: '100%' },
  shareLegends: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  shareLegendItem: { width: '45%', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  shareLegendDot: { width: 12, height: 12, borderRadius: 6 },
  shareLegendLabel: { fontSize: Typography.xs, color: theme.textMuted },
  shareLegendValue: { fontSize: Typography.sm, color: theme.textPrimary, fontWeight: Typography.bold },
  // Footer
  footerDisclaimer: {
    fontSize: 10, color: theme.textMuted, textAlign: 'center',
    paddingHorizontal: Spacing.xl, marginTop: Spacing.md,
  },
});
