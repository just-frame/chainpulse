'use client';

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'bloomberg' | 'sakura' | 'noir' | 'ember';

export const THEMES: { id: Theme; name: string; description: string }[] = [
  { id: 'bloomberg', name: 'Bloomberg', description: 'Professional terminal' },
  { id: 'sakura', name: 'Sakura', description: 'Cherry blossom' },
  { id: 'noir', name: 'Noir', description: 'Pure minimal' },
  { id: 'ember', name: 'Ember', description: 'Warm glow' },
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
