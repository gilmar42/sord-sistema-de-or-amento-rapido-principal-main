import React, { createContext, useContext, ReactNode } from 'react';

export type ThemeMode = 'corporate-dark' | 'corporate-light';

interface ThemeContextType {
  theme: ThemeMode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Removido o useEffect que forçava 'dark' - o useDarkMode gerencia isso
  const theme: ThemeMode = 'corporate-light';

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
