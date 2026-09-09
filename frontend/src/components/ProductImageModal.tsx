import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Product } from '../types/product';

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart?: (product: Product) => void;
  onCustomOrder?: (product: Product) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

export const ProductImageModal: React.FC<ProductImageModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onCustomOrder,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [isAdded, setIsAdded] = useState(false);

  // Reiniciar zoom y posición al abrir un producto
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsDragging(false);
      setIsAdded(false);
    }
  }, [isOpen, product]);

  // Manejo de teclado: Escape para cerrar, '+' y '-' para zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        setZoom((prev) => Math.min(prev + 0.5, 3.5));
      } else if (e.key === '-' || e.key === '_') {
        setZoom((prev) => {
          const next = Math.max(prev - 0.5, 1);
          if (next === 1) setPan({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === '0') {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevenir scroll de la página de fondo mientras la imagen está abierta
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoom((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoom((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoom > 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(2.2);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(prev + 0.25, 3.5));
    } else {
      setZoom((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Lógica de arrastre / pan cuando hay zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || zoom <= 1) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      });
    },
    [isDragging, zoom]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Soporte táctil en celulares (Touch Drag)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen || !product) return null;

  const isSoldOut =
    product.isActive === false || (product.stock !== undefined && product.stock <= 0);

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 800);
    }
  };

  return (
    <div
      className="product-lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista ampliada de ${product.name}`}
    >
      {/* CONTENEDOR FLOTANTE DE LA IMAGEN */}
      <div
        className="product-lightbox-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BARRA SUPERIOR DE HERRAMIENTAS */}
        <div className="lightbox-topbar">
          <div className="lightbox-meta-left">
            <span className="lightbox-cat-badge">
              {(product.category || 'Accesorio').toUpperCase()}
            </span>
            <span className="lightbox-sku-chip">
              #{product.sku || `ART-${product.id}`}
            </span>
            {isSoldOut ? (
              <span className="lightbox-sold-tag">✨ Vendido</span>
            ) : (
              <span className="lightbox-stock-tag">
                {product.stock === 1 ? '💎 Pieza Única' : `Stock: ${product.stock ?? 'Disponible'}`}
              </span>
            )}
          </div>

          {/* CONTROLES DE ZOOM */}
          <div className="lightbox-zoom-controls">
            <button
              type="button"
              className="zoom-btn"
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              title="Alejar (-)"
              aria-label="Alejar imagen"
            >
              −
            </button>
            <button
              type="button"
              className="zoom-btn-label"
              onClick={handleResetZoom}
              title="Clic para reiniciar tamaño (100%)"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              className="zoom-btn"
              onClick={handleZoomIn}
              disabled={zoom >= 3.5}
              title="Acercar (+)"
              aria-label="Acercar imagen"
            >
              +
            </button>
          </div>

          {/* BOTÓN DE CIERRE RÁPIDO Y DESTACADO */}
          <button
            type="button"
            className="lightbox-close-btn"
            onClick={onClose}
            title="Cerrar vista ampliada (Escape o clic afuera)"
            aria-label="Cerrar vista ampliada"
          >
            <span className="lightbox-close-text">Cerrar</span> ✕
          </button>
        </div>

        {/* ÁREA INTERACTIVA DE VISUALIZACIÓN DE IMAGEN */}
        <div
          className={`lightbox-viewport ${zoom > 1 ? 'is-zoomed' : ''} ${isDragging ? 'is-dragging' : ''}`}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={product.image}
            alt={product.name}
            className="lightbox-img"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            }}
            draggable={false}
          />

          {zoom === 1 && (
            <div className="lightbox-hint-overlay">
              <span>🔍 Doble clic o rueda del mouse para hacer zoom</span>
            </div>
          )}
        </div>

        {/* BARRA INFERIOR CON DETALLES Y ACCIÓN DE COMPRA */}
        <div className="lightbox-bottom-bar">
          <div className="lightbox-product-details">
            <h3 className="lightbox-title">{product.name}</h3>
            <p className="lightbox-desc">
              {product.description || 'Joyería y accesorio artesanal exclusivo.'}
            </p>
          </div>

          <div className="lightbox-action-block">
            <div className="lightbox-price-group">
              <span className="lightbox-price-lbl">Precio</span>
              <span className="lightbox-price-val">{formatCurrency(product.price)}</span>
            </div>

            {isSoldOut ? (
              <button
                type="button"
                className="lightbox-custom-btn"
                onClick={() => {
                  onClose();
                  onCustomOrder?.(product);
                }}
                title="Mandar a elaborar uno igual por encargo con Liliana"
              >
                <span>✨ Mandar a Elaborar</span>
              </button>
            ) : (
              <button
                type="button"
                className={`lightbox-add-btn ${isAdded ? 'added' : ''}`}
                onClick={handleAddToCartClick}
                title="Agregar accesorio a la bolsa de compras"
              >
                {isAdded ? '✓ ¡Agregado!' : '🛍️ Agregar a mi bolsa'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductImageModal;
