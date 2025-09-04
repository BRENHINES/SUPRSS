// src/pages/settings/SettingsProfile.tsx
import React, { useState } from "react";
import SettingsLayout from "@/components/layout/SettingsLayout";

const SettingsProfile: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call /api/users/me
  };

  return (
    <SettingsLayout>
      <div className="rounded-2xl bg-white border border-neutral-200 p-5 md:p-6">
        <h1 className="text-2xl font-semibold">Profil</h1>
        <form onSubmit={onSubmit} className="mt-4 grid gap-4 max-w-xl">
          <div>
            <label className="text-sm text-neutral-700">Nom complet</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600 bg-white"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-700">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600 bg-white resize-y"
            />
          </div>
          <button className="rounded-xl bg-emerald-800 text-white px-5 py-2.5 font-medium hover:bg-emerald-900 transition">
            Enregistrer
          </button>
        </form>
      </div>
    </SettingsLayout>
  );
};

export default SettingsProfile;
