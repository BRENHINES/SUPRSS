import React from "react";
import { Link } from "react-router-dom";

const SettingsIndex: React.FC = () => {
  const items = [
    { to: "/settings/profile", label: "Profil" },
    { to: "/settings/account", label: "Compte (email / username)" },
    { to: "/settings/security", label: "Sécurité (mot de passe)" },
    { to: "/settings/preferences", label: "Préférences" },
    { to: "/settings/notifications", label: "Notifications" },
    { to: "/settings/integrations", label: "Intégrations" },
    { to: "/settings/api-keys", label: "API Keys" },
  ];
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Paramètres</h1>
      <ul className="mt-6 space-y-2">
        {items.map((i) => (
          <li key={i.to}>
            <Link className="text-blue-600 hover:underline" to={i.to}>{i.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default SettingsIndex;
