// src/services/feeds.ts
import { api } from "./api";

export type Feed = {
  id: number;
  title: string;
  feed_url: string;
  site_url?: string;
  unread_count?: number;
  last_updated?: string;   // ISO date
  created_at?: string;     // ISO date
};

export async function listFeeds() {
  const { data } = await api.get<Feed[]>("/api/feeds");
  return data;
}

export async function createFeed(p: { feed_url: string; title?: string }) {
  const { data } = await api.post<Feed>("/api/feeds", p);
  return data;
}

export async function getFeed(id: number | string) {
  const { data } = await api.get<Feed>(`/api/feeds/${id}`);
  return data;
}

export async function updateFeed(id: number | string, p: Partial<Feed>) {
  const { data } = await api.patch<Feed>(`/api/feeds/${id}`, p);
  return data;
}

export async function deleteFeed(id: number | string) {
  await api.delete(`/api/feeds/${id}`);
}

export async function refreshFeed(id: number | string) {
  // Optionnel côté backend
  await api.post(`/api/feeds/${id}/refresh`, {});
}

export async function subscribeToFeed(p: { feed_id: number }) {
  const { data } = await api.post("/api/feeds/subscribe", p);
  return data;
}