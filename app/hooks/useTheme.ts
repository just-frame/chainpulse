'use client';

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'cypher';

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
    id: 'cypher',
    name: 'Cypher',
    description: 'Terminal mode',
    colors: {
      bg: '#08090b',
      accent: '#5aabb8',
      text: '#e4e6eb',
    },
  },
];

const STORAGE_KEY = 'portfolio-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('cypher');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    // Always set to cypher theme
    document.documentElement.setAttribute('data-theme', 'cypher');
  }, []);

  // Update theme (simplified since we only have one theme now)
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
