import React from "react";
import ErrorPage from "@/components/ui/ErrorPage";

const NotFound: React.FC = () => (
  <ErrorPage
    code={404}
    title="Page introuvable"
    message="La ressource demandée n’existe pas ou a été déplacée."
    backTo="/"
  />
);

export default NotFound;
