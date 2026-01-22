'use client';

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'default' | 'terracotta' | 'violet' | 'amber';

export const THEMES: { id: Theme; name: string; description: string }[] = [
  { id: 'default', name: 'Gunmetal', description: 'Clean, neutral dark' },
  { id: 'terracotta', name: 'Terracotta', description: 'Warm coral energy' },
  { id: 'violet', name: 'Violet', description: 'Nocturnal synthwave' },
  { id: 'amber', name: 'Amber', description: 'Retro terminal' },
];

const STORAGE_KEY = 'portfolio-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('default');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && THEMES.some(t => t.id === stored)) {
      setThemeState(stored);
      document.documentElement.setAttribute('data-theme', stored);
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
