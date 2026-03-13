import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@kupimy_theme';

export type ThemePresetId = 'light' | 'dark' | 'forest' | 'ocean';

/** Zachowana dla kompatybilności wstecznej. */
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

/** Las – zielony, ziemisty. */
const forestColors: ThemeColors = {
  background: '#f0f7f0',
  card: '#ffffff',
  text: '#1a2f1a',
  textSecondary: '#4a6b4a',
  border: '#c5d9c5',
  primary: '#2d5a27',
  primaryText: '#ffffff',
  overlay: 'rgba(0,0,0,0.5)',
  inputBg: '#ffffff',
  rowBg: '#e8f0e8',
  rowBoughtBg: '#d4e8d4',
  error: '#b91c1c',
  success: '#166534',
  primaryTint: '#dcfce7',
};

/** Morze – niebieski, wodny. */
const oceanColors: ThemeColors = {
  background: '#f0f7fc',
  card: '#ffffff',
  text: '#0f1729',
  textSecondary: '#475569',
  border: '#b8d4e8',
  primary: '#0369a1',
  primaryText: '#ffffff',
  overlay: 'rgba(0,0,0,0.5)',
  inputBg: '#ffffff',
  rowBg: '#e0f2fe',
  rowBoughtBg: '#cffafe',
  error: '#b91c1c',
  success: '#0e7490',
  primaryTint: '#e0f2fe',
};

const THEME_COLORS: Record<ThemePresetId, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
  forest: forestColors,
  ocean: oceanColors,
};

export type ThemePreset = { id: ThemePresetId; label: string; icon: string };
export const THEME_PRESETS: ThemePreset[] = [
  { id: 'light', label: 'Jasny', icon: '☀️' },
  { id: 'dark', label: 'Ciemny', icon: '🌙' },
  { id: 'forest', label: 'Las', icon: '🌲' },
  { id: 'ocean', label: 'Morze', icon: '🌊' },
];

type ThemeContextType = {
  theme: ThemePresetId;
  colors: ThemeColors;
  setTheme: (id: ThemePresetId) => void;
  /** Przełącza tylko jasny ↔ ciemny (do użycia w nagłówku). */
  toggleLightDark: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function isValidPreset(s: string | null): s is ThemePresetId {
  return s === 'light' || s === 'dark' || s === 'forest' || s === 'ocean';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePresetId>('light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((s) => {
      if (isValidPreset(s)) setThemeState(s);
    });
  }, []);

  const setTheme = useCallback((id: ThemePresetId) => {
    setThemeState(id);
    AsyncStorage.setItem(THEME_STORAGE_KEY, id).catch(() => {});
  }, []);

  const toggleLightDark = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const colors = THEME_COLORS[theme];
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        setTheme,
        toggleLightDark,
        isDark,
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
