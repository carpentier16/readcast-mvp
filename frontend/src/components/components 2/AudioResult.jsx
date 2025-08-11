import React from "react";

export default function AudioResult({ status, mp3Url, m4bUrl, jobId }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">Statut</div>
        <div className={`text-sm font-medium ${status === "DONE" ? "text-green-400" : status === "ERROR" ? "text-red-400" : "text-amber-400"}`}>
          {status}
        </div>
      </div>

      {jobId && (
        <div className="text-xs text-neutral-500 break-all">
          Job ID: {jobId}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-neutral-800/50 p-4">
          <div className="mb-2 text-sm text-neutral-300">MP3</div>
          {mp3Url ? (
            <>
              <audio className="w-full" controls src={mp3Url} />
              <a
                href={mp3Url}
                download
                className="inline-flex mt-3 items-center justify-center rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
              >
                Télécharger le MP3
              </a>
            </>
          ) : (
            <div className="text-xs text-neutral-500">Indisponible…</div>
          )}
        </div>

        <div className="rounded-xl bg-neutral-800/50 p-4">
          <div className="mb-2 text-sm text-neutral-300">M4B</div>
          {m4bUrl ? (
            <>
              <audio className="w-full" controls src={m4bUrl} />
              <a
                href={m4bUrl}
                download
                className="inline-flex mt-3 items-center justify-center rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
              >
                Télécharger le M4B
              </a>
            </>
          ) : (
            <div className="text-xs text-neutral-500">Indisponible…</div>
          )}
        </div>
      </div>
    </div>
  );
}
