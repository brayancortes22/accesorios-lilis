import { apiFetch } from './config';
import type { User } from '../types/auth';

export const usersApi = {
  getAdmins: () => apiFetch<User[]>('/users/admins'),

  addAdmin: (payload: { email: string; fullName?: string }) =>
    apiFetch<User>('/users/admins', {
      method: 'POST',
      body: payload,
    }),

  revokeAdmin: (id: number) =>
    apiFetch<{ message: string }>(`/users/admins/${id}`, {
      method: 'DELETE',
    }),
};
