// src/services/app.ts
export type Feed = { id: number; title: string; site?: string; unread?: number };
export type Article = { id: number; title: string; feedId: number; date: string };
export type Collection = { id: number; name: string; members?: number };

export const FeedsAPI = {
  async list(): Promise<Feed[]> {
    return [
      { id: 1, title: "SUPRSS Blog", site: "suprss.com", unread: 12 },
      { id: 2, title: "Hacker News", site: "news.ycombinator.com", unread: 5 },
    ];
  },
  async create(input: { url: string; folder?: string }) {
    return { id: Math.floor(Math.random() * 10000), title: input.url, site: "", unread: 0 };
  },
  async get(id: number) {
    return { id, title: "Exemple feed", site: "example.com", unread: 3 } as Feed;
  },
  async update(id: number, p: Partial<Feed>) {
    return { id, title: p.title ?? "Updated", site: p.site ?? "", unread: 0 } as Feed;
  },
  async remove(id: number) { return { ok: true }; }
};

export const CollectionsAPI = {
  async list(): Promise<Collection[]> { return [{ id: 1, name: "Equipe Produit", members: 3 }]; },
  async create(input: { name: string }) { return { id: Date.now(), name: input.name, members: 1 }; },
  async get(id: number) { return { id, name: "Equipe Produit", members: 3 } as Collection; },
  async members(id: number) { return [{ id: 10, name: "Camille" }, { id: 11, name: "Louis" }]; }
};

export const ArticlesAPI = {
  async byFeed(feedId: number): Promise<Article[]> {
    return [
      { id: 100, title: "Hello SUPRSS", feedId, date: new Date().toISOString() },
      { id: 101, title: "Tips & Tricks", feedId, date: new Date().toISOString() },
    ];
  }
};
