import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for stored token and fetch user
  useEffect(() => {
    const token = localStorage.getItem('vma-token');
    if (token) {
      api.getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('vma-token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (identifier, password) => {
    const res = await api.login({ identifier, password });
    localStorage.setItem('vma-token', res.data.token);
    setUser(res.data.user);
    return res;
  }, []);

  const register = useCallback(async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('vma-token', res.data.token);
    setUser(res.data.user);
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('vma-token');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
