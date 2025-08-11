// src/App.jsx
import React, { useState } from "react";
import FileDropzone from "./components/FileDropzone";
import VoicePicker from "./components/VoicePicker";
import AudioResult from "./components/AudioResult";
import History from "./components/History";
import { createJob, getJob, uploadPdf } from "./utils/api";

const VOICES = [
  { id: "Rachel",  name: "Rachel",  subtitle: "Féminine • Chaleureuse" },
  { id: "Emma",    name: "Emma",    subtitle: "Féminine • Narrative" },
  { id: "Thomas",  name: "Thomas",  subtitle: "Masculine • Professionnelle" },
  { id: "Antoine", name: "Antoine", subtitle: "Masculine • Dramatique" },
];

export default function App() {
  const [file, setFile] = useState(null);
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [job, setJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // all | running | done

  const onFileSelected = (f) => setFile(f);
  const onVoiceSelected = (id) => setVoiceId(id);

  async function handleConvert() {
    if (!file) return;
    try {
      setIsSubmitting(true);

      // 1) Upload
      const { filename } = await uploadPdf(file);

      // 2) Create job
      const jobResp = await createJob({
        filename,
        voice: voiceId,
      });
      setJob(jobResp);

      // 3) Poll job
      let current = jobResp;
      const start = Date.now();
      const poll = setInterval(async () => {
        const next = await getJob(current.id);
        setJob(next);

        // history update (client-side only)
        setHistory((prev) => {
          const rest = prev.filter((h) => h.id !== next.id);
          return [next, ...rest].slice(0, 20);
        });

        if (next.status === "DONE" || next.status === "ERROR") {
          clearInterval(poll);
        }

        // safety timeout (6 min)
        if (Date.now() - start > 6 * 60 * 1000) clearInterval(poll);
      }, 1200);
    } catch (e) {
      console.error(e);
      alert("Échec de la conversion.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-sky-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white">
              <span className="text-lg font-bold">R</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">ReadCast</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-700 ring-1 ring-sky-100">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            2 crédits restants
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-sky-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            PDF → Audiobook, en quelques secondes
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-600">
            Dépose ton PDF, choisis une voix, et on te rend un MP3/M4B propre et prêt à écouter.
            Idéal pour manuscrits, notes, scans et ebooks.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {/* Row: Upload + Voices */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Upload card */}
          <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                📘
              </div>
              <div>
                <h2 className="text-lg font-semibold">Nouveau Audiobook</h2>
                <p className="text-sm text-zinc-500">PDF, EPUB, DOCX (jusqu’à 100&nbsp;MB)</p>
              </div>
            </div>

            <FileDropzone
              file={file}
              onSelected={onFileSelected}
              className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/50 p-6 hover:bg-sky-50"
            />

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-zinc-500">
                Formats de sortie : <span className="font-medium text-zinc-700">MP3 & M4B</span>
              </div>
              <button
                onClick={handleConvert}
                disabled={!file || isSubmitting}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white
                ${!file || isSubmitting ? "bg-sky-300 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700"}
                shadow-sm`}
              >
                {isSubmitting ? "Conversion..." : "Convertir"}
              </button>
            </div>
          </div>

          {/* Voice picker */}
          <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                🎙️
              </div>
              <div>
                <h2 className="text-lg font-semibold">Choisir la voix narratrice</h2>
                <p className="text-sm text-zinc-500">Écoute et sélectionne la voix avant conversion.</p>
              </div>
            </div>

            <VoicePicker
              voices={VOICES}
              selectedId={voiceId}
              onSelect={onVoiceSelected}
              className="grid grid-cols-2 gap-3"
              cardClass="rounded-2xl border border-sky-100 bg-sky-50/50 hover:bg-sky-50"
              selectedClass="ring-2 ring-sky-400 bg-white"
            />
          </div>
        </div>

        {/* Result */}
        <section className="mt-8">
          <AudioResult job={job} />
        </section>

        {/* History */}
        <section className="mt-10 rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Mes Audiobooks</h3>
            <div className="flex gap-1 rounded-full bg-sky-50 p-1 ring-1 ring-sky-100">
              <Tab label="Tous" active={activeTab === "all"} onClick={() => setActiveTab("all")} />
              <Tab label="En cours" active={activeTab === "running"} onClick={() => setActiveTab("running")} />
              <Tab label="Terminés" active={activeTab === "done"} onClick={() => setActiveTab("done")} />
            </div>
          </div>

          <History
            items={history}
            filter={activeTab}
            className="grid gap-3"
            cardClass="rounded-2xl border border-sky-100 bg-sky-50/50 hover:bg-sky-50"
          />
        </section>
      </main>
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        active ? "bg-white text-sky-700 shadow-sm" : "text-sky-700/70 hover:text-sky-800"
      }`}
    >
      {label}
    </button>
  );
}
