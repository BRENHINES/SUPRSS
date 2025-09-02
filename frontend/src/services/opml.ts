// TODO: branche sur ton backend quand prêt.
export async function importOpml(file: File): Promise<{ imported: number }> {
  // ex: await api.post("/api/feeds/import-opml", formData)
  await new Promise(r => setTimeout(r, 600));
  return { imported: 0 };
}

export async function exportOpml(): Promise<Blob> {
  // ex: const { data } = await api.get("/api/feeds/export-opml", { responseType: "blob" })
  const dummy = `<?xml version="1.0" encoding="UTF-8"?><opml version="2.0"><head><title>SUPRSS</title></head><body></body></opml>`;
  return new Blob([dummy], { type: "text/xml" });
}
