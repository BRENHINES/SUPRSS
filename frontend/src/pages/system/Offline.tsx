import React from "react";
import ErrorPage from "@/components/ui/ErrorPage";

const Offline: React.FC = () => (
  <ErrorPage
    code="☁️"
    title="Vous êtes hors-ligne"
    message="Vérifiez votre connexion internet puis réessayez."
    backTo="/"
    backLabel="Recharger"
  />
);

export default Offline;
