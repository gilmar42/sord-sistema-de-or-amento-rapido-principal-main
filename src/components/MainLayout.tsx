import React, { useState } from 'react';
import { QuoteCalculator } from './QuoteCalculator';
import { ServiceQuoteCalculator } from './ServiceQuoteCalculator';
import { MaterialManagement } from './MaterialManagement';
import { ClientManagement } from './ClientManagement';
import { Settings } from './Settings';
import { SavedQuotes } from './SavedQuotes';
import { Quote } from '../types';
import { SoredIcon, CalculatorIcon, BoxIcon, CogIcon, DocumentTextIcon, ArrowLeftOnRectangleIcon, SunIcon, MoonIcon, UserGroupIcon } from './Icons';
import { useAuth } from './../context/AuthContext';
import { NavItem } from './NavItem';
// import { useDarkMode } from '../hooks/useDarkMode'; // replaced by useTheme
import { useTheme } from '../hooks/useTheme';
import { ThemeSelector } from './ThemeSelector';


type View = 'calculator' | 'materials' | 'settings' | 'quotes' | 'clients' | 'service';

export const MainLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('calculator');
  const [quoteToEdit, setQuoteToEdit] = useState<Quote | null>(null);
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Diagnostic: log view changes during debugging
  React.useEffect(() => {
    console.log('[DEBUG] MainLayout currentView ->', currentView);
  }, [currentView]);

  const handleEditQuote = (quote: Quote) => {
    setQuoteToEdit(quote);
    setCurrentView('calculator');
  };

  const renderView = () => {
    switch (currentView) {
      case 'calculator':
        return <QuoteCalculator data-testid="quote-calculator" quoteToEdit={quoteToEdit} setQuoteToEdit={setQuoteToEdit} onNavigateToMaterials={() => setCurrentView('materials')} />;
      case 'service':
        // Lazy import pattern simplified: component directly imported below after creation.
        return <ServiceQuoteCalculator />;
      case 'materials':
        return <MaterialManagement activeView={currentView} />;
      case 'clients':
        return <ClientManagement />;
      case 'settings':
        return <Settings />;
      case 'quotes':
        return <SavedQuotes onEditQuote={handleEditQuote} />;
      default:
        return <QuoteCalculator quoteToEdit={quoteToEdit} setQuoteToEdit={setQuoteToEdit} onNavigateToMaterials={() => setCurrentView('materials')} />;
    }
  };
  


  const rootThemeClass = 'theme-corp corp-dark';
  const asideClass = 'corp-sidebar-dark corp-glow-ring';
  const mainSurfaceClass = 'corp-surface-dark';

  return (
      <div className={`${rootThemeClass} flex flex-col md:flex-row min-h-screen transition-all duration-500 ease-in-out`}>
        <aside className={`${asideClass} w-full md:w-60 fixed bottom-0 md:relative md:min-h-screen z-20 flex flex-col transition-all duration-500 ease-in-out p-0`}>
          <div className="px-4 py-6 flex-grow">
            <div className="flex items-center justify-between md:justify-center text-white mb-8 group">
              <div className="flex items-center hover:scale-105 transition-all duration-300 ease-in-out">
                <SoredIcon className="w-8 h-8 group-hover:rotate-12 transition-transform duration-500 ease-in-out text-gradient-accent"/>
                <h1 className="ml-2 text-xl font-bold hidden md:block transition-all duration-500 tracking-wide text-gradient-accent">SORED</h1>
              </div>
              <div className="md:hidden">
                <ThemeSelector />
              </div>
            </div>
            <nav className="flex flex-row md:flex-col justify-around md:space-y-2">
              <NavItem view="calculator" label="Novo Orçamento" icon={<CalculatorIcon className="w-5 h-5" />} currentView={currentView} setCurrentView={setCurrentView} setQuoteToEdit={setQuoteToEdit} />
              <NavItem view="service" label="Serviços" icon={<DocumentTextIcon className="w-5 h-5" />} currentView={currentView} setCurrentView={setCurrentView} setQuoteToEdit={setQuoteToEdit} />
              <NavItem view="quotes" label="Orçamentos" icon={<DocumentTextIcon className="w-5 h-5" />} currentView={currentView} setCurrentView={setCurrentView} setQuoteToEdit={setQuoteToEdit} />
              <NavItem view="clients" label="Clientes" icon={<UserGroupIcon className="w-5 h-5" />} currentView={currentView} setCurrentView={setCurrentView} setQuoteToEdit={setQuoteToEdit} />
              <NavItem view="materials" label="Materiais" icon={<BoxIcon className="w-5 h-5" />} currentView={currentView} setCurrentView={setCurrentView} setQuoteToEdit={setQuoteToEdit} />
              <NavItem view="settings" label="Configurações" icon={<CogIcon className="w-5 h-5" />} currentView={currentView} setCurrentView={setCurrentView} setQuoteToEdit={setQuoteToEdit} />
            </nav>
          </div>
          <div className="p-4 hidden md:block space-y-2">
            <ThemeSelector />
            <NavItem label="Sair" icon={<ArrowLeftOnRectangleIcon className="w-5 h-5" />} onClick={logout} currentView={currentView} setCurrentView={setCurrentView} setQuoteToEdit={setQuoteToEdit} />
          </div>
        </aside>

        <main className={`flex-1 p-4 sm:p-6 lg:p-10 pb-24 md:pb-8 transition-all duration-700 ease-in-out ${mainSurfaceClass}`} data-testid="main-view-container">
          <div className="animate-fade-in-up space-y-6">
            {renderView()}
          </div>
        </main>
      </div>
  );
};