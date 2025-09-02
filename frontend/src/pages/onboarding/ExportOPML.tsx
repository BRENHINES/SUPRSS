import React, { useState } from "react";
import { exportOpml } from "@/services/opml";

const ExportOPML: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setDownloading(true); setErr(null);
    try {
      const blob = await exportOpml();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "subscriptions.opml";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Export impossible pour l’instant.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Exporter mes abonnements (OPML)</h1>
      <p className="text-neutral-600">Téléchargez un fichier OPML de vos flux.</p>
      {err && <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">{err}</div>}
      <button
        onClick={run}
        disabled={downloading}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {downloading ? "Génération…" : "Télécharger mon OPML"}
      </button>
    </div>
  );
};

export default ExportOPML;
