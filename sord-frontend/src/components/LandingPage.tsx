import React, { useState, useEffect } from 'react';
import { CalculatorIcon, BoxIcon, DocumentTextIcon, CogIcon, ChevronDownIcon, SparklesIcon, CheckCircleIcon } from './Icons';

interface LandingPageProps {
  onNavigateToAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const features = [
    {
      icon: <CalculatorIcon className="w-8 h-8" />,
      title: 'Cálculo de Orçamentos',
      description: 'Calcule orçamentos precisos com base em materiais, mão de obra e custos indiretos em tempo real.',
    },
    {
      icon: <BoxIcon className="w-8 h-8" />,
      title: 'Gerenciamento de Materiais',
      description: 'Organize e gerencie seu catálogo de materiais com componentes detalhados e custos precisos.',
    },
    {
      icon: <DocumentTextIcon className="w-8 h-8" />,
      title: 'Orçamentos Salvos',
      description: 'Salve, organize e reutilize seus orçamentos anteriores com um clique.',
    },
    {
      icon: <CogIcon className="w-8 h-8" />,
      title: 'Configurações Avançadas',
      description: 'Personalize taxas, margens de lucro e dados da sua empresa facilmente.',
    },
  ];

  const benefits = [
    'Precisão nos cálculos de orçamento',
    'Interface intuitiva e responsiva',
    'Geração de PDF profissional',
    'Suporte a múltiplas unidades de medida',
    'Integração com Mercado Pago',
    'Temas claro e escuro',
  ];

  return (
    <div className="min-h-screen text-textPrimary" style={{ backgroundImage: 'var(--app-gradient)', backgroundColor: 'var(--color-background)' }}>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-card shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
          {/* Logo e Nome */}
          <div className="flex items-center gap-3 group cursor-pointer">
            {/* Logo 3D com perspectiva */}
            <div
              className="w-12 h-12 relative"
              style={{
                perspective: '1200px',
              }}
            >
              <div
                className="w-full h-full bg-gradient-to-br from-primary via-blue-500 to-cyan-500 rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{
                  transform: `
                    rotateX(${mousePosition.y * 20}deg) 
                    rotateY(${-mousePosition.x * 20}deg)
                    rotateZ(45deg)
                  `,
                  transformStyle: 'preserve-3d',
                  boxShadow: `
                    0 20px 40px rgba(59, 130, 246, 0.3),
                    inset -2px -2px 8px rgba(0, 0, 0, 0.2),
                    inset 2px 2px 8px rgba(255, 255, 255, 0.1)
                  `,
                }}
              >
                <div className="w-full h-full flex items-center justify-center font-bold text-lg text-white drop-shadow-lg">
                  S
                </div>
              </div>
            </div>

            {/* Nome do Sistema */}
            <div className="hidden sm:block">
              <div className="text-xs uppercase tracking-[0.3em] text-primary font-bold drop-shadow-lg">
                SORED
              </div>
              <h1 className="text-2xl font-black text-blue-600 drop-shadow-lg">
                Orçamentos
              </h1>
            </div>
          </div>

          {/* Botão CTA */}
          <button
            onClick={onNavigateToAuth}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:bg-blue-700 hover:scale-105 transition-all duration-300 text-base tracking-wide"
          >
            Começar Agora
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full opacity-10 blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500 rounded-full opacity-10 blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-500 rounded-full opacity-10 blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          {/* 3D Logo Grande */}
          <div className="mb-12 inline-block perspective">
            <div
              className="w-32 h-32 relative mx-auto mb-8 drop-shadow-2xl"
              style={{
                perspective: '1200px',
              }}
            >
              <div
                className="w-full h-full bg-gradient-to-br from-primary via-blue-500 to-cyan-500 rounded-2xl transition-transform duration-300"
                style={{
                  transform: `
                    rotateX(${mousePosition.y * 15}deg) 
                    rotateY(${-mousePosition.x * 15}deg)
                  `,
                  transformStyle: 'preserve-3d',
                  boxShadow: `
                    0 30px 60px rgba(59, 130, 246, 0.4),
                    inset -3px -3px 10px rgba(0, 0, 0, 0.2),
                    inset 3px 3px 10px rgba(255, 255, 255, 0.15)
                  `,
                }}
              >
                <div className="w-full h-full flex items-center justify-center font-black text-5xl text-white drop-shadow-lg">
                  S
                </div>
              </div>
            </div>
          </div>

          {/* Título Principal */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400 mb-4 drop-shadow-lg">
              Sistema de Orçamento Rápido
            </h1>
            <p className="text-xl md:text-2xl text-textPrimary font-medium opacity-90">
              Crie orçamentos profissionais em segundos com precisão e facilidade
            </p>
          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce">
            <ChevronDownIcon className="w-6 h-6 text-primary mx-auto" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-10 bg-surface/50 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400 drop-shadow-lg">
            Funcionalidades Poderosas
          </h2>
          <p className="text-center text-textPrimary text-lg mb-16 max-w-2xl mx-auto font-medium opacity-90">
            Tudo que você precisa para gerenciar orçamentos profissionais em um único lugar
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-surface/80 backdrop-blur-sm border border-border/50 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group hover:border-primary/50"
              >
                <div className="mb-4 inline-block p-3 bg-gradient-to-br from-primary/30 to-cyan-500/30 rounded-xl group-hover:from-primary/50 group-hover:to-cyan-500/50 transition-colors">
                  <div className="text-primary group-hover:text-cyan-400 transition-colors">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-textPrimary">{feature.title}</h3>
                <p className="text-textPrimary opacity-80 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400 drop-shadow-lg">
            Por que escolher SORED?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4 group">
                <div className="mt-1">
                  <CheckCircleIcon className="w-7 h-7 text-blue-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <p className="text-lg text-textPrimary group-hover:text-blue-500 transition-colors font-semibold">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-10 bg-gradient-to-r from-primary/20 to-cyan-500/20 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400 drop-shadow-lg">
            Pronto para começar?
          </h2>
          <p className="text-xl text-textPrimary mb-8 font-medium opacity-90">
            Crie sua conta gratuitamente e comece a gerar orçamentos profissionais agora mesmo
          </p>
          <button
            onClick={onNavigateToAuth}
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-2xl hover:shadow-[0_20px_60px_rgba(59,130,246,0.5)] hover:scale-105 transition-all duration-300 text-xl border-2 border-cyan-400"
          >
            Acessar SORED Agora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-10 border-t border-border/30 text-center text-textSecondary text-sm">
        <p>© 2026 SORED - Sistema de Orçamento Rápido. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};
