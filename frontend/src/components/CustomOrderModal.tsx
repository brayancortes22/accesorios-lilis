import React, { useState, useEffect } from 'react';
import { productsApi } from '../api/products';
import type { Product } from '../types/product';
import type { User } from '../types/auth';

interface CustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  user: User | null;
  onOrderSuccess: (message: string) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

export const CustomOrderModal: React.FC<CustomOrderModalProps> = ({
  isOpen,
  onClose,
  product,
  user,
  onOrderSuccess,
}) => {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Algeciras');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setClientName(user?.fullName || '');
      setPhone('');
      setCity('Algeciras');
      setNotes('');
    }
  }, [isOpen, user]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setError('Por favor escribe tu nombre completo.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setError('Por favor ingresa un número de teléfono o WhatsApp válido.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const customNotes = `[POR ENCARGO] ${notes.trim() || 'Mismos colores y diseño de la muestra'}`;

      // 1. Registrar automáticamente en MySQL (Cero digitación para Liliana)
      const res = await productsApi.createOrder({
        clientName: clientName.trim(),
        phone: phone.trim(),
        city: city.trim() || 'Algeciras',
        notes: customNotes,
        items: [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ],
      });

      const orderId = res?.order?.id || '';
      const orderRef = orderId ? `#${orderId}` : '';

      // 2. Abrir WhatsApp directamente con Liliana con mensaje pre-armado
      const whatsappMsg = `¡Hola Liliana! 👋 Acabo de solicitar en tu tienda el encargo ${orderRef} para mandar a elaborar el accesorio *${product.name}* (Cód: *#${product.sku}*).

👤 *Mis datos para el encargo:*
• Cliente: ${clientName.trim()}
• WhatsApp: ${phone.trim()}
• Ciudad de entrega: ${city.trim() || 'Algeciras'}
• Indicaciones: ${notes.trim() || 'Deseo los mismos colores y diseño de la foto'}
• Valor de referencia: ${formatCurrency(product.price)}

Quedo muy atenta para coordinar contigo los detalles de elaboración y entrega. ¡Muchas gracias! 🥰`;

      const whatsappUrl = `https://wa.me/573174811570?text=${encodeURIComponent(whatsappMsg)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      onOrderSuccess(`¡Tu encargo ${orderRef} para "${product.name}" ha sido enviado a Liliana con éxito!`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la solicitud de encargo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="custom-order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="custom-order-header">
          <div className="custom-order-title-wrap">
            <span className="custom-order-eyebrow">✨ Pieza Artesanal por Encargo</span>
            <h3 className="custom-order-title">Mandar a Elaborar este Accesorio</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {/* TARJETA RESUMEN DEL PRODUCTO QUE SE VA A MANDAR A TEJER */}
        <div className="custom-order-product-card">
          <img src={product.image} alt={product.name} className="custom-order-thumb" />
          <div className="custom-order-meta">
            <div className="custom-order-sku-tag">
              <span>#{product.sku}</span>
              <span className="cat-chip">{product.category}</span>
            </div>
            <h4 className="custom-order-prod-name">{product.name}</h4>
            <div className="custom-order-price-row">
              <span className="custom-order-price-label">Valor de referencia:</span>
              <strong className="custom-order-price-val">{formatCurrency(product.price)}</strong>
            </div>
          </div>
        </div>

        <div className="custom-order-notice-box">
          <p>
            ℹ️ <strong>Hecho a mano exclusivamente para ti:</strong> Esta pieza única ya fue vendida en vitrina, pero Liliana puede tejerte una idéntica o adaptarla en tus colores favoritos. Al confirmar, se registrará el encargo y se abrirá WhatsApp para coordinar los detalles.
          </p>
        </div>

        {error && <div className="admin-feedback-banner error">{error}</div>}

        <form onSubmit={handleSubmit} className="custom-order-form">
          <div className="form-group">
            <label htmlFor="custom-client-name">Tu Nombre Completo *</label>
            <input
              id="custom-client-name"
              type="text"
              required
              placeholder="Ej: María Camila Pérez"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="custom-client-phone">Número de WhatsApp *</label>
              <input
                id="custom-client-phone"
                type="tel"
                required
                placeholder="Ej: 3174811570"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="admin-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="custom-client-city">Ciudad / Municipio *</label>
              <input
                id="custom-client-city"
                type="text"
                required
                placeholder="Ej: Algeciras, Neiva, Bogotá..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="custom-client-notes">Personalización o Indicaciones Especiales</label>
            <textarea
              id="custom-client-notes"
              rows={3}
              placeholder="Ej: Deseo los mismos colores de la foto, o ¿sería posible elaborarlo con mostacilla dorada? Lo necesito para un regalo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="admin-textarea"
            />
          </div>

          <div className="custom-order-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="submit-custom-order-btn"
              disabled={submitting}
            >
              {submitting ? 'Registrando...' : '✨ Enviar Encargo por WhatsApp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
