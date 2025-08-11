import React from "react";

export default function HistoryList({ items = [], onClear }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-neutral-200">Historique</h3>
        <button
          onClick={onClear}
          className="text-xs text-neutral-400 hover:text-neutral-200"
        >
          Vider
        </button>
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-neutral-500">Aucune conversion récente.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="rounded-md bg-neutral-800/50 p-3">
              <div className="text-sm text-neutral-200">{it.filename}</div>
              <div className="text-xs text-neutral-500">
                {it.created_at} — {it.status}
              </div>
              <div className="mt-2 flex gap-2">
                {it.output_mp3_url && (
                  <a className="text-xs underline" href={it.output_mp3_url} download>MP3</a>
                )}
                {it.output_m4b_url && (
                  <a className="text-xs underline" href={it.output_m4b_url} download>M4B</a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
