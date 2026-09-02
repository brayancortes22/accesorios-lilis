import React from 'react';
import type { Category } from '../types/product';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  todos: '✨',
  aretes: '🌸',
  collares: '📿',
  pulseras: '💫',
  anillos: '💍',
  bolsos: '👜',
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="category-filter-wrapper">
      <div className="category-filter-scroll" role="tablist" aria-label="Filtrar por categoría">
        {categories.map((category) => {
          const catId = String(category.id || '');
          const selId = String(selectedCategory || '');
          const isActive = selId.toLowerCase() === catId.toLowerCase();
          const icon = CATEGORY_ICONS[catId.toLowerCase()] || '💎';

          return (
            <button
              key={catId}
              role="tab"
              aria-selected={isActive}
              className={`category-chip ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(catId)}
              type="button"
            >
              <span className="chip-icon">{icon}</span>
              <span className="chip-text">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
