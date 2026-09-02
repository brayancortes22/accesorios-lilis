import { apiFetch } from './config';

export interface CategoryModel {
  id: number;
  name: string;
  description?: string;
}

export const categoriesApi = {
  getAll: () => apiFetch<CategoryModel[]>('/categories'),

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

  delete: (id: number) =>
    apiFetch<CategoryModel>(`/categories/${id}`, {
      method: 'DELETE',
    }),
};
