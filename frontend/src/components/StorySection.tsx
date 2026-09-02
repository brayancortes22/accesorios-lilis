import React from 'react';

export const StorySection: React.FC = () => {
  return (
    <section className="story-section" id="nosotros">
      <div className="story-container">
        <div className="story-badge">
          <span>🌸 Nuestra Pasión & Tradición</span>
        </div>

        <h2 className="story-heading">
          Accesorios Lilis: Belleza, Confianza y Calidez en Algeciras
        </h2>

        <p className="story-lead">
          Detrás de cada pieza está <strong>Liliana Lombana Polania</strong>, emprendedora y apasionada
          por la moda femenina, quien atiende con cariño y dedicación en el corazón de la <strong>Galería Municipal de Algeciras (Huila)</strong>.
        </p>

        <div className="story-cards-grid">
          <div className="story-feature-card">
            <div className="feature-icon">✨</div>
            <h3>Creaciones Artesanales</h3>
            <p>Accesorios únicos 100% hechos a mano, desde aretes tejidos en Miyuki hasta collares y pulseras para cualquier ocasión.</p>
          </div>

          <div className="story-feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Atención Cercana</h3>
            <p>Asesoría personalizada por WhatsApp o directamente en nuestro punto de venta en la Galería.</p>
          </div>

          <div className="story-feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Entregas Seguras</h3>
            <p>Entregas rápidas en Algeciras, municipios cercanos y despachos coordinados a nivel regional.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
