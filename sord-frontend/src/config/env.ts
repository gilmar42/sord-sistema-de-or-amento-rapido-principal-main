/**
 * Environment configuration helper
 * Wrapper para import.meta.env compatível com testes
 */

function getEnv(key: string, defaultValue: string = ''): string {
  // Em testes (Node.js), usar process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  // Em browser (Vite), usar import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as any)[key] || defaultValue;
  }
  
  return defaultValue;
}

export const API_URL = getEnv('VITE_API_URL', 'http://localhost:3001/api');
