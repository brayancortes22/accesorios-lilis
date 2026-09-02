import { useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../api/config';
import type { User } from '../types/auth';

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Si hay un token guardado, podemos validar el perfil actual en segundo plano
    if (token && !user) {
      authApi
        .getMe()
        .then((profile) => {
          setUser(profile);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const saveAuthSession = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.warn('Error guardando sesión en localStorage', e);
    }
  };

  const loginWithGoogle = async (idToken: string, captchaToken?: string) => {
    try {
      setAuthLoading(true);
      const res = await authApi.loginWithGoogle({ idToken, captchaToken });
      saveAuthSession(res.token, res.user);
      setIsLoginModalOpen(false);
      return res.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithDev = async (email: string, fullName = 'Liliana Lombana') => {
    try {
      setAuthLoading(true);
      const res = await authApi.devLogin({ email, fullName });
      saveAuthSession(res.token, res.user);
      setIsLoginModalOpen(false);
      return res.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAdminPanelOpen(false);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.warn('Error al limpiar sesión', e);
    }
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(isAuthenticated && user?.role === 'Admin');

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    authLoading,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isAdminPanelOpen,
    setIsAdminPanelOpen,
    loginWithGoogle,
    loginWithDev,
    logout,
  };
}
