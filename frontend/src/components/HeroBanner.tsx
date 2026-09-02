import React from 'react';
import banner from '../../imagenes/baneer.svg';

export const HeroBanner: React.FC = () => {
  return (
    <section className="hero" id="inicio">
      <div className="hero-content">
        <div className="eyebrow-pill">
          <span className="sparkle-icon">✨</span>
          <span>Galería Municipal de Algeciras, Huila</span>
        </div>

        <h1 className="hero-title">
          Accesorios para dama con <span className="highlight">elegancia y distinción</span>
        </h1>

        <p className="hero-description">
          Realza tu estilo con aretes, collares, pulseras y bolsos diseñados para cada momento especial.
          Atención personalizada directamente con Liliana Lombana y entregas locales seguras.
        </p>

        <div className="hero-actions">
          <a href="#catalogo" className="cta-button">
            <span>Explorar catálogo</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a href="#nosotros" className="secondary-button">
            Conoce a Liliana
          </a>
        </div>

        <div className="hero-stats" aria-label="Estadísticas de la tienda">
          <div className="stat-item">
            <strong className="stat-number">1.200+</strong>
            <span className="stat-label">Clientes felices</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <strong className="stat-number">48h</strong>
            <span className="stat-label">Entrega local</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <strong className="stat-number">100%</strong>
            <span className="stat-label">Garantía y amor</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-banner-card">
          <img src={banner} alt="Ilustración y colección de Accesorios Lilis" className="hero-banner-img" />
          <div className="hero-floating-badge badge-top-right">
            <span>💎 Oro Laminado & Acero</span>
          </div>
          <div className="hero-floating-badge badge-bottom-left">
            <span>🛍️ Pide por WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  );
};
