import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { MoonIcon } from './Icons';

export const ThemeSelector: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="mt-4 p-4 rounded-xl ice-graphite-surface dark:modern-surface soft-shadow">
      <div className="flex items-center gap-2 text-sm font-semibold text-gradient-accent dark:text-gradient-accent">
        <MoonIcon className="w-4 h-4" />
        <span>Tema Corporativo Escuro</span>
      </div>
    </div>
  );
};
