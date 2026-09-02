import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/config';
import { usersApi } from '../api/users';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import type { Category, Product } from '../types/product';
import type { User } from '../types/auth';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  categories: Category[];
  products: Product[];
  onProductCreatedOrUpdated: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

const CATEGORY_ICON_MAP: Record<string, string> = {
  aretes: '🌸',
  candongas: '🌸',
  collares: '📿',
  gargantillas: '📿',
  pulseras: '💫',
  manillas: '💫',
  anillos: '💍',
  bolsos: '👜',
  carteras: '👜',
  tocados: '👑',
  tobilleras: '✨',
  relojes: '⌚',
};

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  user,
  categories,
  products,
  onProductCreatedOrUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'orders' | 'categories' | 'admins'>('create');

  // Local synced state for instant 0ms optimistic UI updates
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [adminSearch, setAdminSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const filteredCatalog = localProducts.filter((p) => {
    // 1. Filtrar por estado activo/inactivo
    if (statusFilter === 'active' && p.isActive === false) return false;
    if (statusFilter === 'inactive' && p.isActive !== false) return false;

    // 2. Filtrar por término de búsqueda (SKU o nombre)
    if (!adminSearch.trim()) return true;
    const term = adminSearch.trim().toLowerCase();
    const cleanTerm = term.replace('#', '');
    return (
      String(p.sku || '').toLowerCase().includes(cleanTerm) ||
      String(p.id || '').toLowerCase() === cleanTerm ||
      String(p.name || '').toLowerCase().includes(term) ||
      String(p.category || '').toLowerCase().includes(term)
    );
  });

  // Form State for new/edited product
  const [productForm, setProductForm] = useState({
    id: 0,
    name: '',
    category: 'aretes',
    price: 35000,
    stock: 10,
    imageUrl: '',
    description: '',
  });

  const [imageUploadMode, setImageUploadMode] = useState<'file' | 'url'>('file');

  // Admin users state
  const [admins, setAdmins] = useState<User[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Categories state
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'admins') fetchAdmins();
      if (activeTab === 'categories') fetchDbCategories();
    }
  }, [isOpen, activeTab]);

  const fetchDbCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await categoriesApi.getAll();
      if (Array.isArray(data)) setDbCategories(data);
    } catch (err) {
      console.error('Error cargando categorías:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setFeedback({ type: 'error', message: 'Por favor escribe el nombre de la categoría.' });
      return;
    }
    try {
      setAddingCategory(true);
      setFeedback(null);
      await categoriesApi.create({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim() || undefined,
      });
      setFeedback({
        type: 'success',
        message: `¡Categoría "${newCategoryName}" creada con éxito!`,
      });
      setNewCategoryName('');
      setNewCategoryDesc('');
      fetchDbCategories();
      onProductCreatedOrUpdated();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al crear la categoría.',
      });
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la categoría "${cat.name}"?`)) return;
    try {
      setFeedback(null);
      await categoriesApi.delete(cat.id);
      setFeedback({
        type: 'success',
        message: `Categoría "${cat.name}" eliminada.`,
      });
      fetchDbCategories();
      onProductCreatedOrUpdated();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al eliminar categoría.',
      });
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await apiFetch<any[]>('/orders');
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error('Error cargando órdenes:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      setFeedback({
        type: 'success',
        message: `¡Estado del pedido #${orderId} actualizado a "${newStatus}"!`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al actualizar el estado del pedido.',
      });
      fetchOrders();
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const data = await usersApi.getAdmins();
      if (Array.isArray(data)) setAdmins(data);
    } catch (err) {
      console.error('Error cargando administradores:', err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  if (!isOpen) return null;

  // Handle image file selection & lightweight canvas compression
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setProductForm((prev) => ({ ...prev, imageUrl: dataUrl }));
        setFeedback({ type: 'success', message: 'Foto cargada y optimizada con éxito.' });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const payload = {
        name: productForm.name.trim(),
        category: productForm.category,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        imageUrl:
          productForm.imageUrl.trim() ||
          'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
        description: productForm.description.trim(),
        isActive: true,
      };

      if (productForm.id > 0) {
        await apiFetch(`/products/${productForm.id}`, {
          method: 'PUT',
          body: payload,
        });
        setFeedback({ type: 'success', message: '¡Producto actualizado con éxito!' });
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: payload,
        });
        setFeedback({ type: 'success', message: '¡Nuevo producto agregado al catálogo con éxito!' });
      }

      setProductForm({
        id: 0,
        name: '',
        category: 'aretes',
        price: 35000,
        stock: 10,
        imageUrl: '',
        description: '',
      });

      onProductCreatedOrUpdated();
      setActiveTab('manage');
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al guardar el producto.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Instant real-time optimistic toggle
  const handleToggleProductStatus = async (product: Product) => {
    const targetActive = product.isActive === false;

    // 1. Optimistic instant UI update
    setLocalProducts((prev) =>
      prev.map((p) => (String(p.id) === String(product.id) ? { ...p, isActive: targetActive } : p))
    );

    try {
      await productsApi.toggleProductActive(product.id);
      setFeedback({
        type: 'success',
        message: `El producto "${product.name}" ha sido ${targetActive ? 'activado (visible)' : 'desactivado / marcado como vendido'}.`,
      });
      onProductCreatedOrUpdated();
    } catch (err) {
      // Revert if error
      setLocalProducts((prev) =>
        prev.map((p) => (String(p.id) === String(product.id) ? { ...p, isActive: !targetActive } : p))
      );
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al cambiar estado del producto.',
      });
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Por favor ingresa un correo electrónico válido.' });
      return;
    }

    try {
      await usersApi.addAdmin({
        email: newAdminEmail.trim(),
        fullName: newAdminName.trim() || newAdminEmail.split('@')[0],
      });
      setFeedback({
        type: 'success',
        message: `¡Usuario ${newAdminEmail} autorizado como Administrador en MySQL!`,
      });
      setNewAdminEmail('');
      setNewAdminName('');
      fetchAdmins();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al agregar administrador.',
      });
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRevokeAdmin = async (adminUser: User) => {
    if (adminUser.email === user?.email) {
      alert('No puedes revocar tus propios permisos de administrador.');
      return;
    }

    if (!window.confirm(`¿Seguro que deseas remover permisos de administrador a ${adminUser.email}?`)) {
      return;
    }

    try {
      setFeedback(null);
      await usersApi.revokeAdmin(adminUser.id);
      setFeedback({
        type: 'success',
        message: `Permisos de administrador revocados para ${adminUser.email}.`,
      });
      fetchAdmins();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al revocar permisos.',
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-title"
      >
        <div className="modal-header">
          <div className="admin-header-title">
            <span className="admin-badge">👑 Panel Administrador</span>
            <h2 id="admin-title">Gestión de Tienda & Catálogo</h2>
            <p className="modal-subtitle">
              Sesión activa: <strong>{user?.fullName}</strong> ({user?.email})
            </p>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose} aria-label="Cerrar panel">
            ✕
          </button>
        </div>

        <div className="admin-nav-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            ➕ {productForm.id > 0 ? 'Editar Producto' : 'Crear Producto'}
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            📦 Catálogo ({localProducts.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            📁 Categorías ({dbCategories.length || categories.length - 1})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📋 Pedidos Recibidos
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => setActiveTab('admins')}
          >
            👥 Administradores
          </button>
        </div>

        <div className="admin-modal-body">
          {feedback && (
            <div className={`admin-feedback-banner ${feedback.type === 'success' ? 'success' : 'error'}`}>
              {feedback.message}
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleSaveProduct} className="admin-product-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="p-name">Nombre del Accesorio / Producto *</label>
                  <input
                    id="p-name"
                    type="text"
                    required
                    placeholder="Ej. Candongas en Oro Golfi"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="p-cat">Categoría *</label>
                  <select
                    id="p-cat"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {categories
                      .filter((c) => c.id !== 'todos')
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="p-price">Precio (COP) *</label>
                  <input
                    id="p-price"
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="p-stock">Stock Disponible</label>
                  <input
                    id="p-stock"
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* SECCIÓN DE IMAGEN: SUBIR DESDE DISPOSITIVO O PEGAR LINK */}
              <div className="image-upload-wrapper">
                <div className="image-upload-header">
                  <label>Fotografía del Producto *</label>
                  <div className="image-mode-toggle">
                    <button
                      type="button"
                      className={`image-mode-btn ${imageUploadMode === 'file' ? 'active' : ''}`}
                      onClick={() => setImageUploadMode('file')}
                    >
                      📁 Subir desde Celular / PC
                    </button>
                    <button
                      type="button"
                      className={`image-mode-btn ${imageUploadMode === 'url' ? 'active' : ''}`}
                      onClick={() => setImageUploadMode('url')}
                    >
                      🔗 Pegar Enlace (URL)
                    </button>
                  </div>
                </div>

                {imageUploadMode === 'file' ? (
                  <div className="file-upload-dropzone">
                    <input
                      type="file"
                      id="p-file-input"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden-file-input"
                    />
                    <label htmlFor="p-file-input" className="file-upload-label">
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span>Toca aquí para seleccionar una foto de tu galería o cámara</span>
                      <small>Se optimiza automáticamente para carga ultra-rápida</small>
                    </label>
                  </div>
                ) : (
                  <div className="form-group">
                    <input
                      id="p-img"
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    />
                  </div>
                )}

                {productForm.imageUrl && (
                  <div className="image-preview-box">
                    <img src={productForm.imageUrl} alt="Vista previa del producto" className="preview-img" />
                    <div className="preview-info">
                      <span className="preview-badge">✓ Foto lista</span>
                      <button
                        type="button"
                        className="preview-remove-btn"
                        onClick={() => setProductForm({ ...productForm, imageUrl: '' })}
                      >
                        Quitar foto
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="p-desc">Descripción del Accesorio</label>
                <textarea
                  id="p-desc"
                  rows={3}
                  placeholder="Materiales, detalles de diseño, cuidados..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="cta-button" disabled={saving}>
                  {saving ? 'Guardando en Base de Datos...' : productForm.id > 0 ? 'Actualizar Producto' : 'Publicar en Tienda'}
                </button>
                {productForm.id > 0 && (
                  <button
                    type="button"
                    className="cancel-edit-btn"
                    onClick={() =>
                      setProductForm({
                        id: 0,
                        name: '',
                        category: 'aretes',
                        price: 35000,
                        stock: 10,
                        imageUrl: '',
                        description: '',
                      })
                    }
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>
            </form>
          )}

          {activeTab === 'manage' && (
            <div className="admin-catalog-wrapper">
              {/* FILTROS DE ESTADO: TODOS / DISPONIBLES / AGOTADOS */}
              <div className="admin-status-filters-pills">
                <button
                  type="button"
                  className={`admin-status-pill ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  🔘 Todos ({localProducts.length})
                </button>
                <button
                  type="button"
                  className={`admin-status-pill active-pill ${statusFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('active')}
                >
                  🟢 Disponibles ({localProducts.filter((p) => p.isActive !== false).length})
                </button>
                <button
                  type="button"
                  className={`admin-status-pill inactive-pill ${statusFilter === 'inactive' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('inactive')}
                >
                  🔴 Vendidos / Inactivos ({localProducts.filter((p) => p.isActive === false).length})
                </button>
              </div>

              {/* BUSCADOR RÁPIDO POR CÓDIGO O NOMBRE PARA EL ADMINISTRADOR */}
              <div className="admin-search-bar-row">
                <div className="admin-search-input-wrap">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Buscar por código (ej: ART-001 o 001), nombre o categoría..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                  />
                  {adminSearch && (
                    <button type="button" className="admin-search-clear" onClick={() => setAdminSearch('')}>
                      ✕
                    </button>
                  )}
                </div>
                <span className="admin-catalog-count">
                  {filteredCatalog.length} de {localProducts.length} productos
                </span>
              </div>

              {/* VISTA PARA ESCRITORIO / PANTALLAS GRANDES */}
              <div className="admin-table-container admin-desktop-view">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Cód. SKU</th>
                      <th>Foto</th>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Estado / Visibilidad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCatalog.map((p) => {
                      const isAvailable = p.isActive !== false && (p.stock === undefined || p.stock > 0);
                      const skuCode = p.sku || `ART-${String(p.id).padStart(3, '0')}`;
                      return (
                        <tr key={p.id} className={!isAvailable ? 'table-row-inactive' : ''}>
                          <td>
                            <span className="admin-sku-chip">#{skuCode}</span>
                          </td>
                          <td>
                            <img src={p.image} alt={p.name} className="admin-table-thumb" />
                          </td>
                          <td>
                            <strong>{p.name}</strong>
                          </td>
                          <td>
                            <span className="admin-cat-chip">{p.category}</span>
                          </td>
                          <td>{formatCurrency(p.price)}</td>
                          <td>{p.stock ?? 10} unids</td>
                          <td>
                            <button
                              type="button"
                              className={`product-status-toggle-btn ${isAvailable ? 'active-btn' : 'inactive-btn'}`}
                              onClick={() => handleToggleProductStatus(p)}
                              title={isAvailable ? 'Clic para desactivar o marcar como vendido' : 'Clic para reactivar en el catálogo'}
                            >
                              {isAvailable ? '🟢 Disponible' : '🔴 Vendido / Inactivo (Reactivar)'}
                            </button>
                          </td>
                          <td>
                            <div className="admin-table-actions">
                              <button
                                type="button"
                                className="admin-edit-btn"
                                onClick={() => {
                                  setProductForm({
                                    id: Number(p.id),
                                    name: p.name,
                                    category: p.category,
                                    price: p.price,
                                    stock: p.stock ?? 10,
                                    imageUrl: p.image,
                                    description: p.description,
                                  });
                                  setActiveTab('create');
                                }}
                              >
                                ✏️ Editar
                              </button>
                              <button
                                type="button"
                                className="admin-delete-btn"
                                title="Desactivar producto"
                                onClick={() => handleToggleProductStatus(p)}
                              >
                                {p.isActive !== false ? '🚫' : '🔄'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* VISTA 100% RESPONSIVA EN TARJETAS PARA CELULARES */}
              <div className="admin-mobile-cards-list admin-mobile-view">
                {filteredCatalog.map((p) => {
                  const isAvailable = p.isActive !== false && (p.stock === undefined || p.stock > 0);
                  const skuCode = p.sku || `ART-${String(p.id).padStart(3, '0')}`;
                  return (
                    <div
                      key={p.id}
                      className={`admin-mobile-card ${!isAvailable ? 'card-inactive' : ''}`}
                    >
                      <div className="admin-mobile-card-top">
                        <img src={p.image} alt={p.name} className="admin-mobile-thumb" />
                        <div className="admin-mobile-info">
                          <div className="admin-mobile-sku-row">
                            <span className="admin-sku-chip">#{skuCode}</span>
                            <span className="admin-cat-chip">{p.category}</span>
                          </div>
                          <h4 className="admin-mobile-title">{p.name}</h4>
                          <div className="admin-mobile-meta">
                            <strong className="admin-mobile-price">{formatCurrency(p.price)}</strong>
                            <span className="admin-mobile-stock">Stock: {p.stock ?? 10}</span>
                          </div>
                        </div>
                      </div>

                      <div className="admin-mobile-card-bottom">
                        <button
                          type="button"
                          className={`product-status-toggle-btn mobile-full ${isAvailable ? 'active-btn' : 'inactive-btn'}`}
                          onClick={() => handleToggleProductStatus(p)}
                        >
                          {isAvailable ? '🟢 Disponible (Visible)' : '🔴 Vendido / Inactivo (Reactivar)'}
                        </button>

                        <div className="admin-mobile-btn-group">
                          <button
                            type="button"
                            className="admin-edit-btn mobile-edit-btn"
                            onClick={() => {
                              setProductForm({
                                id: Number(p.id),
                                name: p.name,
                                category: p.category,
                                price: p.price,
                                stock: p.stock ?? 10,
                                imageUrl: p.image,
                                description: p.description,
                              });
                              setActiveTab('create');
                            }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            type="button"
                            className="admin-delete-btn mobile-toggle-btn"
                            title={p.isActive !== false ? 'Desactivar' : 'Reactivar'}
                            onClick={() => handleToggleProductStatus(p)}
                          >
                            {p.isActive !== false ? '🚫 Desactivar' : '🔄 Reactivar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="admin-orders-container">
              <div className="admin-orders-header">
                <div>
                  <h3>Control de Pedidos y Despachos</h3>
                  <p className="admin-orders-subtitle">
                    Gestiona las órdenes registradas, actualiza su estado y comunícate directamente con el cliente por WhatsApp.
                  </p>
                </div>
                <div className="orders-summary-badges">
                  <span className="badge-total">📦 {orders.length} Totales</span>
                  <span className="badge-pending">
                    ⏳ {orders.filter((o) => o.status === 'Pending' || o.status === 'Pendiente').length} Pendientes
                  </span>
                </div>
              </div>

              {loadingOrders ? (
                <p className="admin-loading-text">Cargando pedidos desde MySQL...</p>
              ) : orders.length === 0 ? (
                <div className="empty-orders-state">
                  <p>Aún no se han registrado pedidos en la tienda.</p>
                </div>
              ) : (
                <div className="admin-orders-grid">
                  {orders.map((ord: any) => {
                    const statusClass =
                      ord.status === 'Completed' || ord.status === 'Completado'
                        ? 'status-completed'
                        : ord.status === 'Shipped' || ord.status === 'Enviado'
                        ? 'status-shipped'
                        : ord.status === 'Cancelled' || ord.status === 'Cancelado'
                        ? 'status-cancelled'
                        : 'status-pending';

                    const cleanPhone = String(ord.customerPhone || ord.customer?.phone || '').replace(/[^0-9]/g, '');
                    const customerName = ord.customerName || ord.customer?.fullName || 'Cliente';
                    const waLink = `https://wa.me/57${cleanPhone}?text=${encodeURIComponent(
                      `Hola ${customerName}, te escribimos de Accesorios Lilís respecto a tu pedido #${ord.id}.`
                    )}`;

                    const itemsList = Array.isArray(ord.items) ? ord.items : [];

                    return (
                      <div key={ord.id} className="admin-order-card">
                        <div className="order-card-header">
                          <div>
                            <span className="order-id-badge">Pedido #{ord.id}</span>
                            <span className="order-date-text">
                              {new Date(ord.createdAt).toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <span className={`order-status-pill ${statusClass}`}>{ord.status || 'Pendiente'}</span>
                        </div>

                        <div className="order-customer-info">
                          <strong>👤 {customerName}</strong>
                          <p>
                            📍 {ord.customerAddress || ord.customer?.address || 'Algeciras'}, {ord.customerCity || ord.customer?.city || 'Huila'}
                          </p>
                          <p>📞 {ord.customerPhone || ord.customer?.phone || 'No registrado'}</p>
                          {ord.notes && <p className="order-notes-box">📝 Nota: {ord.notes}</p>}
                        </div>

                        <div className="order-items-preview">
                          <strong>Artículos:</strong>
                          <ul>
                            {itemsList.map((item: any) => (
                              <li key={item.id}>
                                <span>{item.productName || item.product?.name || `Accesorio #${item.productId}`}</span>
                                <span>
                                  {item.quantity} x ${Number(item.unitPrice || 0).toLocaleString('es-CO')}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="order-total-row">
                            <span>Total del Pedido:</span>
                            <strong>${Number(ord.totalAmount || ord.total || 0).toLocaleString('es-CO')} COP</strong>
                          </div>
                        </div>

                        <div className="order-actions-row">
                          {cleanPhone ? (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="order-whatsapp-btn"
                            >
                              💬 Chat con Cliente
                            </a>
                          ) : (
                            <span className="no-phone-tag">Sin Teléfono</span>
                          )}
                          <div className="order-status-selector">
                            <label htmlFor={`status-${ord.id}`}>Estado:</label>
                            <select
                              id={`status-${ord.id}`}
                              value={ord.status || 'Pendiente'}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            >
                              <option value="Pendiente">⏳ Pendiente</option>
                              <option value="Enviado">🚚 Enviado</option>
                              <option value="Completado">✅ Completado</option>
                              <option value="Cancelado">❌ Cancelado</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'admins' && (
            <div className="admin-team-container">
              <div className="admin-team-header">
                <div>
                  <h3>Gestión del Equipo de Administradores</h3>
                  <p className="admin-team-subtitle">
                    Autoriza a nuevos miembros del equipo con su correo de Google (Gmail) para acceder al inventario y pedidos.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddAdmin} className="add-admin-form">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="new-admin-email">Correo de Google (Gmail) *</label>
                    <input
                      id="new-admin-email"
                      type="email"
                      required
                      placeholder="nuevo.administrador@gmail.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-admin-name">Nombre / Titular</label>
                    <input
                      id="new-admin-name"
                      type="text"
                      placeholder="Ej. Liliana Lombana"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="cta-button add-admin-btn" disabled={addingAdmin}>
                  {addingAdmin ? 'Guardando en MySQL...' : '➕ Autorizar como Administrador'}
                </button>
              </form>

              {loadingAdmins ? (
                <p className="admin-loading-text">Cargando administradores desde MySQL...</p>
              ) : (
                <div className="admin-users-list">
                  {admins.map((adm) => {
                    const isSelf = adm.email === user?.email;
                    const protectedList = [
                      'lombanaliliana64@gmail.com',
                      'brayanstidcorteslombana@gmail.com',
                      'bscl20062007@gmail.com',
                      'liliana.lombana@gmail.com',
                      'admin@accesorioslilis.com',
                    ];
                    const isMaster = protectedList.some(
                      (p) => p.toLowerCase() === adm.email?.toLowerCase()
                    );

                    return (
                      <div key={adm.id} className="admin-user-card">
                        <div className="admin-user-left">
                          <div className="admin-avatar">
                            {adm.pictureUrl ? (
                              <img src={adm.pictureUrl} alt={adm.fullName} />
                            ) : (
                              <span>{(adm.fullName || adm.email || 'A').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="admin-user-details">
                            <strong>
                              {adm.fullName} {isSelf && <span className="self-tag">(Tú)</span>}
                            </strong>
                            <span className="admin-email-text">{adm.email}</span>
                          </div>
                        </div>

                        <div className="admin-user-right">
                          <span className="admin-role-pill">👑 {adm.role}</span>
                          {isMaster ? (
                            <span className="admin-master-badge" title="Cuenta principal protegida">
                              🔒 Cuenta Principal
                            </span>
                          ) : !isSelf ? (
                            <button
                              type="button"
                              className="revoke-admin-btn"
                              onClick={() => handleRevokeAdmin(adm)}
                              title="Revocar permisos de administrador"
                            >
                              Revocar
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="admin-categories-container">
              <div className="admin-team-header">
                <div>
                  <h3>Gestión de Categorías y Colecciones</h3>
                  <p className="admin-team-subtitle">
                    Crea nuevas categorías (ej. "Tocados", "Tobilleras", "Relojes") para que aparezcan en el catálogo de la tienda.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddCategory} className="add-category-form">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="new-cat-name">Nombre de la Categoría *</label>
                    <input
                      id="new-cat-name"
                      type="text"
                      required
                      placeholder="Ej. Tocados y Peinetas, Tobilleras..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-cat-desc">Descripción (Opcional)</label>
                    <input
                      id="new-cat-desc"
                      type="text"
                      placeholder="Ej. Accesorios para el cabello y ocasiones especiales"
                      value={newCategoryDesc}
                      onChange={(e) => setNewCategoryDesc(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="cta-button add-admin-btn" disabled={addingCategory}>
                  {addingCategory ? 'Guardando en MySQL...' : '➕ Crear Nueva Categoría'}
                </button>
              </form>

              <div className="admin-team-header">
                <h4>Categorías Activas en la Base de Datos ({dbCategories.length}):</h4>
              </div>

              {loadingCategories ? (
                <p className="admin-loading-text">Cargando categorías...</p>
              ) : (
                <div className="admin-categories-grid">
                  {dbCategories.map((cat) => {
                    const slug = String(cat.name || '').toLowerCase();
                    const icon =
                      Object.keys(CATEGORY_ICON_MAP).find((k) => slug.includes(k))
                        ? CATEGORY_ICON_MAP[Object.keys(CATEGORY_ICON_MAP).find((k) => slug.includes(k))!]
                        : '💎';

                    return (
                      <div key={cat.id} className="admin-category-card">
                        <div className="cat-card-info">
                          <span className="cat-card-icon">{icon}</span>
                          <div className="cat-card-details">
                            <strong>{cat.name}</strong>
                            <small>{cat.description || 'Colección activa'}</small>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="revoke-admin-btn"
                          onClick={() => handleDeleteCategory(cat)}
                          title={`Eliminar categoría ${cat.name}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
