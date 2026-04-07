/**
 * Bull Bridge — Notifications Screen
 * In-app notification list with types: AI signals, price alerts, news, market status
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Notification, NotificationType } from '../../types';

function getNotificationConfig(theme: ThemeColors): Record<NotificationType, { icon: string; color: string }> {
  return {
  ai_signal: { icon: 'sparkles', color: theme.neuralPurple },
  price_alert: { icon: 'alert-circle', color: theme.warning },
  percent_move: { icon: 'trending-up', color: theme.bullish },
  earnings: { icon: 'calendar', color: theme.info },
  market_status: { icon: 'time', color: theme.primary },
  breaking_news: { icon: 'newspaper', color: theme.bearish },
  };
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [notifs, setNotifs] = useState<Notification[]>([]);

  const markAsRead = (id: string) => {
    setNotifs(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const config = getNotificationConfig(theme)[item.type];
    const time = new Date(item.timestamp);
    const now = new Date();
    const diffHrs = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    const timeStr = diffHrs < 1 ? 'Just now' : diffHrs < 24 ? `${diffHrs}h ago` : `${Math.floor(diffHrs / 24)}d ago`;

    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.read && styles.notifUnread]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
          <Ionicons name={config.icon as any} size={20} color={config.color} />
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.notifTime}>{timeStr}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.subtitle}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifs}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.textMuted} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

function getStyles(theme: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
      paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.lg,
    },
    title: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: theme.textPrimary },
    subtitle: { fontSize: Typography.sm, color: theme.textSecondary, marginTop: 2 },
    markAllButton: {
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full, backgroundColor: theme.primaryMuted,
    },
    markAllText: { fontSize: Typography.sm, color: theme.primary, fontWeight: Typography.semibold },
    listContent: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
    notifCard: {
      flexDirection: 'row', alignItems: 'flex-start',
      backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
      padding: Spacing.base, borderWidth: 1, borderColor: theme.border,
    },
    notifUnread: { borderColor: theme.glassBorder, backgroundColor: theme.backgroundTertiary },
    iconContainer: {
      width: 40, height: 40, borderRadius: 20,
      alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
    },
    notifContent: { flex: 1 },
    notifHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    notifTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: theme.textPrimary, flex: 1 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary },
    notifMessage: { fontSize: Typography.sm, color: theme.textSecondary, lineHeight: 18, marginTop: 4 },
    notifTime: { fontSize: Typography.xs, color: theme.textMuted, marginTop: 6 },
    emptyState: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
    emptyText: { fontSize: Typography.base, color: theme.textMuted },
  });
}
