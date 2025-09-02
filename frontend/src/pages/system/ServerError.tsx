import React from "react";
import ErrorPage from "@/components/ui/ErrorPage";

type Props = { error?: unknown };

const ServerError: React.FC<Props> = ({ error }) => {
  let details: React.ReactNode = null;
  if (error instanceof Error) {
    details = (
      <div>
        <div className="font-semibold">Message</div>
        <pre className="whitespace-pre-wrap">{error.message}</pre>
        {error.stack && (
          <>
            <div className="mt-2 font-semibold">Stack</div>
            <pre className="text-xs whitespace-pre-wrap">{error.stack}</pre>
          </>
        )}
      </div>
    );
  }

  return (
    <ErrorPage
      code={500}
      title="Erreur interne"
      message="Quelque chose s’est mal passé. Réessayez plus tard."
      backTo="/"
      extra={details}
    />
  );
};

export default ServerError;
