import React from 'react';

import React, { useState } from "react";

export default function UploadCard({ file, onDrop, onConvert, isSubmitting }) {
  const [isOver, setIsOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) onDrop(f);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={`relative rounded-2xl border p-5 transition ${
        isOver
          ? "border-indigo-400 bg-indigo-500/5"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 shadow-lg shadow-blue-500/20 shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V4m0 0l-4 4m4-4l4 4M6 20h12"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-base font-medium">Dépose ton PDF</h3>
          <p className="text-sm text-white/60">
            Glisse-dépose un fichier ou clique pour sélectionner (jusqu’à 100 MB).
          </p>

          <div className="mt-4 flex items-center gap-3">
            <label className="relative inline-flex">
              <input
                type="file"
                accept="application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onDrop(f);
                  e.currentTarget.value = "";
                }}
              />
              <span className="px-3 py-1.5 rounded-lg border border-white/10 bg-white text-neutral-900 text-sm">
                Choisir un fichier
              </span>
            </label>

            {file && (
              <span className="text-sm text-white/80 truncate max-w-[16rem]">
                {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
          </div>

          <button
            onClick={onConvert}
            disabled={!file || isSubmitting}
            className="mt-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
                       border border-white/10 bg-gradient-to-br from-blue-500 to-indigo-600
                       hover:opacity-95 disabled:opacity-50 transition shadow-lg shadow-blue-500/20"
          >
            {isSubmitting ? "Conversion…" : "Convertir"}
          </button>
        </div>
      </div>
    </div>
  );
}
