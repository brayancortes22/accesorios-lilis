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
                  <strong>Taller & Punto de Venta</strong>
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
                  "Elaboro cada accesorio a mano en mi taller hogareño con la misma ilusión y delicadeza que si fuera para mi propia familia."
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
                Cada joya de <strong>Accesorios Lilís</strong> nace en nuestro taller artesanal en Algeciras (Huila). 
                Confeccionamos cada arete, pulsera y collar pieza por pieza, y los fines de semana llevamos nuestras creaciones 
                al carrito de exhibición en la Galería Municipal para brindarte una atención cercana, cálida y personalizada.
              </p>
            </div>

            {/* 3 PILARES EN TARJETAS MODERNAS */}
            <div className="story-features-list">
              <div className="story-feature-card">
                <div className="feature-card-icon-box pink-theme">
                  <span>💎</span>
                </div>
                <div className="feature-card-text">
                  <h4>100% Hecho a Mano en Casa</h4>
                  <p>Diseños propios y tejidos artesanales exclusivos confeccionados con esmero en nuestro taller hogareño.</p>
                </div>
              </div>

              <div className="story-feature-card">
                <div className="feature-card-icon-box warm-theme">
                  <span>🛒</span>
                </div>
                <div className="feature-card-text">
                  <h4>Exhibición Fin de Semana</h4>
                  <p>Encuentra nuestro carrito artesanal los sábados y domingos en la Galería Municipal para probarte tus joyas favoritas.</p>
                </div>
              </div>

              <div className="story-feature-card">
                <div className="feature-card-icon-box green-theme">
                  <span>🚀</span>
                </div>
                <div className="feature-card-text">
                  <h4>Entregas Rápidas & Envíos</h4>
                  <p>Entregas locales en Algeciras, coordinación directa por WhatsApp y envíos seguros a todo el Huila y Colombia.</p>
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
                <span>Taller & Punto en Galería Municipal • Algeciras</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECCIÓN DE UBICACIÓN & MAPA INTERACTIVO DE GOOGLE MAPS
            ========================================================================= */}
        <div className="story-locations-showcase">
          <div className="story-locations-header">
            <span className="locations-badge">
              <span className="badge-pin">📍</span>
              <span>Ubicación Oficial en Google Maps</span>
            </span>
            <h3 className="locations-title">¿Dónde se Crean y Dónde Encuentras Nuestras Joyas?</h3>
            <p className="locations-description">
              La magia empieza en nuestro taller hogareño donde Liliana elabora a mano cada joya, y los fines de semana te esperamos en la Galería Municipal con nuestro carrito artesanal.
            </p>
          </div>

          <div className="story-locations-grid">
            {/* MAPA OFICIAL EMBEBIDO DE GOOGLE MAPS */}
            <div className="story-map-frame-card">
              <div className="map-frame-top-bar">
                <div className="map-badge-group">
                  <span className="map-pulse-dot" />
                  <strong>Accesorios Lilís en Google Maps</strong>
                </div>
                <a
                  href="https://www.google.com/maps?cid=13396417387431273926"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-maps-external-btn"
                  title="Abrir ruta en Google Maps"
                >
                  Abrir Mapa ➔
                </a>
              </div>
              <div className="map-responsive-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3985.915894297896!2d-75.30570159999999!3d2.5343337999999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3b47003911e85f%3A0xb9e958c2a8d6a5c6!2sAccesorios%20lilis!5e0!3m2!1sen!2sco!4v1788402279322!5m2!1sen!2sco"
                  width="100%"
                  height="340"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Ubicación oficial de Accesorios Lilís en Google Maps"
                />
              </div>
            </div>

            {/* TARJETAS DE LAS DOS SEDES */}
            <div className="story-locations-cards-column">
              <div className="location-info-card workshop-theme">
                <div className="location-card-icon-box">🏡</div>
                <div className="location-card-body">
                  <span className="location-type-tag">Taller Artesanal & Confección</span>
                  <h4>El Hogar de la Creación</h4>
                  <p>
                    Aquí se elabora a mano cada par de aretes, collar y pulsera. Es el punto registrado oficialmente en Google Maps donde coordinamos pedidos personalizados y despachos.
                  </p>
                  <div className="location-card-footer">
                    <span className="loc-chip">📍 Algeciras, Huila</span>
                    <span className="loc-chip">✨ 100% Hecho a Mano</span>
                  </div>
                </div>
              </div>

              <div className="location-info-card market-theme">
                <div className="location-card-icon-box">🛒</div>
                <div className="location-card-body">
                  <span className="location-type-tag market-tag">Punto de Venta Fin de Semana</span>
                  <h4>Carrito en la Galería Municipal</h4>
                  <p>
                    Los fines de semana, Liliana exhibe las piezas en su carrito artesanal en la <strong>Galería Municipal de Algeciras</strong>. ¡Ven a probarte los accesorios y a compartir con nosotras!
                  </p>
                  <div className="location-card-footer">
                    <span className="loc-chip">🗓️ Sábados y Domingos</span>
                    <span className="loc-chip">👋 Atención Presencial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
