import React from 'react';

import { useCallback, useRef, useState } from "react";

export default function Dropzone({ onFileSelected, disabled }) {
  const inputRef = useRef(null);
  const [isOver, setOver] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFiles = useCallback((files) => {
    const f = files?.[0];
    if (!f) return;
    setFileName(f.name);
    onFileSelected?.(f);
  }, [onFileSelected]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`card p-5 transition ${isOver ? "ring-2 ring-[rgb(var(--brand))]" : ""}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-white/70">Glisse-dépose ton PDF ici, ou sélectionne-le.</div>
          <div className="text-xs text-white/40 mt-1">Taille max : 100 MB • Sorties : MP3 & M4B</div>
          {!!fileName && <div className="mt-2 text-white/80 text-sm">Sélectionné : <span className="font-medium">{fileName}</span></div>}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-muted"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            Choisir un fichier
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />
    </div>
  );
}
