import { apiFetch } from './config';
import type {
  AuthResponse,
  ChangePasswordPayload,
  CheckEmailPayload,
  CheckEmailResponse,
  DevLoginPayload,
  GoogleLoginPayload,
  LoginWithPasswordPayload,
  RegisterPayload,
  User,
} from '../types/auth';

export const authApi = {
  loginWithGoogle: (payload: GoogleLoginPayload) =>
    apiFetch<AuthResponse>('/auth/google', {
      method: 'POST',
      body: payload,
    }),

  checkEmail: (payload: CheckEmailPayload) =>
    apiFetch<CheckEmailResponse>('/auth/check-email', {
      method: 'POST',
      body: payload,
    }),

  register: (payload: RegisterPayload) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    }),

  loginWithPassword: (payload: LoginWithPasswordPayload) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    }),

  devLogin: (payload: DevLoginPayload) =>
    apiFetch<AuthResponse>('/auth/dev-login', {
      method: 'POST',
      body: payload,
    }),

  changePassword: (payload: ChangePasswordPayload) =>
    apiFetch<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: payload,
    }),

  getMe: () => apiFetch<User>('/auth/me'),

  logout: () => apiFetch<{ message: string }>('/auth/logout', { method: 'POST' }),
};
