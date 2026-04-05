/**
 * Bull Bridge — Profile Screen
 * User profile, settings, data source disclosures, and logout
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemeColors, getGradients } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';

interface MenuItem {
  icon: string;
  label: string;
  color: string;
  trailing?: string;
  onPress: () => void;
}



export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = getStyles(theme);
  const Gradients = getGradients(theme);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', color: theme.primary, onPress: () => {} },
        { icon: 'shield-checkmark-outline', label: 'Security', color: theme.bullish, onPress: () => {} },
        { icon: 'notifications-outline', label: 'Notification Preferences', color: theme.warning, onPress: () => {} },
      ],
    },
    {
      title: 'App Settings',
      items: [
        { 
          icon: isDark ? 'sunny-outline' : 'moon-outline', 
          label: isDark ? 'Light Theme' : 'Dark Theme', 
          color: theme.neuralPurple, 
          trailing: isDark ? 'Off' : 'Active',
          onPress: toggleTheme 
        },
        { icon: 'language-outline', label: 'Language', color: theme.info, trailing: 'English', onPress: () => {} },
        { icon: 'analytics-outline', label: 'Default Chart Type', color: theme.primary, trailing: 'Candle', onPress: () => {} },
      ],
    },
    {
      title: 'Legal',
      items: [
        { icon: 'document-text-outline', label: 'Privacy Policy', color: theme.textSecondary, onPress: () => {} },
        { icon: 'information-circle-outline', label: 'Terms of Service', color: theme.textSecondary, onPress: () => {} },
        { icon: 'shield-outline', label: 'SEBI Disclaimer', color: theme.warning, onPress: () => {} },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* User Card */}
      <View style={styles.userCard}>
        <LinearGradient
          colors={['rgba(0, 212, 255, 0.1)', 'rgba(179, 136, 255, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userCardGradient}
        >
          <View style={styles.avatar}>
            <LinearGradient
              colors={[...Gradients.primary]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || 'A'}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Demo User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'demo@bullbridge.app'}</Text>
            <View style={styles.levelBadge}>
              <Ionicons name="school-outline" size={12} color={theme.primary} />
              <Text style={styles.levelText}>{user?.experienceLevel || 'Intermediate'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color={theme.primary} />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Interest Sectors */}
      <View style={styles.sectorsSection}>
        <Text style={styles.sectionLabel}>Sectors of Interest</Text>
        <View style={styles.sectorChips}>
          {(user?.sectors || ['Tech', 'Banking', 'Pharma']).map((sector) => (
            <View key={sector} style={styles.sectorChip}>
              <Text style={styles.sectorChipText}>{sector}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <View key={section.title} style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, idx < section.items.length - 1 && styles.menuItemBorder]}
                activeOpacity={0.7}
                onPress={item.onPress}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}18` }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
                {item.trailing ? (
                  <Text style={styles.menuItemTrailing}>{item.trailing}</Text>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={theme.bearish} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* App info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>BullBridge v2.0</Text>
        <Text style={styles.appInfoText}>Data sourced from Yahoo Finance</Text>
        <Text style={styles.appInfoText}>15-20 minute delay during market hours</Text>
      </View>
    </ScrollView>
  );
}

function getStyles(theme: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { paddingBottom: 100 },
    header: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.lg },
    headerTitle: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: theme.textPrimary },
    userCard: {
      marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl,
      overflow: 'hidden', borderWidth: 1, borderColor: theme.glassBorder,
      marginBottom: Spacing.lg,
    },
    userCardGradient: {
      flexDirection: 'row', alignItems: 'center', padding: Spacing.lg,
    },
    avatar: { marginRight: Spacing.base },
    avatarGradient: {
      width: 56, height: 56, borderRadius: 28,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: Typography.xl, fontWeight: Typography.bold, color: theme.textInverse },
    userInfo: { flex: 1 },
    userName: { fontSize: Typography.lg, fontWeight: Typography.bold, color: theme.textPrimary },
    userEmail: { fontSize: Typography.sm, color: theme.textSecondary, marginTop: 2 },
    levelBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: theme.primaryMuted, paddingHorizontal: 8, paddingVertical: 2,
      borderRadius: BorderRadius.full, alignSelf: 'flex-start', marginTop: 6,
    },
    levelText: { fontSize: Typography.xs, color: theme.primary, fontWeight: Typography.semibold },
    editButton: { padding: Spacing.sm },
    sectorsSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
    sectionLabel: { fontSize: Typography.sm, color: theme.textSecondary, marginBottom: Spacing.sm },
    sectorChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    sectorChip: {
      backgroundColor: theme.surface, paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs, borderRadius: BorderRadius.full,
      borderWidth: 1, borderColor: theme.border,
    },
    sectorChipText: { fontSize: Typography.sm, color: theme.textSecondary },
    menuSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
    menuSectionTitle: {
      fontSize: Typography.sm, color: theme.textMuted, fontWeight: Typography.semibold,
      textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm,
    },
    menuCard: {
      backgroundColor: theme.surface, borderRadius: BorderRadius.lg,
      borderWidth: 1, borderColor: theme.border, overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: Spacing.md, paddingHorizontal: Spacing.base,
    },
    menuItemBorder: { borderBottomWidth: 1, borderBottomColor: theme.borderLight },
    menuIconContainer: {
      width: 32, height: 32, borderRadius: 8,
      alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
    },
    menuItemLabel: { flex: 1, fontSize: Typography.base, color: theme.textPrimary },
    menuItemTrailing: { fontSize: Typography.sm, color: theme.textMuted },
    logoutButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: Spacing.sm, marginHorizontal: Spacing.xl,
      paddingVertical: Spacing.base, borderRadius: BorderRadius.lg,
      backgroundColor: theme.bearishMuted, borderWidth: 1,
      borderColor: 'rgba(255, 82, 82, 0.3)', marginBottom: Spacing.lg,
    },
    logoutText: { fontSize: Typography.md, color: theme.bearish, fontWeight: Typography.semibold },
    appInfo: { alignItems: 'center', paddingBottom: Spacing.lg, gap: 4 },
    appInfoText: { fontSize: 10, color: theme.textMuted },
  });
}

