import React, { useCallback, useEffect, useMemo, useState } from "react";
import UploadCard from "./components/UploadCard";
import VoicePicker from "./components/VoicePicker";
import ProgressBar from "./components/ProgressBar";
import AudioResult from "./components/AudioResult";
import History from "./components/History";
import { createJob, getJob } from "./utils/api";

const TABS = [
  { key: "all", label: "Tous" },
  { key: "running", label: "En cours" },
  { key: "done", label: "Terminés" },
];

// NOTE: à mapper plus tard sur des “vraies” voices côté backend
const VOICES = [
  {
    id: "Rachel",
    name: "Rachel",
    subtitle: "Féminine • Chaleureuse",
  },
  // exemples visuels (peuvent aussi pointer sur Rachel en attendant)
  { id: "Rachel", name: "Emma", subtitle: "Féminine • Narrative" },
  { id: "Rachel", name: "Thomas", subtitle: "Masculine • Professionnelle" },
  { id: "Rachel", name: "Antoine", subtitle: "Masculine • Dramatique" },
];

export default function App() {
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [file, setFile] = useState(null);

  const [job, setJob] = useState(null); // { id, status, mp3, m4b, error, filename }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("readcast_history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState("all");

  // Persiste l'historique
  useEffect(() => {
    localStorage.setItem("readcast_history", JSON.stringify(history));
  }, [history]);

  const onDropFile = useCallback((f) => setFile(f), []);

  // Submit job
  const onConvert = useCallback(async () => {
    if (!file || isSubmitting) return;
    setIsSubmitting(true);
    setJob(null);

    try {
      const created = await createJob(file, selectedVoice?.id || "Rachel");
      // created { id, status, ... }
      const newJob = {
        id: created.id,
        status: created.status,
        filename: created.input_filename,
        createdAt: new Date().toISOString(),
        mp3: created.output_mp3_url || null,
        m4b: created.output_m4b_url || null,
        error: created.error || null,
      };
      setJob(newJob);
      setHistory((prev) => [newJob, ...prev]);
    } catch (e) {
      alert("Erreur lors de la création du job.");
    } finally {
      setIsSubmitting(false);
    }
  }, [file, isSubmitting, selectedVoice]);

  // Polling du job courant tant que pas DONE/ERROR
  useEffect(() => {
    if (!job?.id) return;

    let cancel = false;
    const tick = async () => {
      try {
        const fresh = await getJob(job.id);
        if (cancel) return;

        const updated = {
          id: fresh.id,
          status: fresh.status,
          filename: fresh.input_filename,
          createdAt: job.createdAt,
          mp3: fresh.output_mp3_url || null,
          m4b: fresh.output_m4b_url || null,
          error: fresh.error || null,
        };
        setJob(updated);

        // maj historique
        setHistory((prev) =>
          prev.map((j) => (j.id === updated.id ? updated : j))
        );

        if (fresh.status === "RUNNING" || fresh.status === "PENDING") {
          setTimeout(tick, 1500);
        }
      } catch {
        setTimeout(tick, 1500);
      }
    };
    tick();

    return () => {
      cancel = true;
    };
  }, [job?.id]);

  const filteredHistory = useMemo(() => {
    if (activeTab === "running")
      return history.filter((h) => h.status !== "DONE" && !h.error);
    if (activeTab === "done") return history.filter((h) => h.status === "DONE");
    return history;
  }, [activeTab, history]);

  const progress = useMemo(() => {
    if (!job) return 0;
    if (job.status === "PENDING") return 10;
    if (job.status === "RUNNING") return 60; // approx
    if (job.status === "DONE") return 100;
    return 0;
  }, [job]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-neutral-950/60 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg shadow-blue-500/20">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white"
              >
                <path
                  d="M12 3l7 4v10l-7 4-7-4V7l7-4z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Readcast
            </span>
            <span className="ml-3 px-2 py-0.5 text-xs rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Beta
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-sm">
            <a
              href="#"
              className="text-white/60 hover:text-white transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Docs API
            </a>
            <div className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-xs">
              API: {import.meta.env.VITE_API_BASE?.replace(/^https?:\/\//, "")}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          PDF →{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-fuchsia-400">
            Audiobook
          </span>
          , en quelques secondes
        </h1>
        <p className="mt-2 text-white/60 max-w-2xl">
          Dépose ton PDF, choisis une voix, et on te rend un MP3/M4B propre et
          prêt à écouter. Idéal pour manuscrits, notes, ebooks, scans.
        </p>
      </section>

      {/* Upload + Voix */}
      <section className="max-w-6xl mx-auto px-5 mt-8 grid md:grid-cols-2 gap-6">
        <UploadCard
          file={file}
          onDrop={onDropFile}
          onConvert={onConvert}
          isSubmitting={isSubmitting}
        />

        <VoicePicker
          voices={VOICES}
          selected={selectedVoice}
          onSelect={setSelectedVoice}
        />
      </section>

      {/* Résultat en direct */}
      <section className="max-w-6xl mx-auto px-5 mt-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Résultat</h2>
            {!!job?.status && (
              <span
                className={`text-xs px-2 py-1 rounded-md border ${
                  job.status === "DONE"
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    : job.error
                    ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                }`}
              >
                {job.error
                  ? "ERREUR"
                  : job.status === "DONE"
                  ? "TERMINÉ"
                  : job.status}
              </span>
            )}
          </div>

          {!job && <div className="text-white/50">Aucun job en cours.</div>}

          {!!job && job.status !== "DONE" && !job.error && (
            <ProgressBar value={progress} />
          )}

          {!!job && job.error && (
            <div className="text-rose-300 text-sm leading-relaxed whitespace-pre-wrap bg-rose-500/5 border border-rose-500/30 rounded-xl p-3">
              {job.error}
            </div>
          )}

          {!!job && job.status === "DONE" && (
            <AudioResult job={job} className="mt-4" />
          )}
        </div>
      </section>

      {/* Historique */}
      <section className="max-w-6xl mx-auto px-5 mt-10 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Historique</h2>
          <div className="flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition ${
                  activeTab === t.key
                    ? "bg-white text-neutral-900 border-white"
                    : "border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <History
          items={filteredHistory}
          onClear={() => setHistory([])}
          onRemove={(id) =>
            setHistory((prev) => prev.filter((j) => j.id !== id))
          }
        />
      </section>
    </div>
  );
}
