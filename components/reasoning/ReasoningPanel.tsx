/**
 * Bull Bridge — AI Reasoning Panel
 * Collapsible panel that displays structured multi-factor reasoning.
 * Has its own loading skeleton — never blocks the main UI.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { ReasoningResult, ReasoningSignal, Recommendation, RiskLevel } from '../../types';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ReasoningPanelProps {
  reasoning: ReasoningResult | null;
  isLoading: boolean;
}

export function ReasoningPanel({ reasoning, isLoading }: ReasoningPanelProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header — always visible */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Toggle AI Reasoning panel"
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="bulb" size={18} color={theme.neuralPurple} />
          </View>
          <Text style={styles.headerTitle}>AI Reasoning</Text>
          {reasoning && (
            <View style={[
              styles.recBadgeSmall,
              { backgroundColor: getRecommendationColor(reasoning.recommendation, theme) + '20' }
            ]}>
              <Text style={[
                styles.recBadgeSmallText,
                { color: getRecommendationColor(reasoning.recommendation, theme) }
              ]}>
                {reasoning.recommendation}
              </Text>
            </View>
          )}
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.textMuted}
        />
      </TouchableOpacity>

      {/* Body — collapsible */}
      {isExpanded && (
        <View style={styles.body}>
          {/* SEBI Disclaimer */}
          <View style={styles.disclaimer}>
            <Ionicons name="warning" size={12} color={theme.warning} />
            <Text style={styles.disclaimerText}>
              AI reasoning is for educational purposes only. Not financial advice.
            </Text>
          </View>

          {isLoading ? (
            <LoadingSkeleton theme={theme} />
          ) : reasoning ? (
            <ReasoningContent reasoning={reasoning} theme={theme} />
          ) : null}
        </View>
      )}
    </View>
  );
}

// ─── Sub-Components ──────────────────────────

function LoadingSkeleton({ theme }: { theme: ThemeColors }) {
  const styles = getStyles(theme);
  return (
    <View style={styles.skeletonContainer}>
      <View style={[styles.skeletonLine, { width: '90%' }]} />
      <View style={[styles.skeletonLine, { width: '75%' }]} />
      <View style={[styles.skeletonLine, { width: '60%' }]} />
      <View style={styles.skeletonRow}>
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonCard} />
      </View>
    </View>
  );
}

function ReasoningContent({ reasoning, theme }: { reasoning: ReasoningResult; theme: ThemeColors }) {
  const styles = getStyles(theme);
  const recColor = getRecommendationColor(reasoning.recommendation, theme);
  const riskColor = getRiskColor(reasoning.risk_level, theme);

  return (
    <View>
      {/* Summary */}
      <Text style={styles.summary}>{reasoning.summary}</Text>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        {/* Recommendation */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Recommendation</Text>
          <View style={[styles.recBadge, { backgroundColor: recColor + '20' }]}>
            <Ionicons
              name={reasoning.recommendation === 'BUY' ? 'trending-up' : reasoning.recommendation === 'SELL' ? 'trending-down' : 'remove'}
              size={16}
              color={recColor}
            />
            <Text style={[styles.recText, { color: recColor }]}>
              {reasoning.recommendation}
            </Text>
          </View>
        </View>

        {/* Confidence */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Confidence</Text>
          <Text style={[styles.metricValue, { color: getConfidenceColor(reasoning.confidence, theme) }]}>
            {reasoning.confidence}%
          </Text>
          <View style={styles.confidenceBarOuter}>
            <View style={[
              styles.confidenceBarInner,
              {
                width: `${reasoning.confidence}%`,
                backgroundColor: getConfidenceColor(reasoning.confidence, theme),
              },
            ]} />
          </View>
        </View>

        {/* Risk Level */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Risk</Text>
          <View style={[styles.riskBadge, { backgroundColor: riskColor + '20' }]}>
            <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
            <Text style={[styles.riskText, { color: riskColor }]}>
              {reasoning.risk_level.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Signal Cards */}
      <Text style={styles.signalsTitle}>Factor Analysis</Text>
      {reasoning.signals.map((signal, index) => (
        <SignalCard key={index} signal={signal} theme={theme} />
      ))}
    </View>
  );
}

function SignalCard({ signal, theme }: { signal: ReasoningSignal; theme: ThemeColors }) {
  const styles = getStyles(theme);
  const impactConfig = getImpactConfig(signal.impact, theme);

  return (
    <View style={styles.signalCard}>
      <View style={styles.signalHeader}>
        <View style={styles.signalHeaderLeft}>
          <View style={[styles.impactDot, { backgroundColor: impactConfig.color }]} />
          <Text style={styles.signalFactor}>{signal.factor}</Text>
        </View>
        <View style={[styles.impactBadge, { backgroundColor: impactConfig.bg }]}>
          <Ionicons name={impactConfig.icon as any} size={12} color={impactConfig.color} />
          <Text style={[styles.impactText, { color: impactConfig.color }]}>
            {signal.impact.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.signalExplanation}>{signal.explanation}</Text>
    </View>
  );
}

// ─── Helpers ─────────────────────────────────

function getRecommendationColor(rec: Recommendation, theme: ThemeColors): string {
  switch (rec) {
    case 'BUY': return theme.bullish;
    case 'SELL': return theme.bearish;
    case 'HOLD': return theme.warning;
  }
}

function getRiskColor(risk: RiskLevel, theme: ThemeColors): string {
  switch (risk) {
    case 'low': return theme.bullish;
    case 'medium': return theme.warning;
    case 'high': return theme.bearish;
  }
}

function getConfidenceColor(confidence: number, theme: ThemeColors): string {
  if (confidence >= 65) return theme.bullish;
  if (confidence >= 40) return theme.warning;
  return theme.bearish;
}

function getImpactConfig(impact: string, theme: ThemeColors) {
  switch (impact) {
    case 'positive':
      return { color: theme.bullish, bg: theme.bullishMuted, icon: 'checkmark-circle' };
    case 'negative':
      return { color: theme.bearish, bg: theme.bearishMuted, icon: 'close-circle' };
    default:
      return { color: theme.textMuted, bg: theme.glassLight, icon: 'remove-circle' };
  }
}

// ─── Styles ──────────────────────────────────

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    backgroundColor: theme.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: theme.neuralPurpleMuted,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.neuralPurpleMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: theme.textPrimary,
  },
  recBadgeSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  recBadgeSmallText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  body: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: theme.warningMuted,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 10,
    color: theme.warning,
    lineHeight: 14,
  },

  // Skeleton
  skeletonContainer: {
    gap: Spacing.md,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.backgroundTertiary,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  skeletonCard: {
    flex: 1,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: theme.backgroundTertiary,
  },

  // Content
  summary: {
    fontSize: Typography.sm,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },

  // Metrics
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.backgroundTertiary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: Typography.xs,
    color: theme.textMuted,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.extrabold,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  recText: {
    fontSize: Typography.sm,
    fontWeight: Typography.extrabold,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  riskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  riskText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  confidenceBarOuter: {
    width: '100%',
    height: 4,
    backgroundColor: theme.borderLight,
    borderRadius: 2,
    marginTop: Spacing.xs,
    overflow: 'hidden',
  },
  confidenceBarInner: {
    height: '100%',
    borderRadius: 2,
  },

  // Signals
  signalsTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: theme.textPrimary,
    marginBottom: Spacing.sm,
  },
  signalCard: {
    backgroundColor: theme.backgroundTertiary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  signalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  impactDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  signalFactor: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: theme.textPrimary,
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  impactText: {
    fontSize: 9,
    fontWeight: Typography.bold,
  },
  signalExplanation: {
    fontSize: Typography.xs,
    color: theme.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
});
