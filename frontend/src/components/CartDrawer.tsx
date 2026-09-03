import React from 'react';
import type { CartItem } from '../types/product';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  cartTotal,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalItemsCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        <div className="cart-drawer-header">
          <div className="drawer-title-row">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h2>Tu Carrito ({totalItemsCount})</h2>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose} aria-label="Cerrar carrito">
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty-view">
            <div className="empty-cart-icon-circle">🛍️</div>
            <h3>Tu carrito está vacío</h3>
            <p>¡Agrega tus aretes, collares y bolsos preferidos para pedir por WhatsApp!</p>
            <button type="button" className="cta-button empty-cart-action-btn" onClick={onClose}>
              Explorar Catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cart.map((item) => {
                const maxStock = typeof item.stock === 'number' ? item.stock : 999;
                const isMaxReached = item.quantity >= maxStock;

                return (
                  <div key={item.id} className="cart-item-row">
                    <img src={item.image} alt={item.name} className="cart-item-thumb" />
                    <div className="cart-item-details">
                      <div className="cart-item-header-meta">
                        <span className="cart-item-sku">#{item.sku || `ART-${item.id}`}</span>
                        <h4>{item.name}</h4>
                      </div>
                      <span className="cart-item-price">{formatCurrency(item.price)} c/u</span>

                      <div className="cart-qty-controls">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span className="qty-display">{item.quantity}</span>
                        <button
                          type="button"
                          className={`qty-btn ${isMaxReached ? 'disabled-stock' : ''}`}
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          disabled={isMaxReached}
                          title={
                            isMaxReached
                              ? `Límite de stock disponible alcanzado (${maxStock} unidades)`
                              : 'Aumentar cantidad'
                          }
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      {typeof item.stock === 'number' && (
                        <div className="cart-item-stock-info">
                          <span
                            className={`cart-stock-pill ${isMaxReached ? 'stock-limit-reached' : ''}`}
                          >
                            {isMaxReached ? (
                              <>⚠️ Máx. disponible ({item.stock} uds.)</>
                            ) : (
                              <>Disponibles: {item.stock} uds.</>
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="cart-item-right-col">
                      <strong className="cart-item-subtotal">
                        {formatCurrency(item.price * item.quantity)}
                      </strong>
                      <button
                        type="button"
                        className="cart-item-remove-btn"
                        onClick={() => onRemoveItem(item.id)}
                        title="Eliminar del carrito"
                        aria-label={`Eliminar ${item.name}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-drawer-footer">
              <div className="cart-subtotal-row">
                <span>Subtotal estimado:</span>
                <span className="subtotal-highlight">{formatCurrency(cartTotal)}</span>
              </div>
              <p className="delivery-badge-note">
                📍 Entrega directa en la Galería Municipal de Algeciras y envíos locales.
              </p>
              <button
                type="button"
                className="cta-button checkout-btn-full"
                onClick={onProceedToCheckout}
              >
                <span>Pedir por WhatsApp</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
