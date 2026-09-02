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

export type DevLoginPayload = {
  email: string;
  fullName?: string;
};
