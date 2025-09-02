import { api } from "./api";

export type User = {
  id: number;
  email: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  is_verified?: boolean;
  theme?: "light" | "dark" | "auto";
  font_size?: "small" | "medium" | "large";
  articles_per_page?: number;
  auto_mark_read?: boolean;

  // Oauth flags
  google_id?: string | null;
  github_id?: string | null;
  microsoft_id?: string | null;
};

export async function getMe() {
  const { data } = await api.get<User>("/api/users/me");
  return data;
}

export async function updateUser(userId: number, payload: Partial<User>) {
  const { data } = await api.patch<User>(`/api/users/${userId}`, payload);
  return data;
}

export async function changeMyPassword(old_password: string, new_password: string) {
  await api.patch(`/api/users/me/password`, { old_password, new_password });
}

export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("file", file);
  // backend: POST /api/users/me/avatar → UserOut
  const { data } = await api.post<User>("/api/users/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteAvatar() {
  // backend: DELETE /api/users/me/avatar (204 ou UserOut selon ta version)
  try {
    const { data } = await api.delete<User>("/api/users/me/avatar");
    return data;
  } catch {
    // si 204 sans body
    return null;
  }
}
