/**
 * Bull Bridge — Root Layout
 * Entry point for Expo Router; handles auth gating and splash
 */

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { DisclaimerModal } from '../components/ui/DisclaimerModal';
import { useAuthStore } from '../stores/authStore';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';

// Prevent auto hide while app loads
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { theme, isDark } = useTheme();
  const { hasAcknowledgedDisclaimer, isAuthenticated } = useAuthStore();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const acknowledgeDisclaimer = useAuthStore((s) => s.acknowledgeDisclaimer);

  useEffect(() => {
    // Hide splash immediately since we have no fonts to load
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !hasAcknowledgedDisclaimer) {
      setShowDisclaimer(true);
    }
  }, [isAuthenticated, hasAcknowledgedDisclaimer]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="stock/[ticker]"
          options={{
            animation: 'slide_from_right',
            presentation: 'card',
          }}
        />
      </Stack>
      {showDisclaimer && (
        <DisclaimerModal
          visible={showDisclaimer}
          onAccept={() => {
            acknowledgeDisclaimer();
            setShowDisclaimer(false);
          }}
        />
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

