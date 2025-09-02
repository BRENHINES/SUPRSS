import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getArticle,
  toggleSave,
  toggleStar,
  markRead,
  type Article,
} from "@/services/articles";

const ArticleReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [a, setA] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const data = await getArticle(id);
        setA(data);
        // marquer lu (optionnel)
        try { await markRead(id); } catch {}
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? "Chargement impossible");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onToggleSave = async () => {
    if (!a || !id) return;
    try {
      setBusy(true);
      await toggleSave(id, !a.is_saved);
      setA({ ...a, is_saved: !a.is_saved });
    } finally {
      setBusy(false);
    }
  };

  const onToggleStar = async () => {
    if (!a || !id) return;
    try {
      setBusy(true);
      await toggleStar(id, !a.is_starred);
      setA({ ...a, is_starred: !a.is_starred });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/feeds" className="text-blue-600">← Retour aux flux</Link>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded-lg border"
            onClick={onToggleSave}
            disabled={busy}
            title="Enregistrer"
          >
            {a?.is_saved ? "Retirer des favoris" : "Enregistrer"}
          </button>
          <button
            className="px-3 py-1 rounded-lg border"
            onClick={onToggleStar}
            disabled={busy}
            title="Étoiler"
          >
            {a?.is_starred ? "Retirer l’étoile" : "Mettre une étoile"}
          </button>
          {a?.url && (
            <a className="px-3 py-1 rounded-lg bg-black text-white" href={a.url} target="_blank" rel="noreferrer">
              Ouvrir l’article
            </a>
          )}
        </div>
      </div>

      {loading && <div>Chargement…</div>}
      {err && <div className="text-red-600">{err}</div>}

      {a && (
        <article className="prose max-w-none">
          <h1>{a.title}</h1>
          {a.feed_title && (
            <div className="text-sm text-neutral-600 mb-4">Depuis <span className="font-medium">{a.feed_title}</span></div>
          )}
          {a.image_url && (
            <img src={a.image_url} alt="" className="rounded-xl mb-4" />
          )}
          {/* si ton API renvoie du HTML */}
          {a.content_html ? (
            <div dangerouslySetInnerHTML={{ __html: a.content_html }} />
          ) : (
            <p className="text-neutral-700">{a.summary || "—"}</p>
          )}
        </article>
      )}
    </div>
  );
};

export default ArticleReader;
