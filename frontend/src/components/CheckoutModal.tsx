import React, { useState, useEffect, type FormEvent } from 'react';
import type { CartItem, CustomerForm } from '../types/product';
import type { User } from '../types/auth';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
  user: User | null;
  onRequireLogin: () => void;
  onSubmitOrder: (customer: CustomerForm, openWhatsApp: boolean) => Promise<{ orderId: string; whatsappUrl: string; message: string } | null | void>;
  isSubmitting: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

const PAYMENT_OPTIONS = [
  { id: 'Nequi / Llaves Bre-B', label: '📱 Nequi (o Llaves Bre-B / Breve)', desc: 'Transferencia directa a Liliana o llaves' },
  { id: 'Bancolombia', label: '🏦 Bancolombia', desc: 'Transferencia directa / QR' },
];

const DELIVERY_OPTIONS = [
  { id: 'Recoger en Galería Municipal (Algeciras)', label: '📍 Recoger en la Galería Municipal de Algeciras' },
  { id: 'Domicilio en Algeciras', label: '🛵 Domicilio en el casco urbano de Algeciras' },
  { id: 'Envío Nacional / Huila', label: '📦 Envío a otro municipio (Neiva, Campoalegre, etc.)' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  cartTotal,
  user,
  onRequireLogin,
  onSubmitOrder,
  isSubmitting,
}) => {
  const [form, setForm] = useState<CustomerForm>({
    name: user?.fullName || '',
    phone: '',
    city: 'Algeciras, Huila',
    deliveryType: 'Recoger en Galería Municipal (Algeciras)',
    paymentMethod: 'Nequi / Llaves Bre-B',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: string;
    whatsappUrl: string;
    message: string;
  } | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  useEffect(() => {
    if (user?.fullName && !form.name) {
      setForm((prev) => ({ ...prev, name: user.fullName || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) {
      setOrderSuccess(null);
      setCopiedMessage(false);
      setFormErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Por favor ingresa tu nombre completo.';
    if (!form.phone.trim() || form.phone.trim().length < 7) {
      errors.phone = 'Por favor ingresa tu número de WhatsApp o teléfono.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleWhatsAppCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireLogin();
      return;
    }
    if (!validate()) return;

    // Validación estricta de inventario: ningún artículo puede exceder el stock disponible
    const exceedingItems = cart.filter(
      (item) => typeof item.stock === 'number' && item.quantity > item.stock,
    );
    if (exceedingItems.length > 0) {
      const details = exceedingItems
        .map((i) => `• ${i.name}: pides ${i.quantity}, pero solo hay ${i.stock} disponibles`)
        .join('\n');
      alert(
        `⚠️ No es posible completar el pedido por límite de stock:\n\n${details}\n\nPor favor ajusta las cantidades en el carrito antes de continuar.`,
      );
      return;
    }

    const result = await onSubmitOrder(form, true);
    if (result && result.orderId) {
      setOrderSuccess(result);
    }
  };

  const handleCopyMessage = () => {
    if (!orderSuccess?.message) return;
    navigator.clipboard.writeText(orderSuccess.message);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="checkout-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="checkout-title">Finalizar Pedido</h2>
            <p className="modal-subtitle">Atención directa con Liliana Lombana Polania (+57 3174811570)</p>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose} aria-label="Cerrar ventana">
            ✕
          </button>
        </div>

        {orderSuccess ? (
          <div className="checkout-success-view">
            <div className="success-icon-badge">🎉</div>
            <h3 className="success-title">¡Pedido #{orderSuccess.orderId} Creado con Éxito!</h3>
            <p className="success-desc">
              Tu pedido ha quedado registrado en nuestro sistema. Para coordinar el despacho y concretar tu compra, abre tu WhatsApp directamente con Liliana Lombana:
            </p>

            <a
              href={orderSuccess.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-order-btn success-btn-cta"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>💬 Abrir WhatsApp con mi Pedido</span>
            </a>

            <div className="success-action-buttons">
              <button
                type="button"
                className="secondary-button copy-order-btn"
                onClick={handleCopyMessage}
              >
                {copiedMessage ? '✓ ¡Mensaje Copiado!' : '📋 Copiar Mensaje del Pedido'}
              </button>
              <button
                type="button"
                className="close-success-btn"
                onClick={onClose}
              >
                Cerrar y seguir comprando
              </button>
            </div>
          </div>
        ) : (
          <div className="checkout-content-grid">
            <form className="checkout-form" onSubmit={handleWhatsAppCheckout}>
              {/* OBLIGAR INICIO DE SESIÓN CON GOOGLE SI NO ESTÁ AUTENTICADO */}
              {!user ? (
                <div className="checkout-login-required-card">
                  <div className="login-required-info">
                    <span className="lock-icon">🔒</span>
                    <div>
                      <strong>Inicio de Sesión Requerido</strong>
                      <p>Para respaldar tu pedido y brindarte seguimiento, por favor ingresa con tu cuenta de Google.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="google-login-trigger-btn"
                    onClick={onRequireLogin}
                  >
                    <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Iniciar Sesión con Google</span>
                  </button>
                </div>
              ) : (
                <div className="checkout-logged-user-chip">
                  <span className="user-verified-badge">🟢 Sesión Verificada:</span>
                  <strong>{user.fullName}</strong>
                  <span className="user-email-text">({user.email})</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="customer-name">Nombre y Apellido *</label>
                <input
                  id="customer-name"
                  type="text"
                  placeholder="Ej. María Fernanda Rojas"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={formErrors.name ? 'input-error' : ''}
                />
                {formErrors.name && <span className="field-error">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="customer-phone">WhatsApp de contacto *</label>
                <input
                  id="customer-phone"
                  type="tel"
                  placeholder="Ej. 317 481 1570"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={formErrors.phone ? 'input-error' : ''}
                />
                {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="customer-city">Municipio / Ciudad</label>
                <input
                  id="customer-city"
                  type="text"
                  placeholder="Algeciras, Neiva, Campoalegre..."
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="delivery-type">Método de Entrega</label>
                <select
                  id="delivery-type"
                  value={form.deliveryType}
                  onChange={(e) => setForm({ ...form, deliveryType: e.target.value })}
                >
                  {DELIVERY_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="payment-method">Forma de Pago sugerida</label>
                <select
                  id="payment-method"
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                >
                  {PAYMENT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} — {opt.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="customer-notes">Notas o dirección específica (opcional)</label>
                <textarea
                  id="customer-notes"
                  rows={2}
                  placeholder="Ej. Dirección exacta, piso, color preferido o indicaciones..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="checkout-actions">
                <button
                  type="submit"
                  className="whatsapp-order-btn"
                  disabled={isSubmitting}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>{isSubmitting ? 'Generando Pedido...' : !user ? 'Iniciar Sesión para Pedir' : 'Enviar Pedido por WhatsApp'}</span>
                </button>
              </div>
            </form>

            <div className="order-summary-box">
              <h3>Resumen ({cart.reduce((s, i) => s + i.quantity, 0)} artículos)</h3>
              <div className="summary-items-scroll">
                {cart.map((item) => (
                  <div key={item.id} className="summary-item-row">
                    <span className="summary-item-qty">{item.quantity}x</span>
                    <div className="summary-item-info">
                      <span className="summary-item-sku">#{item.sku || `ART-${item.id}`}</span>
                      <span className="summary-item-title">{item.name}</span>
                    </div>
                    <span className="summary-item-val">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-total-row">
                <span>Total a pagar:</span>
                <strong className="summary-total-price">{formatCurrency(cartTotal)}</strong>
              </div>

              <p className="summary-help-note">
                💬 Al presionar el botón se abrirá WhatsApp con el mensaje estructurado listo para Liliana Lombana y quedará registrado tu pedido.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
