/**
 * BullBridge — Terms of Service
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { ThemeColors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';

export default function TermsOfServiceScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerTitle: 'Terms of Service',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        ),
      }} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last Updated: April 2026</Text>
        
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using BullBridge, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
        </Text>

        <Text style={styles.sectionTitle}>2. Use of Service</Text>
        <Text style={styles.paragraph}>
          BullBridge provides educational information and AI-powered market predictions. All data provided is for informational purposes ONLY and should not be construed as investment or financial advice.
        </Text>

        <Text style={styles.sectionTitle}>3. No Brokerage Services</Text>
        <Text style={styles.paragraph}>
          BullBridge is NOT a registered broker-dealer or investment advisor. We do not facilitate the buying or selling of securities. We are an educational/utility platform.
        </Text>

        <Text style={styles.sectionTitle}>4. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          We are not responsible for any financial losses incurred based on the information provided within the app. Investing in the stock market involves high risk.
        </Text>
        
        <Text style={styles.sectionTitle}>5. Market Data</Text>
        <Text style={styles.paragraph}>
          Market data is sourced from Yahoo Finance and may be delayed by 15-20 minutes. We do not guarantee the accuracy or completeness of any data.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 BullBridge. High Risk - High Reward.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: Spacing.xl, paddingBottom: 60 },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: theme.textPrimary, marginBottom: Spacing.xs },
  lastUpdated: { fontSize: Typography.xs, color: theme.textMuted, marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: theme.textPrimary, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  paragraph: { fontSize: Typography.base, color: theme.textSecondary, lineHeight: 22, marginBottom: Spacing.base },
  footer: { marginTop: Spacing['3xl'], alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: Spacing.xl },
  footerText: { fontSize: Typography.xs, color: theme.textMuted },
});
