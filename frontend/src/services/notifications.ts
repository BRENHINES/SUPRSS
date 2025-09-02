// src/services/notifications.ts
import { api } from "./api";

export type Notification = {
  id: number;
  type: string;           // "info" | "warning" | "new_article" | ...
  title: string;
  body?: string;
  link?: string;          // URL vers un article / une page
  created_at: string;     // ISO
  read_at?: string | null;
};

export async function listNotifications() {
  const { data } = await api.get<Notification[]>("/api/notifications");
  return data;
}

export async function markNotificationRead(id: number) {
  await api.post(`/api/notifications/${id}/read`, {});
}

export async function markAllNotificationsRead() {
  await api.post(`/api/notifications/read_all`, {});
}
