import React, { useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import type { CheckEmailResponse } from '../types/auth';

declare global {
  interface Window {
    google?: any;
  }
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginWithGoogle: (idToken: string, captchaToken?: string) => Promise<unknown>;
  onLoginWithDev: (email: string, name?: string, password?: string) => Promise<unknown>;
  onRegister?: (email: string, name: string, password: string) => Promise<unknown>;
  loading: boolean;
}

type AuthStep = 'email' | 'existing_password' | 'new_register';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginWithGoogle,
  onLoginWithDev,
  onRegister,
  loading,
}) => {
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [authInProgress, setAuthInProgress] = useState(false);
  const [detectedUser, setDetectedUser] = useState<CheckEmailResponse | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('email');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setName('');
      setErrorMessage('');
      setInfoMessage('');
      setCheckingEmail(false);
      setAuthInProgress(false);
      setDetectedUser(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Lanza el flujo de autenticación de Google con feedback claro
  const handleGoogleOAuthLogin = () => {
    setErrorMessage('');
    setInfoMessage('');
    const configuredClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Si NO está configurado el Client ID en variables de entorno (como pasa en despliegues iniciales)
    if (!configuredClientId) {
      setErrorMessage(
        'El acceso directo con botón de Google requiere configurar la variable VITE_GOOGLE_CLIENT_ID en Vercel o en tu archivo .env. Mientras tanto, puedes continuar escribiendo tu correo a continuación.'
      );
      document.getElementById('auth-email')?.focus();
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setErrorMessage(
        'El componente de Google se está conectando o fue bloqueado por una extensión de navegador. Por favor intenta de nuevo en unos segundos o ingresa tu correo abajo.'
      );
      return;
    }

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
          setErrorMessage('No se pudo completar la autenticación con Google. Por favor intenta con tu correo.');
        },
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setAuthInProgress(false);
      setErrorMessage('Error al inicializar el servicio de Google. Ingresa con tu correo abajo.');
    }
  };

  // PASO 1: Consulta dinámica del correo en la base de datos
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    // Validar sintaxis de correo
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('El formato de correo ingresado no es válido. Por favor ingresa un correo real.');
      return;
    }

    const domain = cleanEmail.split('@')[1];
    const invalidDomains = ['test.com', 'fake.com', 'mailinator.com', 'tempmail.com', 'asdf.com', '10minutemail.com', 'example.com'];
    if (invalidDomains.includes(domain)) {
      setErrorMessage('Los correos temporales o de prueba no están permitidos. Usa una cuenta legítima de Google o proveedor confiable.');
      return;
    }

    setErrorMessage('');
    setInfoMessage('');
    setCheckingEmail(true);

    try {
      const res = await authApi.checkEmail({ email: cleanEmail });
      setDetectedUser(res);

      if (res.exists) {
        // El usuario ya existe -> Solicitar contraseña de acceso
        setName(res.fullName || cleanEmail.split('@')[0]);
        setStep('existing_password');
      } else {
        // El usuario es nuevo -> Pedir crear cuenta con contraseña y confirmación
        setName('');
        setStep('new_register');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al verificar el correo en el servidor.');
    } finally {
      setCheckingEmail(false);
    }
  };

  // PASO 2A: Inicio de sesión para usuario existente
  const handleLoginExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Por favor ingresa tu contraseña para acceder.');
      return;
    }

    setErrorMessage('');
    try {
      await onLoginWithDev(email.trim().toLowerCase(), name.trim() || email.split('@')[0], password);
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Contraseña incorrecta.');
    }
  };

  // PASO 2B: Registro de nueva cuenta con confirmación de contraseña
  const handleRegisterNew = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener como mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor asegúrate de escribir la misma en ambos campos.');
      return;
    }

    setErrorMessage('');
    try {
      if (onRegister) {
        await onRegister(email.trim().toLowerCase(), name.trim(), password);
      } else {
        await onLoginWithDev(email.trim().toLowerCase(), name.trim(), password);
      }
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al registrar la cuenta.');
    }
  };

  // Regresar al paso 1 para corregir el correo
  const handleResetToEmailStep = () => {
    setStep('email');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setInfoMessage('');
  };

  const isBusy = loading || authInProgress || checkingEmail;

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
            <h2 id="login-title">
              {step === 'email' && 'Acceso a tu Cuenta'}
              {step === 'existing_password' && '¡Hola de nuevo!'}
              {step === 'new_register' && 'Crear tu Cuenta Segura'}
            </h2>
            <p className="modal-subtitle">
              {step === 'email' && 'Identifícate con tu correo o cuenta de Google'}
              {step === 'existing_password' && 'Ingresa tu contraseña para acceder a tus pedidos'}
              {step === 'new_register' && 'Regístrate en 30 segundos para proteger tus compras'}
            </p>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose} aria-label="Cerrar modal">
            ✕
          </button>
        </div>

        <div className="auth-modal-body">
          {errorMessage && <div className="auth-error-banner">{errorMessage}</div>}
          {infoMessage && <div className="auth-info-banner">{infoMessage}</div>}

          {/* =========================================================================
              PASO 1: IDENTIFICACIÓN POR CORREO
              ========================================================================= */}
          {step === 'email' && (
            <>
              {/* BOTÓN OFICIAL DE GOOGLE */}
              <div className="google-auth-central">
                <button
                  type="button"
                  className="google-direct-btn"
                  onClick={handleGoogleOAuthLogin}
                  disabled={isBusy}
                  aria-label="Continuar con cuenta de Google"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
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
                  <span>{isBusy ? 'Conectando...' : 'Continuar con cuenta de Google'}</span>
                </button>
              </div>

              <div className="auth-separator">
                <span>O ingresa tu correo electrónico:</span>
              </div>

              <form onSubmit={handleCheckEmail} className="dev-login-form">
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
                    autoFocus
                  />
                  <span className="auth-input-hint">
                    Consultaremos si ya tienes una cuenta o si crearemos una nueva.
                  </span>
                </div>

                <button
                  type="submit"
                  className="cta-button auth-submit-btn"
                  disabled={isBusy || !email.trim()}
                >
                  {checkingEmail ? 'Consultando correo...' : 'Continuar ➔'}
                </button>
              </form>
            </>
          )}

          {/* =========================================================================
              PASO 2A: USUARIO REGISTRADO -> PEDIR CONTRASEÑA
              ========================================================================= */}
          {step === 'existing_password' && (
            <form onSubmit={handleLoginExisting} className="dev-login-form">
              {/* CHIP DE CORREO DETECTADO CON BOTÓN CAMBIAR */}
              <div className="auth-account-badge-box">
                <div className="auth-account-info">
                  <span className="auth-badge-icon">👋</span>
                  <div>
                    <strong className="auth-badge-title">{name || 'Cliente Registrado'}</strong>
                    <span className="auth-badge-email">{email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetToEmailStep}
                  className="auth-change-email-btn"
                  title="Corregir correo"
                >
                  ✏️ Cambiar
                </button>
              </div>

              <div className="form-group">
                <div className="auth-password-label-row">
                  <label htmlFor="auth-password">Tu Contraseña *</label>
                  <span className="auth-password-tip">Protegida</span>
                </div>
                <div className="auth-password-input-wrapper">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="auth-password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈 Ocultar' : '👁️ Ver'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="cta-button auth-submit-btn"
                disabled={isBusy || !password.trim()}
              >
                {isBusy ? 'Iniciando sesión...' : '🔒 Iniciar Sesión Segura'}
              </button>
            </form>
          )}

          {/* =========================================================================
              PASO 2B: USUARIO NUEVO -> CREAR CUENTA CON CONFIRMACIÓN
              ========================================================================= */}
          {step === 'new_register' && (
            <form onSubmit={handleRegisterNew} className="dev-login-form">
              {/* CHIP DE NUEVO USUARIO */}
              <div className="auth-account-badge-box new-user-theme">
                <div className="auth-account-info">
                  <span className="auth-badge-icon">✨</span>
                  <div>
                    <strong className="auth-badge-title">Nuevo Usuario</strong>
                    <span className="auth-badge-email">{email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetToEmailStep}
                  className="auth-change-email-btn"
                  title="Cambiar correo"
                >
                  ✏️ Cambiar
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="auth-reg-name">Nombre Completo *</label>
                <input
                  id="auth-reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. María Camila Rojas"
                  autoComplete="name"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <div className="auth-password-label-row">
                  <label htmlFor="auth-reg-password">Crear Contraseña *</label>
                  <span className="auth-password-tip">Mínimo 6 caracteres</span>
                </div>
                <div className="auth-password-input-wrapper">
                  <input
                    id="auth-reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈 Ocultar' : '👁️ Ver'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <div className="auth-password-label-row">
                  <label htmlFor="auth-reg-confirm">Confirmar Contraseña *</label>
                  {confirmPassword && password !== confirmPassword && (
                    <span className="auth-password-mismatch-warning">⚠️ No coinciden</span>
                  )}
                </div>
                <div className="auth-password-input-wrapper">
                  <input
                    id="auth-reg-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña exactamente"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Ver confirmación'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? '🙈 Ocultar' : '👁️ Ver'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="cta-button auth-submit-btn"
                disabled={isBusy || !name.trim() || password.length < 6 || password !== confirmPassword}
              >
                {isBusy ? 'Creando tu cuenta...' : '✨ Crear Cuenta & Acceder'}
              </button>
            </form>
          )}

          <div className="auth-security-info-box">
            <p>
              🛡️ <strong>Seguridad Garantizada:</strong> Tus datos y contraseñas están protegidos con cifrado PBKDF2 y sal criptográfica. Nadie más puede acceder a tu cuenta sin tu clave personal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
