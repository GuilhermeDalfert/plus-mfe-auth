const API_BASE = import.meta.env.VITE_MS_AUTH_URL ?? "http://localhost:3001";

// TODO: alinhar com o enum UserRole do plus-ms-auth quando os perfis forem definidos.
// Valores atuais são placeholders.
export const USER_ROLES = ["VENDEDOR", "GERENTE", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
};

export class AuthApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function request<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthApiError("Não foi possível contatar o servidor", 0);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new AuthApiError(text || `Erro ${res.status}`, res.status);
  }

  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined as T;
  return res.json() as Promise<T>;
}

export function login(body: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", body);
}

export function register(body: RegisterRequest): Promise<void> {
  return request<void>("/auth/register", body);
}
