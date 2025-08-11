import React from "react";

export default function DropZone({ onFile, uploading }) {
  const inputRef = React.useRef(null);

  const onChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="rounded-2xl border-2 border-dashed border-neutral-700 p-8 text-center hover:border-neutral-500 transition-colors"
    >
      <div className="text-neutral-300 mb-2">Glissez-déposez votre PDF ici</div>
      <div className="text-xs text-neutral-500 mb-4">ou</div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center justify-center rounded-lg bg-white text-black px-3 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {uploading ? "Envoi…" : "Choisir un fichier"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}
