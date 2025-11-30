import { useEffect, useState } from 'react';

// New theme modes for corporate styling
export type ThemeMode = 'corporate-dark' | 'corporate-light';

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('themeMode');
    // Migration from old values
    if (stored === 'dark') return 'corporate-dark';
    if (stored === 'light') return 'corporate-light';
    if (stored === 'corporate-dark' || stored === 'corporate-light') return stored as ThemeMode;
    return 'corporate-dark'; // default
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Maintain dark class for legacy dark-specific styling (optional)
    if (theme === 'corporate-dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('themeMode', theme);
  }, [theme]);

  return { theme, setTheme };
};
