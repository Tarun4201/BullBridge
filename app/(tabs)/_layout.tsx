/**
 * Bull Bridge — Tab Layout
 * Bottom tab navigator with 5 tabs: Home, Search, Watchlist, Notifications, Profile
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { ThemeColors } from '../../constants/colors';
import { Typography } from '../../constants/theme';

type TabIconName = 'home' | 'search' | 'star' | 'notifications' | 'person';

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  index: { active: 'home', inactive: 'home-outline' },
  search: { active: 'search', inactive: 'search-outline' },
  watchlist: { active: 'star', inactive: 'star-outline' },
  notifications: { active: 'notifications', inactive: 'notifications-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

export default function TabLayout() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.tabActive,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name] || TAB_ICONS.index;
          const iconName = focused ? icons.active : icons.inactive;
          return (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={iconName as any} size={22} color={color} />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: theme.tabActive }]} />}
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="watchlist" options={{ title: 'Watchlist' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

function getStyles(theme: ThemeColors) {
  return StyleSheet.create({
    tabBar: {
    backgroundColor: theme.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: theme.tabBarBorder,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    elevation: 0,
  },
  tabLabel: {
    fontSize: Typography.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  activeIconContainer: {
    alignItems: 'center',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
    },
  });
}
