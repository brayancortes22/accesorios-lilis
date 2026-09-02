import React, { useState, type FormEvent } from 'react';
import type { CartItem, CustomerForm } from '../types/product';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
  onSubmitOrder: (customer: CustomerForm, openWhatsApp: boolean) => Promise<void>;
  isSubmitting: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

const PAYMENT_OPTIONS = [
  { id: 'Nequi / Daviplata', label: '📱 Nequi / Daviplata', desc: 'Transferencia directa a Liliana' },
  { id: 'Bancolombia', label: '🏦 Bancolombia', desc: 'Transferencia / QR' },
  { id: 'Efectivo / Galería', label: '💵 Efectivo', desc: 'Pago contraentrega en Galería Algeciras' },
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
  onSubmitOrder,
  isSubmitting,
}) => {
  const [form, setForm] = useState<CustomerForm>({
    name: '',
    phone: '',
    city: 'Algeciras, Huila',
    deliveryType: 'Recoger en Galería Municipal (Algeciras)',
    paymentMethod: 'Nequi / Daviplata',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const handleWhatsAppCheckout = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmitOrder(form, true);
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

        <div className="checkout-content-grid">
          <form className="checkout-form" onSubmit={handleWhatsAppCheckout}>
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
                <span>{isSubmitting ? 'Generando Pedido...' : 'Enviar Pedido por WhatsApp'}</span>
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
              💬 Al presionar el botón verde se abrirá WhatsApp con el mensaje estructurado listo para enviarle a <strong>Liliana Lombana</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
