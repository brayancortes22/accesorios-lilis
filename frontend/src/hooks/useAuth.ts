import { useState, useEffect, useCallback } from 'react';
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

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAdminPanelOpen(false);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.warn('Error al limpiar sesión', e);
    }

    // Revocar cookie en el backend si está configurada
    authApi.logout().catch(() => {});
  }, []);

  // Escuchar evento global de error 401 emitido por apiFetch
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('lilis:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('lilis:unauthorized', handleUnauthorized);
  }, [logout]);

  // Al montar el hook, validar la sesión contra el endpoint /api/auth/me si existe token guardado
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!savedToken) return;

    authApi
      .getMe()
      .then((profile) => {
        setUser(profile);
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
        } catch (e) {
          console.warn('Error al persistir usuario en storage', e);
        }
      })
      .catch(() => {
        // Si el token ya no es válido en el backend, se limpiará vía evento 401
      });
  }, []);

  const saveAuthSession = (newToken: string, newUser: User) => {
    setUser(newUser);
    setToken(newToken);
    try {
      if (newToken) {
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      }
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

  const loginWithPassword = async (email: string, password: string, fullName = 'Liliana Lombana') => {
    try {
      setAuthLoading(true);
      const res = await authApi.loginWithPassword({ email, password, fullName });
      saveAuthSession(res.token, res.user);
      setIsLoginModalOpen(false);
      return res.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (email: string, fullName: string, password: string) => {
    try {
      setAuthLoading(true);
      const res = await authApi.register({ email, fullName, password });
      saveAuthSession(res.token, res.user);
      setIsLoginModalOpen(false);
      return res.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithDev = async (email: string, fullName = 'Liliana Lombana', password = '') => {
    return loginWithPassword(email, password, fullName);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    return authApi.changePassword({ currentPassword, newPassword });
  };

  const isAuthenticated = Boolean(user);
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
    loginWithPassword,
    register,
    loginWithDev,
    changePassword,
    logout,
  };
}
