'use client';

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'bloomberg' | 'sakura' | 'noir' | 'ember';

export interface ThemeConfig {
  id: Theme;
  name: string;
  description: string;
  colors: {
    bg: string;
    accent: string;
    text: string;
  };
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'noir',
    name: 'Noir',
    description: 'Pure obsidian',
    colors: {
      bg: '#050505',
      accent: '#ffffff',
      text: '#fafafa',
    },
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    description: 'Terminal amber',
    colors: {
      bg: '#000000',
      accent: '#ff8c00',
      text: '#ff9500',
    },
  },
  {
    id: 'sakura',
    name: 'Sakura',
    description: 'Cherry blossom',
    colors: {
      bg: '#080609',
      accent: '#ec4899',
      text: '#f9a8d4',
    },
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Warm glow',
    colors: {
      bg: '#080605',
      accent: '#f97316',
      text: '#fb923c',
    },
  },
];

const STORAGE_KEY = 'portfolio-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('noir');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && THEMES.some(t => t.id === stored)) {
      setThemeState(stored);
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      // Set default theme
      document.documentElement.setAttribute('data-theme', 'noir');
    }
  }, []);

  // Update theme
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);

  return {
    theme,
    setTheme,
    themes: THEMES,
    mounted,
  };
}
