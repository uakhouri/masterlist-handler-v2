import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import axiosClient, { extractErrorMessage } from '../api/axiosClient';
import { isTokenExpired } from '../utils/jwt';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('token');
    return stored && !isTokenExpired(stored) ? stored : null;
  });
  const [user, setUser] = useState(() => (token ? readStoredUser() : null));

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    try {
      const res = await axiosClient.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      return { success: false, message: extractErrorMessage(err, 'Login failed') };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await axiosClient.post('/auth/register', { name, email, password });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      return { success: false, message: extractErrorMessage(err, 'Registration failed') };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, register, logout }),
    [token, user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
