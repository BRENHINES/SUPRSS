import React, { useMemo } from "react";

const ApiKeys: React.FC = () => {
  const access = useMemo(()=> localStorage.getItem("suprss.access") || localStorage.getItem("access_token") || "", []);
  const refresh = useMemo(()=> localStorage.getItem("suprss.refresh") || "", []);

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); alert("Copié !"); } catch {}
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold">API Keys</h1>
      <p className="text-sm text-neutral-600 mt-2">Espace placeholder. À remplacer par une vraie gestion de clés côté backend.</p>

      <div className="mt-6 space-y-4">
        <div>
          <div className="text-sm font-medium">Access token (localStorage)</div>
          <div className="mt-1 p-2 border rounded break-all bg-neutral-50">{access || "—"}</div>
          {access && <button className="mt-2 px-3 py-1 border rounded" onClick={()=>copy(access)}>Copier</button>}
        </div>

        <div>
          <div className="text-sm font-medium">Refresh token (localStorage)</div>
          <div className="mt-1 p-2 border rounded break-all bg-neutral-50">{refresh || "—"}</div>
          {refresh && <button className="mt-2 px-3 py-1 border rounded" onClick={()=>copy(refresh)}>Copier</button>}
        </div>
      </div>
    </div>
  );
};
export default ApiKeys;
