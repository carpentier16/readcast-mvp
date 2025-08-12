import React from 'react';

export default function AudioResult({ job }) {
  if (!job) return null;
  const { status, output_mp3_url, output_m4b_url, id } = job;

  const Cell = ({ title, url }) => (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium">{title}</div>
        {url ? (
          <a className="btn" href={url} download>
            Télécharger
          </a>
        ) : (
          <span className="badge">En préparation…</span>
        )}
      </div>
      {url ? (
        <audio controls className="w-full">
          <source src={url} />
        </audio>
      ) : (
        <div className="h-9 rounded-lg bg-white/5 animate-pulse" />
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/70">
          Job <span className="text-white/90 font-mono">{id}</span>
        </div>
        <div className={`badge ${status === "DONE" ? "bg-green-500/20 text-green-200" : status === "ERROR" ? "bg-red-500/20 text-red-200" : ""}`}>
          {status}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Cell title="MP3" url={output_mp3_url} />
        <Cell title="M4B" url={output_m4b_url} />
      </div>
    </div>
  );
}
