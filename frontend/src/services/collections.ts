// src/services/collections.ts
import { api } from "./api";

export type Collection = {
  id: number;
  name: string;
  description?: string;
  is_public?: boolean;
  feeds_count?: number;
  members_count?: number;
  created_at?: string;   // ISO
  owner_id?: number;
};

export type Member = {
  user_id: number;
  username: string;
  email: string;
  role?: "owner" | "admin" | "member";
  created_at?: string;
};

export async function listCollections() {
  const { data } = await api.get<Collection[]>("/api/collections");
  return data;
}

export async function createCollection(p: { name: string; description?: string; is_public?: boolean }) {
  const { data } = await api.post<Collection>("/api/collections", p);
  return data;
}

export async function getCollection(id: number | string) {
  const { data } = await api.get<Collection>(`/api/collections/${id}`);
  return data;
}

export async function updateCollection(id: number | string, p: Partial<Collection>) {
  const { data } = await api.patch<Collection>(`/api/collections/${id}`, p);
  return data;
}

export async function deleteCollection(id: number | string) {
  await api.delete(`/api/collections/${id}`);
}

// --- membres ---
export async function listMembers(collectionId: number | string) {
  const { data } = await api.get<Member[]>(`/api/collections/${collectionId}/members`);
  return data;
}

// selon ton backend : { email } ou { user_id }
export async function addMemberByEmail(collectionId: number | string, email: string) {
  const { data } = await api.post<Member>(`/api/collections/${collectionId}/members`, { email });
  return data;
}

export async function removeMember(collectionId: number | string, userId: number) {
  await api.delete(`/api/collections/${collectionId}/members/${userId}`);
}
