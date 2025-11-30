import React, { createContext, useContext, useEffect, ReactNode } from 'react';

export type ThemeMode = 'corporate-dark';

interface ThemeContextType {
  theme: ThemeMode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const theme: ThemeMode = 'corporate-dark';

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    localStorage.setItem('themeMode', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
