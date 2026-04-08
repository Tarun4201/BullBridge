/**
 * BullBridge — Permission Handler
 * Simplified utility for app permissions (Removed expo-notifications to fix Expo Go Android crashes).
 */

import { Alert, Platform } from 'react-native';

export const PermissionHandler = {
  /**
   * Mock request to avoid crashes on Android SDK 53+
   */
  requestNotificationPermission: async () => {
    if (Platform.OS === 'android') {
      Alert.alert(
        'Feature Notice',
        'Real-time Push Notifications require a Development Build or Production APK on Android SDK 53+. Local alerts are still functional.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  },

  /**
   * Generic check for platform specific permissions
   */
  checkStatus: async () => {
    return true; // Simplified for stability
  }
};
