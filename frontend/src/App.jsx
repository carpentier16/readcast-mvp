import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "";

const prettyBytes = (n) =>
  n === 0 ? "0 B" : ["B", "KB", "MB", "GB"].map((u, i) => {
    const p = Math.pow(1024, i);
    if (n < p * 1024) return `${(n / p).toFixed(i ? 2 : 0)} ${u}`;
    return null;
  }).filter(Boolean).at(-1);

const StatusPill = ({ status }) => {
  const map = {
    PENDING: "bg-zinc-800 text-zinc-300 ring-zinc-700",
    RUNNING: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
    DONE: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
    ERROR: "bg-rose-500/10 text-rose-300 ring-rose-500/30",
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1 ${map[status] || "bg-zinc-800 text-zinc-300 ring-zinc-700"}`}>
      <span className={`h-2 w-2 rounded-full ${status === "DONE" ? "bg-emerald-400" : status === "RUNNING" ? "bg-amber-400 animate-pulse" : status === "ERROR" ? "bg-rose-400" : "bg-zinc-400"}`} />
      {status}
    </span>
  );
};

export default function App() {
  const [file, setFile] = useState(null);
  const [job, setJob] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("readcast-history") || "[]"); } catch { return []; }
  });

  const audioMp3Ref = useRef(null);
  const audioM4bRef = useRef(null);

  useEffect(() => { localStorage.setItem("readcast-history", JSON.stringify(history.slice(0, 10))); }, [history]);

  // Simple polling of job status
  useEffect(() => {
    if (!job?.id) return;
    let stop = false;

    const tick = async () => {
      try {
        const r = await fetch(`${API_BASE}/api/jobs/${job.id}`);
        if (!r.ok) throw new Error("Erreur serveur");
        const json = await r.json();
        setJob(json);

        // progress: fake a smooth progress while running (better UX than 0 or 100)
        if (json.status === "RUNNING") {
          setProgress((p) => (p < 88 ? Math.min(88, p + Math.random() * 8) : p));
        } else if (json.status === "DONE") {
          setProgress(100);
          setBusy(false);
          setHistory((h) => [
            { id: json.id, name: json.input_filename, ts: Date.now(), status: json.status, mp3: json.output_mp3_url, m4b: json.output_m4b_url },
            ...h.filter((x) => x.id !== json.id),
          ]);
        } else if (json.status === "ERROR") {
          setBusy(false);
          setErrorMsg(json.error || "Échec du traitement.");
        }
      } catch (e) {
        // ne bloque pas l’UI si un poll échoue
      }
      if (!stop && job?.status !== "DONE" && job?.status !== "ERROR") {
        setTimeout(tick, 1400);
      }
    };
    tick();
    return () => { stop = true; };
  }, [job?.id]);

  const canSubmit = useMemo(() => !!file && !busy, [file, busy]);

  const onChooseFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setErrorMsg("");
    setProgress(0);
    setJob(null);
  };

  const submit = async () => {
    if (!file) return;
    setBusy(true);
    setErrorMsg("");
    setProgress(12);

    const form = new FormData();
    form.append("file", file);

    try {
      const r = await fetch(`${API_BASE}/api/jobs`, { method: "POST", body: form });
      if (!r.ok) throw new Error(await r.text());
      const json = await r.json();
      setJob(json);
      setProgress(22);
    } catch (e) {
      setBusy(false);
      setErrorMsg(e.message || "Impossible de créer le job.");
    }
  };

  const clearHistory = () => setHistory([]);

  const forceDownload = (url, filename = undefined) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-100">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60 sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 ring-1 ring-white/10 grid place-content-center">
              <span className="text-zinc-950 text-lg font-black">R</span>
            </div>
            <div className="text-lg font-semibold tracking-tight">Readcast</div>
            <span className="ml-3 text-xs text-zinc-400 hidden sm:inline">PDF → Audiobook (MP3/M4B)</span>
          </div>
          <a
            className="text-xs text-zinc-400 hover:text-zinc-200 transition"
            href={API_BASE || "#"}
            target="_blank"
            rel="noreferrer"
          >
            API: {API_BASE || "—"}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        {/* Upload Card */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Convertir un PDF en audiobook</h2>
              <p className="text-sm text-zinc-400 mt-1">Faites glisser votre PDF ou sélectionnez-le, puis lancez la conversion.</p>
            </div>
            <StatusPill status={job?.status || (busy ? "RUNNING" : file ? "PENDING" : "PENDING")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3 hover:bg-zinc-900/80 transition cursor-pointer">
              <input type="file" accept="application/pdf" className="hidden" onChange={onChooseFile} />
              <div className="flex-1">
                <div className="text-sm">
                  {file ? <span className="font-medium">{file.name}</span> : "Choisir un fichier PDF"}
                </div>
                <div className="text-xs text-zinc-400">
                  {file ? prettyBytes(file.size || 0) : "Taille max limitée par votre navigateur"}
                </div>
              </div>
              <div className="text-[10px] rounded-full bg-zinc-800 px-2.5 py-1 text-zinc-300 ring-1 ring-white/10">PDF</div>
            </label>

            <button
              onClick={submit}
              disabled={!canSubmit}
              className={`rounded-xl px-6 py-3 text-sm font-medium transition shadow-inner ring-1 ring-white/10
                ${canSubmit
                  ? "bg-gradient-to-br from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110"
                  : "bg-zinc-800 text-zinc-400 cursor-not-allowed"}`}
            >
              {busy ? "Conversion en cours…" : "Convertir"}
            </button>
          </div>

          {/* Progress */}
          {(busy || progress > 0) && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-zinc-400">Progression</div>
                <div className="text-xs text-zinc-300">{Math.round(progress)}%</div>
              </div>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 animate-[progress_2s_ease_infinite]"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMsg}
            </div>
          )}
        </section>

        {/* Result Card */}
        {job?.status === "DONE" && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Résultat</h3>
                <p className="text-sm text-zinc-400 mt-1">Job id : <span className="text-zinc-300">{job.id}</span></p>
              </div>
              <StatusPill status="DONE" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* MP3 */}
              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">MP3</span>
                  {job.output_mp3_url && (
                    <button
                      className="text-xs text-zinc-300 hover:text-white transition"
                      onClick={() => forceDownload(job.output_mp3_url, "audiobook.mp3")}
                    >
                      Télécharger
                    </button>
                  )}
                </div>
                <audio
                  ref={audioMp3Ref}
                  controls
                  src={job.output_mp3_url || undefined}
                  className="w-full rounded-lg bg-zinc-800"
                />
              </div>

              {/* M4B */}
              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">M4B</span>
                  {job.output_m4b_url && (
                    <button
                      className="text-xs text-zinc-300 hover:text-white transition"
                      onClick={() => forceDownload(job.output_m4b_url, "audiobook.m4b")}
                    >
                      Télécharger
                    </button>
                  )}
                </div>
                <audio
                  ref={audioM4bRef}
                  controls
                  src={job.output_m4b_url || undefined}
                  className="w-full rounded-lg bg-zinc-800"
                />
              </div>
            </div>
          </section>
        )}

        {/* History */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Historique</h3>
            {history.length > 0 && (
              <button onClick={clearHistory} className="text-xs text-zinc-300 hover:text-white transition">
                Vider
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-zinc-400">Aucun élément pour le moment.</p>
          ) : (
            <ul className="grid gap-3">
              {history.map((h) => (
                <li key={h.id} className="rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{h.name}</div>
                      <div className="text-xs text-zinc-400">
                        {new Date(h.ts).toLocaleString()} — {h.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill status={h.status} />
                      {h.mp3 && (
                        <a
                          href={h.mp3}
                          download
                          className="rounded-full border border-white/10 bg-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700 transition"
                        >
                          MP3
                        </a>
                      )}
                      {h.m4b && (
                        <a
                          href={h.m4b}
                          download
                          className="rounded-full border border-white/10 bg-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700 transition"
                        >
                          M4B
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="py-6 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Readcast — made for PDFs you’ll actually listen to.
        </footer>
      </main>
    </div>
  );
}
