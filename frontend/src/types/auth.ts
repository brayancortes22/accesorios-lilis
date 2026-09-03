export type UserRole = 'Admin' | 'Customer';

export type User = {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  pictureUrl?: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type GoogleLoginPayload = {
  idToken: string;
  captchaToken?: string;
};

export type LoginWithPasswordPayload = {
  email: string;
  password: string;
  fullName?: string;
};

export type DevLoginPayload = {
  email: string;
  password?: string;
  fullName?: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type CheckEmailPayload = {
  email: string;
};

export type CheckEmailResponse = {
  exists: boolean;
  email: string;
  fullName?: string | null;
  hasPassword: boolean;
  message: string;
};

export type RegisterPayload = {
  email: string;
  fullName: string;
  password: string;
};
