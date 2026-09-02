import React, { useState, useEffect } from 'react';

export type LegalTabType = 'terms' | 'warranty' | 'privacy' | 'thanks';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTabType;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTabType>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="legal-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        <div className="modal-header">
          <div>
            <span className="legal-badge">⚖️ Marco Legal & Compromiso</span>
            <h2 id="legal-modal-title">Políticas, Términos y Agradecimientos</h2>
            <p className="modal-subtitle">
              Accesorios Lilís — Liliana Lombana Polania | Algeciras, Huila, Colombia
            </p>
          </div>
          <button
            type="button"
            className="close-modal-btn"
            onClick={onClose}
            aria-label="Cerrar modal de información legal"
          >
            ✕
          </button>
        </div>

        {/* TABS NAVEGACIÓN */}
        <div className="legal-nav-tabs">
          <button
            type="button"
            className={`legal-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            📜 Términos y Condiciones
          </button>
          <button
            type="button"
            className={`legal-tab-btn ${activeTab === 'warranty' ? 'active' : ''}`}
            onClick={() => setActiveTab('warranty')}
          >
            💎 Garantía y Cuidados
          </button>
          <button
            type="button"
            className={`legal-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            🔒 Privacidad de Datos
          </button>
          <button
            type="button"
            className={`legal-tab-btn ${activeTab === 'thanks' ? 'active' : ''}`}
            onClick={() => setActiveTab('thanks')}
          >
            🌸 Agradecimientos
          </button>
        </div>

        {/* CONTENIDO DE CADA TAB */}
        <div className="legal-modal-body">
          {activeTab === 'terms' && (
            <div className="legal-content-block">
              <h3>1. Términos y Condiciones de Uso y Compra</h3>
              <p className="legal-lead">
                Bienvenido a la plataforma digital de <strong>Accesorios Lilís</strong>, negocio comercial ubicado en la Galería Municipal de Algeciras (Huila), liderado por <strong>Liliana Lombana Polania</strong>.
              </p>

              <h4>1.1 Proceso de Pedidos y Coordinación</h4>
              <p>
                Este sitio web funciona como un catálogo digital interactivo. Al hacer clic en <em>"Enviar Pedido por WhatsApp"</em>, el sistema genera automáticamente un detalle estructurado con los artículos seleccionados, códigos de identificación (SKU), valores y forma de entrega para ser verificado y coordinado directamente con Liliana Lombana.
              </p>

              <h4>1.2 Métodos de Pago Aceptados</h4>
              <ul>
                <li><strong>Transferencia Digital Directa:</strong> Nequi y Daviplata al número oficial autorizado (+57 317 481 1570).</li>
                <li><strong>Transferencia Bancaria:</strong> Bancolombia a la cuenta de ahorros autorizada.</li>
                <li><strong>Pago en Efectivo Contraentrega:</strong> Válido exclusivamente para entregas presenciales en el casco urbano de Algeciras (Huila) o retiro en el puesto de la Galería Municipal.</li>
              </ul>

              <h4>1.3 Políticas de Despacho y Entrega</h4>
              <p>
                Los despachos locales en Algeciras se efectúan en un plazo estimado de 24 a 48 horas tras confirmar disponibilidad. Para envíos a municipios vecinos del Huila o a nivel nacional, los envíos se coordinan mediante empresas transportadoras legalmente autorizadas (Interrapidísimo, Servientrega, Envia), asumiendo el cliente el costo de flete acordado.
              </p>

              <h4>1.4 Precios y Disponibilidad</h4>
              <p>
                Todos los precios están expresados en pesos colombianos (COP). Nos reservamos el derecho de actualizar precios y disponibilidad de stock en cualquier momento conforme a las existencias físicas en tienda.
              </p>
            </div>
          )}

          {activeTab === 'warranty' && (
            <div className="legal-content-block">
              <h3>2. Políticas de Garantía y Guía de Cuidados</h3>
              <p className="legal-lead">
                Nuestros accesorios combinan diseño artesanal, baño en oro golfi, acero inoxidable, perlas y piedras semipreciosas seleccionadas con altos estándares de calidad.
              </p>

              <h4>2.1 Cobertura de Garantía</h4>
              <ul>
                <li>
                  <strong>Defectos de Fabricación:</strong> Cobertura de <strong>30 días calendario</strong> a partir de la fecha de entrega en broches, engastes o defectos estructurales atribuibles a la elaboración.
                </li>
                <li>
                  <strong>Recepción y Notificación:</strong> Si el producto llega en mal estado por transporte, el cliente debe notificarlo con fotos/videos dentro de las primeras <strong>48 horas</strong> de recibido.
                </li>
              </ul>

              <h4>2.2 Exclusiones de la Garantía</h4>
              <p>
                No están cubiertos daños por uso inadecuado, caídas, tirones bruscos, contacto con químicos abrasivos, perfumes directos, sudoración ácida extrema o inmersión en agua salada / piscinas cloradas.
              </p>

              <h4>2.3 Guía de Cuidados para Mayor Durabilidad ✨</h4>
              <div className="care-tips-grid">
                <div className="care-tip-card">
                  <span>💧</span>
                  <strong>Evita el Agua</strong>
                  <p>Retira tus accesorios antes de bañarte, nadar o hacer ejercicio intenso.</p>
                </div>
                <div className="care-tip-card">
                  <span>🧴</span>
                  <strong>Perfumes Antes</strong>
                  <p>Aplica lociones, cremas y perfumes y espera a que sequen antes de colocarte tus joyas.</p>
                </div>
                <div className="care-tip-card">
                  <span>📦</span>
                  <strong>Guarda Individual</strong>
                  <p>Conserva cada pieza en su bolsita o joyero para evitar fricciones y rayones.</p>
                </div>
                <div className="care-tip-card">
                  <span>✨</span>
                  <strong>Limpieza Suave</strong>
                  <p>Limpia con un pañuelo de microfibra seco después de usarlos para retirar impurezas.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="legal-content-block">
              <h3>3. Política de Privacidad y Tratamiento de Datos</h3>
              <p className="legal-lead">
                En cumplimiento de la <strong>Ley Estatutaria 1581 de 2012</strong> y el Decreto 1377 de 2013 de la República de Colombia, informamos sobre el tratamiento de tus datos personales.
              </p>

              <h4>3.1 Responsable del Tratamiento</h4>
              <p>
                <strong>Razón Comercial:</strong> Accesorios Lilís<br />
                <strong>Titular Responsable:</strong> Liliana Lombana Polania<br />
                <strong>Ubicación:</strong> Galería Municipal, Algeciras, Huila, Colombia<br />
                <strong>Contacto:</strong> WhatsApp +57 317 481 1570 / bscl20062007@gmail.com
              </p>

              <h4>3.2 Finalidad de la Recolección de Datos</h4>
              <p>Los datos solicitados en el formulario de pedido (Nombre, Teléfono de WhatsApp, Ciudad, Dirección y Notas de entrega) se utilizan con el único propósito de:</p>
              <ul>
                <li>Procesar, preparar y coordinar la entrega o envío del pedido solicitado.</li>
                <li>Comunicar el estado de despacho y resolver inquietudes sobre el pedido.</li>
                <li>Facturación y comprobantes de entrega.</li>
              </ul>

              <h4>3.3 No Divulgación a Terceros</h4>
              <p>
                Accesorios Lilís <strong>NO vende, NO comparte y NO transfiere</strong> tu información personal a empresas de publicidad ni a terceros no relacionados con la logística de entrega de tu pedido.
              </p>

              <h4>3.4 Derechos del Titular (Habeas Data)</h4>
              <p>
                Puedes solicitar en cualquier momento la actualización, rectificación o supresión de tus datos de nuestros registros escribiendo a nuestro WhatsApp oficial.
              </p>
            </div>
          )}

          {activeTab === 'thanks' && (
            <div className="legal-content-block">
              <h3>4. Agradecimientos Especiales & Créditos</h3>
              <p className="legal-lead">
                Detrás de este sueño empresarial existe un gran esfuerzo familiar y comunitario que hace posible llevar brillo y elegancia a cada rincón.
              </p>

              <div className="thanks-highlight-card">
                <h4>🌸 Agradecimiento de Liliana Lombana Polania</h4>
                <p>
                  <em>
                    "Agradezco de corazón a Dios, a mi amada familia y a toda la hermosa comunidad de <strong>Algeciras (Huila)</strong> por creer en mi emprendimiento desde el primer día en la Galería Municipal. Gracias a cada cliente por valorar el trabajo honesto, la dedicación y el amor con el que seleccionamos cada joya y accesorio."
                  </em>
                </p>
              </div>

              <h4>🏛️ Reconocimientos y Apoyo</h4>
              <ul>
                <li>
                  <strong>Comunidad de Algeciras y Huila:</strong> Por apoyar incansablemente el comercio local y el talento femenino independiente.
                </li>
                <li>
                  <strong>Galería Municipal de Algeciras:</strong> Espacio de tradición y trabajo donde recibimos a nuestros clientes con calidez todos los días.
                </li>
                <li>
                  <strong>Desarrollo Tecnológico:</strong> Plataforma digital diseñada e implementada para impulsar la modernización y venta en línea de la bisutería algecireña.
                </li>
              </ul>

              <div className="copyright-seal">
                <p>
                  <strong>© {new Date().getFullYear()} Accesorios Lilís.</strong> Todos los derechos reservados. Marca registrada en Algeciras, Huila, Colombia.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer-action">
          <button type="button" className="cta-button" onClick={onClose}>
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
