import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from '../api/config';
import { usersApi } from '../api/users';
import { authApi } from '../api/auth';
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

const COURIER_STEPS_REGULAR = [
  { step: 1, label: 'Recibido', icon: '📝' },
  { step: 2, label: 'Empacando', icon: '📦' },
  { step: 3, label: 'Enviado', icon: '🚚' },
  { step: 4, label: 'Entregado', icon: '✨' },
];

const COURIER_STEPS_CUSTOM = [
  { step: 1, label: 'Por Encargo', icon: '📝' },
  { step: 2, label: 'Tejiendo', icon: '🧶' },
  { step: 3, label: 'Empacando', icon: '📦' },
  { step: 4, label: 'Enviado', icon: '🚚' },
  { step: 5, label: 'Entregado', icon: '✨' },
];

const getOrderStep = (status?: string, isCustom?: boolean): number => {
  const s = String(status || '').toLowerCase().trim();
  if (s === 'cancelado' || s === 'cancelled') return -1;
  if (isCustom) {
    if (s === 'completado' || s === 'completed' || s === 'entregado') return 5;
    if (s === 'enviado' || s === 'shipped') return 4;
    if (s === 'empacando' || s === 'preparando') return 3;
    if (s === 'en elaboración' || s === 'en elaboracion' || s === 'tejiendo') return 2;
    return 1; // Por Encargo / Recibido
  }
  if (s === 'completado' || s === 'completed' || s === 'entregado') return 4;
  if (s === 'enviado' || s === 'shipped') return 3;
  if (s === 'empacando' || s === 'preparando') return 2;
  return 1; // Pendiente / Recibido
};

const parseOrderNotes = (rawNotes?: string) => {
  if (!rawNotes) return { isCustom: false, delivery: null, payment: null, userNote: null };
  const isCustom = /\[POR ENCARGO\]/i.test(rawNotes);
  const deliveryMatch = rawNotes.match(/\[Entrega:\s*([^\]]+)\]/i);
  const paymentMatch = rawNotes.match(/\[Pago:\s*([^\]]+)\]/i);
  const userNote = rawNotes
    .replace(/\[POR ENCARGO\]/gi, '')
    .replace(/\[Entrega:\s*[^\]]+\]/gi, '')
    .replace(/\[Pago:\s*[^\]]+\]/gi, '')
    .trim();
  return {
    isCustom,
    delivery: deliveryMatch ? deliveryMatch[1].trim() : null,
    payment: paymentMatch ? paymentMatch[1].trim() : null,
    userNote: userNote || null,
  };
};

const getStatusNotificationMsg = (ord: any, status: string) => {
  const name = ord.customerName || ord.customer?.fullName || 'estimada clienta';
  const orderNum = ord.id;
  const s = String(status || '').toLowerCase().trim();

  if (s === 'por encargo') {
    return `¡Hola ${name}! 🌸✨ Confirmamos recibido tu pedido por encargo #${orderNum} en Accesorios Lilís. Muy pronto comenzaremos la elaboración artesanal de tu accesorio exclusivo. ¡Te mantendremos al tanto! 🧶`;
  }
  if (s === 'en elaboración' || s === 'en elaboracion') {
    return `¡Hola ${name}! 🧶✨ ¡Buenas noticias! Tu accesorio del encargo #${orderNum} ya está siendo elaborado y tejido a mano con todo el amor y detalle por Liliana en nuestro taller de Algeciras. Te avisaremos apenas esté listo para empaque. 💖`;
  }
  if (s === 'empacando') {
    return `¡Hola ${name}! 🌸✨ Te contamos con mucha alegría que tu pedido #${orderNum} de Accesorios Lilís ya está en proceso de empaque y preparación artesanal 📦. ¡Te avisaremos en cuanto salga a despacho!`;
  }
  if (s === 'enviado') {
    return `¡Hola ${name}! 🚚💨 Tu pedido #${orderNum} de Accesorios Lilís ya fue enviado / despachado y está en camino hacia tu dirección. ¡Pronto lo tendrás contigo!`;
  }
  if (s === 'completado' || s === 'entregado') {
    return `¡Hola ${name}! 💎 ¡Tu pedido #${orderNum} ha sido completado y entregado! Esperamos que disfrutes mucho tus joyas y accesorios. Muchas gracias por apoyar nuestro emprendimiento en Algeciras. 🌸`;
  }
  if (s === 'cancelado') {
    return `Hola ${name}, te informamos que el pedido #${orderNum} en Accesorios Lilís ha sido cancelado. Si tienes alguna inquietud adicional o deseas solicitar un nuevo diseño, con mucho gusto te atenderemos.`;
  }
  return `¡Hola ${name}! Te saludamos de Accesorios Lilís respecto a tu pedido #${orderNum}. ¿En qué podemos asesorarte hoy?`;
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
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<string>('all');

  const fetchCatalog = useCallback(async () => {
    try {
      const data = await productsApi.getProducts('todos', true);
      if (Array.isArray(data) && data.length > 0) {
        setLocalProducts(data);
      }
    } catch (err) {
      console.error('Error sincronizando catálogo admin:', err);
    }
  }, []);

  useEffect(() => {
    if (products && products.length > 0 && localProducts.length === 0) {
      setLocalProducts(products);
    }
  }, [products, localProducts.length]);

  const filteredCatalog = localProducts.filter((p) => {
    // 1. Filtrar por estado: activos en tienda vs archivados/desactivados
    const isArchived = p.isActive === false || Boolean(p.deletedAt);
    if (statusFilter === 'active' && isArchived) return false;
    if (statusFilter === 'archived' && !isArchived) return false;

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

  // Paginación del Catálogo Administrador (10 productos por página)
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reiniciar a página 1 al cambiar de filtro o término de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [adminSearch, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCatalog = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredCatalog.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCatalog, currentPage]);

  const getPaginationRange = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const wrap = document.querySelector('.admin-catalog-wrapper');
    if (wrap) {
      wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

  // Cloudinary storage state (Automated & Pre-configured)
  const [uploadingImage, setUploadingImage] = useState(false);
  const CLOUDINARY_CLOUD_NAME = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) || 'w51mvoxm';
  const CLOUDINARY_UPLOAD_PRESET = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string) || 'accesorios_preset';

  // Admin users state
  const [admins, setAdmins] = useState<User[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Admin password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
      fetchCatalog();
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'admins') fetchAdmins();
      if (activeTab === 'categories') fetchDbCategories();
    }
  }, [isOpen, activeTab, fetchCatalog]);

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

  // Handle image file selection, smart WebP compression & automatic Cloudinary cloud upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedback(null);
    setUploadingImage(true);

    try {
      // 1. Redimensionar y comprimir localmente con Canvas a formato WebP ligero (ahorra ancho de banda)
      const compressedBlob = await new Promise<Blob | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 950;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_DIM) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              }
            } else {
              if (height > MAX_DIM) {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.84);
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });

      if (!compressedBlob) {
        throw new Error('No se pudo procesar la imagen seleccionada.');
      }

      // 2. Subir automáticamente a Cloudinary (CDN en la nube)
      const formData = new FormData();
      formData.append('file', compressedBlob, `producto_${Date.now()}.webp`);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'accesorios_lilis/productos');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error?.message || `Error al subir a la nube (${res.status})`);
      }

      const data = await res.json();
      setProductForm((prev) => ({ ...prev, imageUrl: data.secure_url }));
      setFeedback({
        type: 'success',
        message: '✓ Fotografía optimizada y almacenada en la nube con éxito.',
      });
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      // Fallback de emergencia local si falla la red
      try {
        const fallbackUrl = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.readAsDataURL(file);
          r.onloadend = () => resolve(r.result as string);
        });
        setProductForm((prev) => ({ ...prev, imageUrl: fallbackUrl }));
        setFeedback({
          type: 'success',
          message: 'Foto cargada con respaldo local.',
        });
      } catch {
        setFeedback({
          type: 'error',
          message: err instanceof Error ? err.message : 'Error al procesar la fotografía.',
        });
      }
    } finally {
      setUploadingImage(false);
    }
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

  // Dedicated Reactivate handler for archived/soft-deleted products
  const handleReactivateProduct = async (product: Product) => {
    const confirmText = `¿Deseas volver a activar "${product.name}" en la tienda pública?\n\n• Volverá a aparecer en el catálogo y tus clientes podrán comprarlo nuevamente.\n• Si su inventario estaba en 0 o agotado, se restaurará 1 unidad disponible por defecto (pieza artesanal única, puedes editarla cuando gustes).`;
    if (!window.confirm(confirmText)) return;

    // Optimistic instant UI update
    setLocalProducts((prev) =>
      prev.map((p) =>
        String(p.id) === String(product.id)
          ? { ...p, isActive: true, deletedAt: null, stock: p.stock && p.stock > 0 ? p.stock : 1 }
          : p
      )
    );

    try {
      const res = await productsApi.reactivateProduct(product.id);
      setFeedback({
        type: 'success',
        message: res.message || `¡"${product.name}" ha sido reactivado en la tienda con éxito!`,
      });
      fetchCatalog();
      onProductCreatedOrUpdated();
    } catch (err) {
      fetchCatalog();
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al reactivar el accesorio.',
      });
    }
  };

  // Instant real-time optimistic toggle
  const handleToggleProductStatus = async (product: Product) => {
    const targetActive = product.isActive === false;

    // 1. Optimistic instant UI update
    setLocalProducts((prev) =>
      prev.map((p) =>
        String(p.id) === String(product.id)
          ? {
              ...p,
              isActive: targetActive,
              deletedAt: targetActive ? null : new Date().toISOString(),
              stock: targetActive && (!p.stock || p.stock <= 0) ? 1 : p.stock,
            }
          : p
      )
    );

    try {
      await productsApi.toggleProductActive(product.id);
      setFeedback({
        type: 'success',
        message: `El producto "${product.name}" ha sido ${targetActive ? 'activado (visible en tienda)' : 'desactivado / marcado como vendido'}.`,
      });
      fetchCatalog();
      onProductCreatedOrUpdated();
    } catch (err) {
      // Revert if error
      fetchCatalog();
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al cambiar estado del producto.',
      });
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const hasHistory = product.hasOrders;
    const confirmText = hasHistory
      ? `"${product.name}" tiene pedidos asociados en tu historial contable de ventas.\n\nPara proteger tus registros contables, no se borrará físicamente: se desactivará y archivará fuera de la tienda pública.\n\nPodrás volver a activarlo en cualquier momento desde la pestaña "Archivados / Con Pedidos".\n\n¿Deseas continuar?`
      : `¿Estás seguro de que deseas eliminar "${product.name}"?\n\n• Si fue creado por error y no tiene ventas, se borrará definitivamente de la base de datos.\n• Si ya tiene pedidos asociados, se archivará y protegerá tu contabilidad.`;

    if (!window.confirm(confirmText)) return;

    try {
      const res = await productsApi.deleteProduct(product.id);

      if (res.mode === 'deleted') {
        // Borrado definitivo de MySQL
        setLocalProducts((prev) => prev.filter((p) => String(p.id) !== String(product.id)));
      } else {
        // Desactivado / Archivado por tener órdenes asociadas
        setLocalProducts((prev) =>
          prev.map((p) =>
            String(p.id) === String(product.id)
              ? { ...p, isActive: false, deletedAt: new Date().toISOString(), hasOrders: true }
              : p
          )
        );
      }

      setFeedback({
        type: 'success',
        message: res.message || 'Operación completada con éxito.',
      });

      fetchCatalog();
      onProductCreatedOrUpdated();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al eliminar el producto.',
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'Las contraseñas no coinciden. Verifica e intenta de nuevo.' });
      return;
    }

    try {
      setChangingPassword(true);
      setPasswordFeedback(null);
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordFeedback({
        type: 'success',
        message: '¡Tu contraseña ha sido actualizada con éxito! Tu cuenta y privilegios de administrador están protegidos.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al cambiar la contraseña.',
      });
    } finally {
      setChangingPassword(false);
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
                  <div className={`file-upload-dropzone ${uploadingImage ? 'uploading' : ''}`}>
                    <input
                      type="file"
                      id="p-file-input"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={handleImageFileChange}
                      className="hidden-file-input"
                    />
                    <label htmlFor="p-file-input" className="file-upload-label">
                      {uploadingImage ? (
                        <>
                          <div className="upload-spinner" />
                          <span>☁️ Optimizando y subiendo imagen a la nube...</span>
                          <small>Por favor espera un momento mientras generamos tu URL ultra-rápida</small>
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span>Toca aquí para seleccionar una foto de tu galería o cámara</span>
                          <small>Se optimiza y almacena en la nube automáticamente</small>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="form-group">
                    <input
                      id="p-img"
                      type="url"
                      placeholder="https://images.unsplash.com/... o enlace de imagen"
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
              {/* FILTROS DE ESTADO: ACTIVOS EN TIENDA / ARCHIVADOS CON PEDIDOS / TODOS */}
              <div className="admin-status-filters-pills">
                <button
                  type="button"
                  className={`admin-status-pill active-pill ${statusFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('active')}
                >
                  🟢 Activos en Tienda ({localProducts.filter((p) => p.isActive !== false && !p.deletedAt).length})
                </button>
                <button
                  type="button"
                  className={`admin-status-pill archived-pill ${statusFilter === 'archived' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('archived')}
                >
                  📦 Archivados / Con Pedidos ({localProducts.filter((p) => p.isActive === false || Boolean(p.deletedAt)).length})
                </button>
                <button
                  type="button"
                  className={`admin-status-pill ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  🔘 Todos ({localProducts.length})
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
                    {paginatedCatalog.map((p) => {
                      const isArchived = p.isActive === false || Boolean(p.deletedAt);
                      const isAvailable = !isArchived && (p.stock === undefined || p.stock > 0);
                      const hasOrderHistory = Boolean(p.hasOrders);
                      const skuCode = p.sku || `ART-${String(p.id).padStart(3, '0')}`;
                      return (
                        <tr key={p.id} className={isArchived ? 'table-row-inactive table-row-archived' : ''}>
                          <td>
                            <span className="admin-sku-chip">#{skuCode}</span>
                          </td>
                          <td>
                            <img src={p.image} alt={p.name} className="admin-table-thumb" />
                          </td>
                          <td>
                            <strong>{p.name}</strong>
                            {hasOrderHistory && (
                              <span className="admin-has-orders-tag" title="Tiene pedidos registrados en el historial de ventas">
                                🧾 Con pedidos
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="admin-cat-chip">{p.category}</span>
                          </td>
                          <td>{formatCurrency(p.price)}</td>
                          <td>{p.stock ?? 10} unids</td>
                          <td>
                            {isArchived ? (
                              <div className="admin-status-col-wrap">
                                <span className="admin-badge-archived">
                                  {hasOrderHistory ? '📦 Con Historial' : '🔴 Desactivado'}
                                </span>
                                <button
                                  type="button"
                                  className="admin-reactivate-btn"
                                  onClick={() => handleReactivateProduct(p)}
                                  title="Volver a activar este accesorio y mostrarlo en la tienda"
                                >
                                  🔄 Reactivar en Tienda
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className={`product-status-toggle-btn ${isAvailable ? 'active-btn' : 'inactive-btn'}`}
                                onClick={() => handleToggleProductStatus(p)}
                                title={isAvailable ? 'Clic para desactivar o marcar como vendido' : 'Clic para reactivar en el catálogo'}
                              >
                                {isAvailable ? '🟢 Disponible' : '⚠️ Agotado / Inactivo'}
                              </button>
                            )}
                          </td>
                          <td>
                            <div className="admin-table-actions">
                              <button
                                type="button"
                                className="admin-edit-btn"
                                title="Editar accesorio"
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
                              {isArchived ? (
                                <button
                                  type="button"
                                  className="admin-action-reactivate-icon-btn"
                                  title="Volver a activar en la tienda"
                                  onClick={() => handleReactivateProduct(p)}
                                >
                                  🔄 Reactivar
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="admin-delete-btn"
                                  title="Desactivar producto"
                                  onClick={() => handleToggleProductStatus(p)}
                                >
                                  🚫
                                </button>
                              )}
                              <button
                                type="button"
                                className="admin-remove-btn"
                                title={hasOrderHistory ? "Archivado con pedidos (protegido contra borrado permanente)" : "Eliminar accesorio"}
                                onClick={() => handleDeleteProduct(p)}
                              >
                                🗑️
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
                {paginatedCatalog.map((p) => {
                  const isArchived = p.isActive === false || Boolean(p.deletedAt);
                  const isAvailable = !isArchived && (p.stock === undefined || p.stock > 0);
                  const hasOrderHistory = Boolean(p.hasOrders);
                  const skuCode = p.sku || `ART-${String(p.id).padStart(3, '0')}`;
                  return (
                    <div
                      key={p.id}
                      className={`admin-mobile-card ${isArchived ? 'card-inactive' : ''}`}
                    >
                      <div className="admin-mobile-card-top">
                        <img src={p.image} alt={p.name} className="admin-mobile-thumb" />
                        <div className="admin-mobile-info">
                          <div className="admin-mobile-sku-row">
                            <span className="admin-sku-chip">#{skuCode}</span>
                            <span className="admin-cat-chip">{p.category}</span>
                            {hasOrderHistory && (
                              <span className="admin-has-orders-tag">🧾 Pedidos</span>
                            )}
                          </div>
                          <h4 className="admin-mobile-title">{p.name}</h4>
                          <div className="admin-mobile-meta">
                            <strong className="admin-mobile-price">{formatCurrency(p.price)}</strong>
                            <span className="admin-mobile-stock">Stock: {p.stock ?? 10}</span>
                          </div>
                        </div>
                      </div>

                      <div className="admin-mobile-card-bottom">
                        {isArchived ? (
                          <div className="admin-mobile-archived-box">
                            <span className="admin-badge-archived">
                              {hasOrderHistory ? '📦 Archivado (Tiene pedidos asociados)' : '🔴 Desactivado'}
                            </span>
                            <button
                              type="button"
                              className="admin-reactivate-btn mobile-full"
                              onClick={() => handleReactivateProduct(p)}
                            >
                              🔄 Volver a Activar en Tienda
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={`product-status-toggle-btn mobile-full ${isAvailable ? 'active-btn' : 'inactive-btn'}`}
                            onClick={() => handleToggleProductStatus(p)}
                          >
                            {isAvailable ? '🟢 Disponible (Visible en tienda)' : '⚠️ Agotado / Inactivo'}
                          </button>
                        )}

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
                          {isArchived ? (
                            <button
                              type="button"
                              className="admin-action-reactivate-icon-btn mobile-toggle-btn"
                              title="Reactivar en tienda"
                              onClick={() => handleReactivateProduct(p)}
                            >
                              🔄 Reactivar
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="admin-delete-btn mobile-toggle-btn"
                              title="Desactivar"
                              onClick={() => handleToggleProductStatus(p)}
                            >
                              🚫
                            </button>
                          )}
                          <button
                            type="button"
                            className="admin-remove-btn mobile-remove-btn"
                            title="Eliminar accesorio del catálogo"
                            onClick={() => handleDeleteProduct(p)}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BARRA DE PAGINACIÓN ELEGANTE (10 PRODUCTOS POR PÁGINA) */}
              {filteredCatalog.length > 0 && (
                <div className="admin-pagination-container">
                  <div className="admin-pagination-info">
                    Mostrando <strong>{(currentPage - 1) * PAGE_SIZE + 1}</strong> -{' '}
                    <strong>{Math.min(currentPage * PAGE_SIZE, filteredCatalog.length)}</strong> de{' '}
                    <strong>{filteredCatalog.length}</strong> productos
                    <span className="admin-page-count-tag">
                      Página {currentPage} de {totalPages}
                    </span>
                  </div>

                  {totalPages > 1 && (
                    <div className="admin-pagination-controls" role="navigation" aria-label="Paginación del catálogo de administrador">
                      <button
                        type="button"
                        className="admin-pagination-btn admin-page-prev"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        aria-label="Ir a página anterior"
                      >
                        ‹ Anterior
                      </button>

                      <div className="admin-pagination-numbers">
                        {getPaginationRange(currentPage, totalPages).map((item, idx) => {
                          if (item === '...') {
                            return (
                              <span key={`ellipsis-${idx}`} className="admin-pagination-ellipsis">
                                ...
                              </span>
                            );
                          }
                          const pageNum = Number(item);
                          const isActive = pageNum === currentPage;
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              className={`admin-pagination-num-btn ${isActive ? 'active' : ''}`}
                              onClick={() => handlePageChange(pageNum)}
                              aria-current={isActive ? 'page' : undefined}
                              aria-label={`Ir a página ${pageNum}`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className="admin-pagination-btn admin-page-next"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        aria-label="Ir a página siguiente"
                      >
                        Siguiente ›
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (() => {
            const countTotal = orders.length;
            const countCustom = orders.filter((o) => {
              const s = String(o.status || '').toLowerCase().trim();
              return s === 'por encargo' || /\[por encargo\]/i.test(o.notes || '');
            }).length;
            const countCrafting = orders.filter((o) => {
              const s = String(o.status || '').toLowerCase().trim();
              return s === 'en elaboración' || s === 'en elaboracion' || s === 'tejiendo';
            }).length;
            const countPending = orders.filter((o) => {
              const s = String(o.status || '').toLowerCase().trim();
              return s === 'pendiente' || s === 'pending';
            }).length;
            const countPacking = orders.filter((o) => String(o.status || '').toLowerCase().trim() === 'empacando').length;
            const countShipped = orders.filter((o) => {
              const s = String(o.status || '').toLowerCase().trim();
              return s === 'enviado' || s === 'shipped';
            }).length;
            const countCompleted = orders.filter((o) => {
              const s = String(o.status || '').toLowerCase().trim();
              return s === 'completado' || s === 'completed' || s === 'entregado';
            }).length;
            const countCancelled = orders.filter((o) => {
              const s = String(o.status || '').toLowerCase().trim();
              return s === 'cancelado' || s === 'cancelled';
            }).length;
            const totalRevenue = orders
              .filter((o) => {
                const s = String(o.status || '').toLowerCase();
                return s !== 'cancelado' && s !== 'cancelled';
              })
              .reduce((acc, o) => acc + Number(o.totalAmount || o.total || 0), 0);

            const filteredOrders = orders.filter((ord: any) => {
              // Status filter
              if (ordersStatusFilter !== 'all') {
                const s = String(ord.status || '').toLowerCase().trim();
                if (ordersStatusFilter === 'Por Encargo' && s !== 'por encargo' && !/\[por encargo\]/i.test(ord.notes || '')) return false;
                if (ordersStatusFilter === 'En Elaboración' && s !== 'en elaboración' && s !== 'en elaboracion' && s !== 'tejiendo') return false;
                if (ordersStatusFilter === 'Pendiente' && s !== 'pendiente' && s !== 'pending') return false;
                if (ordersStatusFilter === 'Empacando' && s !== 'empacando') return false;
                if (ordersStatusFilter === 'Enviado' && s !== 'enviado' && s !== 'shipped') return false;
                if (ordersStatusFilter === 'Completado' && s !== 'completado' && s !== 'completed' && s !== 'entregado') return false;
                if (ordersStatusFilter === 'Cancelado' && s !== 'cancelado' && s !== 'cancelled') return false;
              }

              // Search query
              if (!ordersSearch.trim()) return true;
              const q = ordersSearch.trim().toLowerCase().replace('#', '');
              const idStr = String(ord.id).toLowerCase();
              const nameStr = String(ord.customerName || ord.customer?.fullName || '').toLowerCase();
              const phoneStr = String(ord.customerPhone || ord.customer?.phone || '').toLowerCase();
              const cityStr = String(ord.customerCity || ord.customer?.city || '').toLowerCase();
              const notesStr = String(ord.notes || '').toLowerCase();
              const itemsStr = Array.isArray(ord.items)
                ? ord.items.map((it: any) => String(it.productName || it.product?.name || '')).join(' ').toLowerCase()
                : '';

              return (
                idStr.includes(q) ||
                nameStr.includes(q) ||
                phoneStr.includes(q) ||
                cityStr.includes(q) ||
                notesStr.includes(q) ||
                itemsStr.includes(q)
              );
            });

            return (
              <div className="admin-orders-container">
                {/* ENCABEZADO Y RESUMEN KPI */}
                <div className="admin-orders-header">
                  <div>
                    <h3>📦 Control de Pedidos & Despachos</h3>
                    <p className="admin-orders-subtitle">
                      Seguimiento de la traza de paquetería, actualización de estados y notificación automática por WhatsApp.
                    </p>
                  </div>
                </div>

                {/* TARJETAS KPI DE RESUMEN */}
                <div className="orders-metrics-bar">
                  <div className="order-kpi-item">
                    <span className="kpi-icon">📦</span>
                    <div>
                      <span className="kpi-num">{countTotal}</span>
                      <span className="kpi-lbl">Total Órdenes</span>
                    </div>
                  </div>
                  <div className="order-kpi-item kpi-pending">
                    <span className="kpi-icon">⏳</span>
                    <div>
                      <span className="kpi-num">{countPending}</span>
                      <span className="kpi-lbl">Pendientes</span>
                    </div>
                  </div>
                  <div className="order-kpi-item kpi-packing">
                    <span className="kpi-icon">🎁</span>
                    <div>
                      <span className="kpi-num">{countPacking}</span>
                      <span className="kpi-lbl">Empacando</span>
                    </div>
                  </div>
                  <div className="order-kpi-item kpi-shipped">
                    <span className="kpi-icon">🚚</span>
                    <div>
                      <span className="kpi-num">{countShipped}</span>
                      <span className="kpi-lbl">Enviados</span>
                    </div>
                  </div>
                  <div className="order-kpi-item kpi-completed">
                    <span className="kpi-icon">✅</span>
                    <div>
                      <span className="kpi-num">{countCompleted}</span>
                      <span className="kpi-lbl">Completados</span>
                    </div>
                  </div>
                  <div className="order-kpi-item kpi-revenue">
                    <span className="kpi-icon">💰</span>
                    <div>
                      <span className="kpi-num">{formatCurrency(totalRevenue)}</span>
                      <span className="kpi-lbl">Total Ventas</span>
                    </div>
                  </div>
                </div>

                {/* BARRA DE BÚSQUEDA Y FILTROS DE ESTADO */}
                <div className="orders-toolbar-wrapper">
                  <div className="orders-search-input-box">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Buscar por #ID de pedido, nombre de cliente, teléfono, ciudad o artículo..."
                      value={ordersSearch}
                      onChange={(e) => setOrdersSearch(e.target.value)}
                      className="orders-search-field"
                    />
                    {ordersSearch && (
                      <button type="button" className="orders-search-clear-btn" onClick={() => setOrdersSearch('')}>
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="orders-filter-chips">
                    <button
                      type="button"
                      className={`order-chip-btn ${ordersStatusFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setOrdersStatusFilter('all')}
                    >
                      🔘 Todos ({countTotal})
                    </button>
                    {countCustom > 0 && (
                      <button
                        type="button"
                        className={`order-chip-btn chip-custom ${ordersStatusFilter === 'Por Encargo' ? 'active' : ''}`}
                        onClick={() => setOrdersStatusFilter('Por Encargo')}
                      >
                        ✨ Por Encargo ({countCustom})
                      </button>
                    )}
                    {countCrafting > 0 && (
                      <button
                        type="button"
                        className={`order-chip-btn chip-crafting ${ordersStatusFilter === 'En Elaboración' ? 'active' : ''}`}
                        onClick={() => setOrdersStatusFilter('En Elaboración')}
                      >
                        🧶 En Elaboración ({countCrafting})
                      </button>
                    )}
                    <button
                      type="button"
                      className={`order-chip-btn chip-pending ${ordersStatusFilter === 'Pendiente' ? 'active' : ''}`}
                      onClick={() => setOrdersStatusFilter('Pendiente')}
                    >
                      ⏳ Pendientes ({countPending})
                    </button>
                    <button
                      type="button"
                      className={`order-chip-btn chip-packing ${ordersStatusFilter === 'Empacando' ? 'active' : ''}`}
                      onClick={() => setOrdersStatusFilter('Empacando')}
                    >
                      📦 Empacando ({countPacking})
                    </button>
                    <button
                      type="button"
                      className={`order-chip-btn chip-shipped ${ordersStatusFilter === 'Enviado' ? 'active' : ''}`}
                      onClick={() => setOrdersStatusFilter('Enviado')}
                    >
                      🚚 Enviados ({countShipped})
                    </button>
                    <button
                      type="button"
                      className={`order-chip-btn chip-completed ${ordersStatusFilter === 'Completado' ? 'active' : ''}`}
                      onClick={() => setOrdersStatusFilter('Completado')}
                    >
                      ✅ Completados ({countCompleted})
                    </button>
                    {countCancelled > 0 && (
                      <button
                        type="button"
                        className={`order-chip-btn chip-cancelled ${ordersStatusFilter === 'Cancelado' ? 'active' : ''}`}
                        onClick={() => setOrdersStatusFilter('Cancelado')}
                      >
                        ❌ Cancelados ({countCancelled})
                      </button>
                    )}
                  </div>
                </div>

                {loadingOrders ? (
                  <div className="orders-loading-state">
                    <p>Cargando pedidos en tiempo real desde MySQL...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="orders-empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <h4>No se encontraron pedidos</h4>
                    <p>
                      {ordersSearch || ordersStatusFilter !== 'all'
                        ? 'No hay pedidos que coincidan con los filtros de búsqueda aplicados.'
                        : 'Aún no se han registrado órdenes en la tienda.'}
                    </p>
                    {(ordersSearch || ordersStatusFilter !== 'all') && (
                      <button
                        type="button"
                        className="cta-button"
                        onClick={() => {
                          setOrdersSearch('');
                          setOrdersStatusFilter('all');
                        }}
                      >
                        Ver todos los pedidos
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="orders-cards-list">
                    {filteredOrders.map((ord: any) => {
                      const currentStatus = ord.status || 'Pendiente';
                      const notesParsed = parseOrderNotes(ord.notes);
                      const isCustom = notesParsed.isCustom || currentStatus === 'Por Encargo' || currentStatus === 'En Elaboración' || currentStatus === 'En Elaboracion';
                      const currentStep = getOrderStep(currentStatus, isCustom);
                      const isCancelled = currentStep === -1;
                      const stepsToRender = isCustom ? COURIER_STEPS_CUSTOM : COURIER_STEPS_REGULAR;

                      const statusClass =
                        currentStatus === 'Completado' || currentStatus === 'Completed' || currentStatus === 'Entregado'
                          ? 'status-badge-completed'
                          : currentStatus === 'Enviado' || currentStatus === 'Shipped'
                          ? 'status-badge-shipped'
                          : currentStatus === 'Empacando'
                          ? 'status-badge-packing'
                          : currentStatus === 'En Elaboración' || currentStatus === 'En Elaboracion'
                          ? 'status-badge-crafting'
                          : currentStatus === 'Por Encargo'
                          ? 'status-badge-custom'
                          : isCancelled
                          ? 'status-badge-cancelled'
                          : 'status-badge-pending';

                      const cleanPhone = String(ord.customerPhone || ord.customer?.phone || '').replace(/[^0-9]/g, '');
                      const customerName = ord.customerName || ord.customer?.fullName || 'Cliente';

                      const directChatLink = cleanPhone
                        ? `https://wa.me/57${cleanPhone}?text=${encodeURIComponent(
                            `Hola ${customerName}, te escribimos de Accesorios Lilís respecto a tu pedido #${ord.id}.`
                          )}`
                        : '';

                      const notifyStatusMsg = getStatusNotificationMsg(ord, currentStatus);
                      const notifyStatusLink = cleanPhone
                        ? `https://wa.me/57${cleanPhone}?text=${encodeURIComponent(notifyStatusMsg)}`
                        : '';

                      const itemsList = Array.isArray(ord.items) ? ord.items : [];
                      const totalAmount = Number(ord.totalAmount || ord.total || 0);

                      return (
                        <div key={ord.id} className={`premium-order-card ${isCancelled ? 'card-cancelled' : ''}`}>
                          {/* CABECERA DE LA TARJETA */}
                          <div className="p-order-header">
                            <div className="p-order-id-block">
                              <span className="p-order-tag">Pedido #{ord.id}</span>
                              <span className="p-order-date">
                                📅 {new Date(ord.createdAt).toLocaleDateString('es-CO', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <span className={`p-order-status-badge ${statusClass}`}>
                              {currentStatus === 'Empacando'
                                ? '📦 Empacando'
                                : currentStatus === 'Enviado'
                                ? '🚚 Enviado'
                                : currentStatus === 'Completado' || currentStatus === 'Entregado'
                                ? '✅ Entregado'
                                : currentStatus === 'En Elaboración' || currentStatus === 'En Elaboracion'
                                ? '🧶 En Elaboración'
                                : currentStatus === 'Por Encargo'
                                ? '📝 Por Encargo'
                                : isCancelled
                                ? '❌ Cancelado'
                                : '⏳ Pendiente'}
                            </span>
                          </div>

                          {/* TRAZA DE PAQUETERÍA / TRACKING STEPPER */}
                          <div className="courier-tracker-panel">
                            <span className="tracker-caption">
                              {isCustom ? '🧵 Traza de Creación & Despacho Artesanal:' : 'Traza de Paquetería:'}
                            </span>
                            <div className="courier-stepper">
                              {stepsToRender.map((st, idx) => {
                                const isDone = !isCancelled && currentStep >= st.step;
                                const isCurrent = !isCancelled && currentStep === st.step;
                                return (
                                  <React.Fragment key={st.step}>
                                    <div className={`stepper-point ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''} ${isCancelled ? 'cancelled' : ''}`}>
                                      <div className="stepper-dot">
                                        {isDone && currentStep > st.step ? '✓' : st.icon}
                                      </div>
                                      <span className="stepper-title">{st.label}</span>
                                    </div>
                                    {idx < stepsToRender.length - 1 && (
                                      <div className={`stepper-trail ${!isCancelled && currentStep > st.step ? 'done' : ''}`} />
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </div>

                          {/* DATOS DEL CLIENTE Y ENVÍO */}
                          <div className="p-order-details-grid">
                            <div className="p-customer-box">
                              <div className="customer-row-main">
                                <span className="customer-name-heading">👤 {customerName}</span>
                                {cleanPhone && (
                                  <span className="customer-phone-val">📞 {ord.customerPhone || ord.customer?.phone}</span>
                                )}
                              </div>
                              <p className="customer-location-val">
                                📍 {ord.customerAddress || ord.customer?.address || 'Algeciras'}, {ord.customerCity || ord.customer?.city || 'Huila'}
                              </p>

                              {/* ETIQUETAS DE FORMA DE ENTREGA Y PAGO PARSEADAS */}
                              <div className="p-meta-tags-row">
                                {isCustom && (
                                  <span className="meta-tag-pill custom-order-tag">
                                    ✨ Hecho por Encargo
                                  </span>
                                )}
                                {notesParsed.delivery && (
                                  <span className="meta-tag-pill delivery-tag">
                                    🛵 {notesParsed.delivery}
                                  </span>
                                )}
                                {notesParsed.payment && (
                                  <span className="meta-tag-pill payment-tag">
                                    💳 {notesParsed.payment}
                                  </span>
                                )}
                              </div>

                              {/* NOTAS ADICIONALES DEL CLIENTE */}
                              {notesParsed.userNote && (
                                <div className="customer-note-callout">
                                  <strong>📝 Nota del cliente:</strong> <span>{notesParsed.userNote}</span>
                                </div>
                              )}
                            </div>

                            {/* LISTA DE ARTÍCULOS PEDIDOS */}
                            <div className="p-items-box">
                              <span className="items-box-heading">Artículos del Pedido ({itemsList.length}):</span>
                              <div className="p-items-scrollable">
                                {itemsList.map((item: any) => (
                                  <div key={item.id} className="p-item-line">
                                    <span className="p-item-qty">{item.quantity}x</span>
                                    <span className="p-item-name">
                                      {item.productName || item.product?.name || `Accesorio #${item.productId}`}
                                    </span>
                                    <strong className="p-item-price">
                                      {formatCurrency(Number(item.unitPrice || 0) * Number(item.quantity || 1))}
                                    </strong>
                                  </div>
                                ))}
                              </div>

                              <div className="p-order-total-bar">
                                <span>Total a cobrar:</span>
                                <strong className="p-order-total-amount">{formatCurrency(totalAmount)} COP</strong>
                              </div>
                            </div>
                          </div>

                          {/* BARRA DE ACCIONES Y CAMBIO DE ESTADO */}
                          <div className="p-order-footer-actions">
                            <div className="status-update-control">
                              <label htmlFor={`status-${ord.id}`}>Estado:</label>
                              <select
                                id={`status-${ord.id}`}
                                className="order-status-styled-select"
                                value={currentStatus}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              >
                                <option value="Pendiente">⏳ Pendiente (Por Confirmar)</option>
                                <option value="Por Encargo">📝 Por Encargo (Solicitud Recibida)</option>
                                <option value="En Elaboración">🧶 En Elaboración (Tejiendo / Fabricando)</option>
                                <option value="Empacando">📦 Empacando (En Preparación)</option>
                                <option value="Enviado">🚚 Enviado (En Camino)</option>
                                <option value="Completado">✅ Completado (Entregado)</option>
                                <option value="Cancelado">❌ Cancelado</option>
                              </select>
                            </div>

                            <div className="order-chat-buttons">
                              {cleanPhone ? (
                                <>
                                  <a
                                    href={notifyStatusLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-whatsapp-notify"
                                    title="Enviar actualización automática del estado por WhatsApp"
                                  >
                                    📲 Notificar Estado
                                  </a>
                                  <a
                                    href={directChatLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-whatsapp-direct"
                                    title="Abrir chat de WhatsApp con el cliente"
                                  >
                                    💬 Chat Cliente
                                  </a>
                                </>
                              ) : (
                                <span className="no-phone-badge">Sin teléfono registrado</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

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

              {/* SECCIÓN DE CAMBIO Y PROTECCIÓN DE CONTRASEÑA */}
              <div className="admin-password-card">
                <div className="admin-team-header">
                  <div>
                    <h4>🔐 Seguridad & Contraseña de tu Cuenta ({user?.email})</h4>
                    <p className="admin-team-subtitle">
                      Actualiza tu clave de acceso para proteger tu inventario, clientes y pedidos contra accesos no autorizados.
                    </p>
                  </div>
                </div>

                {passwordFeedback && (
                  <div className={`admin-feedback-banner ${passwordFeedback.type === 'success' ? 'success' : 'error'}`}>
                    {passwordFeedback.message}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="admin-password-form">
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label htmlFor="adm-cur-pass">Contraseña Actual *</label>
                      <input
                        id="adm-cur-pass"
                        type="password"
                        required
                        placeholder="Tu clave actual"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="adm-new-pass">Nueva Contraseña *</label>
                      <input
                        id="adm-new-pass"
                        type="password"
                        required
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="adm-conf-pass">Confirmar Nueva Contraseña *</label>
                      <input
                        id="adm-conf-pass"
                        type="password"
                        required
                        placeholder="Repite la nueva clave"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <button type="submit" className="cta-button add-admin-btn" disabled={changingPassword}>
                    {changingPassword ? 'Guardando...' : '🔒 Actualizar Mi Contraseña'}
                  </button>
                </form>
              </div>
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
