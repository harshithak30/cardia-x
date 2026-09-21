import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, expectedRole?: UserRole) => Promise<User>;
  signupPatient: (data: any) => Promise<User>;
  signupDoctor: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('cardia_x_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cardia_x_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('cardia_x_token');
      if (savedToken) {
        try {
          const res = await authApi.getCurrentUser();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('cardia_x_user', JSON.stringify(res.user));
          }
        } catch (e) {
          console.warn('[AuthContext] Session invalid or expired');
          localStorage.removeItem('cardia_x_token');
          localStorage.removeItem('cardia_x_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, expectedRole?: UserRole): Promise<User> => {
    const res = await authApi.login({ email, password, expectedRole });
    if (res.success && res.token && res.user) {
      localStorage.setItem('cardia_x_token', res.token);
      localStorage.setItem('cardia_x_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Authentication failed');
  };

  const signupPatient = async (data: any): Promise<User> => {
    const res = await authApi.registerPatient(data);
    if (res.success && res.token && res.user) {
      localStorage.setItem('cardia_x_token', res.token);
      localStorage.setItem('cardia_x_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Registration failed');
  };

  const signupDoctor = async (data: any): Promise<User> => {
    const res = await authApi.registerDoctor(data);
    if (res.success && res.token && res.user) {
      localStorage.setItem('cardia_x_token', res.token);
      localStorage.setItem('cardia_x_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Doctor registration failed');
  };

  const logout = () => {
    localStorage.removeItem('cardia_x_token');
    localStorage.removeItem('cardia_x_user');
    setUser(null);
    setToken(null);
    window.location.href = '/';
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getCurrentUser();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('cardia_x_user', JSON.stringify(res.user));
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signupPatient,
        signupDoctor,
        logout,
        refreshUser,
        isAuthenticated: !!token && !!user,
        role: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

