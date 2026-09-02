import React from 'react';
import logo from '../../imagenes/logo_V2.svg';
import type { LegalTabType } from './LegalModal';

interface FooterProps {
  onOpenLegal: (tab: LegalTabType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      <div className="footer-container">
        {/* COL 1: MARCA & IDENTIDAD */}
        <div className="footer-brand-col">
          <div className="footer-brand-group">
            <img src={logo} alt="Logo de Accesorios Lilis" className="footer-logo" />
            <div>
              <span className="footer-title">Accesorios Lilís</span>
              <p className="footer-sub">Moda & Joyería Femenina</p>
            </div>
          </div>
          <p className="footer-desc">
            Joyería y accesorios artesanales pensados para resaltar tu belleza y confianza. Visítanos en nuestro punto de atención en Algeciras (Huila).
          </p>
        </div>

        {/* COL 2: NAVEGACIÓN */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">📍 Navegación</h4>
          <ul className="footer-nav-list">
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#catalogo">Catálogo Completo</a></li>
            <li><a href="#nosotros">Nuestra Historia</a></li>
            <li>
              <button type="button" onClick={() => onOpenLegal('thanks')}>
                🌸 Agradecimientos
              </button>
            </li>
          </ul>
        </div>

        {/* COL 3: LEGAL & GARANTÍA */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">⚖️ Marco Legal</h4>
          <ul className="footer-nav-list">
            <li>
              <button type="button" onClick={() => onOpenLegal('terms')}>
                📜 Términos & Condiciones
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onOpenLegal('warranty')}>
                💎 Garantía & Cuidados
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onOpenLegal('privacy')}>
                🔒 Privacidad de Datos
              </button>
            </li>
          </ul>
        </div>

        {/* COL 4: CONTACTO & UBICACIÓN */}
        <div className="footer-contact-col">
          <h4 className="footer-col-title">💬 Contacto Directo</h4>
          <div className="footer-contact-items">
            <p><strong>Propietaria:</strong> Liliana Lombana Polania</p>
            <p><strong>Ubicación:</strong> Galería Municipal, Algeciras (Huila, Colombia)</p>
            <div className="footer-social-buttons">
              <a
                href="https://wa.me/573174811570?text=Hola%20Liliana,%20deseo%20hacerte%20una%20consulta"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link whatsapp"
              >
                💬 WhatsApp (+57 317 481 1570)
              </a>
              <a
                href="https://www.facebook.com/liliana.lombana.1"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link facebook"
              >
                📘 Facebook Liliana Lombana
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BOTTOM & COPYRIGHT */}
      <div className="footer-bottom">
        <p>© {currentYear} Accesorios Lilís. Todos los derechos reservados. Algeciras, Huila, Colombia.</p>
        <div className="footer-legal-quick-links">
          <button type="button" className="footer-legal-btn" onClick={() => onOpenLegal('terms')}>
            Términos
          </button>
          <span>•</span>
          <button type="button" className="footer-legal-btn" onClick={() => onOpenLegal('warranty')}>
            Garantía
          </button>
          <span>•</span>
          <button type="button" className="footer-legal-btn" onClick={() => onOpenLegal('privacy')}>
            Privacidad
          </button>
          <span>•</span>
          <button type="button" className="footer-legal-btn" onClick={() => onOpenLegal('thanks')}>
            Agradecimientos
          </button>
        </div>
      </div>
    </footer>
  );
};
