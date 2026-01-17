
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (companyName: string, email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hashPassword = (password: string) => `hashed_${password}`;

  const readJson = <T,>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    const session = readJson<User | null>('sored_session', null);
    if (session) {
      setCurrentUser(session);
    }
    setIsLoading(false);
  }, []);

  const persistSession = (user: User) => {
    const session = { id: user.id, email: user.email, tenantId: user.tenantId } as User;
    localStorage.setItem('sored_session', JSON.stringify(session));
    setCurrentUser(session);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = readJson<User[]>('sored_users', []);
      const user = users.find(u => u.email === email);
      if (!user) return false;
      if (user.passwordHash !== hashPassword(password)) return false;
      persistSession(user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (companyName: string, email: string, password: string): Promise<boolean> => {
    try {
      const users = readJson<User[]>('sored_users', []);
      const tenants = readJson<any[]>('sored_tenants', []);

      if (users.some(u => u.email === email)) {
        console.error('User already exists');
        return false;
      }

      const newTenantId = `T-${Date.now()}`;
      const newUserId = `U-${Date.now()}`;

      const newUser: User = {
        id: newUserId,
        email,
        tenantId: newTenantId,
        passwordHash: hashPassword(password),
      };

      users.push(newUser);
      tenants.push({ id: newTenantId, companyName });

      localStorage.setItem('sored_users', JSON.stringify(users));
      localStorage.setItem('sored_tenants', JSON.stringify(tenants));

      persistSession(newUser);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('sored_session');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, signup, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
