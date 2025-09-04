// src/services/search.ts
import axios from "axios";
export type SearchResult = { id: string; title: string; feed_title?: string };
export async function searchArticles(q: string): Promise<SearchResult[]> {
  const base = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
  try {
    const { data } = await axios.get(`${base}/api/search`, { params: { q } });
    return Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
