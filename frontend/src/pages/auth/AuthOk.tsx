// src/pages/AuthOk.tsx
import { Link } from "react-router-dom";

export default function AuthOk() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-semibold">Connecté ✅</h1>
      <p className="mt-2 text-gray-600">Vous êtes bien authentifié.</p>
      <div className="mt-4">
        <Link className="text-blue-600" to="/">Aller à l’accueil</Link>
      </div>
    </div>
  );
}
