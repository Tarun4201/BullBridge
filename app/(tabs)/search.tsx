/**
 * Bull Bridge — Search Screen
 * Auto-suggest search with trending & recent stocks
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../theme/ThemeProvider';
import { ThemeColors } from '../../constants/colors';
import { useStockStore } from '../../stores/stockStore';
import { StockAPI } from '../../services/api';
import { Stock } from '../../types';

export default function SearchScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { searchQuery, setSearchQuery, searchResults, searchStocks, isLoadingSearch, recentSearches, addRecentSearch } = useStockStore();
  const [trendingStocks, setTrendingStocks] = useState<Stock[]>([]);

  useEffect(() => {
    StockAPI.getAll().then(setTrendingStocks);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchStocks(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStockPress = (ticker: string) => {
    addRecentSearch(ticker);
    router.push(`/stock/${ticker}`);
  };

  const renderStockItem = ({ item, index }: { item: Stock, index?: number }) => {
    const isPositive = item.change >= 0;
    return (
      <Animated.View 
        entering={FadeInDown.delay((index || 0) * 50).springify()}
        layout={Layout.springify()}
      >
        <TouchableOpacity
          style={styles.stockItem}
          onPress={() => handleStockPress(item.ticker)}
          activeOpacity={0.7}
        >
          <View style={styles.stockIcon}>
            <Text style={styles.stockIconText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.stockInfo}>
            <Text style={styles.stockName}>{item.name}</Text>
            <Text style={styles.stockTicker}>{item.ticker.replace('.NS', '')} · {item.exchange}</Text>
          </View>
          <View style={styles.stockPriceCol}>
            <Text style={styles.stockPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
            <Text style={[styles.stockChange, { color: isPositive ? theme.bullish : theme.bearish }]}>
              {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <Animated.View style={styles.searchHeader} layout={Layout.springify()}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={theme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search NSE/BSE stocks..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {isLoadingSearch && (
        <ActivityIndicator style={styles.loader} color={theme.primary} />
      )}

      {/* Search Results */}
      {searchQuery.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderStockItem}
          keyExtractor={(item) => item.ticker}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !isLoadingSearch ? (
              <Animated.View entering={FadeInDown} style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={theme.textMuted} />
                <Text style={styles.emptyText}>No stocks found for "{searchQuery}"</Text>
              </Animated.View>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={[{ type: 'recent' }, { type: 'trending' }, ...trendingStocks.map(s => ({ type: 'stock', ...s }))]}
          keyExtractor={(item: any, i) => item.type + i}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }: { item: any, index: number }) => {
            if (item.type === 'recent') {
              return (
                <Animated.View entering={FadeInDown.delay(index * 50)} style={styles.section} layout={Layout.springify()}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <View style={styles.recentChips}>
                    {recentSearches.map((ticker) => (
                      <TouchableOpacity
                        key={ticker}
                        style={styles.recentChip}
                        onPress={() => handleStockPress(ticker)}
                      >
                        <Ionicons name="time-outline" size={14} color={theme.textMuted} />
                        <Text style={styles.recentChipText}>{ticker.replace('.NS', '')}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Animated.View>
              );
            }
            if (item.type === 'trending') {
              return (
                <Animated.View entering={FadeInDown.delay(index * 50)} style={styles.section} layout={Layout.springify()}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Trending Stocks</Text>
                    <Ionicons name="trending-up" size={18} color={theme.primary} />
                  </View>
                </Animated.View>
              );
            }
            return renderStockItem({ item: item as Stock, index });
          }}
        />
      )}
    </View>
  );
}

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  searchHeader: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.base },
  searchInputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base, height: 52,
    borderWidth: 1, borderColor: theme.glassBorder,
  },
  searchInput: { flex: 1, color: theme.textPrimary, fontSize: Typography.md },
  loader: { marginTop: Spacing.lg },
  listContent: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: theme.textPrimary, marginBottom: Spacing.sm },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  recentChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  recentChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.surface, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: theme.border,
  },
  recentChipText: { fontSize: Typography.sm, color: theme.textSecondary },
  stockItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: theme.borderLight,
  },
  stockIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.primaryMuted, alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.md,
  },
  stockIconText: { fontSize: Typography.md, fontWeight: Typography.bold, color: theme.primary },
  stockInfo: { flex: 1 },
  stockName: { fontSize: Typography.base, color: theme.textPrimary, fontWeight: Typography.medium },
  stockTicker: { fontSize: Typography.xs, color: theme.textMuted, marginTop: 2 },
  stockPriceCol: { alignItems: 'flex-end' },
  stockPrice: { fontSize: Typography.base, color: theme.textPrimary, fontWeight: Typography.semibold },
  stockChange: { fontSize: Typography.xs, fontWeight: Typography.semibold, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  emptyText: { fontSize: Typography.base, color: theme.textMuted },
});
