/**
 * Bull Bridge — Auth Layout (Stack)
 */

import { Stack } from 'expo-router';
import { useTheme } from '../../theme/ThemeProvider';

export default function AuthLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
