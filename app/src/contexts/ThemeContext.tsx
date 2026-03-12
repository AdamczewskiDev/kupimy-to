import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@kupimy_theme';

export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryText: string;
  overlay: string;
  inputBg: string;
  rowBg: string;
  rowBoughtBg: string;
  error: string;
  success: string;
  primaryTint: string;
};

const lightColors: ThemeColors = {
  background: '#ffffff',
  card: '#ffffff',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  primary: '#2563eb',
  primaryText: '#ffffff',
  overlay: 'rgba(0,0,0,0.5)',
  inputBg: '#ffffff',
  rowBg: '#f8fafc',
  rowBoughtBg: '#f0fdf4',
  error: '#b91c1c',
  success: '#16a34a',
  primaryTint: '#dbeafe',
};

const darkColors: ThemeColors = {
  background: '#111827',
  card: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  border: '#374151',
  primary: '#3b82f6',
  primaryText: '#ffffff',
  overlay: 'rgba(0,0,0,0.7)',
  inputBg: '#1f2937',
  rowBg: '#374151',
  rowBoughtBg: '#064e3b',
  error: '#f87171',
  success: '#34d399',
  primaryTint: 'rgba(59, 130, 246, 0.25)',
};

type ThemeContextType = {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((s) => {
      if (s === 'light' || s === 'dark') setTheme(s);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        toggleTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
