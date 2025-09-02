// src/services/search.ts
import { api } from "./api";
import type { Article } from "./articles";

export type SearchResult = Article & { score?: number };

export async function searchArticles(
  q: string,
  opts?: { page?: number; size?: number }
) {
  const { page = 1, size = 20 } = opts || {};
  const { data } = await api.get<SearchResult[]>("/api/search", {
    params: { q, page, size },
  });
  return data;
}
