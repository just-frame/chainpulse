'use client';

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'swiss' | 'default' | 'terracotta' | 'violet' | 'amber' | 'terminal';

export const THEMES: { id: Theme; name: string; description: string }[] = [
  { id: 'swiss', name: 'Swiss', description: 'Maximum clarity' },
  { id: 'default', name: 'Gunmetal', description: 'Clean, neutral dark' },
  { id: 'terracotta', name: 'Terracotta', description: 'Warm coral energy' },
  { id: 'violet', name: 'Violet', description: 'Nocturnal synthwave' },
  { id: 'amber', name: 'Amber', description: 'Retro terminal' },
  { id: 'terminal', name: 'Terminal', description: 'CRT maximalism' },
];

const STORAGE_KEY = 'portfolio-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('swiss');
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
