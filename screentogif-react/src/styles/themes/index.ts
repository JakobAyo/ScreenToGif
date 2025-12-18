/**
 * Theme Definitions for ScreenToGif React
 *
 * Four themes ported from original WPF application:
 * - Light: Clean white backgrounds with dark text
 * - Medium: Balanced gray tones for reduced eye strain
 * - Dark: Default dark theme with slate backgrounds
 * - VeryDark: High contrast dark theme for AMOLED/OLED
 */

export type ThemeName = 'light' | 'medium' | 'dark' | 'veryDark';

export interface ThemeColors {
  // Background colors
  bg: string;
  bgAlt: string;
  bgElevated: string;
  bgOverlay: string;

  // Foreground/Text colors
  text: string;
  textMuted: string;
  textSubtle: string;

  // Border colors
  border: string;
  borderStrong: string;
  borderSubtle: string;

  // Interactive states
  hover: string;
  active: string;
  focus: string;
  selected: string;

  // Input fields
  inputBg: string;
  inputBorder: string;
  inputPlaceholder: string;

  // Scrollbar
  scrollbarTrack: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
}

export interface Theme {
  name: ThemeName;
  label: string;
  isDark: boolean;
  colors: ThemeColors;
}

export const themes: Record<ThemeName, Theme> = {
  light: {
    name: 'light',
    label: 'Light',
    isDark: false,
    colors: {
      // Background colors
      bg: '#ffffff',
      bgAlt: '#f8fafc',
      bgElevated: '#ffffff',
      bgOverlay: 'rgba(0, 0, 0, 0.3)',

      // Foreground/Text colors
      text: '#0f172a',
      textMuted: '#475569',
      textSubtle: '#94a3b8',

      // Border colors
      border: '#e2e8f0',
      borderStrong: '#cbd5e1',
      borderSubtle: '#f1f5f9',

      // Interactive states
      hover: '#f1f5f9',
      active: '#e2e8f0',
      focus: 'rgba(79, 70, 229, 0.2)',
      selected: '#eef2ff',

      // Input fields
      inputBg: '#ffffff',
      inputBorder: '#cbd5e1',
      inputPlaceholder: '#94a3b8',

      // Scrollbar
      scrollbarTrack: '#f1f5f9',
      scrollbarThumb: '#cbd5e1',
      scrollbarThumbHover: '#94a3b8',
    },
  },

  medium: {
    name: 'medium',
    label: 'Medium',
    isDark: false,
    colors: {
      // Background colors
      bg: '#e2e8f0',
      bgAlt: '#cbd5e1',
      bgElevated: '#f1f5f9',
      bgOverlay: 'rgba(0, 0, 0, 0.4)',

      // Foreground/Text colors
      text: '#1e293b',
      textMuted: '#475569',
      textSubtle: '#64748b',

      // Border colors
      border: '#94a3b8',
      borderStrong: '#64748b',
      borderSubtle: '#cbd5e1',

      // Interactive states
      hover: '#cbd5e1',
      active: '#94a3b8',
      focus: 'rgba(79, 70, 229, 0.25)',
      selected: '#c7d2fe',

      // Input fields
      inputBg: '#f1f5f9',
      inputBorder: '#94a3b8',
      inputPlaceholder: '#64748b',

      // Scrollbar
      scrollbarTrack: '#cbd5e1',
      scrollbarThumb: '#94a3b8',
      scrollbarThumbHover: '#64748b',
    },
  },

  dark: {
    name: 'dark',
    label: 'Dark',
    isDark: true,
    colors: {
      // Background colors
      bg: '#0f172a',
      bgAlt: '#1e293b',
      bgElevated: '#334155',
      bgOverlay: 'rgba(0, 0, 0, 0.6)',

      // Foreground/Text colors
      text: '#f8fafc',
      textMuted: '#94a3b8',
      textSubtle: '#64748b',

      // Border colors
      border: '#334155',
      borderStrong: '#475569',
      borderSubtle: '#1e293b',

      // Interactive states
      hover: '#334155',
      active: '#475569',
      focus: 'rgba(99, 102, 241, 0.3)',
      selected: '#312e81',

      // Input fields
      inputBg: '#1e293b',
      inputBorder: '#475569',
      inputPlaceholder: '#64748b',

      // Scrollbar
      scrollbarTrack: '#1e293b',
      scrollbarThumb: '#475569',
      scrollbarThumbHover: '#64748b',
    },
  },

  veryDark: {
    name: 'veryDark',
    label: 'Very Dark',
    isDark: true,
    colors: {
      // Background colors
      bg: '#020617',
      bgAlt: '#0f172a',
      bgElevated: '#1e293b',
      bgOverlay: 'rgba(0, 0, 0, 0.8)',

      // Foreground/Text colors
      text: '#f8fafc',
      textMuted: '#cbd5e1',
      textSubtle: '#94a3b8',

      // Border colors
      border: '#1e293b',
      borderStrong: '#334155',
      borderSubtle: '#0f172a',

      // Interactive states
      hover: '#1e293b',
      active: '#334155',
      focus: 'rgba(99, 102, 241, 0.4)',
      selected: '#1e1b4b',

      // Input fields
      inputBg: '#0f172a',
      inputBorder: '#334155',
      inputPlaceholder: '#64748b',

      // Scrollbar
      scrollbarTrack: '#0f172a',
      scrollbarThumb: '#334155',
      scrollbarThumbHover: '#475569',
    },
  },
};

export const defaultTheme: ThemeName = 'dark';

/**
 * Get CSS custom properties for a theme
 */
export function getThemeCSSVariables(theme: Theme): Record<string, string> {
  return {
    '--color-bg': theme.colors.bg,
    '--color-bg-alt': theme.colors.bgAlt,
    '--color-bg-elevated': theme.colors.bgElevated,
    '--color-bg-overlay': theme.colors.bgOverlay,
    '--color-text': theme.colors.text,
    '--color-text-muted': theme.colors.textMuted,
    '--color-text-subtle': theme.colors.textSubtle,
    '--color-border': theme.colors.border,
    '--color-border-strong': theme.colors.borderStrong,
    '--color-border-subtle': theme.colors.borderSubtle,
    '--color-hover': theme.colors.hover,
    '--color-active': theme.colors.active,
    '--color-focus': theme.colors.focus,
    '--color-selected': theme.colors.selected,
    '--color-input-bg': theme.colors.inputBg,
    '--color-input-border': theme.colors.inputBorder,
    '--color-input-placeholder': theme.colors.inputPlaceholder,
    '--color-scrollbar-track': theme.colors.scrollbarTrack,
    '--color-scrollbar-thumb': theme.colors.scrollbarThumb,
    '--color-scrollbar-thumb-hover': theme.colors.scrollbarThumbHover,
  };
}

/**
 * Apply theme CSS variables to an element
 */
export function applyTheme(element: HTMLElement, themeName: ThemeName): void {
  const theme = themes[themeName];
  const cssVars = getThemeCSSVariables(theme);

  Object.entries(cssVars).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });

  // Toggle dark mode class for Tailwind
  if (theme.isDark) {
    element.classList.add('dark');
  } else {
    element.classList.remove('dark');
  }

  // Set data attribute for CSS selectors
  element.dataset.theme = themeName;
}
