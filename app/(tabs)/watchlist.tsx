/**
 * Bull Bridge — Watchlist Screen
 * User's saved stocks with live price data
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemeColors, getGradients } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useWatchlistStore } from '../../stores/watchlistStore';
import { Stock } from '../../types';

export default function WatchlistScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const Gradients = getGradients(theme);
  const { getWatchlistStocks, removeFromWatchlist, watchlistTickers } = useWatchlistStore();
  const watchlistStocks = getWatchlistStocks();

  const renderStock = ({ item }: { item: Stock }) => {
    const isPositive = item.change >= 0;
    return (
      <TouchableOpacity
        style={styles.stockCard}
        activeOpacity={0.8}
        onPress={() => router.push(`/stock/${item.ticker}`)}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.stockAvatar, { backgroundColor: isPositive ? theme.bullishMuted : theme.bearishMuted }]}>
            <Text style={[styles.avatarText, { color: isPositive ? theme.bullish : theme.bearish }]}>
              {item.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.stockInfo}>
            <Text style={styles.stockName}>{item.name}</Text>
            <Text style={styles.stockTicker}>{item.ticker.replace('.NS', '')} · {item.sector}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.price}>₹{item.price.toLocaleString('en-IN')}</Text>
          <View style={[styles.changeBadge, { backgroundColor: isPositive ? theme.bullishMuted : theme.bearishMuted }]}>
            <Ionicons
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={12}
              color={isPositive ? theme.bullish : theme.bearish}
            />
            <Text style={[styles.changeText, { color: isPositive ? theme.bullish : theme.bearish }]}>
              {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Watchlist</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{watchlistTickers.length} stocks</Text>
        </View>
      </View>

      {watchlistStocks.length > 0 ? (
        <FlatList
          data={watchlistStocks}
          renderItem={renderStock}
          keyExtractor={(item) => item.ticker}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="star-outline" size={48} color={theme.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No stocks in watchlist</Text>
          <Text style={styles.emptySubtitle}>
            Add stocks from the Search or Stock Detail page to track them here.
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/search')}
          >
            <LinearGradient
              colors={[...Gradients.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={20} color={theme.textInverse} />
              <Text style={styles.addButtonText}>Add Stocks</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footerText}>
        Data sourced from Yahoo Finance. 15-20 minute delay during market hours.
      </Text>
    </View>
  );
}

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.lg,
  },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: theme.textPrimary },
  countBadge: {
    backgroundColor: theme.primaryMuted, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs, borderRadius: BorderRadius.full,
  },
  countText: { fontSize: Typography.sm, color: theme.primary, fontWeight: Typography.semibold },
  listContent: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  stockCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.base, borderWidth: 1, borderColor: theme.border,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stockAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  avatarText: { fontSize: Typography.lg, fontWeight: Typography.bold },
  stockInfo: { flex: 1 },
  stockName: { fontSize: Typography.base, color: theme.textPrimary, fontWeight: Typography.medium },
  stockTicker: { fontSize: Typography.xs, color: theme.textMuted, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  price: { fontSize: Typography.md, color: theme.textPrimary, fontWeight: Typography.bold },
  changeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4,
  },
  changeText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing['2xl'] },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: theme.textPrimary, marginBottom: Spacing.sm },
  emptySubtitle: { fontSize: Typography.base, color: theme.textSecondary, textAlign: 'center', lineHeight: 22 },
  addButton: { marginTop: Spacing.xl },
  addButtonGradient: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  addButtonText: { color: theme.textInverse, fontSize: Typography.base, fontWeight: Typography.bold },
  footerText: {
    fontSize: 10, color: theme.textMuted, textAlign: 'center',
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg,
  },
});
