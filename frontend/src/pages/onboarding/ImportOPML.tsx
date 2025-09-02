import React, { useState } from "react";
import { importOpml } from "@/services/opml";

const ImportOPML: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setMsg(null); setErr(null);
    try {
      const res = await importOpml(file);
      setMsg(`Import terminé. Flux importés: ${res.imported}`);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Import impossible pour l’instant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Importer un fichier OPML</h1>
      <p className="text-neutral-600">Sélectionnez votre fichier OPML d’abonnements.</p>

      {msg && <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">{msg}</div>}
      {err && <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">{err}</div>}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="file"
          accept=".opml,.xml"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full"
        />
        <button
          type="submit"
          disabled={!file || loading}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {loading ? "Import…" : "Importer"}
        </button>
      </form>
    </div>
  );
};

export default ImportOPML;
