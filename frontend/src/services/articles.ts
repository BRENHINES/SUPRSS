// src/services/articles.ts
import { api } from "./api";

export type Article = {
  id: number;
  title: string;
  summary?: string;
  content_html?: string;  // si ton API renvoie du HTML
  url?: string;
  image_url?: string;
  feed_id?: number;
  feed_title?: string;
  published_at?: string;  // ISO
  is_saved?: boolean;
  is_starred?: boolean;
  is_read?: boolean;
};

export async function getArticle(id: string | number) {
  const { data } = await api.get<Article>(`/api/articles/${id}`);
  return data;
}

// Actions utilisateur
export async function markRead(id: string | number) {
  await api.post(`/api/articles/${id}/read`, {});
}
export async function toggleSave(id: string | number, save: boolean) {
  if (save) await api.post(`/api/articles/${id}/save`, {});
  else await api.delete(`/api/articles/${id}/save`);
}
export async function toggleStar(id: string | number, star: boolean) {
  if (star) await api.post(`/api/articles/${id}/star`, {});
  else await api.delete(`/api/articles/${id}/star`);
}

// Listes perso
export async function listSaved() {
  const { data } = await api.get<Article[]>(`/api/me/saved`);
  return data;
}
export async function listStarred() {
  const { data } = await api.get<Article[]>(`/api/me/starred`);
  return data;
}
export async function listHistory() {
  const { data } = await api.get<Article[]>(`/api/me/history`);
  return data;
}
