import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { getErrorMessage } from '../utils/getErrorMessage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('codealpha_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  const logout = useCallback(() => {
    localStorage.removeItem('codealpha_token');
    setToken(null);
    setUser(null);
  }, []);

  const persistSession = useCallback((payload) => {
    localStorage.setItem('codealpha_token', payload.token);
    setToken(payload.token);
    setUser(payload.user);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.post('/auth/login', credentials);
      persistSession(data);
      return data;
    },
    [persistSession]
  );

  const register = useCallback(
    async (formData) => {
      const { data } = await api.post('/auth/register', formData);
      persistSession(data);
      return data;
    },
    [persistSession]
  );

  const refreshProfile = useCallback(async () => {
    const { data } = await api.get('/users/profile');
    setUser(data);
    return data;
  }, []);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/users/profile');
        if (active) setUser(data);
      } catch (error) {
        if (active) {
          logout();
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [logout, token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      logout,
      register,
      refreshProfile,
      setUser
    }),
    [loading, login, logout, refreshProfile, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
