import { apiFetch } from './config';

export interface CategoryModel {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
  deletedAt?: string | null;
  productCount?: number;
  hasProducts?: boolean;
}

export const categoriesApi = {
  getAll: (includeInactive = false) =>
    apiFetch<CategoryModel[]>(`/categories${includeInactive ? '?includeInactive=true' : ''}`),

  create: (payload: { name: string; description?: string }) =>
    apiFetch<CategoryModel>('/categories', {
      method: 'POST',
      body: payload,
    }),

  update: (id: number, payload: { name: string; description?: string }) =>
    apiFetch<CategoryModel>(`/categories/${id}`, {
      method: 'PUT',
      body: payload,
    }),

  reactivate: (id: number) =>
    apiFetch<{ message: string; category: CategoryModel }>(`/categories/${id}/reactivate`, {
      method: 'PATCH',
    }),

  delete: (id: number, hard = false) =>
    apiFetch<{
      message: string;
      mode: 'deleted' | 'deactivated';
      id: number;
      category?: CategoryModel;
    }>(`/categories/${id}${hard ? '?hard=true' : ''}`, {
      method: 'DELETE',
    }),
};
