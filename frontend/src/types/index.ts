export type { CartItem, Category, CustomerForm, OrderRequest, Product } from './product';
export type { AuthResponse, DevLoginPayload, GoogleLoginPayload, User, UserRole } from './auth';

export type StatusState = {
  type: 'success' | 'error' | '';
  message: string;
};
