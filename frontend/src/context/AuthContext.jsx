import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchProfile, logoutRequest } from '../services/authService';

const AuthContext = createContext();

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('erp-user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => localStorage.getItem('erp-token') || null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem('erp-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('erp-user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('erp-token', token);
    } else {
      localStorage.removeItem('erp-token');
    }
  }, [token]);

  useEffect(() => {
    let isCurrent = true;

    const restoreSession = async () => {
      if (!token) {
        setUser(null);
        setIsInitializing(false);
        return;
      }

      setIsInitializing(true);
      try {
        const response = await fetchProfile(token);
        if (isCurrent) setUser(response.data.user);
      } catch {
        if (isCurrent) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isCurrent) setIsInitializing(false);
      }
    };

    restoreSession();
    return () => {
      isCurrent = false;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      isInitializing,
      setUser,
      setToken,
      logout: async () => {
        const currentToken = token;
        setUser(null);
        setToken(null);
        localStorage.removeItem('erp-user');
        localStorage.removeItem('erp-token');

        try {
          if (currentToken) await logoutRequest(currentToken);
        } catch {
          // Local logout must still complete when the API is unavailable.
        }
      },
    }),
    [user, token, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
