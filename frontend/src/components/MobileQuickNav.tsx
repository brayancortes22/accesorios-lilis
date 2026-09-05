import React, { useState, useEffect, useRef, useCallback } from 'react';

export const MobileQuickNav: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitorear posición de scroll para mostrar el botón sólo cuando se haya bajado
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Aparece tras hacer scroll pasando el hero (~250px)
          const scrolledPastHero = window.scrollY > 250;
          setIsVisible(scrolledPastHero);
          if (!scrolledPastHero) {
            setIsOpen(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar el menú si se hace clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const scrollToSection = useCallback((targetId?: string) => {
    setIsOpen(false);

    if (!targetId || targetId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const el = document.getElementById(targetId);
    if (el) {
      // Offset de 65px para no quedar tapado por el header fijo
      const headerOffset = 65;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className={`mobile-quick-nav-wrapper ${isOpen ? 'is-open' : ''}`}
      role="region"
      aria-label="Navegación rápida de la página"
    >
      {/* Telón sutil de fondo cuando el menú está abierto para facilitar cierre con un toque */}
      {isOpen && (
        <div
          className="mobile-quick-nav-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Opciones del menú Speed Dial desplegables hacia arriba */}
      <div className={`mobile-quick-nav-menu ${isOpen ? 'open' : ''}`} role="menu">
        {/* Opción 1: Volver al Inicio */}
        <button
          type="button"
          role="menuitem"
          className="quick-nav-item item-top"
          onClick={() => scrollToSection('top')}
          title="Subir al inicio de la página"
        >
          <span className="quick-nav-icon">⬆️</span>
          <span className="quick-nav-text">Volver al Inicio</span>
        </button>

        {/* Opción 2: Ir al Catálogo de Joyas */}
        <button
          type="button"
          role="menuitem"
          className="quick-nav-item item-catalog"
          onClick={() => scrollToSection('catalogo')}
          title="Ver catálogo y colecciones"
        >
          <span className="quick-nav-icon">💎</span>
          <span className="quick-nav-text">Ir al Catálogo</span>
        </button>

        {/* Opción 3: Ir al Footer / Contacto */}
        <button
          type="button"
          role="menuitem"
          className="quick-nav-item item-footer"
          onClick={() => scrollToSection('footer')}
          title="Ir a contacto, ubicación y pie de página"
        >
          <span className="quick-nav-icon">📍</span>
          <span className="quick-nav-text">Contacto & Pie</span>
        </button>
      </div>

      {/* Botón Flotante Principal (FAB) */}
      <button
        type="button"
        className={`mobile-quick-nav-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Cerrar menú de navegación rápida' : 'Abrir navegación rápida hacia inicio, catálogo o footer'}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="fab-icon-container">
          {/* Icono interactivo: Brújula / Navegación o Cruz de cierre */}
          <span className={`fab-icon-nav ${isOpen ? 'hidden' : 'visible'}`}>
            🧭
          </span>
          <span className={`fab-icon-close ${isOpen ? 'visible' : 'hidden'}`}>
            ✕
          </span>
        </div>
        <span className="fab-label-text">
          {isOpen ? 'Cerrar' : 'Ir a...'}
        </span>
      </button>
    </div>
  );
};
