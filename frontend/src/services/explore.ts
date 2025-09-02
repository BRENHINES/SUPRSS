import { api } from "./api";

export type ExploreFeed = {
  id: number;
  title: string;
  site_url?: string;
  feed_url?: string;
  followers?: number;
  description?: string;
};

export type ExploreArticle = {
  id: number;
  title: string;
  url?: string;
  summary?: string;
  feed_title?: string;
  published_at?: string;
};

export async function getPopularFeeds() {
  const { data } = await api.get<ExploreFeed[]>("/api/explore/popular-feeds");
  return data;
}

export async function getTrendingArticles(params?: { page?: number; size?: number }) {
  const { page = 1, size = 20 } = params || {};
  const { data } = await api.get<ExploreArticle[]>("/api/explore/trending", {
    params: { page, size },
  });
  return data;
}

export async function getCategories() {
  const { data } = await api.get<string[]>("/api/explore/categories");
  return data;
}

export async function discoverByCategory(category: string) {
  const { data } = await api.get<ExploreFeed[]>("/api/explore/discover", {
    params: { category },
  });
  return data;
}