import { ApiError, request } from "./http";

// TODO: alinhar com o enum UserRole do plus-ms-auth quando os perfis forem definidos.
// Valores atuais são placeholders.
export const USER_ROLES = ["USER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
};

export type CurrentUser = {
  id: string;
  username: string;
  email: string;
  role: string;
};

export const AuthApiError = ApiError;
export type AuthApiError = ApiError;

export function login(body: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", "POST", body);
}

export function register(body: RegisterRequest): Promise<void> {
  return request<void>("/auth/register", "POST", body);
}

export function me(): Promise<CurrentUser> {
  return request<CurrentUser>("/auth/me", "GET");
}
