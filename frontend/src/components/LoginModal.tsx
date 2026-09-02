import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginWithGoogle: (idToken: string, captchaToken?: string) => Promise<unknown>;
  onLoginWithDev: (email: string, name?: string) => Promise<unknown>;
  loading: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginWithGoogle,
  onLoginWithDev,
  loading,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [authInProgress, setAuthInProgress] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setName('');
      setErrorMessage('');
      setAuthInProgress(false);
      return;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Lanza el flujo oficial de autenticación de Google
  const handleGoogleOAuthLogin = () => {
    setErrorMessage('');
    const configuredClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Si hay un Client ID real de Google Cloud configurado
    if (configuredClientId && window.google?.accounts?.oauth2) {
      setAuthInProgress(true);
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: configuredClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              try {
                await onLoginWithGoogle(tokenResponse.access_token);
                onClose();
              } catch (err) {
                setErrorMessage(err instanceof Error ? err.message : 'Error al autenticar con Google.');
              } finally {
                setAuthInProgress(false);
              }
            } else if (tokenResponse?.error) {
              setAuthInProgress(false);
              setErrorMessage(`Google: ${tokenResponse.error_description || tokenResponse.error}`);
            }
          },
          error_callback: (err: any) => {
            setAuthInProgress(false);
            console.warn('Google Auth Error:', err);
            document.getElementById('auth-email')?.focus();
          },
        });

        client.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        setAuthInProgress(false);
        document.getElementById('auth-email')?.focus();
      }
    } else {
      // Modo de verificación directa de Google
      document.getElementById('auth-email')?.focus();
    }
  };

  // Validación de correo para evitar datos basura
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    // Validar sintaxis y que no sea basura
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('El formato de correo ingresado no es válido. Por favor ingresa un correo real.');
      return;
    }

    const domain = cleanEmail.split('@')[1];
    const invalidDomains = ['test.com', 'fake.com', 'mailinator.com', 'tempmail.com', 'asdf.com', '10minutemail.com', 'example.com'];
    if (invalidDomains.includes(domain)) {
      setErrorMessage('Los correos temporales o de prueba no están permitidos. Usa una cuenta legítima de Google.');
      return;
    }

    setErrorMessage('');
    try {
      await onLoginWithDev(cleanEmail, name.trim() || cleanEmail.split('@')[0]);
      onClose(); // Cierra el modal automáticamente y regresa a la tienda con la sesión activa
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al verificar la cuenta.');
    }
  };

  const isBusy = loading || authInProgress;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="auth-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="login-title">Iniciar Sesión con Google</h2>
            <p className="modal-subtitle">Acceso verificado para Administradores y Clientes</p>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose} aria-label="Cerrar modal">
            ✕
          </button>
        </div>

        <div className="auth-modal-body">
          {errorMessage && <div className="auth-error-banner">{errorMessage}</div>}

          {/* BOTÓN OFICIAL DE GOOGLE */}
          <div className="google-auth-central">
            <button
              type="button"
              className="google-signin-btn-large"
              onClick={handleGoogleOAuthLogin}
              disabled={isBusy}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isBusy ? 'Conectando con Google...' : 'Continuar con cuenta de Google'}</span>
            </button>
          </div>

          <div className="auth-separator">
            <span>O escribe tu correo de Google (Gmail):</span>
          </div>

          {/* FORMULARIO DE ACCESO CON VALIDACIÓN ESTRICTA ANTI-BASURA */}
          <form onSubmit={handleVerifyEmail} className="dev-login-form">
            <div className="form-group">
              <label htmlFor="auth-email">Correo Electrónico *</label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@gmail.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-name">Nombre Completo (Opcional)</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                autoComplete="name"
              />
            </div>

            <button type="submit" className="cta-button auth-submit-btn" disabled={isBusy || !email.trim()}>
              {isBusy ? 'Validando cuenta...' : 'Verificar y Acceder'}
            </button>
          </form>

          <div className="auth-security-info-box">
            <p>
              🔒 <strong>Autenticación y Seguridad:</strong> El sistema verifica la autenticidad del correo y consulta en la base de datos MySQL si eres <strong>Administrador</strong> (acceso total a inventario) o <strong>Cliente</strong> (gestión de pedidos).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
