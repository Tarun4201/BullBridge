/**
 * Bull Bridge — Home Dashboard
 * Central hub: market indices, news, trending stocks, AI predictions
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Dimensions, Image, Platform
} from 'react-native';
import Animated, { 
  useSharedValue, useAnimatedStyle, withRepeat, 
  withTiming, Easing, FadeInDown 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemeColors, getGradients } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useStockStore } from '../../stores/stockStore';
import { useAuthStore } from '../../stores/authStore';
import { MarketIndex, StockQuote, TrendTab } from '../../types';
import { NewsCarousel } from '../../components/ui/NewsCarousel';
import { TradingViewWidget } from '../../components/charts/TradingViewWidget';
import { SimpleLineChart } from '../../components/charts/SimpleLineChart';
import { PressableScale } from '../../components/ui/PressableScale';

const { width } = Dimensions.get('window');

// ─── Memoized Sub-components ──────────────────

const MarketIndexChip = React.memo(({ index }: { index: MarketIndex }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const isPositive = index.change >= 0;

  return (
    <PressableScale 
      style={[styles.indexChip, isPositive ? styles.indexChipBull : styles.indexChipBear]}
      onPress={() => router.push(`/stock/${index.ticker}`)}
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
    </PressableScale>
  );
});

const StockRow = React.memo(({ stock, index, theme, styles }: { stock: StockQuote; index: number; theme: ThemeColors; styles: any }) => {
  const price = typeof stock.price === 'number' ? stock.price : 0;
  const changePercent = typeof stock.changePercent === 'number' ? stock.changePercent : 0;
  const isPositive = changePercent >= 0;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <PressableScale
        style={styles.stockRow}
        onPress={() => stock.ticker && router.push(`/stock/${stock.ticker}`)}
      >
        <View style={styles.stockRank}>
          <Image 
            source={{ uri: `https://ui-avatars.com/api/?name=${(stock.ticker || 'BB').replace('.NS', '')}&background=random&color=fff&size=128&bold=true` }}
            style={{ width: 32, height: 32, borderRadius: 8 }}
          />
        </View>
        <View style={styles.stockInfo}>
          <Text style={styles.stockName} numberOfLines={1}>{stock.name || 'Unknown'}</Text>
          <Text style={styles.stockTicker}>{(stock.ticker || '').replace('.NS', '')}</Text>
        </View>
        <View style={styles.stockPriceCol}>
          <Text style={styles.stockPrice}>₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          <View style={[styles.changeChip, { backgroundColor: isPositive ? theme.bullishMuted : theme.bearishMuted }]}>
            <Ionicons name={isPositive ? 'caret-up' : 'caret-down'} size={10} color={isPositive ? theme.bullish : theme.bearish} />
            <Text style={[styles.changeText, { color: isPositive ? theme.bullish : theme.bearish }]}>
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </Text>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
});

const MARKET_BASICS = [
  { title: 'NIFTY 50', description: 'Tracks the 50 largest companies on the NSE.', icon: 'pulse-outline', color: '#00D4FF' },
  { title: 'SENSEX', description: 'Tracks 30 established companies on the BSE.', icon: 'trending-up-outline', color: '#FF9100' },
  { title: 'NIFTY BANK', description: 'Tracks the 12 most liquid banking stocks.', icon: 'business-outline', color: '#00E676' },
  { title: 'MA (20)', description: 'Moving Average of the last 20 days.', icon: 'stats-chart-outline', color: '#F43F5E' },
  { title: 'RSI Indicator', description: 'Relative Strength Index. Above 70 is overbought.', icon: 'speedometer-outline', color: '#8B5CF6' },
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
  const [selectedChartIndex, setSelectedChartIndex] = useState<'NIFTY' | 'BANK'>('NIFTY');

  const marqueeOffset = useSharedValue(0);

  useEffect(() => {
    // Exact cycle width: (Chip 140px + Margin 12px) * 3 indices = 456px
    // Using exactly -456 ensures an invisible seam for infinite scrolling.
    marqueeOffset.value = withRepeat(
      withTiming(-456, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const marqueeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: marqueeOffset.value }],
    flexDirection: 'row',
  }));

  useEffect(() => {
    loadMarketData().then(() => setLastUpdated(new Date()));
    const interval = setInterval(() => {
       loadMarketData().then(() => setLastUpdated(new Date()));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMarketData();
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  const trendData = useMemo(() => ({
    gainers: topGainers,
    losers: topLosers,
    active: mostActive,
  }), [topGainers, topLosers, mostActive]);

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
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => router.push('/(tabs)/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.textPrimary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <PressableScale
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/search')}
        >
          <Ionicons name="search" size={20} color={theme.textMuted} />
          <Text style={styles.searchPlaceholder}>Search NSE/BSE stocks...</Text>
        </PressableScale>

        {/* Market Snapshot Bar (Animated Marquee) */}
        <View style={styles.indexMarqueeContainer}>
          <Animated.View style={[marqueeStyle, { flexWrap: 'nowrap' }]}>
            {(indices.length > 0 ? [...indices, ...indices, ...indices, ...indices] : []).map((index, i) => (
              <MarketIndexChip key={`${index.ticker}-${i}`} index={index} />
            ))}
          </Animated.View>
        </View>

        {/* Market Performance Chart */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Market Performance</Text>
            <Text style={styles.sectionSubtitle}>{selectedChartIndex === 'NIFTY' ? 'NIFTY 50' : 'BANK NIFTY'}</Text>
          </View>
          <View style={styles.chartToggle}>
            <TouchableOpacity 
              style={[styles.toggleBtn, selectedChartIndex === 'NIFTY' && styles.toggleBtnActive]}
              onPress={() => setSelectedChartIndex('NIFTY')}
            >
              <Text style={[styles.toggleText, selectedChartIndex === 'NIFTY' && styles.toggleTextActive]}>NIFTY</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, selectedChartIndex === 'BANK' && styles.toggleBtnActive]}
              onPress={() => setSelectedChartIndex('BANK')}
            >
              <Text style={[styles.toggleText, selectedChartIndex === 'BANK' && styles.toggleTextActive]}>BANK</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.chartContainer}>
           <SimpleLineChart 
            ticker={selectedChartIndex === 'NIFTY' ? '^NSEI' : '^NSEBANK'} 
            height={250} 
          />
        </View>

        {/* Latest News */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest News</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <NewsCarousel data={news} />

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
            <PressableScale
              key={tab}
              style={[styles.trendTab, activeTrendTab === tab && styles.trendTabActive]}
              onPress={() => setTrendTab(tab)}
            >
              <Text style={[styles.trendTabText, activeTrendTab === tab && styles.trendTabTextActive]}>
                {tab === 'gainers' ? '🚀 Gainers' : tab === 'losers' ? '📉 Losers' : '🔥 Active'}
              </Text>
            </PressableScale>
          ))}
        </View>
        <View style={styles.trendList}>
          {trendData[activeTrendTab].length > 0 ? (
            trendData[activeTrendTab].map((stock, i) => (
              <StockRow key={`${stock.ticker}-${i}`} stock={stock} index={i} theme={theme} styles={styles} />
            ))
          ) : (
            <View style={{ paddingVertical: Spacing.xl, alignItems: 'center' }}>
              <Ionicons name="search-outline" size={32} color={theme.textMuted} />
              <Text style={{ color: theme.textMuted, marginTop: Spacing.sm, fontSize: Typography.sm }}>
                No {activeTrendTab} movers found right now
              </Text>
            </View>
          )}
        </View>

        {/* Market Basics */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Market Basics</Text>
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
              3 AI models analyzing 200+ NSE stocks — LSTM, XGBoost & Ensemble.
            </Text>
            <View style={styles.aiModelRow}>
              {['LSTM', 'XGBoost', 'Ensemble'].map((model) => (
                <View key={model} style={styles.aiModelChip}>
                  <View style={[styles.aiModelDot, { backgroundColor: model === 'LSTM' ? theme.primary : model === 'XGBoost' ? theme.bullish : theme.neuralPurple }]} />
                  <Text style={styles.aiModelChipText}>{model}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.dataSourceFooter}>
          Data sourced from Yahoo Finance. 15-20 min delay.
        </Text>
      </ScrollView>
    </View>
  );
}

function getStyles(theme: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingBottom: 100 },
    header: {
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      paddingHorizontal: Spacing.xl, 
      paddingTop: Platform.OS === 'ios' ? 60 : 50, // Handling top notch properly
      paddingBottom: Spacing.base,
    },
    greeting: { fontSize: Typography.sm, color: theme.textSecondary },
    headerTitle: { fontSize: Typography['3xl'], fontWeight: Typography.extrabold, color: theme.textPrimary },
    headerIcon: { position: 'relative', padding: Spacing.sm },
    notificationBadge: {
      position: 'absolute', top: 8, right: 8, width: 8, height: 8,
      borderRadius: 4, backgroundColor: theme.bearish,
    },
    searchBar: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
      marginHorizontal: Spacing.xl, marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.base, height: 48,
      borderWidth: 1, borderColor: theme.border,
    },
    searchPlaceholder: { color: theme.textMuted, fontSize: Typography.base },
    indexChip: {
      backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
      padding: Spacing.base, marginRight: Spacing.md, width: 140,
      borderWidth: 1,
    },
    indexChipBull: { borderColor: theme.bullishMuted },
    indexChipBear: { borderColor: theme.bearishMuted },
    indexMarqueeContainer: { 
      overflow: 'hidden', 
      paddingLeft: Spacing.xl, 
      marginBottom: Spacing.md, // Reduced margin slightly, but container is deeper
      height: 95, // Deepened to prevent clipping of index chips
    },
    indexName: { fontSize: Typography.xs, color: theme.textSecondary, fontWeight: Typography.medium },
    indexValue: { fontSize: Typography.lg, fontWeight: Typography.bold, color: theme.textPrimary, marginTop: 2 },
    indexChangeRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
    indexChange: { fontSize: Typography.sm, fontWeight: Typography.semibold },
    chartContainer: { 
      marginHorizontal: Spacing.xl, height: 200, borderRadius: BorderRadius.lg, 
      overflow: 'hidden', marginBottom: Spacing.lg, borderWidth: 1, borderColor: theme.border 
    },
    sectionHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: Spacing.xl, marginBottom: Spacing.md, marginTop: Spacing.sm,
    },
    sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: theme.textPrimary },
    sectionSubtitle: { fontSize: Typography.xs, color: theme.textMuted, marginTop: 2 },
    chartToggle: { flexDirection: 'row', backgroundColor: theme.backgroundTertiary, borderRadius: BorderRadius.md, padding: 2 },
    toggleBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.sm },
    toggleBtnActive: { backgroundColor: theme.surface, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
    toggleText: { fontSize: 10, fontWeight: 'bold', color: theme.textMuted },
    toggleTextActive: { color: theme.primary },
    seeAll: { fontSize: Typography.sm, color: theme.primary, fontWeight: Typography.semibold },
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
    stockRow: {
      flexDirection: 'row', alignItems: 'center',
      padding: Spacing.md, backgroundColor: theme.surface,
      borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: theme.border,
      marginBottom: Spacing.sm,
    },
    stockRank: { marginRight: Spacing.md },
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
    aiPreviewCard: {
      marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl,
      overflow: 'hidden', borderWidth: 1, borderColor: theme.glassBorder,
      marginBottom: Spacing.lg,
    },
    aiPreviewGradient: { padding: Spacing.lg },
    aiPreviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
    aiPreviewTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: theme.textPrimary },
    aiPreviewDescription: { fontSize: Typography.sm, color: theme.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
    aiModelRow: { flexDirection: 'row', gap: Spacing.sm },
    aiModelChip: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: theme.surface, paddingHorizontal: 10, paddingVertical: 6,
      borderRadius: BorderRadius.sm,
    },
    aiModelDot: { width: 6, height: 6, borderRadius: 3 },
    aiModelChipText: { fontSize: Typography.xs, color: theme.textSecondary, fontWeight: Typography.semibold },
    dataSourceFooter: {
      fontSize: 10, color: theme.textMuted, textAlign: 'center',
      paddingHorizontal: Spacing.xl, marginTop: Spacing.md,
    },
  });
}
