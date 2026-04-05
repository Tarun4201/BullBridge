/**
 * Bull Bridge — SEBI Disclaimer Modal (P0 Compliance)
 * Must show on first app use; user taps "I Understand" to proceed
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors, getGradients } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';

interface Props {
  visible: boolean;
  onAccept: () => void;
}

export function DisclaimerModal({ visible, onAccept }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const Gradients = getGradients(theme);
  
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[...Gradients.primary]}
              style={styles.iconGradient}
            >
              <Ionicons name="shield-checkmark" size={32} color={theme.textInverse} />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Important Disclaimer</Text>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              AI predictions are for educational purposes only and are not financial advice. Past accuracy does not guarantee future results.
            </Text>
          </View>

          <View style={styles.bulletPoints}>
            <View style={styles.bulletRow}>
              <Ionicons name="information-circle" size={18} color={theme.primary} />
              <Text style={styles.bulletText}>
                BullBridge provides market analysis and AI predictions for educational use only.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Ionicons name="trending-up" size={18} color={theme.warning} />
              <Text style={styles.bulletText}>
                Predictions show BULLISH/BEARISH direction — never BUY/SELL recommendations.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Ionicons name="time" size={18} color={theme.info} />
              <Text style={styles.bulletText}>
                Data sourced from Yahoo Finance with 15-20 minute delay during market hours.
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={onAccept} activeOpacity={0.85}>
            <LinearGradient
              colors={[...Gradients.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.acceptButton}
            >
              <Text style={styles.acceptButtonText}>I Understand</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    width: '100%',
  },
  iconContainer: { alignItems: 'center', marginBottom: Spacing.lg },
  iconGradient: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: Typography.xl, fontWeight: Typography.bold,
    color: theme.textPrimary, textAlign: 'center',
    marginBottom: Spacing.base,
  },
  disclaimerBox: {
    backgroundColor: theme.warningMuted,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.3)',
    marginBottom: Spacing.lg,
  },
  disclaimerText: {
    color: theme.warning, fontSize: Typography.sm,
    fontWeight: Typography.medium, lineHeight: 20,
    textAlign: 'center',
  },
  bulletPoints: { gap: Spacing.md, marginBottom: Spacing.xl },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  bulletText: {
    flex: 1, color: theme.textSecondary, fontSize: Typography.sm,
    lineHeight: 20,
  },
  acceptButton: {
    height: 52, borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  acceptButtonText: {
    color: theme.textInverse, fontSize: Typography.md,
    fontWeight: Typography.bold,
  },
});
