import React, { useState, useEffect } from 'react';

export type TutorialMode = 'customer' | 'admin';

interface TutorialStep {
  title: string;
  badge: string;
  speech: string;
  highlightText?: string;
  icon: string;
  actionButtonText?: string;
  actionTargetId?: string;
  tips?: string;
}

interface InteractiveTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: TutorialMode;
  isAdmin?: boolean;
  onNavigateSection?: (sectionId: string) => void;
  onOpenAdminPanel?: () => void;
}

const CUSTOMER_STEPS: TutorialStep[] = [
  {
    icon: '🌸',
    badge: 'Paso 1 de 8 • Bienvenida',
    title: '¡Hola corazón! Soy Liliana 🌸',
    speech:
      '¡Te doy la más cariñosa bienvenida a mi tienda virtual de joyería y accesorios artesanales! He preparado esta guía para que comprar sea súper fácil y seguro para ti o tu familia, como si estuviéramos charlando en persona en mi taller.',
    highlightText: '✨ Joyería femenina hecha a mano • Baño de oro de alta durabilidad • Envíos a todo el país',
    tips: 'Diseñé este sistema para que nadie se confunda al navegar, especialmente si no eres muy fanática de la tecnología.',
    actionButtonText: 'Cómo acceder a tu cuenta ➔',
    actionTargetId: 'inicio',
  },
  {
    icon: '🔐',
    badge: 'Paso 2 de 8 • Acceder',
    title: 'Botón "Acceder" para tu Cuenta y Gestión 🔐',
    speech:
      'En la barra superior encontrarás el botón "Acceder". Si eres clienta, puedes iniciar sesión con Google o tu correo para agilizar tus compras. Y si eres administradora, desde allí ingresarás al panel para crear joyas, editar precios y gestionar tus pedidos.',
    highlightText: '🔑 Acceso seguro con Google o contraseña con cifrado avanzado.',
    tips: '💡 No es obligatorio registrarse para comprar; siempre puedes pedir directamente por WhatsApp.',
    actionButtonText: 'Conocer las colecciones ➔',
    actionTargetId: 'catalogo',
  },
  {
    icon: '📿',
    badge: 'Paso 3 de 8 • Colecciones',
    title: 'Encuentra tus joyas por Colección 📿',
    speech:
      'En la parte superior verás botones con flores y joyas: "Aretes y Candongas", "Collares y Gargantillas", "Pulseras", "Anillos" y "Bolsos". Al tocar cualquiera de ellos, la tienda te mostrará únicamente ese tipo de joya.',
    highlightText: '🔘 Toca "Todos los productos" para volver a ver el catálogo completo en cualquier instante.',
    tips: '💡 Consejo de Liliana: Toca una categoría para ver solo lo que buscas sin tener que bajar tanto en la pantalla.',
    actionButtonText: 'Ver cómo funciona el buscador ➔',
    actionTargetId: 'catalogo',
  },
  {
    icon: '🔍',
    badge: 'Paso 4 de 8 • Búsqueda',
    title: '¿Buscas algo específico? Usa la Lupa 🔍',
    speech:
      '¿Viste una foto en redes o buscas algo en especial como "perlas", "dorado", "candongas" o un código como "ART-001"? Solo toca la barra blanca de búsqueda, escribe la palabra y los accesorios aparecerán al instante.',
    highlightText: '⚡ Búsqueda rápida en tiempo real por nombre, estilo o código SKU.',
    tips: '💡 Si te equivocas al escribir, presiona la pequeña "✕" en la barra de búsqueda para ver todo otra vez.',
    actionButtonText: 'Aprender sobre fotos y precios ➔',
    actionTargetId: 'catalogo',
  },
  {
    icon: '💎',
    badge: 'Paso 5 de 8 • Joyas & Precios',
    title: 'Fotos reales con Zoom, precios y stock 💎',
    speech:
      'Cada accesorio cuenta con su fotografía real que puedes pulsar para hacerle zoom y ver cada detalle artesanal, su precio claro en pesos colombianos y el stock disponible. Si te encanta, solo presiona "+ Agregar a mi bolsa".',
    highlightText: '✨ Si ves una pieza que dice "Vendida", puedes presionar "Mandar a Elaborar" para fabricártela bajo pedido.',
    tips: '💡 Cada pieza es única y cuidada con esmero para garantizar que brille con elegancia.',
    actionButtonText: 'Cómo revisar tu bolsa de compras ➔',
  },
  {
    icon: '🛍️',
    badge: 'Paso 6 de 8 • Bolsa de Compras',
    title: 'Tu Bolsa de Compras siempre a la vista 🛍️',
    speech:
      'Arriba a la derecha encontrarás el botón de tu bolsa con un círculo que te indica cuántas joyas has seleccionado. Tócalo en cualquier momento para revisar tu pedido, sumar más unidades o retirar lo que ya no desees.',
    highlightText: '📦 Puedes sumar varios accesorios en un solo pedido para pagar un único envío.',
    tips: '💡 Tu selección se guarda en tu dispositivo para que no pierdas lo que elegiste si se te apaga el celular.',
    actionButtonText: 'Conocer el botón de acción rápida ➔',
  },
  {
    icon: '🧭',
    badge: 'Paso 7 de 8 • Navegación Rápida',
    title: 'Botón de Acción Rápida: Navegar arriba, abajo o al catálogo 🧭',
    speech:
      'Al deslizar la página verás un botón flotante con una brújula que dice "Ir a...". Al tocarlo, se despliega un menú rápido con 4 opciones clave: "Volver al Inicio ⬆️" (para subir arriba de inmediato), "Ir al Catálogo 💎", "Ver Tutorial 🎓" y "Contacto & Pie 📍" para no tener que deslizar tanto con el dedo.',
    highlightText: '⚡ Desplazamiento instantáneo y suave hacia cualquier sección de la tienda.',
    tips: '💡 Es la forma más rápida y cómoda de explorar la tienda en celulares y computadores.',
    actionButtonText: 'Ver cómo finalizar el pedido ➔',
  },
  {
    icon: '💬',
    badge: 'Paso 8 de 8 • Pedido por WhatsApp',
    title: '¡Sin tarjetas enredadas! Pedido directo a WhatsApp 💬',
    speech:
      '¡Aquí no necesitas ingresar tarjetas de crédito ni claves bancarias difíciles! Al pulsar "Confirmar Pedido", se abrirá mi WhatsApp oficial con el listado exacto de lo que escogiste y el total. Yo misma te atenderé con gusto para acordar el envío y tu medio de pago favorito (Nequi, Daviplata o Transferencia Bancaria).',
    highlightText: '📱 Atención personalizada y cálida directa con Liliana Lombana.',
    tips: '¡Así de fácil y seguro es consentirte con nuestras joyas artesanales!',
    actionButtonText: '¡Entendido! Empezar a explorar la tienda 🎉',
  },
];

const ADMIN_STEPS: TutorialStep[] = [
  {
    icon: '👑',
    badge: 'Paso 1 de 6 • Administración',
    title: 'Centro de Control & Administración 👑',
    speech:
      '¡Hola Liliana o Administrador(a)! Este es tu panel maestro de gestión. Desde aquí tienes el control absoluto del catálogo de la tienda, pedidos de tus clientes, inventario en tiempo real y seguridad de accesos en MySQL.',
    highlightText: '🔒 Protegido con autenticación segura y cifrado PBKDF2.',
    tips: 'Puedes acceder al panel con el botón "👑 Panel Admin" en la cabecera siempre que tengas sesión activa.',
    actionButtonText: 'Ver creación de productos ➔',
  },
  {
    icon: '📸',
    badge: 'Paso 2 de 6 • Crear Productos',
    title: 'Crear y Editar Accesorios en la Nube 📸',
    speech:
      'En la pestaña "Crear Producto" puedes subir fotografías tomadas directamente desde tu celular o computador. El sistema las comprime y almacena automáticamente en la nube (Cloudinary en formato WebP ultra liviano). Define nombre, precio en COP, stock y categoría.',
    highlightText: '☁️ Almacenamiento automático en la nube con compresión inteligente WebP.',
    tips: '💡 Puedes editar cualquier producto existente haciendo clic en su botón "Editar" en el catálogo.',
    actionButtonText: 'Ver gestión de catálogo y borrado ➔',
  },
  {
    icon: '🛡️',
    badge: 'Paso 3 de 6 • Catálogo & Borrado',
    title: 'Catálogo Activo vs Archivados en Dos Vías 🛡️',
    speech:
      'En la pestaña "Catálogo" dispones de filtros para ver "Activos en Tienda", "Archivados con Pedidos" o "Todos". Cuentas con eliminación inteligente en dos vías: si el producto ya tiene ventas registradas, se archiva para no dañar tu contabilidad. Si fue creado por error sin pedidos, se borra definitivamente de MySQL.',
    highlightText: '🔄 Los productos archivados se pueden reactivar en cualquier instante con el botón "Reactivar en Tienda".',
    tips: '💡 Cuentas con buscador por SKU (ej. #ART-001) para ubicar piezas en un segundo.',
    actionButtonText: 'Ver gestión de categorías ➔',
  },
  {
    icon: '📁',
    badge: 'Paso 4 de 6 • Categorías',
    title: 'Gestión Inteligente de Categorías & Colecciones 📁',
    speech:
      'Crea nuevas colecciones (ej. "Tobilleras", "Relojes"). Puedes editar el nombre o descripción en cualquier momento, y el sistema actualizará en cascada todos los productos asociados para que no queden huérfanos. También puedes archivarlas, reactivarlas o borrarlas físicamente.',
    highlightText: '⚡ Actualización en cascada en MySQL sin romper referencias del catálogo.',
    tips: '💡 El contador del encabezado cuenta únicamente las categorías activas visibles en la tienda.',
    actionButtonText: 'Ver control de pedidos recibidos ➔',
  },
  {
    icon: '📋',
    badge: 'Paso 5 de 6 • Pedidos Recibidos',
    title: 'Seguimiento Contable de Pedidos y Ventas 📋',
    speech:
      'En "Pedidos Recibidos" puedes auditar cada compra enviada por tus clientes, con su nombre, celular, ciudad, dirección de entrega y joyas solicitadas. Puedes cambiar el estado entre Pendiente, En Preparación, Enviado o Entregado para llevar un control impecable.',
    highlightText: '📊 Transacciones ACID seguras con descuento automático y atómico de inventario.',
    tips: '💡 Al confirmar el pedido por WhatsApp con el cliente, actualiza el estado a "Enviado" para registrar tu avance.',
    actionButtonText: 'Ver seguridad y equipo ➔',
  },
  {
    icon: '🔐',
    badge: 'Paso 6 de 6 • Seguridad & Equipo',
    title: 'Seguridad de tu Cuenta y Administradores 🔐',
    speech:
      'En "Administradores" puedes autorizar a familiares o colaboradores de confianza asignándoles rol de administrador por correo electrónico, o revocar permisos. Además, puedes cambiar tu propia clave de acceso con cifrado de alto nivel PBKDF2 para mantener tu inventario y datos a salvo.',
    highlightText: '🛡️ Rate Limiting activo, cabeceras OWASP y blindaje contra ataques.',
    tips: '¡Todo listo! Tienes en tus manos una plataforma moderna, segura y fácil de administrar.',
    actionButtonText: '¡Listo! Ir a gestionar la tienda 👑',
  },
];

export const InteractiveTutorialModal: React.FC<InteractiveTutorialModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'customer',
  isAdmin = false,
  onNavigateSection,
  onOpenAdminPanel,
}) => {
  const [currentMode, setCurrentMode] = useState<TutorialMode>(initialMode);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentMode(initialMode);
      setStepIndex(0);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const steps = currentMode === 'admin' ? ADMIN_STEPS : CUSTOMER_STEPS;
  const currentStep = steps[stepIndex] || steps[0];
  const progressPercent = Math.round(((stepIndex + 1) / steps.length) * 100);
  const isLastStep = stepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleComplete = () => {
    if (currentMode === 'customer') {
      localStorage.setItem('lilis_tutorial_customer_seen', 'true');
      if (currentStep.actionTargetId && onNavigateSection) {
        onNavigateSection(currentStep.actionTargetId);
      }
    } else {
      localStorage.setItem('lilis_tutorial_admin_seen', 'true');
      if (onOpenAdminPanel) {
        onOpenAdminPanel();
      }
    }
    onClose();
  };

  const handleSwitchMode = (mode: TutorialMode) => {
    setCurrentMode(mode);
    setStepIndex(0);
  };

  return (
    <div className="tutorial-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tutorial-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* BARRA DE PROGRESO SUPERIOR */}
        <div className="tutorial-progress-bar-wrap">
          <div
            className="tutorial-progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* CABECERA CON CONTROLES */}
        <div className="tutorial-header">
          <div className="tutorial-header-left">
            <span className="tutorial-mascot-pill">
              <span className="mascot-sparkle">✨</span> Asesora Virtual Liliana
            </span>

            {/* SELECTOR DE MODALIDAD (SI ES ADMINISTRADOR) */}
            {isAdmin && (
              <div className="tutorial-mode-tabs">
                <button
                  type="button"
                  className={`tutorial-mode-tab-btn ${currentMode === 'customer' ? 'active' : ''}`}
                  onClick={() => handleSwitchMode('customer')}
                >
                  🛍️ Guía para Clientes
                </button>
                <button
                  type="button"
                  className={`tutorial-mode-tab-btn ${currentMode === 'admin' ? 'active' : ''}`}
                  onClick={() => handleSwitchMode('admin')}
                >
                  👑 Guía de Administrador
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="tutorial-close-btn"
            onClick={onClose}
            title="Cerrar / Omitir guía"
            aria-label="Cerrar tutorial"
          >
            <span className="tutorial-close-text">Omitir</span> ✕
          </button>
        </div>

        {/* CUERPO PRINCIPAL CON LA VENDEDORA Y EL GLOBO DE DIÁLOGO */}
        <div className="tutorial-body">
          {/* PERSONAJE DE LA VENDEDORA (ILUSTRACIÓN OFICIAL DE LILIANA) */}
          <div className="tutorial-mascot-showcase">
            <div className="tutorial-mascot-avatar-ring">
              <img
                src="/vendedora_avatar_circle.png"
                alt="Personaje ilustrado de la Vendedora Liliana"
                className="tutorial-mascot-img"
                onError={(e) => {
                  // Respaldo visual si no cargara
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="tutorial-mascot-caption">
              <strong>Liliana Lombana</strong>
              <span>Diseñadora & Creadora</span>
            </div>
          </div>

          {/* GLOBO DE DIÁLOGO INTERACTIVO (SPEECH BUBBLE) */}
          <div className="tutorial-speech-bubble">
            <div className="tutorial-bubble-arrow" />

            <div className="tutorial-step-badge-row">
              <span className="tutorial-step-badge">{currentStep.badge}</span>
              <span className="tutorial-step-number">
                {stepIndex + 1} de {steps.length}
              </span>
            </div>

            <h3 className="tutorial-step-title">{currentStep.title}</h3>

            <p className="tutorial-speech-text">{currentStep.speech}</p>

            {currentStep.highlightText && (
              <div className="tutorial-highlight-box">
                {currentStep.highlightText}
              </div>
            )}

            {currentStep.tips && (
              <div className="tutorial-tip-box">
                {currentStep.tips}
              </div>
            )}
          </div>
        </div>

        {/* INDICADORES DE PUNTOS INTERACTIVOS */}
        <div className="tutorial-dots-row">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`tutorial-dot ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'completed' : ''}`}
              onClick={() => setStepIndex(i)}
              title={`Ir al paso ${i + 1}`}
              aria-label={`Paso ${i + 1}`}
            />
          ))}
        </div>

        {/* BOTONERA DE NAVEGACIÓN INFERIOR */}
        <div className="tutorial-footer-actions">
          <button
            type="button"
            className="tutorial-btn-secondary"
            onClick={handlePrev}
            disabled={stepIndex === 0}
          >
            ⬅ Anterior
          </button>

          <div className="tutorial-footer-right">
            <button
              type="button"
              className="tutorial-btn-skip"
              onClick={handleComplete}
            >
              Cerrar Guía
            </button>

            <button
              type="button"
              className="tutorial-btn-primary"
              onClick={handleNext}
            >
              {currentStep.actionButtonText || (isLastStep ? '¡Entendido!' : 'Siguiente ➔')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InteractiveTutorialModal;
