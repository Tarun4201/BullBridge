import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  cancelAnimation,
  runOnJS
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { NewsArticle } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const ANIMATION_DURATION = 30000; // 30 seconds for one full loop

interface NewsCarouselProps {
  data: NewsArticle[];
}

export const NewsCarousel: React.FC<NewsCarouselProps> = ({ data }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  // We double the data to create a seamless infinite loop
  const displayData = useMemo(() => {
    if (data.length === 0) return [];
    // Repeat the data to ensure the marquee has enough length to loop seamlessly
    return [...data, ...data];
  }, [data]);

  const translateX = useSharedValue(0);
  const totalWidth = displayData.length * (CARD_WIDTH + Spacing.md);
  const halfWidth = totalWidth / 2;

  useEffect(() => {
    if (displayData.length === 0) return;

    // Start the continuous smooth marquee animation
    translateX.value = withRepeat(
      withTiming(-halfWidth, {
        duration: ANIMATION_DURATION,
        easing: Easing.linear,
      }),
      -1, // infinite
      false // do not reverse
    );

    return () => cancelAnimation(translateX);
  }, [displayData.length, halfWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = (url: string) => {
    if (url) {
      router.push(url as any);
    }
  };

  if (displayData.length === 0) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.marqueeContainer, animatedStyle]}>
        {displayData.map((item, i) => (
          <TouchableOpacity
            key={`${item.id}-${i}`}
            style={styles.card}
            onPress={() => item.url && handlePress(item.url)}
            activeOpacity={0.9}
          >
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.footerRow}>
                  <Text style={styles.source} numberOfLines={1}>
                    {item.source}
                  </Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.time}>
                    {new Date(item.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
              </View>
              <View style={styles.iconBox}>
                <Ionicons name="newspaper-outline" size={24} color={theme.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      paddingVertical: Spacing.md,
      overflow: 'hidden',
    },
    marqueeContainer: {
      flexDirection: 'row',
      paddingLeft: Spacing.xl,
    },
    card: {
      width: CARD_WIDTH,
      height: 100,
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      padding: Spacing.md,
      marginRight: Spacing.md,
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: Typography.sm,
      fontWeight: Typography.bold,
      color: theme.textPrimary,
      marginBottom: 6,
      lineHeight: 18,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    source: {
      fontSize: 10,
      fontWeight: Typography.semibold,
      color: theme.primary,
      maxWidth: 100,
    },
    dot: {
      fontSize: 10,
      color: theme.textMuted,
    },
    time: {
      fontSize: 10,
      color: theme.textMuted,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundTertiary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
