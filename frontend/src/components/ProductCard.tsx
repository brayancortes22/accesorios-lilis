import React, { useState } from 'react';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isAdding, setIsAdding] = useState(false);

  const isSoldOut = product.isActive === false || (product.stock !== undefined && product.stock <= 0);

  const handleAdd = () => {
    if (isSoldOut) return;
    setIsAdding(true);
    onAddToCart(product);
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <article className={`product-card ${isSoldOut ? 'product-card-sold-out' : ''}`}>
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        {isSoldOut ? (
          <span className="product-tag-badge sold-out-badge">⚠️ AGOTADO / VENDIDO</span>
        ) : (
          product.tag && <span className="product-tag-badge">{product.tag}</span>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-top-meta">
          <span className="product-category-label">{(product.category || 'accesorio').toUpperCase()}</span>
          <span className="product-sku-chip" title="Identificador de artículo">
            #{product.sku || `ART-${product.id}`}
          </span>
        </div>
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-desc">{product.description}</p>

        <div className="product-card-footer">
          <div className="price-block">
            <span className="price-label">Precio</span>
            <span className="price-value">{formatCurrency(product.price)}</span>
          </div>

          <button
            type="button"
            className={`add-to-cart-btn ${isSoldOut ? 'disabled-sold-out' : ''} ${isAdding ? 'added-pop' : ''}`}
            onClick={handleAdd}
            disabled={isSoldOut}
            aria-label={isSoldOut ? `${product.name} está agotado` : `Agregar ${product.name} al carrito`}
          >
            {isSoldOut ? (
              <span>Agotado</span>
            ) : isAdding ? (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>¡Listo!</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
