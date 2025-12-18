import { useState, useEffect, useCallback } from 'react';
import { themes, type ThemeName, applyTheme, defaultTheme } from '../styles/themes';

const THEME_STORAGE_KEY = 'screentogif-theme';

export interface UseThemeReturn {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  isDark: boolean;
  availableThemes: ThemeName[];
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    // Try to get theme from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && stored in themes) {
        return stored as ThemeName;
      }

      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return defaultTheme;
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    applyTheme(root, theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a theme
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    darkQuery.addEventListener('change', handleChange);
    return () => darkQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((newTheme: ThemeName) => {
    setThemeState(newTheme);
  }, []);

  // Cycle through themes
  const toggleTheme = useCallback(() => {
    const themeOrder: ThemeName[] = ['light', 'medium', 'dark', 'veryDark'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setThemeState(themeOrder[nextIndex]);
  }, [theme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: themes[theme].isDark,
    availableThemes: Object.keys(themes) as ThemeName[],
  };
}
