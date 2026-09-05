import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/Header';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductGrid } from '../components/ProductGrid';
import { CustomOrderModal } from '../components/CustomOrderModal';
import { StorySection } from '../components/StorySection';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { LoginModal } from '../components/LoginModal';
import { AdminPanelModal } from '../components/AdminPanelModal';
import { LegalModal, type LegalTabType } from '../components/LegalModal';
import { ToastNotification } from '../components/ToastNotification';
import { MobileQuickNav } from '../components/MobileQuickNav';
import { productsApi } from '../api/products';
import type { CustomerForm, Product } from '../types/product';

export function App() {
  const {
    categories,
    products,
    allProducts,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    sortMode,
    setSortMode,
    rotateCatalog,
    loading,
    refreshProducts,
  } = useProducts();

  const {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    getItemQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const {
    user,
    isAdmin,
    authLoading,
    loginWithGoogle,
    loginWithPassword,
    register,
    loginWithDev,
    logout,
  } = useAuth();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalInitialTab, setLegalInitialTab] = useState<LegalTabType>('terms');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: '' | 'success' | 'error'; message: string }>({ type: '', message: '' });

  const [pendingCheckout, setPendingCheckout] = useState(false);

  // Vistas del Catálogo: 'available' (en stock para entrega) vs 'sold' (vitrina de vendidos y por encargo)
  const [catalogView, setCatalogView] = useState<'available' | 'sold'>('available');
  const [soldProducts, setSoldProducts] = useState<Product[]>([]);
  const [loadingSold, setLoadingSold] = useState(false);
  const [customOrderProduct, setCustomOrderProduct] = useState<Product | null>(null);

  const fetchSoldProducts = useCallback(async () => {
    try {
      setLoadingSold(true);
      const data = await productsApi.getSoldGallery();
      setSoldProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Error al cargar vitrina de vendidos:', err);
    } finally {
      setLoadingSold(false);
    }
  }, []);

  useEffect(() => {
    fetchSoldProducts();
  }, [fetchSoldProducts]);

  const handleRefreshCatalog = () => {
    refreshProducts();
    fetchSoldProducts();
  };

  // Filtrado de las creaciones vendidas según búsqueda y categoría seleccionada
  const displayedSoldProducts = useMemo(() => {
    return soldProducts.filter((p) => {
      // 1. Filtrar por término de búsqueda
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const cleanTerm = term.replace('#', '');
        const matchSearch =
          String(p.name || '').toLowerCase().includes(term) ||
          String(p.sku || '').toLowerCase().includes(cleanTerm) ||
          String(p.id || '').toLowerCase() === cleanTerm ||
          String(p.description || '').toLowerCase().includes(term) ||
          String(p.category || '').toLowerCase().includes(term);
        if (!matchSearch) return false;
      }
      // 2. Filtrar por categoría
      if (selectedCategory && selectedCategory !== 'todos') {
        return String(p.category || '').toLowerCase() === selectedCategory.toLowerCase();
      }
      return true;
    });
  }, [soldProducts, searchTerm, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    const success = addToCart(product);
    if (!success) {
      const maxStock = typeof product.stock === 'number' ? product.stock : 0;
      if (maxStock <= 0) {
        setStatus({
          type: 'error',
          message: `El accesorio "${product.name}" se encuentra agotado actualmente.`,
        });
      } else {
        setStatus({
          type: 'error',
          message: `Límite alcanzado: Ya tienes el máximo disponible (${maxStock} uds.) de "${product.name}" en tu carrito.`,
        });
      }
    }
  };

  const handleSubmitOrder = async (customer: CustomerForm, openWhatsApp: boolean = true) => {
    try {
      setIsSubmitting(true);
      setStatus({ type: '', message: '' });

      const payload = {
        clientName: customer.name,
        phone: customer.phone,
        city: customer.city,
        notes: `${customer.deliveryType ? `[Entrega: ${customer.deliveryType}] ` : ''}${customer.paymentMethod ? `[Pago: ${customer.paymentMethod}] ` : ''}${customer.notes || ''}`.trim(),
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      let orderId = 'WEB-' + Math.floor(1000 + Math.random() * 9000);
      try {
        const res = await productsApi.createOrder(payload);
        if (res?.order?.id) {
          orderId = String(res.order.id);
        }
      } catch (err) {
        console.warn('Registro local de pedido', err);
      }

      const itemsText = cart
        .map(
          (i) =>
            `• ${i.quantity}x [Cód: #${i.sku || `ART-${i.id}`}] ${i.name}\n  Precio: $${(i.price * i.quantity).toLocaleString('es-CO')} COP`,
        )
        .join('\n\n');

      const now = new Date().toLocaleString('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short',
      });

      const message =
        `✨ *NUEVO PEDIDO - ACCESORIOS LILIS* ✨\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `🆔 *No. Pedido:* #${orderId}\n` +
        `📅 *Fecha:* ${now}\n\n` +
        `👤 *Cliente:* ${customer.name}\n` +
        `📱 *Teléfono/WhatsApp:* ${customer.phone}\n` +
        `📍 *Municipio/Ciudad:* ${customer.city || 'Algeciras, Huila'}\n` +
        (customer.deliveryType ? `🛵 *Entrega:* ${customer.deliveryType}\n` : '') +
        (customer.paymentMethod ? `💳 *Forma de Pago:* ${customer.paymentMethod}\n` : '') +
        (customer.notes ? `📝 *Indicaciones:* ${customer.notes}\n` : '') +
        `\n🛍️ *PRODUCTOS SELECCIONADOS:*\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `${itemsText}\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 *TOTAL A PAGAR:* $${cartTotal.toLocaleString('es-CO')} COP\n\n` +
        `_¡Hola doña Liliana! Acabo de hacer este pedido desde su tienda web y deseo coordinar el pago y la entrega. ¡Muchas gracias!_`;

      const whatsappUrl = `https://wa.me/573174811570?text=${encodeURIComponent(message)}`;

      // Intentar abrir WhatsApp inmediatamente si fue solicitado
      if (openWhatsApp) {
        try {
          window.open(whatsappUrl, '_blank');
        } catch {
          // Ignorar si el navegador bloquea el pop-up; la pantalla de éxito proveerá el botón directo
        }
      }

      clearCart();
      setStatus({
        type: 'success',
        message: `¡Pedido #${orderId} generado con éxito!`,
      });

      return { orderId, whatsappUrl, message };
    } catch (err: unknown) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al registrar el pedido.',
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <Header
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        user={user}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onLogout={() => {
          logout();
          setStatus({ type: 'success', message: 'Sesión cerrada correctamente.' });
        }}
      />

      <main>
        <HeroBanner />

        <section className="catalog-section" id="catalogo">
          <div className="section-header">
            <span className="eyebrow-tag">Nuestras Colecciones</span>
            <h2 className="section-title">Encuentra tu accesorio ideal</h2>
            <p className="section-subtitle">
              Piezas exclusivas y de alta calidad para realzar tu belleza todos los días.
            </p>
          </div>

          {/* SELECTOR DE VISTA DEL CATÁLOGO: DISPONIBLES VS CREACIONES VENDIDAS / POR ENCARGO (Opción A) */}
          <div className="catalog-view-switcher" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={catalogView === 'available'}
              className={`catalog-view-tab ${catalogView === 'available' ? 'active' : ''}`}
              onClick={() => setCatalogView('available')}
            >
              <span className="tab-icon">🟢</span>
              <span>Disponibles para Entrega</span>
              <span className="tab-count-badge">{products.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={catalogView === 'sold'}
              className={`catalog-view-tab ${catalogView === 'sold' ? 'active' : ''}`}
              onClick={() => {
                setCatalogView('sold');
                if (soldProducts.length === 0) fetchSoldProducts();
              }}
            >
              <span className="tab-icon">✨</span>
              <span>Creaciones Vendidas & Por Encargo</span>
              <span className="tab-count-badge sold-badge-count">{soldProducts.length}</span>
            </button>
          </div>

          {catalogView === 'sold' && (
            <div className="sold-gallery-info-banner">
              <div className="banner-icon">🧵</div>
              <div className="banner-text">
                <h4>Vitrina de Creaciones Vendidas & Hechos por Encargo</h4>
                <p>
                  Estas piezas artesanales exclusivas ya fueron adquiridas por nuestras clientas. ¿Te enamoraste de algún modelo? Haz clic en <strong>"✨ Mandar a Elaborar"</strong> para que Liliana confeccione uno idéntico o adaptado en tus tonos preferidos.
                </p>
              </div>
            </div>
          )}

          {/* BÚSQUEDA RÁPIDA GLOBAL DE PRODUCTOS */}
          <div className="catalog-search-box">
            <div className="catalog-search-input-wrapper">
              <svg className="catalog-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="catalog-search-input"
                placeholder="Buscar por nombre, categoría (aretes, collares, anillos, bolsos)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="catalog-search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  aria-label="Borrar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            {searchTerm && (
              <div className="catalog-search-badge-row">
                <span>Resultados para "<strong>{searchTerm}</strong>": {catalogView === 'available' ? products.length : displayedSoldProducts.length} productos</span>
                <button
                  type="button"
                  className="catalog-reset-search-btn"
                  onClick={() => setSearchTerm('')}
                >
                  Ver todos los productos
                </button>
              </div>
            )}
          </div>

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(id) => {
              setSelectedCategory(id);
            }}
          />

          {/* BARRA DE HERRAMIENTAS Y ROTACIÓN DINÁMICA DE PRODUCTOS */}
          <div className="catalog-toolbar">
            <div className="catalog-toolbar-left">
              <span className="catalog-count-badge">
                Mostrando <strong>{catalogView === 'available' ? products.length : displayedSoldProducts.length}</strong>{' '}
                {(catalogView === 'available' ? products.length : displayedSoldProducts.length) === 1
                  ? 'accesorio'
                  : 'accesorios'}
              </span>
              {catalogView === 'available' && sortMode === 'dynamic' && (
                <span className="catalog-live-rotation-tag" title="Los accesorios rotan periódicamente para que siempre descubras piezas nuevas">
                  <span className="rotation-pulse-dot" /> Rotación dinámica activa
                </span>
              )}
              {catalogView === 'sold' && (
                <span className="catalog-live-rotation-tag sold-tag-pill" title="Creaciones elaboradas por Liliana disponibles bajo encargo">
                  ✨ Piezas elaboradas previamente
                </span>
              )}
            </div>

            <div className="catalog-toolbar-right">
              {catalogView === 'available' && (
                <button
                  type="button"
                  className="catalog-shuffle-btn"
                  onClick={() => {
                    rotateCatalog();
                    setStatus({
                      type: 'success',
                      message: '✨ ¡Catálogo rotado! Nuevas piezas artesanales destacadas al frente.',
                    });
                  }}
                  title="Mostrar diferentes joyas y accesorios al inicio"
                >
                  <span className="shuffle-icon">🔀</span>
                  <span>Descubrir Nuevas Joyas</span>
                </button>
              )}

              <div className="catalog-sort-wrapper">
                <label htmlFor="catalog-sort-select" className="catalog-sort-label">Ordenar:</label>
                <select
                  id="catalog-sort-select"
                  className="catalog-sort-select"
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as any)}
                >
                  <option value="dynamic">✨ Variado / Destacados</option>
                  <option value="newest">🆕 Nuevas Llegadas</option>
                  <option value="price-asc">💵 Menor Precio</option>
                  <option value="price-desc">💎 Mayor Precio</option>
                </select>
              </div>
            </div>
          </div>

          <ProductGrid
            products={catalogView === 'available' ? products : displayedSoldProducts}
            loading={catalogView === 'available' ? loading : loadingSold}
            getItemQuantity={getItemQuantity}
            onAddToCart={handleAddToCart}
            onCustomOrder={(product) => setCustomOrderProduct(product)}
            onResetFilter={() => {
              setSelectedCategory('todos');
              setSearchTerm('');
              setSortMode('dynamic');
            }}
          />
        </section>

        <StorySection />
      </main>

      <Footer
        onOpenLegal={(tab) => {
          setLegalInitialTab(tab);
          setIsLegalModalOpen(true);
        }}
      />

      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalInitialTab}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        cartTotal={cartTotal}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          if (!user) {
            setPendingCheckout(true);
            setStatus({
              type: 'info' as any,
              message: '🔒 Inicia sesión con tu cuenta de Google para continuar con tu pedido.',
            });
            setIsLoginModalOpen(true);
          } else {
            setIsCheckoutOpen(true);
          }
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        cartTotal={cartTotal}
        user={user}
        onRequireLogin={() => {
          setPendingCheckout(true);
          setIsLoginModalOpen(true);
        }}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setPendingCheckout(false);
        }}
        onLoginWithGoogle={async (idToken, captchaToken) => {
          const u = await loginWithGoogle(idToken, captchaToken);
          setIsLoginModalOpen(false);
          setStatus({ type: 'success', message: `¡Bienvenido(a), ${u?.fullName || 'Usuario'}!` });
          if (pendingCheckout) {
            setPendingCheckout(false);
            setIsCheckoutOpen(true);
          }
          return u;
        }}
        onLoginWithDev={async (email, name, password) => {
          const u = await loginWithPassword(email, password || '', name);
          setIsLoginModalOpen(false);
          setStatus({ type: 'success', message: `¡Sesión iniciada con éxito como ${u?.fullName || email}!` });
          if (pendingCheckout) {
            setPendingCheckout(false);
            setIsCheckoutOpen(true);
          }
          return u;
        }}
        onRegister={async (email, name, password) => {
          const u = await register(email, name, password);
          setIsLoginModalOpen(false);
          setStatus({ type: 'success', message: `¡Cuenta creada con éxito! Bienvenido(a), ${u?.fullName || name}.` });
          if (pendingCheckout) {
            setPendingCheckout(false);
            setIsCheckoutOpen(true);
          }
          return u;
        }}
        loading={authLoading}
      />

      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        user={user}
        categories={categories}
        products={allProducts}
        onProductCreatedOrUpdated={handleRefreshCatalog}
      />

      <CustomOrderModal
        isOpen={customOrderProduct !== null}
        onClose={() => setCustomOrderProduct(null)}
        product={customOrderProduct}
        user={user}
        onOrderSuccess={(msg) => {
          setStatus({ type: 'success', message: msg });
          fetchSoldProducts();
          refreshProducts();
        }}
      />

      {/* NAVEGACIÓN RÁPIDA FLOTANTE PARA MÓVILES */}
      <MobileQuickNav />

      <ToastNotification
        status={status}
        onClose={() => setStatus({ type: '', message: '' })}
      />

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href="https://wa.me/573174811570?text=Hola%20Liliana,%20deseo%20consultar%20sobre%20tus%20accesorios"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-btn"
        title="Escribir a Liliana por WhatsApp"
        aria-label="Escribir por WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#ffffff">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
        </svg>
        <span className="floating-wa-label">WhatsApp</span>
      </a>
    </div>
  );
}
export default App;
