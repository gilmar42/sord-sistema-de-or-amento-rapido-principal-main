import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SoredIcon } from '../Icons';

export const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { login, signup } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let success = false;
    try {
        if (isLoginView) {
            if (!email || !password) {
                setError("Por favor, preencha e-mail e senha.");
                return;
            }
            success = await login(email, password);
            if (!success) setError('E-mail ou senha inválidos.');
        } else {
            if (!companyName || !email || !password) {
                setError("Por favor, preencha todos os campos.");
                return;
            }
            success = await signup(companyName, email, password);
            if (!success) setError('Este e-mail já está em uso.');
        }
    } catch (e) {
        setError('Ocorreu um erro. Tente novamente.');
    } finally {
        setIsLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setEmail('');
    setPassword('');
    setCompanyName('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center mb-6 text-primary">
            <SoredIcon className="w-12 h-12"/>
            <h1 className="ml-3 text-3xl font-bold text-textPrimary">SORED</h1>
        </div>
        <div className="bg-surface shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
          <h2 className="text-center text-2xl font-semibold text-textPrimary mb-6">
            {isLoginView ? 'Acessar sua Conta' : 'Criar Nova Conta'}
          </h2>
          <form onSubmit={handleSubmit}>
            {!isLoginView && (
              <div className="mb-5">
                <label className="block text-textSecondary text-sm font-semibold mb-2" htmlFor="companyName">
                  Nome da Empresa
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Digite o nome da sua empresa"
                    className="bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm shadow-inner border-2 border-gray-700 rounded-lg w-full py-3 pl-10 pr-4 text-white placeholder-gray-500 leading-tight focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:bg-gray-800 transition-all duration-200 hover:border-gray-600 hover:bg-gray-800"
                    required
                  />
                </div>
              </div>
            )}
            <div className="mb-5">
              <label className="block text-textSecondary text-sm font-semibold mb-2" htmlFor="email">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm shadow-inner border-2 border-gray-700 rounded-lg w-full py-3 pl-10 pr-4 text-white placeholder-gray-500 leading-tight focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:bg-gray-800 transition-all duration-200 hover:border-gray-600 hover:bg-gray-800"
                  required
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-textSecondary text-sm font-semibold mb-2" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm shadow-inner border-2 border-gray-700 rounded-lg w-full py-3 pl-10 pr-4 text-white placeholder-gray-500 leading-tight focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:bg-gray-800 transition-all duration-200 hover:border-gray-600 hover:bg-gray-800"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="bg-red-900/30 border-l-4 border-red-500 text-red-300 px-4 py-3 rounded mb-4 flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-blue-500/50 hover:shadow-blue-600/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 transform transition-all duration-200 disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Carregando...
                  </span>
                ) : (isLoginView ? 'Entrar' : 'Criar Conta')}
              </button>
            </div>
          </form>
          <div className="text-center mt-6">
            <button onClick={toggleView} className="inline-block align-baseline font-semibold text-sm text-primary hover:text-blue-400 transition-colors duration-200 underline-offset-4 hover:underline">
              {isLoginView ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </button>
          </div>
        </div>
        <p className="text-center text-textSecondary text-xs">
          &copy;{new Date().getFullYear()} SORED. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};