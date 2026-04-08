/**
 * BullBridge — Privacy Policy
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { ThemeColors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerTitle: 'Privacy Policy',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        ),
      }} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: April 2026</Text>
        
        <Text style={styles.paragraph}>
          BullBridge ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>1. Information Collection</Text>
        <Text style={styles.paragraph}>
          We collect information that you provide directly to us when you create an account, such as your name, email address, and experience level. We also collect data about your interactions with the app, including watchlist items and stock searches.
        </Text>

        <Text style={styles.sectionTitle}>2. Use of Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to provide, maintain, and improve our services, to personalize your experience, and to send you technical notices and support messages.
        </Text>

        <Text style={styles.sectionTitle}>3. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement commercially reasonable security measures to protect your information. However, no method of transmission over the internet or electronic storage is 100% secure.
        </Text>
        
        <Text style={styles.sectionTitle}>4. Data Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell your personal data to third parties. We may share information with service providers who perform services on our behalf, or as required by law.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 BullBridge. All rights reserved.</Text>
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
