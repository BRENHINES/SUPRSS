import React from "react";
import ErrorPage from "@/components/ui/ErrorPage";

const Forbidden: React.FC = () => (
  <ErrorPage
    code={403}
    title="Accès refusé"
    message="Vous n’avez pas les permissions nécessaires pour accéder à cette page."
    backTo="/"
  />
);

export default Forbidden;
