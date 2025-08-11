import React from "react";

function StatusBadge({ status, error }) {
  if (error)
    return (
      <span className="text-xs px-2 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30">
        ERREUR
      </span>
    );
  if (status === "DONE")
    return (
      <span className="text-xs px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
        TERMINÉ
      </span>
    );
  return (
    <span className="text-xs px-2 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
      {status}
    </span>
  );
}

export default function History({ items, onClear, onRemove }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/60">
        Aucun élément pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={onClear}
          className="text-xs px-2 py-1 rounded-md border border-white/10 hover:bg-white/10 transition"
        >
          Vider
        </button>
      </div>

      {items.map((j) => (
        <div
          key={j.id}
          className="rounded-xl border border-white/10 bg-white/5 p-4 grid gap-2 sm:grid-cols-[1fr_auto] items-center"
        >
          <div>
            <div className="flex items-center gap-2">
              <div className="font-medium">{j.filename || "—"}</div>
              <StatusBadge status={j.status} error={j.error} />
            </div>
            <div className="text-xs text-white/60 mt-1">
              {new Date(j.createdAt || Date.now()).toLocaleString()} — {j.id}
            </div>
            {j.status === "DONE" && (
              <div className="flex gap-2 mt-2">
                {j.mp3 && (
                  <a
                    download
                    href={j.mp3}
                    className="text-xs px-2 py-1 rounded-md border border-white/10 bg-white text-neutral-900"
                  >
                    MP3
                  </a>
                )}
                {j.m4b && (
                  <a
                    download
                    href={j.m4b}
                    className="text-xs px-2 py-1 rounded-md border border-white/10 bg-white text-neutral-900"
                  >
                    M4B
                  </a>
                )}
              </div>
            )}
            {j.error && (
              <div className="text-xs text-rose-300 mt-1 line-clamp-2">
                {j.error}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => onRemove(j.id)}
              className="text-xs px-2 py-1 rounded-md border border-white/10 hover:bg-white/10 transition"
            >
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
