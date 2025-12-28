import React, { useEffect, useState } from 'react';
import { QuoteCalculator } from './QuoteCalculator';
import { MaterialManagement } from './MaterialManagement';

import { Settings } from './Settings';
import { SavedQuotes } from './SavedQuotes';
import type { Quote } from '../types';
import { SoredIcon, CalculatorIcon, BoxIcon, CogIcon, DocumentTextIcon, ArrowLeftOnRectangleIcon, MoonIcon, SunIcon } from './Icons';
import { useAuth } from './../context/AuthContext';
import { NavItem } from './NavItem';
import { useLocalStorage } from '../hooks/useLocalStorage';


type View = 'calculator' | 'materials' | 'settings' | 'quotes';

export const MainLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('calculator');
  const [quoteToEdit, setQuoteToEdit] = useState<Quote | null>(null);
  const { logout } = useAuth();
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('sored_theme', 'light');

  // Diagnostic: log view changes during debugging
  React.useEffect(() => {
    console.log('[DEBUG] MainLayout currentView ->', currentView);
  }, [currentView]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const themeLabel = theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro';

  const handleEditQuote = (quote: Quote) => {
    setQuoteToEdit(quote);
    setCurrentView('calculator');
  };

  const renderView = () => {
    switch (currentView) {
      case 'calculator':
        return <QuoteCalculator data-testid="quote-calculator" quoteToEdit={quoteToEdit} setQuoteToEdit={setQuoteToEdit} />;
      case 'materials':
        return <MaterialManagement activeView={currentView} />;
      case 'settings':
        return <Settings />;
      case 'quotes':
        return <SavedQuotes onEditQuote={handleEditQuote} />;
      default:
        return <QuoteCalculator quoteToEdit={quoteToEdit} setQuoteToEdit={setQuoteToEdit} />;
    }
  };
  


  return (
    <div
      className="min-h-screen text-textPrimary"
      style={{ backgroundImage: 'var(--app-gradient)', backgroundColor: 'var(--color-background)' }}
    >
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 gap-6">
        <aside className="w-full md:w-60 glass-card md:sticky md:top-8 md:h-[calc(100vh-4rem)] flex flex-col p-5 animate-slideIn">
          <div className="flex items-center justify-between md:justify-start text-primary mb-6">
            <div className="flex items-center">
              <SoredIcon className="w-8 h-8" />
              <div className="ml-2">
                <p className="text-xs uppercase tracking-[0.18em] text-textSecondary">SORED</p>
                <h1 className="text-lg font-semibold text-textPrimary">Orçamentos</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="text-textSecondary hover:text-textPrimary transition-colors p-2 rounded-lg border border-transparent hover:border-border"
                aria-label="Alternar tema"
              >
                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
              </button>
              <button onClick={logout} className="md:hidden text-textSecondary hover:text-textPrimary transition-colors" aria-label="Sair">
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav className="flex flex-row md:flex-col md:space-y-2 gap-2 md:gap-0">
            <NavItem view="calculator" label="Novo Orçamento" icon={<CalculatorIcon className="w-5 h-5" />} currentView={currentView} setCurrentView={setCurrentView} setQuoteToEdit={setQuoteToEdit} />
            <NavItem view="quotes" label="Orçamentos" icon={<DocumentTextIcon className="w-5 h-5" />} currentView={currentView} setCurrentView={setCurrentView} setQuoteToEdit={setQuoteToEdit} />
            <NavItem view="materials" label="Materiais" icon={<BoxIcon className="w-5 h-5" />} currentView={currentView} setCurrentView={setCurrentView} setQuoteToEdit={setQuoteToEdit} />
            <NavItem view="settings" label="Configurações" icon={<CogIcon className="w-5 h-5" />} currentView={currentView} setCurrentView={setCurrentView} setQuoteToEdit={setQuoteToEdit} />
          </nav>

          <div className="mt-3">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-full px-3 py-2 text-sm font-semibold rounded-xl transition-all duration-200 border border-border/70 bg-surface-light text-textSecondary hover:text-textPrimary hover:border-primary hover:bg-surface"
              aria-label={themeLabel}
            >
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
              <span className="ml-2">Tema</span>
            </button>
          </div>

          <div className="mt-auto hidden md:block pt-6 border-t border-[color:var(--color-border)]">
            <NavItem label="Sair" icon={<ArrowLeftOnRectangleIcon className="w-5 h-5" />} onClick={logout} currentView={currentView} setCurrentView={setCurrentView} setQuoteToEdit={setQuoteToEdit} />
          </div>
        </aside>

        <main className="flex-1">
          <div className="glass-card p-5 sm:p-7 lg:p-8 animate-fadeUp" data-testid="main-view-container">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};