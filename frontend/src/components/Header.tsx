import React from 'react';
import logo from '../../imagenes/logo_V2.svg';
import type { User } from '../types/auth';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  user: User | null;
  isAdmin: boolean;
  onOpenLogin: () => void;
  onOpenAdminPanel: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  user,
  isAdmin,
  onOpenLogin,
  onOpenAdminPanel,
  onLogout,
}) => {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        {/* LOGO & NOMBRE */}
        <a href="#inicio" className="brand-block" aria-label="Ir al inicio">
          <img src={logo} alt="Logo de Accesorios Lilis" className="brand-logo" />
          <div className="brand-text">
            <span className="brand-name">Accesorios Lilís</span>
            <span className="brand-tag">Moda & Joyería Femenina</span>
          </div>
        </a>

        {/* NAVEGACIÓN DESKTOP */}
        <nav className="header-nav" aria-label="Navegación principal">
          <a href="#inicio" className="header-nav-link">Inicio</a>
          <a href="#catalogo" className="header-nav-link">Catálogo</a>
          <a href="#nosotros" className="header-nav-link">Nuestra Historia</a>
        </nav>

        {/* GRUPO DE BOTONES DE ACCIÓN */}
        <div className="header-actions-group">
          {/* Botón WhatsApp */}
          <a
            href="https://wa.me/573174811570?text=Hola%20Liliana,%20deseo%20consultar%20sobre%20tus%20accesorios"
            target="_blank"
            rel="noopener noreferrer"
            className="header-whatsapp-btn"
            title="Escribir a WhatsApp (+57 3174811570)"
            aria-label="Escribir a WhatsApp"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
            </svg>
            <span className="header-wa-text">WhatsApp</span>
          </a>

          {/* Autenticación / Admin / Salir */}
          {user ? (
            <div className="user-profile-menu">
              {isAdmin && (
                <button
                  type="button"
                  className="admin-badge-btn"
                  onClick={onOpenAdminPanel}
                  title="Abrir panel de administración del catálogo"
                >
                  <span className="admin-btn-text-full">👑 Panel Admin</span>
                  <span className="admin-btn-text-mobile">👑 Admin</span>
                </button>
              )}
              <span className="user-greeting" title={user.email}>
                {(user?.fullName || user?.email || 'Admin').split(' ')[0]}
              </span>
              <button
                type="button"
                className="logout-action-btn"
                onClick={onLogout}
                title="Cerrar sesión / Salir"
                aria-label="Cerrar sesión"
              >
                <span className="logout-btn-text">Salir</span>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="login-trigger-btn"
              onClick={onOpenLogin}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Acceder</span>
            </button>
          )}

          {/* Botón Carrito */}
          <button
            className="cart-toggle-btn"
            type="button"
            onClick={onOpenCart}
            aria-label={`Ver carrito de compras con ${cartCount} productos`}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="cart-btn-label">Carrito</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};
