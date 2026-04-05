/**
 * Bull Bridge — Entry Redirect
 * Redirects to auth or home based on login state
 */

import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  
  return <Redirect href="/(auth)/login" />;
}
