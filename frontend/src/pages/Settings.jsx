import React from 'react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Paramètres</h1>
      <div className="card p-6">
        <p className="text-slate-600">
          Ici tu pourras plus tard configurer la voix par défaut, la langue OCR, et gérer ton compte.
        </p>
      </div>
    </div>
  );
}
