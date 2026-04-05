import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, ThemeColors } from '../constants/colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  themeMode: 'light',
  setThemeMode: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light'); // Default to light as requested

  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';
    
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, themeMode, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
