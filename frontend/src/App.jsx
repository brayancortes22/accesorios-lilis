import { useEffect, useMemo, useState } from 'react';
import logo from '../imagenes/logo_V2.svg';
import banner from '../imagenes/baneer.svg';

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    city: 'Algeciras',
    notes: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (category = selectedCategory) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?category=${encodeURIComponent(category)}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setStatus({ type: 'error', message: 'No se pudieron cargar los productos.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    };

    loadCategories();
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [cart],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!customer.name || !customer.phone || cart.length === 0) {
      setStatus({
        type: 'error',
        message: 'Completa tu nombre y tel?fono y agrega al menos un producto.',
      });
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: customer.name,
          phone: customer.phone,
          city: customer.city,
          notes: customer.notes,
          items: cart.map(({ id, name, price, quantity }) => ({
            id,
            name,
            price,
            quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'No se pudo registrar el pedido');
      }

      setStatus({
        type: 'success',
        message: `Pedido ${result.order.id} registrado. Total: ${result.totalLabel}`,
      });
      setCart([]);
      setCustomer({ name: '', phone: '', city: 'Algeciras', notes: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-block">
          <img src={logo} alt="Logo de Accesorios Lilis" className="brand-logo" />
          <div>
            <p className="brand-name">Accesorios Lilis</p>
            <p className="brand-tag">Moda femenina</p>
          </div>
        </div>

        <nav className="nav" aria-label="Navegaci?n principal">
          <a href="#inicio">Inicio</a>
          <a href="#catalogo">Cat?logo</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#carrito">Carrito</a>
        </nav>

        <button className="cta-button">Pedir hoy</button>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-copy">
            <span className="eyebrow">Estilo que resalta tu personalidad</span>
            <h1>Accesorios para dama con encanto y color.</h1>
            <p>
              Encuentra aretes, collares, bolsos y detalles para cada ocasi?n. Todo con
              una vibra femenina, elegante y fresca para vender desde la Galer?a Municipal
              del Algeciras.
            </p>

            <div className="hero-actions">
              <a href="#catalogo" className="cta-button">Ver cat?logo</a>
              <a href="#nosotros" className="secondary-button">Nuestra historia</a>
            </div>

            <div className="hero-stats" aria-label="estad?sticas de la marca">
              <div className="stat-box">
                <strong>1.200+</strong>
                <span>clientes felices</span>
              </div>
              <div className="stat-box">
                <strong>48h</strong>
                <span>entrega local</span>
              </div>
              <div className="stat-box">
                <strong>4.9/5</strong>
                <span>valoraci?n</span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-label="Visual principal de la marca">
            <div className="image-card">
              <img src={banner} alt="Banner ilustrado de Accesorios Lilis" />
            </div>
          </div>
        </section>

        <section className="catalog" id="catalogo">
          <div className="section-heading">
            <span className="eyebrow">Cat?logo</span>
            <h2>Lo m?s destacado para cada estilo</h2>
          </div>

          <div className="category-filter" aria-label="Filtros de categor?a">
            {categories.map((category) => (
              <button
                key={category.id}
                className={selectedCategory === category.id ? 'chip active' : 'chip'}
                onClick={() => setSelectedCategory(category.id)}
                type="button"
              >
                {category.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty-state">Cargando productos...</div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <article key={product.id} className="product-card">
                  <div className="product-image-wrap">
                    <img src={product.image} alt={product.name} />
                    <span>{product.tag}</span>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="product-meta">
                      <strong>{formatCurrency(product.price)}</strong>
                      <button type="button" onClick={() => addToCart(product)}>
                        A?adir
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="shop-layout" id="carrito">
          <div className="checkout-panel">
            <div className="section-heading compact">
              <span className="eyebrow">Carrito</span>
              <h2>Resumen del pedido</h2>
            </div>

            {cart.length === 0 ? (
              <div className="empty-state">Tu carrito est? vac?o. Elige alguna pieza.</div>
            ) : (
              <div className="cart-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div>
                      <strong>{item.name}</strong>
                      <small>{formatCurrency(item.price)} c/u</small>
                    </div>
                    <div className="qty-controls">
                      <button type="button" onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="cart-summary">
              <span>Items</span>
              <strong>{cartCount}</strong>
            </div>
            <div className="cart-summary total">
              <span>Total</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </div>
          </div>

          <form className="order-form" onSubmit={handleSubmit}>
            <div className="section-heading compact">
              <span className="eyebrow">Pedido</span>
              <h2>Datos para entrega</h2>
            </div>

            <label>
              Nombre completo
              <input
                type="text"
                value={customer.name}
                onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
                placeholder="Ej: Ana G?mez"
              />
            </label>

            <label>
              Tel?fono
              <input
                type="tel"
                value={customer.phone}
                onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
                placeholder="Ej: 300 123 4567"
              />
            </label>

            <label>
              Ciudad
              <input
                type="text"
                value={customer.city}
                onChange={(event) => setCustomer({ ...customer, city: event.target.value })}
                placeholder="Algeciras"
              />
            </label>

            <label>
              Observaciones
              <textarea
                rows="4"
                value={customer.notes}
                onChange={(event) => setCustomer({ ...customer, notes: event.target.value })}
                placeholder="Indica color, talla o referencia que necesites"
              />
            </label>

            <button type="submit" className="submit-button">
              Confirmar pedido
            </button>

            {status.message && (
              <p className={status.type === 'error' ? 'feedback error' : 'feedback success'}>
                {status.message}
              </p>
            )}
          </form>
        </section>

        <section className="story" id="nosotros">
          <div className="story-text">
            <span className="eyebrow">Nuestra historia</span>
            <h2>M?s que accesorios: detalles que cuentan historias.</h2>
            <p>
              Accesorios Lilis naci? para poner color, alegr?a y personalidad en cada
              detalle del d?a a d?a. Cada pieza est? pensada para acompa?ar outfits femeninos,
              con estilo, calidad y un servicio cercano.
            </p>
          </div>

          <div className="story-panel">
            <div className="story-pill">Hecho con amor</div>
            <div className="story-pill">Estilo femenino</div>
            <div className="story-pill">Venta directa y cercana</div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <p className="brand-name">Accesorios Lilis</p>
          <p>Estilo y alegr?a para cada outfit.</p>
        </div>
        <div className="footer-links">
          <a href="mailto:contacto@accesorioslilis.com">contacto@accesorioslilis.com</a>
          <a href="tel:+573001234567">+57 300 123 4567</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
