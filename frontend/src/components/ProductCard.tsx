import React, { useState } from 'react';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  quantityInCart?: number;
  onAddToCart: (product: Product) => void;
  onCustomOrder?: (product: Product) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart = 0,
  onAddToCart,
  onCustomOrder,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const isSoldOut =
    product.isActive === false || (product.stock !== undefined && product.stock <= 0);
  const maxStock = typeof product.stock === 'number' ? product.stock : 999;
  const isMaxStockReached = !isSoldOut && quantityInCart >= maxStock;

  const handleAdd = () => {
    if (isSoldOut || isMaxStockReached) return;
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
          <span className="product-tag-badge sold-badge-vendido">
            ✨ Vendido
          </span>
        ) : (
          product.tag && <span className="product-tag-badge">{product.tag}</span>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-top-meta">
          <span className="product-category-label">{(product.category || 'accesorio').toUpperCase()}</span>
          {!isSoldOut && typeof product.stock === 'number' && product.stock > 0 && (
            <span
              className={`product-stock-tag ${product.stock <= 5 ? 'low-stock-alert' : ''}`}
              title={`Inventario actual: ${product.stock} unidades`}
            >
              {product.stock === 1 ? '💎 Pieza Única' : `Stock: ${product.stock}`}
            </span>
          )}
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

          {isSoldOut ? (
            <button
              type="button"
              className="custom-order-action-btn"
              onClick={() => onCustomOrder?.(product)}
              title="Mandar a elaborar uno igual por encargo con Liliana"
            >
              <span>✨ Mandar a Elaborar</span>
            </button>
          ) : (
            <button
              type="button"
              className={`add-to-cart-btn ${
                isMaxStockReached ? 'disabled-max-stock' : ''
              } ${isAdding ? 'added-pop' : ''}`}
              onClick={handleAdd}
              disabled={isMaxStockReached}
              title={
                isMaxStockReached
                  ? `Ya tienes el máximo disponible (${maxStock} uds.) en tu carrito`
                  : undefined
              }
              aria-label={
                isMaxStockReached
                  ? `Límite máximo de stock (${maxStock}) alcanzado en el carrito`
                  : `Agregar ${product.name} al carrito`
              }
            >
              {isMaxStockReached ? (
                <span>Máx. en Carrito ({maxStock})</span>
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
          )}
        </div>
      </div>
    </article>
  );
};
