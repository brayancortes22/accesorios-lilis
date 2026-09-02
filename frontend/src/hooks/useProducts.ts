import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../api/products';
import type { Category, Product } from '../types/product';

export function useProducts() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const data = await productsApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error cargando categorías:', err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Siempre traemos todos los productos para permitir búsquedas globales y filtrado instantáneo
      const data = await productsApi.getProducts('todos');
      setRawProducts(data);
    } catch (err) {
      console.error('Error cargando productos:', err);
      setError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    fetchProducts();
  }, [loadCategories, fetchProducts]);

  // Filtrado reactivo en tiempo real
  const filteredProducts = rawProducts.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    
    // Si hay término de búsqueda, busca en todo el catálogo (código SKU, id, nombre, descripción, categoría, tag)
    if (term) {
      const cleanTerm = term.replace('#', '');
      const matchSearch =
        String(p.sku || '').toLowerCase().includes(cleanTerm) ||
        String(p.id || '').toLowerCase() === cleanTerm ||
        String(p.name || '').toLowerCase().includes(term) ||
        String(p.description || '').toLowerCase().includes(term) ||
        String(p.category || '').toLowerCase().includes(term) ||
        String(p.tag || '').toLowerCase().includes(term);

      if (!matchSearch) return false;

      // Si además se seleccionó una categoría específica (no 'todos'), también respeta el filtro
      if (selectedCategory && selectedCategory !== 'todos') {
        return String(p.category || '').toLowerCase() === selectedCategory.toLowerCase();
      }
      return true;
    }

    // Si no hay búsqueda, filtra estrictamente por la categoría seleccionada
    if (!selectedCategory || selectedCategory === 'todos') {
      return true;
    }
    return String(p.category || '').toLowerCase() === selectedCategory.toLowerCase();
  });

  return {
    categories,
    products: filteredProducts,
    allProducts: rawProducts,
    allProductsCount: rawProducts.length,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    refreshProducts: () => {
      loadCategories();
      fetchProducts();
    },
  };
}
