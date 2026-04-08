/**
 * Bull Bridge — Notifications Screen
 * Minimal, standard notification list.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { ThemeColors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [notifications] = useState([
    { id: '1', title: 'Welcome to BullBridge', message: 'Start exploring real-time Indian market data & AI insights.', time: '1d ago' },
    { id: '2', title: 'Market Update', message: 'NIFTY 50 reached a new milestone today.', time: '2d ago' },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.content}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMessage}>{item.message}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: theme.textMuted }}>No new notifications</Text>
          </View>
        }
      />
    </View>
  );
}

function getStyles(theme: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.lg },
    title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: theme.textPrimary },
    list: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },
    card: { 
      flexDirection: 'row', padding: Spacing.base, backgroundColor: theme.surface, 
      borderRadius: BorderRadius.lg, marginBottom: Spacing.base, borderWidth: 1, borderColor: theme.border 
    },
    iconCircle: { 
      width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primaryMuted, 
      alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md 
    },
    content: { flex: 1 },
    cardTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: theme.textPrimary },
    cardMessage: { fontSize: Typography.sm, color: theme.textSecondary, marginTop: 4 },
    cardTime: { fontSize: Typography.xs, color: theme.textMuted, marginTop: 4 },
    empty: { alignItems: 'center', marginTop: 100 },
  });
}
