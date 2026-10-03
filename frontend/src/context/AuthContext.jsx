import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchProfile, logoutRequest, refreshRequest } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isCurrent = true;

    const saveSession = (accessToken, nextRefreshToken, profileUser) => {
      if (!accessToken || !profileUser) {
        throw new Error('La respuesta de autenticación está incompleta');
      }
      if (!isCurrent) return;

      localStorage.setItem('erp-token', accessToken);
      localStorage.setItem('erp-user', JSON.stringify(profileUser));
      if (nextRefreshToken) {
        localStorage.setItem('erp-refresh-token', nextRefreshToken);
      } else {
        localStorage.removeItem('erp-refresh-token');
      }

      setToken(accessToken);
      setRefreshToken(nextRefreshToken || null);
      setUser(profileUser);
      setStatus('authenticated');
    };

    const restoreSession = async () => {
      const storedToken = localStorage.getItem('erp-token');
      const storedRefreshToken = localStorage.getItem('erp-refresh-token');

      if (!storedToken && !storedRefreshToken) {
        localStorage.removeItem('erp-user');
        if (isCurrent) {
          setUser(null);
          setToken(null);
          setRefreshToken(null);
          setStatus('unauthenticated');
        }
        return;
      }

      try {
        let accessToken = storedToken;
        let nextRefreshToken = storedRefreshToken;
        let profileUser;

        if (storedToken) {
          try {
            const profileResponse = await fetchProfile(storedToken);
            profileUser = profileResponse?.data?.user;
          } catch (error) {
            if (!storedRefreshToken) throw error;
          }
        }

        if (!profileUser && storedRefreshToken) {
          const refreshed = await refreshRequest(storedRefreshToken);
          accessToken = refreshed?.data?.accessToken || refreshed?.data?.token;
          nextRefreshToken = refreshed?.data?.refreshToken;
          profileUser = refreshed?.data?.user;
        }

        saveSession(accessToken, nextRefreshToken, profileUser);
      } catch {
        if (isCurrent) {
          localStorage.removeItem('erp-user');
          localStorage.removeItem('erp-token');
          localStorage.removeItem('erp-refresh-token');
          setUser(null);
          setToken(null);
          setRefreshToken(null);
          setStatus('unauthenticated');
        }
      }
    };

    restoreSession();
    return () => {
      isCurrent = false;
    };
  }, []);

  const setSession = useCallback((nextToken, nextUser, nextRefreshToken) => {
    if (!nextToken || !nextUser) {
      throw new Error('La sesión requiere un token y un usuario');
    }

    localStorage.setItem('erp-token', nextToken);
    localStorage.setItem('erp-user', JSON.stringify(nextUser));
    if (nextRefreshToken) {
      localStorage.setItem('erp-refresh-token', nextRefreshToken);
    } else {
      localStorage.removeItem('erp-refresh-token');
    }
    setToken(nextToken);
    setRefreshToken(nextRefreshToken || null);
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    const currentToken = token;
    const currentRefreshToken = refreshToken;

    try {
      if (currentToken) {
        await logoutRequest(currentToken, currentRefreshToken);
      }
    } finally {
      localStorage.removeItem('erp-user');
      localStorage.removeItem('erp-token');
      localStorage.removeItem('erp-refresh-token');
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setStatus('unauthenticated');
    }
  }, [token, refreshToken]);

  const value = useMemo(
    () => ({ user, token, refreshToken, status, setSession, logout }),
    [user, token, refreshToken, status, setSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
