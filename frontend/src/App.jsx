import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "";

// ----- UI helpers -----
function cn(...cls) {
  return cls.filter(Boolean).join(" ");
}
function ProgressBar({ value }) {
  return (
    <div className="w-full h-2 bg-zinc-800/80 rounded">
      <div
        className="h-full bg-emerald-500 rounded transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

const LS_HISTORY_KEY = "readcast.jobs.v1";

// ----- App -----
export default function App() {
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState(null); // {id,status, ...}
  const [error, setError] = useState("");
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // dérive un % de progression simple en fonction du statut
  const progress = useMemo(() => {
    if (!job) return 0;
    const s = (job.status || "").toUpperCase();
    if (s === "PENDING") return 5;
    if (s === "RUNNING") return 60;
    if (s === "DONE") return 100;
    if (s === "ERROR") return 100;
    return 10;
  }, [job]);

  // persister l’historique (max 20)
  useEffect(() => {
    localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  }, [history]);

  // polling du statut
  useEffect(() => {
    if (!job?.id) return;
    if (["DONE", "ERROR"].includes(job.status)) return;

    const abort = new AbortController();
    const tick = async () => {
      try {
        const r = await fetch(`${API_BASE}/api/jobs/${job.id}`, {
          signal: abort.signal,
        });
        const data = await r.json();
        setJob(data);

        // push dans l’historique à la fin
        if (["DONE", "ERROR"].includes(data.status)) {
          setHistory((h) => [
            {
              id: data.id,
              createdAt: Date.now(),
              status: data.status,
              input: data.input_filename,
              mp3: data.output_mp3_url,
              m4b: data.output_m4b_url,
            },
            ...h.filter((x) => x.id !== data.id),
          ]);
        }
      } catch (e) {
        // no-op si navigation
      }
    };

    const iv = setInterval(tick, 2500);
    tick(); // premier coup

    return () => {
      clearInterval(iv);
      abort.abort();
    };
  }, [job?.id, job?.status]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Choisissez un PDF d’abord.");
      return;
    }
    if (!API_BASE) {
      setError("VITE_API_BASE est vide côté front.");
      return;
    }

    try {
      setSubmitting(true);

      const form = new FormData();
      form.append("file", file); // backend: form field "file"
      // (optionnel) voix/lang:
      // form.append("voice_id", "Rachel");
      // form.append("lang", "fra");

      const r = await fetch(`${API_BASE}/api/jobs`, {
        method: "POST",
        body: form,
      });

      if (!r.ok) {
        const t = await r.text();
        throw new Error(`API ${r.status}: ${t}`);
      }

      const data = await r.json(); // {id,status,...}
      setJob(data);

      // insérer une entrée "en attente" dans l’historique
      setHistory((h) => [
        {
          id: data.id,
          createdAt: Date.now(),
          status: data.status,
          input: data.input_filename,
          mp3: null,
          m4b: null,
        },
        ...h,
      ]);
    } catch (e) {
      setError(e.message || "Échec de création de job");
    } finally {
      setSubmitting(false);
    }
  };

  const onPick = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const prettyStatus = (s) => {
    if (!s) return "";
    const x = s.toUpperCase();
    if (x === "PENDING") return "En file d’attente…";
    if (x === "RUNNING") return "Conversion en cours…";
    if (x === "DONE") return "Terminé ✅";
    if (x === "ERROR") return "Erreur ❗";
    return x;
  };

  const canDownload = job && job.status === "DONE";

  return (
    <div className="min-h-screen text-zinc-100 bg-black">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-semibold">📖→🎧 Readcast</h1>
          <p className="text-zinc-400 mt-2">
            Transforme un PDF/scan manuscrit en audiobook.
          </p>
        </header>

        {/* Upload / action */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 mb-8">
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-zinc-400">Fichier PDF</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={onPick}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded
                           file:border-0 file:bg-emerald-600 file:text-white hover:file:bg-emerald-500
                           file:cursor-pointer"
              />
              {file && (
                <div className="text-xs text-zinc-400">
                  {file.name} — {(file.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!file || submitting}
              className={cn(
                "h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition disabled:opacity-50",
                "font-medium"
              )}
            >
              {submitting ? "Envoi…" : "Convertir en audiobook"}
            </button>

            {error && (
              <div className="text-sm text-red-400 border border-red-900/50 rounded p-3">
                {error}
              </div>
            )}
          </form>
        </section>

        {/* Suivi en temps réel */}
        {job && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-zinc-400">Job id</div>
              <code className="text-xs text-zinc-300">{job.id}</code>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{prettyStatus(job.status)}</div>
              <div className="text-sm text-zinc-400">
                {progress < 100 ? `${progress}%` : ""}
              </div>
            </div>
            <ProgressBar value={progress} />

            {job.error && (
              <div className="mt-3 text-sm text-red-400">{job.error}</div>
            )}

            {/* Résultats */}
            {canDownload && (
              <div className="mt-6 grid gap-6">
                {/* MP3 */}
                {job.output_mp3_url && (
                  <div>
                    <div className="mb-2 text-sm text-zinc-400">MP3</div>
                    <audio
                      controls
                      src={job.output_mp3_url}
                      className="w-full"
                    />
                    <div className="mt-2">
                      <a
                        href={job.output_mp3_url}
                        download
                        className="text-emerald-400 hover:underline"
                      >
                        Télécharger le MP3
                      </a>
                    </div>
                  </div>
                )}
                {/* M4B */}
                {job.output_m4b_url && (
                  <div>
                    <div className="mb-2 text-sm text-zinc-400">M4B</div>
                    <audio
                      controls
                      src={job.output_m4b_url}
                      className="w-full"
                    />
                    <div className="mt-2">
                      <a
                        href={job.output_m4b_url}
                        download
                        className="text-emerald-400 hover:underline"
                      >
                        Télécharger le M4B
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Historique local */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Historique</h2>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Vider
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-sm text-zinc-500">
              Aucune conversion pour le moment.
            </div>
          ) : (
            <ul className="grid gap-3">
              {history.map((h) => (
                <li
                  key={h.id}
                  className="rounded-lg border border-zinc-800 p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="truncate">
                      <div className="text-zinc-200 truncate">{h.input}</div>
                      <div className="text-xs text-zinc-500">
                        {new Date(h.createdAt).toLocaleString()} — {h.id}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "px-2 py-0.5 rounded text-xs",
                        h.status === "DONE" &&
                          "bg-emerald-500/20 text-emerald-300 border border-emerald-700/40",
                        h.status === "ERROR" &&
                          "bg-red-500/20 text-red-300 border border-red-700/40",
                        h.status !== "DONE" &&
                          h.status !== "ERROR" &&
                          "bg-zinc-700/30 text-zinc-300 border border-zinc-700/50"
                      )}
                    >
                      {h.status}
                    </div>
                  </div>

                  <div className="mt-2 flex gap-4">
                    {h.mp3 && (
                      <a
                        href={h.mp3}
                        download
                        className="text-emerald-400 hover:underline"
                      >
                        MP3
                      </a>
                    )}
                    {h.m4b && (
                      <a
                        href={h.m4b}
                        download
                        className="text-emerald-400 hover:underline"
                      >
                        M4B
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Footer */}
        <footer className="text-xs text-zinc-500 mt-8">
          API: <code>{API_BASE || "non configurée"}</code>
        </footer>
      </div>
    </div>
  );
}
