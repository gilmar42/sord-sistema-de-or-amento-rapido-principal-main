import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { SunIcon, MoonIcon } from './Icons';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div className="mt-4 p-4 rounded-xl ice-graphite-surface dark:modern-surface soft-shadow">
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gradient-accent dark:text-gradient-accent">
        {theme === 'corporate-light' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
        Tema Corporativo
      </h4>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="radio"
            name="themeMode"
            value="corporate-dark"
            checked={theme === 'corporate-dark'}
            onChange={() => setTheme('corporate-dark')}
            className="accent-blue-600"
          />
          <span>Corporativo Escuro</span>
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="radio"
            name="themeMode"
            value="corporate-light"
            checked={theme === 'corporate-light'}
            onChange={() => setTheme('corporate-light')}
            className="accent-blue-600"
          />
          <span>Corporativo Claro</span>
        </label>
      </div>
    </div>
  );
};
