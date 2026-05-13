export const API_BASE = import.meta.env.VITE_MS_AUTH_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Não foi possível contatar o servidor", 0);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(text || `Erro ${res.status}`, res.status);
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined as T;

  return res.json() as Promise<T>;
}
