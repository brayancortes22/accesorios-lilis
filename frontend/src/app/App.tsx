import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/Header';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductGrid } from '../components/ProductGrid';
import { StorySection } from '../components/StorySection';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { LoginModal } from '../components/LoginModal';
import { AdminPanelModal } from '../components/AdminPanelModal';
import { LegalModal, type LegalTabType } from '../components/LegalModal';
import { ToastNotification } from '../components/ToastNotification';
import { productsApi } from '../api/products';
import type { CustomerForm } from '../types/product';

export function App() {
  const {
    categories,
    products,
    allProducts,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    loading,
    refreshProducts,
  } = useProducts();

  const {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const {
    user,
    isAdmin,
    authLoading,
    loginWithGoogle,
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

  const handleRefreshCatalog = () => {
    refreshProducts();
  };

  const handleSubmitOrder = async (customer: CustomerForm) => {
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

      clearCart();
      setIsCheckoutOpen(false);
      setStatus({
        type: 'success',
        message: '¡Pedido generado con éxito! Abriendo WhatsApp con Liliana...',
      });

      window.open(whatsappUrl, '_blank');
    } catch (err: unknown) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al registrar el pedido.',
      });
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
                <span>Resultados para "<strong>{searchTerm}</strong>": {products.length} productos</span>
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

          <ProductGrid
            products={products}
            loading={loading}
            onAddToCart={addToCart}
            onResetFilter={() => {
              setSelectedCategory('todos');
              setSearchTerm('');
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
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        cartTotal={cartTotal}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginWithGoogle={async (idToken, captchaToken) => {
          const u = await loginWithGoogle(idToken, captchaToken);
          setIsLoginModalOpen(false);
          setStatus({ type: 'success', message: `¡Bienvenido(a), ${u?.fullName || 'Usuario'}!` });
          return u;
        }}
        onLoginWithDev={async (email, name) => {
          const u = await loginWithDev(email, name);
          setIsLoginModalOpen(false);
          setStatus({ type: 'success', message: `¡Sesión iniciada con éxito como ${u?.fullName || email}!` });
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
