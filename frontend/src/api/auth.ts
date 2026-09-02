import { apiFetch } from './config';
import type { AuthResponse, DevLoginPayload, GoogleLoginPayload, User } from '../types/auth';

export const authApi = {
  loginWithGoogle: (payload: GoogleLoginPayload) =>
    apiFetch<AuthResponse>('/auth/google', {
      method: 'POST',
      body: payload,
    }),

  devLogin: (payload: DevLoginPayload) =>
    apiFetch<AuthResponse>('/auth/dev-login', {
      method: 'POST',
      body: payload,
    }),

  getMe: () => apiFetch<User>('/auth/me'),
};
