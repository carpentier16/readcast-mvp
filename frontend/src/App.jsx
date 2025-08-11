import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "";

/* ---------- Helpers ---------- */
const cls = (...s) => s.filter(Boolean).join(" ");

function fmtBytes(n) {
  if (!n && n !== 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}

function saveHistory(item) {
  const key = "readcast:history";
  const cur = JSON.parse(localStorage.getItem(key) || "[]");
  const next = [item, ...cur].slice(0, 20);
  localStorage.setItem(key, JSON.stringify(next));
  return next;
}
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem("readcast:history") || "[]");
  } catch {
    return [];
  }
}

/* ---------- Upload Card (drag & drop) ---------- */
function UploadCard({ onSubmit, busy }) {
  const [file, setFile] = useState(null);
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  async function handleSend() {
    if (!file || busy) return;
    await onSubmit(file);
    setFile(null);
    inputRef.current.value = "";
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cls(
        "relative rounded-2xl border",
        "bg-white/5 backdrop-blur-xl",
        "border-white/10 hover:border-white/20",
        over && "ring-2 ring-indigo-400/60 border-indigo-400/40",
        "p-6 sm:p-8 transition-all"
      )}
    >
      {/* Heading */}
      <div className="flex items-center gap-3">
        <div
          className={cls(
            "h-10 w-10 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30"
          )}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Dépose ton PDF</h2>
          <p className="text-sm text-white/60">
            Glisse-dépose ou choisis un fichier. Nous générons un audiolivre
            (MP3 &amp; M4B).
          </p>
        </div>
      </div>

      {/* Dropzone */}
      <div
        className={cls(
          "mt-5 rounded-xl border border-dashed",
          "border-white/15 bg-white/5 hover:bg-white/10 transition",
          over && "bg-indigo-500/10 border-indigo-400/40"
        )}
      >
        <label className="flex cursor-pointer items-center justify-between gap-4 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cls(
                "h-9 w-9 rounded-lg flex items-center justify-center",
                "bg-white/10 text-white/80"
              )}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 10v9m10-9v9M4 10h16l-2-6H6l-2 6Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium">
                {file ? file.name : "Aucun fichier sélectionné"}
              </div>
              <div className="text-xs text-white/60">
                {file ? fmtBytes(file.size) : "PDF jusqu’à 100 MB"}
              </div>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20"
          >
            Choisir
          </button>
        </label>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-white/50">
          Formats de sortie&nbsp;: <span className="text-white/80">MP3</span> &{" "}
          <span className="text-white/80">M4B</span>
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={!file || busy}
          className={cls(
            "px-4 py-2 rounded-lg text-sm font-semibold",
            "bg-gradient-to-br from-indigo-500 to-violet-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40"
          )}
        >
          {busy ? "Envoi…" : "Convertir"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Progress Bar ---------- */
function ProgressBar({ value = 0, status = "En cours…" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <div className="flex items-center justify-between">
        <div className="font-medium">Traitement</div>
        <div className="text-sm text-white/65">{status}</div>
      </div>
      <div className="mt-3 h-3 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-teal-400"
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="mt-2 text-right text-xs text-white/60">{value}%</div>
    </div>
  );
}

/* ---------- Result Card ---------- */
function ResultCard({ job }) {
  if (!job) return null;
  const done = job.status === "DONE";
  const erro = job.status === "ERROR";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold">Résultat</div>
        <span
          className={cls(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            done && "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
            erro && "bg-rose-500/15 text-rose-300 border border-rose-500/30",
            !done && !erro && "bg-white/10 text-white/70 border border-white/15"
          )}
        >
          {job.status}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <AudioBlock
          title="MP3"
          url={job.output_mp3_url}
          disabled={!done || !job.output_mp3_url}
        />
        <AudioBlock
          title="M4B"
          url={job.output_m4b_url}
          disabled={!done || !job.output_m4b_url}
        />
      </div>

      <div className="mt-4 text-xs text-white/50 break-words">
        Job ID : <span className="text-white/70">{job.id}</span>
      </div>
    </div>
  );
}

function AudioBlock({ title, url, disabled }) {
  return (
    <div
      className={cls(
        "rounded-xl border p-4",
        "border-white/10 bg-white/5",
        disabled && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="font-medium">{title}</div>
        <a
          href={url || "#"}
          download
          target="_blank"
          rel="noreferrer"
          className={cls(
            "text-xs px-3 py-1.5 rounded-lg font-medium",
            "bg-white/10 hover:bg-white/20",
            disabled && "pointer-events-none"
          )}
        >
          Télécharger
        </a>
      </div>
      <audio
        className="mt-3 w-full"
        controls
        src={url || undefined}
        preload="none"
      />
    </div>
  );
}

/* ---------- History ---------- */
function History({ items, onClear }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Historique</div>
        <button
          onClick={onClear}
          className="text-xs px-3 py-1.5 rounded-lg font-medium bg-white/10 hover:bg-white/20"
        >
          Vider
        </button>
      </div>

      <ul className="mt-4 space-y-3">
        {items.map((it, i) => (
          <li
            key={`${it.id}-${i}`}
            className="rounded-lg border border-white/10 bg-white/5 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{it.filename}</div>
                <div className="text-xs text-white/60">
                  {new Date(it.created_at).toLocaleString()} — {it.status}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {it.output_mp3_url && (
                  <a
                    className="text-xs px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20"
                    href={it.output_mp3_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    MP3
                  </a>
                )}
                {it.output_m4b_url && (
                  <a
                    className="text-xs px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20"
                    href={it.output_m4b_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    M4B
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Root App ---------- */
export default function App() {
  const [busy, setBusy] = useState(false);
  const [job, setJob] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("En file d’attente…");
  const [history, setHistory] = useState(loadHistory());

  // Poll job state
  useEffect(() => {
    if (!job?.id) return;
    if (job.status === "DONE" || job.status === "ERROR") return;

    setStatusText("Traitement en cours…");
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/jobs/${job.id}`);
        const data = await res.json();
        setJob(data);
        // Simple progression UI
        setProgress((p) => {
          if (data.status === "DONE") return 100;
          if (p < 90) return p + 2;
          return p;
        });
      } catch (e) {
        console.error(e);
      }
    }, 2000);

    return () => clearInterval(iv);
  }, [job?.id]);

  // Persist in history on completion
  useEffect(() => {
    if (!job || (job.status !== "DONE" && job.status !== "ERROR")) return;
    setProgress(job.status === "DONE" ? 100 : 100);
    setStatusText(job.status === "DONE" ? "Terminé ✅" : "Erreur ❌");
    const item = {
      id: job.id,
      filename: job.input_filename,
      status: job.status,
      output_mp3_url: job.output_mp3_url,
      output_m4b_url: job.output_m4b_url,
      created_at: Date.now(),
    };
    setHistory(saveHistory(item));
    setBusy(false);
  }, [job?.status]);

  async function createJob(file) {
    setBusy(true);
    setProgress(5);
    setStatusText("Envoi du fichier…");

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API_BASE}/api/jobs`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    setJob(data);
    setProgress(15);
    setStatusText("En traitement…");
  }

  function clearHistory() {
    localStorage.removeItem("readcast:history");
    setHistory([]);
  }

  return (
    <div className="min-h-dvh text-white bg-[#0B0B10]">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-3xl" />
      </div>

      <header className="mx-auto max-w-5xl px-6 pt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-lg">📖</span>
            </div>
            <div className="text-xl font-semibold tracking-tight">Readcast</div>
          </div>
          <a
            href={API_BASE || "#"}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-white/60 hover:text-white/80"
          >
            API
          </a>
        </div>
        <h1 className="mt-6 text-2xl sm:text-3xl font-semibold">
          PDF ➝ Audiobook, en quelques secondes
        </h1>
        <p className="mt-2 max-w-2xl text-white/60">
          Dépose un PDF, on s’occupe du reste. Ton fichier audio est prêt en
          MP3/M4B. Idéal pour transformer notes, scans et ebooks.
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-16 pt-8 space-y-6">
        <UploadCard onSubmit={createJob} busy={busy} />

        {/* Progress / Result */}
        {job && (job.status !== "DONE" && job.status !== "ERROR") && (
          <ProgressBar value={progress} status={statusText} />
        )}
        {job && <ResultCard job={job} />}

        <History items={history} onClear={clearHistory} />
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 text-xs text-white/40">
        API&nbsp;:&nbsp;
        <span className="text-white/60">{API_BASE || "—"}</span>
      </footer>
    </div>
  );
}
