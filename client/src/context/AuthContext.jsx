import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('se_token');
    const savedUser = localStorage.getItem('se_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('se_user');
      }
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = () => {
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    window.location.href = `${apiBase}/auth/google`;
  };

  const handleCallback = async (token) => {
    localStorage.setItem('se_token', token);
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      localStorage.setItem('se_user', JSON.stringify(data));
      return data;
    } catch {
      localStorage.removeItem('se_token');
      return null;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('se_token');
    localStorage.removeItem('se_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, handleCallback, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
