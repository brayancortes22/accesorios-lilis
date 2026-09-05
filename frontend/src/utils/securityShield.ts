/**
 * Escudo de Seguridad Frontend para Accesorios Lilís
 * Protege el código fuente y dificulta la inspección y copia:
 * 1. Bloqueo de menú contextual (clic derecho) para prevenir 'Inspeccionar'.
 * 2. Bloqueo de atajos de desarrollador (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S).
 * 3. Trampa anti-depurador (Anti-Debugger trap).
 * 4. Advertencia de seguridad en consola contra Self-XSS.
 */
export function initSecurityShield() {
  if (typeof window === 'undefined') return;

  const isProduction = import.meta.env.PROD;

  if (isProduction) {
    // 1. Bloquear clic derecho
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // 2. Bloquear atajos de teclado de DevTools y Ver Código Fuente
    window.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I / J / C (Windows / Linux)
      if (
        e.ctrlKey &&
        e.shiftKey &&
        (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')
      ) {
        e.preventDefault();
        return false;
      }

      // Cmd+Opt+I / J / C (Mac OS)
      if (
        e.metaKey &&
        e.altKey &&
        (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')
      ) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (Ver código fuente HTML)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
      }

      // Ctrl+S (Guardar página completa)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        return false;
      }
    });

    // 3. Trampa anti-depuración para congelar DevTools si se abren a la fuerza
    setInterval(() => {
      try {
        (function () {
          return false;
        }
        ['constructor']('debugger')());
      } catch {}
    }, 2500);
  }

  // 4. Advertencia preventiva en consola contra ataques Self-XSS
  try {
    console.log(
      '%c¡ALTO!',
      'color: #dc2626; font-size: 38px; font-weight: 900; -webkit-text-stroke: 1px black;'
    );
    console.log(
      '%cEsta consola está reservada exclusivamente para el sistema. Si alguien te indicó pegar código o comandos aquí, se trata de un intento de ataque para acceder a tu información.',
      'font-size: 14px; color: #4b5563; font-weight: 500;'
    );
  } catch {}
}
