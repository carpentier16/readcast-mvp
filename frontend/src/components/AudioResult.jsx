// src/components/AudioResult.jsx
import React from "react";

export default function AudioResult({ job }) {
  if (!job) return null;

  const { id, status, output_mp3_url, output_m4b_url } = job;

  return (
    <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-400">Job ID</p>
          <p className="font-mono text-sm text-zinc-300">{id}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            status === "DONE"
              ? "bg-emerald-500/15 text-emerald-300"
              : status === "RUNNING"
              ? "bg-amber-500/15 text-amber-300"
              : status === "ERROR"
              ? "bg-rose-500/15 text-rose-300"
              : "bg-zinc-700/40 text-zinc-300"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm text-zinc-400">MP3</p>
          {output_mp3_url ? (
            <>
              <audio
                controls
                className="w-full rounded-lg bg-black/20"
                src={output_mp3_url}
              />
              <a
                href={output_mp3_url}
                download
                className="mt-3 inline-flex items-center rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
              >
                Télécharger le MP3
              </a>
            </>
          ) : (
            <p className="text-sm text-zinc-500">En attente…</p>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm text-zinc-400">M4B</p>
          {output_m4b_url ? (
            <>
              <audio
                controls
                className="w-full rounded-lg bg-black/20"
                src={output_m4b_url}
              />
              <a
                href={output_m4b_url}
                download
                className="mt-3 inline-flex items-center rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
              >
                Télécharger le M4B
              </a>
            </>
          ) : (
            <p className="text-sm text-zinc-500">En attente…</p>
          )}
        </div>
      </div>
    </div>
  );
}
