import React from 'react';
import type { Product } from '../types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  getItemQuantity?: (id: string) => number;
  onAddToCart: (product: Product) => void;
  onResetFilter: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  getItemQuantity,
  onAddToCart,
  onResetFilter,
}) => {
  if (loading) {
    return (
      <div className="product-grid-skeleton" aria-busy="true">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="skeleton-card">
            <div className="skeleton-img pulse" />
            <div className="skeleton-body">
              <div className="skeleton-text short pulse" />
              <div className="skeleton-text long pulse" />
              <div className="skeleton-text price pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-catalog-state">
        <div className="empty-icon">💎</div>
        <h3>No encontramos accesorios en esta búsqueda</h3>
        <p>Prueba buscando con otro término o seleccionando una categoría diferente.</p>
        <button type="button" className="cta-button" onClick={onResetFilter}>
          Ver todos los accesorios
        </button>
      </div>
    );
  }

  return (
    <div className="product-grid" role="region" aria-label="Listado de accesorios">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          quantityInCart={getItemQuantity ? getItemQuantity(product.id) : 0}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};
