import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { loginApi, registerApi, updateProfileApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('fmc_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const persist = (userData, token) => {
    localStorage.setItem('fmc_user', JSON.stringify(userData));
    localStorage.setItem('fmc_token', token);
    setUser(userData);
  };

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await loginApi({ email, password });
      persist({ ...data.user, sellerId: data.sellerId }, data.token);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data } = await registerApi(payload);
      persist({ ...data.user, sellerId: data.sellerId }, data.token);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fmc_user');
    localStorage.removeItem('fmc_token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await updateProfileApi(payload);
    const merged = { ...user, ...data.user };
    localStorage.setItem('fmc_user', JSON.stringify(merged));
    setUser(merged);
    return data;
  }, [user]);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, loading, login, register, logout, updateProfile }),
    [user, loading, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
