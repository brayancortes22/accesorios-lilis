import React from 'react';
import historiaImg from '../../imagenes/historia_artesanal.jpg';

export const StorySection: React.FC = () => {
  return (
    <section className="story-section" id="nosotros" aria-labelledby="story-title">
      <div className="story-container">
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="story-header-center">
          <span className="story-badge">
            <span className="story-badge-dot">🌸</span>
            <span>Nuestra Pasión & Tradición Huilense</span>
          </span>
          <h2 id="story-title" className="story-main-title">
            Accesorios Lilís: <span className="text-gradient">Belleza, Confianza y Calidez</span> en Algeciras
          </h2>
          <p className="story-subtitle">
            Cada creación nace de manos dedicadas que transforman hilos, perlas y destellos en piezas que cuentan historias y celebran tu esencia femenina.
          </p>
        </div>

        {/* CONTENIDO PRINCIPAL EN 2 COLUMNAS */}
        <div className="story-grid-layout">
          {/* COLUMNA VISUAL: FOTOGRAFÍA EDITORIAL Y TARJETAS FLOTANTES */}
          <div className="story-visual-column">
            <div className="story-image-card">
              <img
                src={historiaImg}
                alt="Liliana Lombana elaborando piezas de joyería artesanal en su taller"
                className="story-main-photo"
                loading="lazy"
              />
              <div className="story-photo-gradient-overlay" />

              {/* FLOATING BADGE SUPERIOR */}
              <div className="story-floating-badge">
                <span className="floating-badge-icon">📍</span>
                <div>
                  <strong>Galería Municipal</strong>
                  <span>Algeciras, Huila</span>
                </div>
              </div>

              {/* FLOATING GLASS CARD INFERIOR */}
              <div className="story-floating-glass-card">
                <div className="glass-card-header">
                  <div className="glass-card-avatar">LL</div>
                  <div>
                    <h4 className="glass-card-name">Liliana Lombana Polania</h4>
                    <span className="glass-card-role">Artesana & Fundadora</span>
                  </div>
                </div>
                <p className="glass-card-quote">
                  "Elaboro cada accesorio con la misma ilusión y delicadeza que si fuera para mí misma o para alguien de mi familia."
                </p>
                <div className="glass-card-stats">
                  <span className="stat-pill">✨ 100% Hecho a Mano</span>
                  <span className="stat-pill">❤️ +1.000 Clientes Satisfechos</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: BIO & PILARES */}
          <div className="story-pillars-column">
            <div className="story-story-bio">
              <h3 className="story-bio-title">El Arte de la Joyería Hecha con Amor</h3>
              <p className="story-bio-paragraph">
                Desde nuestro punto de atención en el corazón de la <strong>Galería Municipal de Algeciras (Huila)</strong>, 
                brindamos una experiencia cercana y personalizada. Nos especializamos en la confección minuciosa de accesorios femeninos que realzan tu estilo natural con elegancia, durabilidad y autenticidad.
              </p>
            </div>

            {/* 3 PILARES EN TARJETAS MODERNAS */}
            <div className="story-features-list">
              <div className="story-feature-card">
                <div className="feature-card-icon-box pink-theme">
                  <span>💎</span>
                </div>
                <div className="feature-card-text">
                  <h4>100% Hecho a Mano</h4>
                  <p>Diseños propios y tejidos artesanales exclusivos en aretes, collares, pulseras y bolsos confeccionados con esmero pieza por pieza.</p>
                </div>
              </div>

              <div className="story-feature-card">
                <div className="feature-card-icon-box warm-theme">
                  <span>🤝</span>
                </div>
                <div className="feature-card-text">
                  <h4>Atención Cálida & Personalizada</h4>
                  <p>Asesoría directa y dedicada por WhatsApp o presencialmente en nuestro puesto de la Galería para ayudarte a elegir la joya ideal.</p>
                </div>
              </div>

              <div className="story-feature-card">
                <div className="feature-card-icon-box green-theme">
                  <span>🚀</span>
                </div>
                <div className="feature-card-text">
                  <h4>Entregas Rápidas & Seguras</h4>
                  <p>Entregas puntuales en el casco urbano de Algeciras, municipios vecinos y despachos protegidos a todo el Huila y Colombia.</p>
                </div>
              </div>
            </div>

            {/* BARRA DE ACCIÓN DIRECTA */}
            <div className="story-action-strip">
              <a
                href="https://wa.me/573174811570?text=Hola%20Liliana,%20deseo%20conocer%20m%C3%A1s%20sobre%20tus%20accesorios%20y%20piezas%20artesanales"
                target="_blank"
                rel="noopener noreferrer"
                className="story-cta-whatsapp-btn"
                title="Escribir directamente a WhatsApp (+57 3174811570)"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
                </svg>
                <span>Hablar con Liliana por WhatsApp</span>
              </a>

              <div className="story-location-hint">
                <span className="hint-pin">📍</span>
                <span>Punto físico en la <strong>Galería Municipal</strong> de Algeciras</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
