import { useState, useEffect, useCallback, useMemo } from 'react';
import { productsApi } from '../api/products';
import type { Category, Product } from '../types/product';

export type CatalogSortMode = 'dynamic' | 'newest' | 'price-asc' | 'price-desc';

/**
 * Algoritmo de rotación balanceada e inteligente:
 * 1. Agrupa los productos por categoría para garantizar variedad en las primeras posiciones.
 * 2. Baraja determinísticamente según la semilla (seed) para que cada recarga o rotación muestre productos distintos.
 * 3. Intercala los productos de diferentes colecciones (Arete -> Collar -> Pulsera -> Bolso...)
 * evitando que una sola categoría cope toda la primera pantalla y obligue al usuario a hacer scroll infinito.
 */
function smartRotateCatalog(items: Product[], seed: number): Product[] {
  if (items.length <= 2) return items;

  // 1. Agrupar por categoría
  const groups: Record<string, Product[]> = {};
  items.forEach((p) => {
    const cat = String(p.category || 'otros').toLowerCase().trim();
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(p);
  });

  // Generador pseudo-aleatorio con semilla
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const catKeys = Object.keys(groups);
  // Rotar el orden de las categorías según la semilla
  const catOffset = seed % catKeys.length;
  const rotatedCatKeys = [...catKeys.slice(catOffset), ...catKeys.slice(0, catOffset)];

  // 2. Barajar los productos dentro de cada categoría con la semilla
  rotatedCatKeys.forEach((key, keyIdx) => {
    const list = [...groups[key]];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + keyIdx * 43 + i * 17) * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    groups[key] = list;
  });

  // 3. Intercalar los productos de cada categoría de forma redonda (Round-Robin)
  const result: Product[] = [];
  let addedAny = true;
  let depth = 0;

  while (addedAny) {
    addedAny = false;
    for (const key of rotatedCatKeys) {
      if (depth < groups[key].length) {
        result.push(groups[key][depth]);
        addedAny = true;
      }
    }
    depth++;
  }

  return result;
}

export function useProducts() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortMode, setSortMode] = useState<CatalogSortMode>('dynamic');
  
  // Semilla aleatoria generada al entrar a la sesión, para que nunca vea siempre lo mismo
  const [rotationSeed, setRotationSeed] = useState<number>(() => {
    return Math.floor(Math.random() * 5000) + 1;
  });

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

  // Rotar el catálogo manualmente a demanda
  const rotateCatalog = useCallback(() => {
    setSortMode('dynamic');
    setRotationSeed((prev) => prev + 1);
  }, []);

  // 1. Filtrado reactivo en tiempo real
  const filteredProducts = useMemo(() => {
    return rawProducts.filter((p) => {
      // 0. Los clientes solo ven productos activos en la tienda pública
      if (p.isActive === false) return false;

      const term = searchTerm.trim().toLowerCase();

      // Si hay término de búsqueda, busca en todo el catálogo
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

        // Si además se seleccionó una categoría específica (no 'todos')
        if (selectedCategory && selectedCategory !== 'todos') {
          return String(p.category || '').toLowerCase() === selectedCategory.toLowerCase();
        }
        return true;
      }

      // Si no hay búsqueda, filtra por la categoría seleccionada
      if (!selectedCategory || selectedCategory === 'todos') {
        return true;
      }
      return String(p.category || '').toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [rawProducts, searchTerm, selectedCategory]);

  // 2. Ordenamiento y rotación inteligente
  const displayedProducts = useMemo(() => {
    const list = [...filteredProducts];

    switch (sortMode) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'newest':
        return list.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
      case 'dynamic':
      default:
        // Si hay una categoría individual seleccionada, baraja los elementos de esa categoría
        if (selectedCategory && selectedCategory !== 'todos') {
          const catList = [...list];
          const seededRandom = (s: number) => {
            const x = Math.sin(s) * 10000;
            return x - Math.floor(x);
          };
          for (let i = catList.length - 1; i > 0; i--) {
            const j = Math.floor(seededRandom(rotationSeed + i * 29) * (i + 1));
            [catList[i], catList[j]] = [catList[j], catList[i]];
          }
          return catList;
        }
        // Si estamos viendo "Todos", aplica la rotación balanceada entre categorías
        return smartRotateCatalog(list, rotationSeed);
    }
  }, [filteredProducts, sortMode, rotationSeed, selectedCategory]);

  return {
    categories,
    products: displayedProducts,
    allProducts: rawProducts,
    allProductsCount: rawProducts.length,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    sortMode,
    setSortMode,
    rotateCatalog,
    rotationSeed,
    loading,
    error,
    refreshProducts: () => {
      loadCategories();
      fetchProducts();
    },
  };
}
