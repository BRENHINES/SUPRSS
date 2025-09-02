import React from "react";
import { Link } from "react-router-dom";

type Props = {
  code: string | number;
  title: string;
  message?: string;
  backTo?: string;         // route du bouton principal
  backLabel?: string;      // libellé du bouton
  extra?: React.ReactNode; // éléments additionnels (stack, etc.)
};

const ErrorPage: React.FC<Props> = ({
  code,
  title,
  message,
  backTo = "/",
  backLabel = "Retour à l’accueil",
  extra,
}) => {
  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="max-w-xl w-full text-center">
        <div className="text-7xl font-extrabold tracking-tight">{code}</div>
        <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
        {message && <p className="mt-2 text-gray-600">{message}</p>}
        {extra && <div className="mt-4 text-left bg-gray-50 border rounded p-3 overflow-auto">{extra}</div>}
        <div className="mt-6">
          <Link
            to={backTo}
            className="inline-block rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
