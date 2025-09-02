import React, { useState } from "react";
import PublicLayout from "@/layouts/PublicLayout";

const Contact: React.FC = () => {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true); // placeholder
  };
  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-semibold">Contact</h1>
        <p className="mt-2 text-neutral-600">Une question ? Écrivez-nous.</p>

        {sent ? (
          <div className="mt-6 border rounded-2xl p-6 bg-green-50 text-green-800">
            Message envoyé (démo) ✅
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input className="w-full border rounded-lg p-3" placeholder="Email" required />
            <input className="w-full border rounded-lg p-3" placeholder="Sujet" required />
            <textarea className="w-full border rounded-lg p-3 h-32" placeholder="Message" required />
            <button className="px-4 py-2 rounded-lg bg-black text-white">Envoyer</button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
};

export default Contact;
