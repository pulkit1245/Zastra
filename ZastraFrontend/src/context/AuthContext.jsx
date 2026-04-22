import { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('zastra_token'));
  const [userId, setUserId] = useState(() => localStorage.getItem('zastra_user_id'));
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authService.login({ email, password });
      localStorage.setItem('zastra_token', data.token);
      localStorage.setItem('zastra_user_id', data.userId);
      setToken(data.token);
      setUserId(data.userId);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const { data } = await authService.register({ username, email, password });
      localStorage.setItem('zastra_token', data.token);
      localStorage.setItem('zastra_user_id', data.userId);
      setToken(data.token);
      setUserId(data.userId);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('zastra_token');
    localStorage.removeItem('zastra_user_id');
    setToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
