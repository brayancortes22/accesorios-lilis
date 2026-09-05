import { apiFetch } from './config';
import type { Category, OrderRequest, Product } from '../types/product';

export const FALLBACK_CATEGORIES: Category[] = [
  { id: 'todos', name: 'Todos los productos' },
  { id: 'aretes', name: 'Aretes y Candongas' },
  { id: 'collares', name: 'Collares y Gargantillas' },
  { id: 'pulseras', name: 'Pulseras y Manillas' },
  { id: 'anillos', name: 'Anillos y Sets' },
  { id: 'bolsos', name: 'Bolsos y Carteras' },
];

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'ART-001',
    name: 'Aretes Flor Tejidos a Mano',
    description: 'Hermosos aretes 100% tejidos a mano con mostacilla fina y herrajes hipoalergénicos.',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
    tag: 'Más vendido',
    category: 'aretes',
    stock: 12,
    isActive: true,
  },
  {
    id: '2',
    sku: 'ART-002',
    name: 'Collar Artesanal Perla y Cristales',
    description: 'Gargantilla delicada tejida a mano con dije de perla y cristales finos.',
    price: 48000,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    tag: 'Tendencia',
    category: 'collares',
    stock: 8,
    isActive: true,
  },
  {
    id: '3',
    sku: 'ART-003',
    name: 'Pulsera Macramé Piedra Amatista',
    description: 'Pulsera artesanal tejida con cuarzos naturales y mostacilla de alta resistencia.',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1611591475155-4286fafb33e6?w=600&auto=format&fit=crop&q=80',
    tag: 'Nuevo',
    category: 'pulseras',
    stock: 15,
    isActive: true,
  },
  {
    id: '4',
    sku: 'ART-004',
    name: 'Set de Anillos Florales Zirconia',
    description: 'Set de 3 anillos ajustables con incrustaciones de zirconias brillantes.',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
    tag: 'Destacado',
    category: 'anillos',
    stock: 6,
    isActive: true,
  },
  {
    id: '5',
    sku: 'ART-005',
    name: 'Bolso de Mano Cuero Sintético Rosa',
    description: 'Cartera estructurada femenina con correa removible y herrajes dorados.',
    price: 75000,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
    tag: 'Exclusivo',
    category: 'bolsos',
    stock: 4,
    isActive: true,
  },
  {
    id: '6',
    sku: 'ART-006',
    name: 'Aretes Largos Flecos de Cristal',
    description: 'Aretes colgantes de fiesta para resaltar cualquier look de gala o noche.',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
    tag: 'Fiesta',
    category: 'aretes',
    stock: 10,
    isActive: true,
  },
  {
    id: '7',
    sku: 'ART-007',
    name: 'Gargantilla Minimalista Eslabón',
    description: 'Cadena eslabonada moderna en acero inoxidable dorado de alta durabilidad.',
    price: 39000,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80',
    tag: 'Acero',
    category: 'collares',
    stock: 9,
    isActive: true,
  },
  {
    id: '8',
    sku: 'ART-008',
    name: 'Manilla Ojo Turco Protección',
    description: 'Pulsera protectora con mostacilla japonesa y dije central esmaltado.',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&auto=format&fit=crop&q=80',
    tag: 'Protección',
    category: 'pulseras',
    stock: 20,
    isActive: true,
  },
];

export const getCategorySlug = (categoryName?: string, categoryId?: string | number): string => {
  if (!categoryName && !categoryId) return 'todos';
  const nameStr = String(categoryName || '').toLowerCase();
  if (nameStr.includes('arete') || nameStr.includes('candonga')) return 'aretes';
  if (nameStr.includes('collar') || nameStr.includes('gargantilla')) return 'collares';
  if (nameStr.includes('pulsera') || nameStr.includes('manilla')) return 'pulseras';
  if (nameStr.includes('anillo')) return 'anillos';
  if (nameStr.includes('bolso') || nameStr.includes('cartera')) return 'bolsos';
  return String(categoryId || categoryName || 'todos').toLowerCase();
};

export const productsApi = {
  getCategories: async (): Promise<Category[]> => {
    try {
      const data = await apiFetch<any[]>('/categories');
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((cat: any) => ({
          id: getCategorySlug(cat.name, cat.id),
          name: String(cat.name || 'Categoría'),
          description: cat.description ? String(cat.description) : undefined,
        }));
        return [{ id: 'todos', name: 'Todos los productos' }, ...mapped];
      }
      return FALLBACK_CATEGORIES;
    } catch {
      return FALLBACK_CATEGORIES;
    }
  },

  getProducts: async (category = 'todos', includeInactive = false): Promise<Product[]> => {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'todos') {
        params.append('category', category);
      }
      if (includeInactive) {
        params.append('includeInactive', 'true');
      }
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const data = await apiFetch<any[]>(`/products${queryString}`);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => {
          const numId = Number(item.id);
          const autoSku = !isNaN(numId) && numId > 0
            ? `ART-${String(numId).padStart(3, '0')}`
            : `ART-${String(item.id || '001')}`;

          return {
            id: String(item.id || Math.random()),
            sku: String(item.sku || autoSku),
            name: String(item.name || 'Accesorio Lilis'),
            description: String(item.description || ''),
            price: Number(item.price) || 0,
            image: String(item.imageUrl || item.image || FALLBACK_PRODUCTS[0].image),
            tag: item.tag ? String(item.tag) : item.category ? String(item.category).toUpperCase() : 'Lilis',
            category: String(item.category || 'general').toLowerCase(),
            stock: item.stock !== undefined ? Number(item.stock) : 10,
            isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
            deletedAt: item.deletedAt ? String(item.deletedAt) : null,
            hasOrders: item.hasOrders !== undefined ? Boolean(item.hasOrders) : false,
          };
        });
      }
    } catch {
      // Fallback a catálogo local
    }

    if (!category || category === 'todos') {
      return FALLBACK_PRODUCTS;
    }
    return FALLBACK_PRODUCTS.filter(
      (p) => String(p.category || '').toLowerCase() === String(category || '').toLowerCase(),
    );
  },

  toggleProductActive: async (id: string | number) => {
    return apiFetch<Product>(`/products/${id}/toggle-active`, {
      method: 'PATCH',
    });
  },

  reactivateProduct: async (id: string | number, stock?: number) => {
    const query = stock !== undefined ? `?stock=${stock}` : '';
    return apiFetch<{ message: string; product: Product }>(`/products/${id}/reactivate${query}`, {
      method: 'PATCH',
    });
  },

  deleteProduct: async (id: string | number) => {
    return apiFetch<{
      message: string;
      mode: 'deleted' | 'deactivated';
      id: number;
      product?: any;
    }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  createOrder: async (payload: OrderRequest) => {
    return apiFetch<{ order: { id: string | number }; totalLabel: string }>('/orders', {
      method: 'POST',
      body: payload,
    });
  },
};
