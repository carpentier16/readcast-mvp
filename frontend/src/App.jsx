import { useEffect, useRef, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

const cx = (...c) => c.filter(Boolean).join(" ");

/* ===== Upload (drag & drop) ===== */
function Uploader({ onPick, busy }) {
  const [file, setFile] = useState(null);
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);

  function onDrop(e) {
    e.preventDefault();
    setOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }
  async function submit() {
    if (!file || busy) return;
    await onPick(file);
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cx(
        "rounded-2xl border bg-white/[0.04] backdrop-blur",
        "border-white/10 p-8 sm:p-10 transition-all",
        over && "ring-2 ring-indigo-400/60 border-indigo-400/40"
      )}
    >
      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
        Dépose ton PDF
      </h2>
      <p className="mt-2 text-sm text-white/65">
        Glisse-dépose ou choisis un fichier. Nous générons un audiolivre MP3 & M4B.
      </p>

      <div
        className={cx(
          "mt-6 rounded-xl border border-dashed border-white/15 bg-white/5",
          "hover:bg-white/10"
        )}
      >
        <label className="flex flex-col sm:flex-row items-center gap-4 p-5 sm:p-6 cursor-pointer">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white/70">Fichier</div>
            <div className="truncate text-base">
              {file ? file.name : "Aucun fichier sélectionné"}
            </div>
            <div className="mt-1 text-xs text-white/50">PDF jusqu’à 100 MB</div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
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
              className="w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20"
            >
              Choisir un fichier
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!file || busy}
              className={cx(
                "w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-semibold",
                "bg-gradient-to-br from-indigo-500 to-violet-500 shadow-indigo-500/30",
                "hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {busy ? "Envoi…" : "Convertir"}
            </button>
          </div>
        </label>
      </div>

      <p className="mt-3 text-xs text-white/55">Formats de sortie : MP3 & M4B</p>
    </section>
  );
}

/* ===== Progress ===== */
function Progress({ value, note }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Conversion en cours…</h3>
        <span className="text-sm text-white/70">{note}</span>
      </div>
      <div className="mt-4 h-3 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-teal-400 transition-[width] duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="mt-2 text-right text-xs text-white/60">{value}%</div>
    </section>
  );
}

/* ===== Result ===== */
function Result({ job }) {
  if (!job) return null;
  const done = job.status === "DONE";
  const erro = job.status === "ERROR";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Résultat</h3>
        <span
          className={cx(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            done && "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
            erro && "bg-rose-500/15 text-rose-300 border border-rose-500/30",
            !done && !erro && "bg-white/10 text-white/70 border border-white/15"
          )}
        >
          {done ? "Terminé" : erro ? "Erreur" : "En cours…"}
        </span>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <FormatCard label="MP3" url={job.output_mp3_url} ready={done} />
        <FormatCard label="M4B" url={job.output_m4b_url} ready={done} />
      </div>
    </section>
  );
}

function FormatCard({ label, url, ready }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">{label}</div>
        <a
          href={ready && url ? url : "#"}
          download
          target="_blank"
          rel="noreferrer"
          className={cx(
            "text-xs px-3 py-1.5 rounded-lg font-medium bg-white/10 hover:bg-white/20",
            (!ready || !url) && "pointer-events-none opacity-50"
          )}
        >
          Télécharger
        </a>
      </div>
      <audio className="mt-3 w-full" controls src={ready ? url : undefined} />
    </div>
  );
}

/* ===== History (compact) ===== */
function History({ items, onClear }) {
  if (!items?.length) return null;
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Historique</h3>
        <button
          onClick={onClear}
          className="text-xs px-3 py-1.5 rounded-lg font-medium bg-white/10 hover:bg-white/20"
        >
          Vider
        </button>
      </div>

      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{it.filename}</div>
                <div className="text-xs text-white/60">
                  {new Date(it.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {it.output_mp3_url && (
                  <a
                    href={it.output_mp3_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20"
                  >
                    MP3
                  </a>
                )}
                {it.output_m4b_url && (
                  <a
                    href={it.output_m4b_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20"
                  >
                    M4B
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ===== Small store for history ===== */
const HKEY = "readcast:history";
const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HKEY) || "[]");
  } catch {
    return [];
  }
};
const addHistory = (entry) => {
  const cur = getHistory();
  const next = [entry, ...cur].slice(0, 20);
  localStorage.setItem(HKEY, JSON.stringify(next));
  return next;
};

/* ===== App ===== */
export default function App() {
  const [busy, setBusy] = useState(false);
  const [job, setJob] = useState(null);
  const [progress, setProgress] = useState(0);
  const [note, setNote] = useState("Préparation…");
  const [history, setHistory] = useState(getHistory());

  // poll until done
  useEffect(() => {
    if (!job?.id) return;
    if (job.status === "DONE" || job.status === "ERROR") return;

    const iv = setInterval(async () => {
      try {
        const r = await fetch(`${API_BASE}/api/jobs/${job.id}`);
        const data = await r.json();
        setJob(data);
        setProgress((p) => (data.status === "DONE" ? 100 : Math.min(p + 3, 92)));
        setNote(data.status === "DONE" ? "Terminé" : "Traitement…");
      } catch (e) {
        console.error(e);
      }
    }, 2000);
    return () => clearInterval(iv);
  }, [job?.id]);

  // on completion → history
  useEffect(() => {
    if (!job || (job.status !== "DONE" && job.status !== "ERROR")) return;
    const entry = {
      id: job.id,
      filename: job.input_filename,
      created_at: Date.now(),
      output_mp3_url: job.output_mp3_url,
      output_m4b_url: job.output_m4b_url,
    };
    setHistory(addHistory(entry));
    setBusy(false);
    setProgress(100);
    setNote("Terminé");
  }, [job?.status]);

  async function start(file) {
    setBusy(true);
    setProgress(10);
    setNote("Envoi du fichier…");

    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch(`${API_BASE}/api/jobs`, { method: "POST", body: fd });
    const data = await r.json();
    setJob(data);
    setProgress(25);
    setNote("Conversion…");
  }

  function clearHistory() {
    localStorage.removeItem(HKEY);
    setHistory([]);
  }

  return (
    <div className="min-h-dvh text-white bg-[#0B0B10]">
      {/* soft background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-[-8rem] h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-32 right-[-8rem] h-80 w-80 rounded-full bg-fuchsia-600/20 blur-3xl" />
      </div>

      <header className="mx-auto max-w-4xl px-6 pt-10">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">Readcast</div>
        </div>
        <h1 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight">
          PDF → Audiobook, en quelques secondes
        </h1>
        <p className="mt-3 max-w-2xl text-white/70 leading-relaxed">
          Dépose un PDF — nous te rendons un MP3 et un M4B prêts à écouter. Parfait pour
          notes, scans et ebooks.
        </p>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-20 pt-8 space-y-8">
        <Uploader onPick={start} busy={busy} />
        {job && job.status !== "DONE" && job.status !== "ERROR" && (
          <Progress value={progress} note={note} />
        )}
        {job && <Result job={job} />}
        <History items={history} onClear={clearHistory} />
      </main>
    </div>
  );
}
