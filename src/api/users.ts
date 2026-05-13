import { ApiError, request } from "./http";

export type User = {
  id: string;
  username: string;
  email: string;
  role: string;
};

export const UsersApiError = ApiError;
export type UsersApiError = ApiError;

export function listUsers(): Promise<User[]> {
  return request<User[]>("/users", "GET");
}

export function deleteUser(id: string): Promise<void> {
  return request<void>(`/users/${id}`, "DELETE");
}

export type UpdateUserRequest = Partial<{
  username: string;
  email: string;
  role: string;
}>;

export function updateUser(id: string, body: UpdateUserRequest): Promise<User> {
  return request<User>(`/users/${id}`, "PATCH", body);
}
