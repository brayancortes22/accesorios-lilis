import { driver, type Driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Genera el encabezado HTML personalizado con la mascota de Liliana
 */
const renderLiliPopoverHeader = (title: string, badge = '🌸 Tu Asesora Liliana') => `
  <div class="tour-lili-header">
    <div class="tour-lili-avatar-wrapper">
      <img src="/vendedora_avatar_circle.png" alt="Liliana Lombana" class="tour-lili-avatar" />
      <span class="tour-lili-pulse"></span>
    </div>
    <div class="tour-lili-meta">
      <strong class="tour-lili-title">${title}</strong>
      <span class="tour-lili-badge">${badge}</span>
    </div>
  </div>
`;

/**
 * Pasos del tour guiado para Clientes (Navegación por la tienda real)
 */
const getCustomerSteps = (): DriveStep[] => [
  {
    element: '#tour-how-to-buy-btn',
    popover: {
      title: renderLiliPopoverHeader('¡Bienvenida a Accesorios Lilís! 🌸', '🌸 Hola, soy Liliana'),
      description: `
        <div class="tour-lili-content">
          <p>¡Qué alegría tenerte aquí! Te daré un breve recorrido interactivo por nuestra tienda para que descubras dónde están todas las secciones y cómo pedir tus joyas favoritas.</p>
          <div class="tour-lili-tip">💡 Puedes usar los botones <strong>Siguiente ➔</strong> o las flechas de tu teclado para avanzar.</div>
        </div>
      `,
      side: 'bottom',
      align: 'start',
      popoverClass: 'lili-driver-popover',
    },
  },
  {
    element: '#tour-category-filter',
    popover: {
      title: renderLiliPopoverHeader('Filtrar por Colecciones 📿'),
      description: `
        <div class="tour-lili-content">
          <p>Toca cualquiera de estos botones para ver sólo la colección que más te guste: <strong>Aretes, Collares, Pulseras, Anillos o Bolsos</strong>.</p>
          <p>¡Así encuentras justo lo que buscas sin tener que pasar por todo el catálogo!</p>
        </div>
      `,
      side: 'bottom',
      align: 'center',
      popoverClass: 'lili-driver-popover',
    },
  },
  {
    element: '#tour-search-box',
    popover: {
      title: renderLiliPopoverHeader('Buscador Inteligente 🔍'),
      description: `
        <div class="tour-lili-content">
          <p>¿Buscas un diseño en específico, un color o el código de tu accesorio? Escríbelo aquí y aparecerá de inmediato.</p>
          <p>También puedes buscar por palabras como <em>"oro"</em>, <em>"perlas"</em> o <em>"fiesta"</em>.</p>
        </div>
      `,
      side: 'bottom',
      align: 'center',
      popoverClass: 'lili-driver-popover',
    },
  },
  {
    element: document.getElementById('tour-first-product-card') ? '#tour-first-product-card' : '#tour-product-grid',
    popover: {
      title: renderLiliPopoverHeader('Fotos con Zoom y Compra 💎'),
      description: `
        <div class="tour-lili-content">
          <p>• 🔍 <strong>Toca la foto:</strong> Se abrirá en grande para que le hagas <strong>zoom</strong> y aprecies cada detalle artesanal.</p>
          <p>• 🛍️ <strong>Botón "+ Agregar a mi bolsa":</strong> Guarda el accesorio listo para entrega inmediata.</p>
          <p>• ✨ Si la joya ya fue vendida, verás el botón <strong>"Mandar a Elaborar"</strong> para que te la teja a mano con tus colores preferidos.</p>
        </div>
      `,
      side: 'top',
      align: 'center',
      popoverClass: 'lili-driver-popover',
    },
  },
  {
    element: '#tour-cart-btn',
    popover: {
      title: renderLiliPopoverHeader('Tu Bolsa de Compras 🛍️'),
      description: `
        <div class="tour-lili-content">
          <p>Aquí arriba siempre verás cuántas piezas llevas en tu bolsa de compras.</p>
          <p>Al tocarlo podrás revisar tu pedido, modificar cantidades y coordinar el envío local en Algeciras o a nivel nacional.</p>
        </div>
      `,
      side: 'bottom',
      align: 'end',
      popoverClass: 'lili-driver-popover',
    },
  },
  {
    element: '#tour-floating-whatsapp',
    popover: {
      title: renderLiliPopoverHeader('Atención Directa por WhatsApp 💬'),
      description: `
        <div class="tour-lili-content">
          <p>¿Tienes dudas con un accesorio, deseas consultar disponibilidad o encargar un diseño a la medida?</p>
          <p>Toca este botón en cualquier momento y hablarás directamente conmigo por WhatsApp. ¡Te asesoraré con todo el gusto!</p>
          <div class="tour-lili-congrats">🎉 ¡Listo! Ya conoces cómo navegar por nuestra tienda. ¡Disfruta tus compras!</div>
        </div>
      `,
      side: 'left',
      align: 'end',
      popoverClass: 'lili-driver-popover',
    },
  },
];

/**
 * Pasos del tour guiado para el Administrador (Dentro del Panel de Control)
 */
const getAdminSteps = (onSelectTab?: (tab: string) => void): DriveStep[] => [
  {
    element: '#tour-admin-nav-tabs',
    popover: {
      title: renderLiliPopoverHeader('Centro de Control Maestro 👑', '👑 Guía para Administradores'),
      description: `
        <div class="tour-lili-content">
          <p>¡Bienvenido(a) a tu panel administrativo! Desde esta barra superior puedes gestionar todos los aspectos del negocio en 5 módulos:</p>
          <p><strong>Crear Producto, Catálogo/Stock, Categorías, Pedidos Recibidos y Equipo Administrador</strong>.</p>
        </div>
      `,
      side: 'bottom',
      align: 'center',
      popoverClass: 'lili-driver-popover',
    },
  },
  {
    element: '#tour-admin-tab-create',
    popover: {
      title: renderLiliPopoverHeader('Subir y Crear Joyas ➕', '👑 Gestión de Catálogo'),
      description: `
        <div class="tour-lili-content">
          <p>Aquí puedes registrar nuevos accesorios. Puedes subir fotos directamente desde tu celular o computador; se optimizan y guardan en la nube de alta velocidad en formato WebP.</p>
          <p>Fija el precio en pesos COP y la cantidad en stock (1 para piezas artesanales únicas).</p>
        </div>
      `,
      side: 'bottom',
      align: 'start',
      popoverClass: 'lili-driver-popover',
      onNextClick: () => {
        onSelectTab?.('manage');
      },
    },
  },
  {
    element: '#tour-admin-tab-manage',
    popover: {
      title: renderLiliPopoverHeader('Catálogo y Eliminación en 2 Vías 📦', '👑 Protección Contable'),
      description: `
        <div class="tour-lili-content">
          <p>Visualiza todo el inventario activo y agotado. Si necesitas retirar una joya, el sistema aplica la <strong>eliminación inteligente en dos vías</strong>:</p>
          <p>• Si ya tuvo ventas históricas, se <strong>archiva de forma segura</strong> preservando los reportes contables.<br/>• Si nunca se vendió, puedes <strong>eliminarla definitivamente</strong> de la base de datos.</p>
        </div>
      `,
      side: 'bottom',
      align: 'center',
      popoverClass: 'lili-driver-popover',
      onNextClick: () => {
        onSelectTab?.('categories');
      },
    },
  },
  {
    element: '#tour-admin-tab-categories',
    popover: {
      title: renderLiliPopoverHeader('Colecciones y Categorías 📁', '👑 Organización'),
      description: `
        <div class="tour-lili-content">
          <p>Crea, edita y organiza tus colecciones de accesorios.</p>
          <p>Si editas el nombre de una categoría, todos los productos asociados se actualizan automáticamente en cascada sin perder coherencia.</p>
        </div>
      `,
      side: 'bottom',
      align: 'center',
      popoverClass: 'lili-driver-popover',
      onNextClick: () => {
        onSelectTab?.('orders');
      },
    },
  },
  {
    element: '#tour-admin-tab-orders',
    popover: {
      title: renderLiliPopoverHeader('Pedidos Recibidos & Estados 📋', '👑 Despachos & Clientes'),
      description: `
        <div class="tour-lili-content">
          <p>Supervisa todos los pedidos realizados por tus clientas. Puedes cambiar el estado en tiempo real:</p>
          <p><strong>Pendiente ➔ Empacando 📦 ➔ Enviado 🚚 ➔ Entregado 💎</strong></p>
          <p>Y con un solo clic, se abrirá WhatsApp con un mensaje redactado con cariño informándole a la clienta sobre el estado de su joya.</p>
        </div>
      `,
      side: 'bottom',
      align: 'center',
      popoverClass: 'lili-driver-popover',
      onNextClick: () => {
        onSelectTab?.('admins');
      },
    },
  },
  {
    element: '#tour-admin-tab-admins',
    popover: {
      title: renderLiliPopoverHeader('Seguridad & Administradores 👥', '👑 Blindaje'),
      description: `
        <div class="tour-lili-content">
          <p>Crea accesos para otros administradores de tu equipo y cambia tu contraseña en cualquier momento con seguridad criptográfica PBKDF2.</p>
          <div class="tour-lili-congrats">✨ ¡Todo listo! Ya dominas la administración completa de Accesorios Lilís.</div>
        </div>
      `,
      side: 'bottom',
      align: 'end',
      popoverClass: 'lili-driver-popover',
    },
  },
];

let activeDriverInstance: Driver | null = null;

export const guidedTourService = {
  /**
   * Inicia el Tour Interactivo del Cliente con foco visual spotlight y scroll
   */
  startCustomerTour: () => {
    // Si ya hay un tour corriendo, destruirlo
    if (activeDriverInstance) {
      activeDriverInstance.destroy();
    }

    // Scroll al inicio suavemente para que la primera vista sea limpia
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      const steps = getCustomerSteps();

      activeDriverInstance = driver({
        showProgress: true,
        animate: true,
        overlayColor: 'rgba(12, 8, 11, 0.82)',
        stagePadding: 8,
        stageRadius: 14,
        nextBtnText: 'Siguiente ➔',
        prevBtnText: '⬅ Anterior',
        doneBtnText: '✓ ¡Entendido!',
        allowClose: true,
        steps,
        onDestroyed: () => {
          activeDriverInstance = null;
          localStorage.setItem('lilis_tutorial_customer_seen', 'true');
        },
      });

      activeDriverInstance.drive();
    }, 250);
  },

  /**
   * Inicia el Tour Interactivo del Administrador dentro del modal de admin
   */
  startAdminTour: (onSelectTab?: (tab: string) => void) => {
    if (activeDriverInstance) {
      activeDriverInstance.destroy();
    }

    const steps = getAdminSteps(onSelectTab);

    activeDriverInstance = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(12, 8, 11, 0.82)',
      stagePadding: 8,
      stageRadius: 12,
      nextBtnText: 'Siguiente ➔',
      prevBtnText: '⬅ Anterior',
      doneBtnText: '✓ ¡Finalizar Guía!',
      allowClose: true,
      steps,
      onDestroyed: () => {
        activeDriverInstance = null;
        localStorage.setItem('lilis_tutorial_admin_seen', 'true');
      },
    });

    activeDriverInstance.drive();
  },

  /**
   * Detiene cualquier tour activo
   */
  stopTour: () => {
    if (activeDriverInstance) {
      activeDriverInstance.destroy();
      activeDriverInstance = null;
    }
  },
};

export default guidedTourService;
