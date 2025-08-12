import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Dropzone from "./components/Dropzone.jsx";
import VoicePicker from "./components/VoicePicker.jsx";
import Progress from "./components/Progress.jsx";
import AudioResult from "./components/AudioResult.jsx";
import HistoryList from "./components/HistoryList.jsx";
import { uploadPDF, getJob, listJobs } from "./utils/api.js";

export default function App() {
  const [voice, setVoice] = useState("Rachel");
  const [file, setFile] = useState(null);
  const [job, setJob] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState([]);

  // charge un historique (si backend non prêt, garde localStorage)
  useEffect(() => {
    (async () => {
      const fromApi = await listJobs(10);
      if (fromApi?.length) setHistory(fromApi);
      else {
        const local = JSON.parse(localStorage.getItem("readcast_hist") || "[]");
        setHistory(local);
      }
    })();
  }, []);

  // poll le job
  useEffect(() => {
    if (!job?.id || job.status === "DONE" || job.status === "ERROR") return;
    const t = setInterval(async () => {
      try {
        const j = await getJob(job.id);
        setJob(j);
        // progression “fake” douce + DONE => 100
        setProgress((p) => Math.min(95, p + 4));
        if (j.status === "DONE" || j.status === "ERROR") {
          setProgress(100);
          clearInterval(t);
          // maj historique
          setHistory((h) => {
            const next = [
              j,
              ...h.filter((x) => x.id !== j.id),
            ].slice(0, 10);
            localStorage.setItem("readcast_hist", JSON.stringify(next));
            return next;
          });
          setLoading(false);
        }
      } catch {}
    }, 1500);
    return () => clearInterval(t);
  }, [job]);

  // bouton convertir
  async function handleConvert() {
    if (!file) return;
    setLoading(true);
    setProgress(10);
    try {
      const created = await uploadPDF(file, voice);
      setJob({ id: created.id, status: "RUNNING" });
      // seed history pendant le run
      setHistory((h) => {
        const draft = {
          id: created.id,
          input_filename: file.name,
          status: "RUNNING",
          output_mp3_url: null,
          output_m4b_url: null,
        };
        const next = [draft, ...h].slice(0, 10);
        localStorage.setItem("readcast_hist", JSON.stringify(next));
        return next;
      });
    } catch (e) {
      setLoading(false);
      alert("Échec envoi fichier. Vérifie VITE_API_BASE.");
    }
  }

  const canConvert = useMemo(() => !!file && !isLoading, [file, isLoading]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Hero */}
        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              PDF → Audiobook, en quelques secondes
            </h1>
            <p className="text-white/70 mt-2 max-w-2xl">
              Dépose un PDF, choisis une voix. Nous générons un audiolivre propre en MP3 & M4B.
            </p>
          </div>
        </section>

        {/* Zone d'upload + paramètres */}
        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Dropzone onFileSelected={setFile} disabled={isLoading} />
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/70">
                Voix sélectionnée : <span className="font-medium text-white">{voice}</span>
              </div>
              <button
                onClick={handleConvert}
                className="btn disabled:opacity-50"
                disabled={!canConvert}
              >
                {isLoading ? "Conversion…" : "Convertir en audiobook"}
              </button>
            </div>
            {isLoading && <Progress value={progress} label="Génération en cours" />}
            {job && <AudioResult job={job} />}
          </div>

          <aside className="space-y-3">
            <div className="text-sm text-white/70">Choisir la voix narratrice</div>
            <VoicePicker value={voice} onChange={setVoice} />
            <div className="text-xs text-white/40">
              Tu pourras brancher d’autres voix plus tard côté backend (mapping ElevenLabs).
            </div>
          </aside>
        </section>

        {/* Historique */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Historique</h2>
            <button
              className="btn-muted"
              onClick={() => {
                localStorage.removeItem("readcast_hist");
                setHistory([]);
              }}
            >
              Vider
            </button>
          </div>
          <HistoryList items={history} />
        </section>
      </main>
    </>
  );
}
