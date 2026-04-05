/**
 * Bull Bridge — Home Dashboard
 * Central hub: market indices, news, trending stocks, AI predictions
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Dimensions, TextInput, Image
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemeColors, getGradients } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { useStockStore } from '../../stores/stockStore';
import { useAuthStore } from '../../stores/authStore';
import { MarketIndex, StockQuote, NewsArticle, TrendTab } from '../../types';

const { width } = Dimensions.get('window');

const MARKET_BASICS = [
  {
    title: 'NIFTY 50',
    description: 'Tracks the 50 largest companies on the NSE. Think of it as the "heartbeat" of the Indian stock market.',
    icon: 'pulse-outline',
    color: '#00D4FF',
  },
  {
    title: 'SENSEX',
    description: 'Tracks 30 established companies on the BSE. It is the oldest index and reflects long-term market trends.',
    icon: 'trending-up-outline',
    color: '#FF9100',
  },
  {
    title: 'NIFTY BANK',
    description: 'Tracks the 12 most liquid banking stocks. It shows how the financial sector is performing.',
    icon: 'business-outline',
    color: '#00E676',
  },
  {
    title: 'MA (20)',
    description: 'Moving Average of the last 20 days. If the price is above this, the short-term trend is usually "Up".',
    icon: 'stats-chart-outline',
    color: '#F43F5E',
  },
  {
    title: 'RSI Indicator',
    description: 'Relative Strength Index. Above 70 means "Overbought" (too hot), below 30 means "Oversold" (too cold).',
    icon: 'speedometer-outline',
    color: '#8B5CF6',
  },
  {
    title: 'Market Sentiment',
    description: 'The overall mood of investors. "Bullish" means people are buying, "Bearish" means people are fearful.',
    icon: 'happy-outline',
    color: '#EC4899',
  },
  {
    title: 'What is an Index?',
    description: 'A statistical measure that tracks a group of stocks to help you understand market moves at a glance.',
    icon: 'help-circle-outline',
    color: '#6366F1',
  },
];

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const Gradients = getGradients(theme);
  const { user } = useAuthStore();
  const {
    indices, topGainers, topLosers, mostActive, news,
    activeTrendTab, setTrendTab, loadMarketData, isLoadingMarket,
  } = useStockStore();
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    await loadMarketData();
    setLastUpdated(new Date());
  };

  // Marquee Animation for Indices
  const marqueeOffset = useSharedValue(0);

  useEffect(() => {
    // 3 items * roughly 156 width each = ~468px to scroll for one full loop
    marqueeOffset.value = withRepeat(
      withTiming(-468, { duration: 15000, easing: Easing.linear }),
      -1, // infinite loop
      false // do not reverse
    );
  }, []);

  const marqueeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: marqueeOffset.value }],
    flexDirection: 'row',
  }));

  useEffect(() => {
    fetchData();
    // Auto-poll every 60 seconds for live market data
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const trendData: Record<TrendTab, StockQuote[]> = {
    gainers: topGainers,
    losers: topLosers,
    active: mostActive,
  };

  const lastUpdatedLabel = lastUpdated
    ? `Live · ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    : 'Loading…';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.headerTitle}>{user?.name || 'Trader'}!</Text>
          </View>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={24} color={theme.textPrimary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/search')}
        >
          <Ionicons name="search" size={20} color={theme.textMuted} />
          <Text style={styles.searchPlaceholder}>Search NSE/BSE stocks...</Text>
        </TouchableOpacity>

        {/* Market Snapshot Bar (Animated Marquee) */}
        <View style={{ overflow: 'hidden', paddingLeft: Spacing.xl, marginBottom: Spacing.lg }}>
          <Animated.View style={marqueeStyle}>
            {/* Duplicated thrice to ensure smooth seamless looping without white space */}
            {[...indices, ...indices, ...indices, ...indices].map((index, i) => (
              <MarketIndexChip key={`${index.ticker}-${i}`} index={index} />
            ))}
          </Animated.View>
        </View>

        {/* Latest News */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest News</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.newsRow}>
          {news.slice(0, 6).map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </ScrollView>

        {/* Market Trends Tabs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Market Trends</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.bullish }} />
            <Text style={[styles.seeAll, { color: theme.bullish, fontSize: 11 }]}>{lastUpdatedLabel}</Text>
          </View>
        </View>
        <View style={styles.trendTabs}>
          {(['gainers', 'losers', 'active'] as TrendTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.trendTab, activeTrendTab === tab && styles.trendTabActive]}
              onPress={() => setTrendTab(tab)}
            >
              <Text style={[styles.trendTabText, activeTrendTab === tab && styles.trendTabTextActive]}>
                {tab === 'gainers' ? '🚀 Gainers' : tab === 'losers' ? '📉 Losers' : '🔥 Active'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.trendList}>
          {trendData[activeTrendTab].map((stock, i) => (
            <StockRow key={stock.ticker} stock={stock} index={i} />
          ))}
        </View>

        {/* Market Basics (Beginner Guide) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Market Basics</Text>
          <View style={styles.beginnerBadge}>
            <Ionicons name="school" size={12} color={theme.primary} />
            <Text style={styles.beginnerBadgeText}>Beginner Guide</Text>
          </View>
        </View>
        <View style={styles.basicsContainer}>
          {MARKET_BASICS.map((item) => (
            <View key={item.title} style={styles.basicsCard}>
              <View style={[styles.basicsIconContainer, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <View style={styles.basicsInfo}>
                <Text style={styles.basicsTitle}>{item.title}</Text>
                <Text style={styles.basicsDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* AI Predictions Preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Predictions</Text>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={12} color={theme.neuralPurple} />
            <Text style={styles.aiBadgeText}>AI-Powered</Text>
          </View>
        </View>
        <View style={styles.aiPreviewCard}>
          <LinearGradient
            colors={[theme.neuralPurpleMuted, theme.primaryMuted]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiPreviewGradient}
          >
            <View style={styles.aiPreviewHeader}>
              <Ionicons name="analytics" size={24} color={theme.neuralPurple} />
              <Text style={styles.aiPreviewTitle}>Today's AI Insights</Text>
            </View>
            <Text style={styles.aiPreviewDescription}>
              3 AI models analyzing 200+ NSE stocks — LSTM, XGBoost & Ensemble predictions updated daily.
            </Text>
            <View style={styles.aiModelRow}>
              {['LSTM', 'XGBoost', 'Ensemble'].map((model) => (
                <View key={model} style={styles.aiModelChip}>
                  <View style={[styles.aiModelDot, { backgroundColor: model === 'LSTM' ? theme.primary : model === 'XGBoost' ? theme.bullish : theme.neuralPurple }]} />
                  <Text style={styles.aiModelChipText}>{model}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.disclaimerFooter}>
              AI predictions are for educational purposes only.
            </Text>
          </LinearGradient>
        </View>

        {/* Data Source Footer */}
        <Text style={styles.dataSourceFooter}>
          Data sourced from Yahoo Finance. 15-20 minute delay during market hours.
        </Text>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────

function MarketIndexChip({ index }: { index: MarketIndex }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const isPositive = index.change >= 0;

  const handlePress = () => {
    // Pass the raw ticker to the detail page so the store can fetch proper Yahoo Finance data.
    // TradingView widget internally converts ^NSEI -> NSE:NIFTY.
    router.push(`/stock/${index.ticker}`);
  };

  return (
    <TouchableOpacity 
      style={[styles.indexChip, isPositive ? styles.indexChipBull : styles.indexChipBear]}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <Text style={styles.indexName}>{index.name}</Text>
      <Text style={styles.indexValue}>{index.value.toLocaleString('en-IN')}</Text>
      <View style={styles.indexChangeRow}>
        <Ionicons
          name={isPositive ? 'caret-up' : 'caret-down'}
          size={12}
          color={isPositive ? theme.bullish : theme.bearish}
        />
        <Text style={[styles.indexChange, { color: isPositive ? theme.bullish : theme.bearish }]}>
          {isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const sentimentColor = article.sentiment === 'positive' ? theme.bullish : article.sentiment === 'negative' ? theme.bearish : theme.textMuted;
  return (
    <TouchableOpacity style={styles.newsCard} activeOpacity={0.8}>
      <View style={[styles.sentimentTag, { backgroundColor: `${sentimentColor}20` }]}>
        <Text style={[styles.sentimentText, { color: sentimentColor }]}>
          {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
        </Text>
      </View>
      <Text style={styles.newsTitle} numberOfLines={3}>{article.title}</Text>
      <View style={styles.newsFooter}>
        <Text style={styles.newsSource}>{article.source}</Text>
        <Text style={styles.newsTime}>
          {new Date(article.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function StockRow({ stock, index }: { stock: StockQuote; index: number }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const isPositive = stock.change >= 0;
  return (
    <TouchableOpacity
      style={styles.stockRow}
      activeOpacity={0.7}
      onPress={() => router.push(`/stock/${stock.ticker}`)}
    >
      <View style={styles.stockRank}>
        <Image 
          source={{ uri: `https://ui-avatars.com/api/?name=${stock.ticker.replace('.NS', '')}&background=random&color=fff&size=128&bold=true` }}
          style={{ width: 32, height: 32, borderRadius: 8 }}
        />
      </View>
      <View style={styles.stockInfo}>
        <Text style={styles.stockName}>{stock.name}</Text>
        <Text style={styles.stockTicker}>{stock.ticker.replace('.NS', '')}</Text>
      </View>
      <View style={styles.stockPriceCol}>
        <Text style={styles.stockPrice}>₹{stock.price.toLocaleString('en-IN')}</Text>
        <View style={[styles.changeChip, { backgroundColor: isPositive ? theme.bullishMuted : theme.bearishMuted }]}>
          <Ionicons name={isPositive ? 'caret-up' : 'caret-down'} size={10} color={isPositive ? theme.bullish : theme.bearish} />
          <Text style={[styles.changeText, { color: isPositive ? theme.bullish : theme.bearish }]}>
            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.base,
  },
  greeting: { fontSize: Typography.sm, color: theme.textSecondary },
  headerTitle: { fontSize: Typography['3xl'], fontWeight: Typography.extrabold, color: theme.textPrimary },
  headerIcon: { position: 'relative', padding: Spacing.sm },
  notificationBadge: {
    position: 'absolute', top: 8, right: 8, width: 8, height: 8,
    borderRadius: 4, backgroundColor: theme.bearish,
  },
  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xl, marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.base, height: 48,
    borderWidth: 1, borderColor: theme.border,
  },
  searchPlaceholder: { color: theme.textMuted, fontSize: Typography.base },
  // Indices
  indexChip: {
    backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.base, marginRight: Spacing.md, width: 140,
    borderWidth: 1,
  },
  indexChipBull: { borderColor: theme.bullishMuted },
  indexChipBear: { borderColor: theme.bearishMuted },
  indexName: { fontSize: Typography.xs, color: theme.textSecondary, fontWeight: Typography.medium },
  indexValue: { fontSize: Typography.lg, fontWeight: Typography.bold, color: theme.textPrimary, marginTop: 2 },
  indexChangeRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  indexChange: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  // Section headers
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.md, marginTop: Spacing.sm,
  },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: theme.textPrimary },
  seeAll: { fontSize: Typography.sm, color: theme.primary, fontWeight: Typography.semibold },
  // News
  newsRow: { paddingLeft: Spacing.xl, marginBottom: Spacing.lg },
  newsCard: {
    backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.base, marginRight: Spacing.md, width: width * 0.7,
    borderWidth: 1, borderColor: theme.border, justifyContent: 'space-between',
    minHeight: 140,
  },
  sentimentTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
  sentimentText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  newsTitle: { fontSize: Typography.base, color: theme.textPrimary, fontWeight: Typography.medium, lineHeight: 20 },
  newsFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
  newsSource: { fontSize: Typography.xs, color: theme.textMuted },
  newsTime: { fontSize: Typography.xs, color: theme.textMuted },
  // Trends
  trendTabs: {
    flexDirection: 'row', marginHorizontal: Spacing.xl, gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  trendTab: {
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border,
  },
  trendTabActive: { backgroundColor: theme.primaryMuted, borderColor: theme.primary },
  trendTabText: { fontSize: Typography.sm, color: theme.textSecondary, fontWeight: Typography.medium },
  trendTabTextActive: { color: theme.primary },
  trendList: { paddingHorizontal: Spacing.xl, gap: 2 },
  // Stock row
  stockRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: theme.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: theme.border,
    marginBottom: Spacing.sm,
  },
  stockRank: {
    marginRight: Spacing.md,
  },
  stockInfo: { flex: 1 },
  stockName: { fontSize: Typography.base, color: theme.textPrimary, fontWeight: Typography.medium },
  stockTicker: { fontSize: Typography.xs, color: theme.textMuted, marginTop: 2 },
  stockPriceCol: { alignItems: 'flex-end' },
  stockPrice: { fontSize: Typography.base, color: theme.textPrimary, fontWeight: Typography.semibold },
  changeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4,
  },
  changeText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  // Market Basics
  beginnerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: theme.primaryMuted,
  },
  beginnerBadgeText: { fontSize: Typography.xs, color: theme.primary, fontWeight: Typography.semibold },
  basicsContainer: { paddingHorizontal: Spacing.xl, gap: Spacing.sm, marginBottom: Spacing.lg },
  basicsCard: {
    flexDirection: 'row', gap: Spacing.md, padding: Spacing.md,
    backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: theme.border,
  },
  basicsIconContainer: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  basicsInfo: { flex: 1 },
  basicsTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: theme.textPrimary, marginBottom: 2 },
  basicsDescription: { fontSize: Typography.sm, color: theme.textSecondary, lineHeight: 18 },
  // AI Preview
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: theme.neuralPurpleMuted,
  },
  aiBadgeText: { fontSize: Typography.xs, color: theme.neuralPurple, fontWeight: Typography.semibold },
  aiPreviewCard: {
    marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: theme.glassBorder,
    marginBottom: Spacing.lg,
  },
  aiPreviewGradient: { padding: Spacing.lg },
  aiPreviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  aiPreviewTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: theme.textPrimary },
  aiPreviewDescription: { fontSize: Typography.sm, color: theme.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
  aiModelRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  aiModelChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.surface, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  aiModelDot: { width: 6, height: 6, borderRadius: 3 },
  aiModelChipText: { fontSize: Typography.xs, color: theme.textSecondary, fontWeight: Typography.semibold },
  disclaimerFooter: {
    fontSize: 10, color: theme.textMuted, fontStyle: 'italic',
  },
  dataSourceFooter: {
    fontSize: 10, color: theme.textMuted, textAlign: 'center',
    paddingHorizontal: Spacing.xl, marginTop: Spacing.md,
  },
});
