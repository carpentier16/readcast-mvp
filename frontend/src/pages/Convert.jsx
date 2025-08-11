import React from "react";
import FileDropzone from "../components/FileDropzone";
import ProgressBar from "../components/ProgressBar";
import AudioPlayer from "../components/AudioPlayer";

// URL de ton backend (Render)
const API_BASE = import.meta.env.VITE_API_BASE;

export default function Convert() {
  const [file, setFile] = React.useState(null);
  const [status, setStatus] = React.useState("");        // PENDING/RUNNING/DONE/ERROR
  const [progress, setProgress] = React.useState(0);     // 0..100
  const [preview, setPreview] = React.useState("");      // extrait OCR
  const [mp3, setMp3] = React.useState("");
  const [m4b, setM4b] = React.useState("");
  const [dlMp3, setDlMp3] = React.useState("");
  const [dlM4b, setDlM4b] = React.useState("");
  const [voice, setVoice] = React.useState("Rachel");
  const [lang, setLang] = React.useState("fra");
  const [err, setErr] = React.useState("");

  async function startJob() {
    try {
      setErr("");
      setStatus("PENDING");
      setProgress(5);
      setPreview("");
      setMp3(""); setM4b(""); setDlMp3(""); setDlM4b("");

      if (!file) {
        setErr("Choisis un PDF d’abord.");
        return;
      }

      const form = new FormData();
      form.append("file", file);
      form.append("voice", voice);
      form.append("lang", lang);

      const r = await fetch(`${API_BASE}/api/jobs`, { method: "POST", body: form });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.detail || "Échec de création du job");

      const jobId = data.id;
      setStatus(data.status || "PENDING");
      setProgress(10);

      // --- SSE temps réel ---
      if ("EventSource" in window) {
        const es = new EventSource(`${API_BASE}/api/jobs/${jobId}/events`);
        let closed = false;

        es.onmessage = (ev) => {
          try {
            const d = JSON.parse(ev.data);
            if (d.status) setStatus(d.status);
            if (typeof d.error === "string" && d.error.startsWith("PROGRESS::")) {
              const p = Number(d.error.split("::")[1] || "0");
              if (!Number.isNaN(p)) setProgress(p);
            }
            if (d.preview_text) setPreview((p) => p || d.preview_text);
            if (d.output_mp3_url) setMp3(d.output_mp3_url);
            if (d.output_m4b_url) setM4b(d.output_m4b_url);
            if (d.download_mp3_url) setDlMp3(d.download_mp3_url);
            if (d.download_m4b_url) setDlM4b(d.download_m4b_url);

            if (d.status === "DONE" || d.status === "ERROR") {
              es.close();
              closed = true;
            }
          } catch {
            // ignore parse errors
          }
        };

        es.addEventListener("progress", (ev) => {
          const p = Number(ev.data || "0");
          if (!Number.isNaN(p)) setProgress(p);
        });

        es.addEventListener("end", () => {
          es.close();
          closed = true;
          // petit refresh final
          refresh(jobId);
        });

        es.onerror = () => {
          es.close();
          if (!closed) {
            // fallback polling si SSE tombe
            startPolling(jobId);
          }
        };
      } else {
        // vieux navigateurs : polling direct
        startPolling(jobId);
      }
    } catch (e) {
      setErr(String(e.message || e));
      setStatus("ERROR");
    }
  }

  function startPolling(jobId) {
    stopPolling();
    window.__poll_it = setInterval(async () => {
      const done = await refresh(jobId);
      if (done) stopPolling();
    }, 3000);
  }
  function stopPolling() {
    if (window.__poll_it) {
      clearInterval(window.__poll_it);
      window.__poll_it = null;
    }
  }
  async function refresh(jobId) {
    try {
      const r = await fetch(`${API_BASE}/api/jobs/${jobId}`);
      const d = await r.json();
      if (d.status) setStatus(d.status);
      if (typeof d.error === "string" && d.error.startsWith("PROGRESS::")) {
        const p = Number(d.error.split("::")[1] || "0");
        if (!Number.isNaN(p)) setProgress(p);
      }
      if (d.preview_text) setPreview((p) => p || d.preview_text);
      if (d.output_mp3_url) setMp3(d.output_mp3_url);
      if (d.output_m4b_url) setM4b(d.output_m4b_url);
      if (d.download_mp3_url) setDlMp3(d.download_mp3_url);
      if (d.download_m4b_url) setDlM4b(d.download_m4b_url);
      return d.status === "DONE" || d.status === "ERROR";
    } catch {
      return false;
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Convertir un PDF</h1>
        <span className="badge">{status || "PRÊT"}</span>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Col gauche : Upload + paramètres */}
        <div className="card p-6">
          <div className="space-y-4">
            <FileDropzone onFileSelected={(f) => setFile(f)} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-600">Voix</label>
                <input
                  className="input"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  placeholder="Rachel ou un voice_id"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Langue OCR</label>
                <select className="input" value={lang} onChange={(e) => setLang(e.target.value)}>
                  <option value="fra">Français</option>
                  <option value="eng">Anglais</option>
                  <option value="spa">Espagnol</option>
                  <option value="deu">Allemand</option>
                </select>
              </div>
            </div>

            <button className="btn btn-primary w-full" onClick={startJob} disabled={!file || status === "RUNNING"}>
              Convertir en audiobook
            </button>

            {err && (
              <pre className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 whitespace-pre-wrap">
                {err}
              </pre>
            )}
          </div>
        </div>

        {/* Col droite : Preview + Progress */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Prévisualisation du texte</h2>
              <span className="text-xs text-slate-500">{preview ? "extrait" : "en attente…"}</span>
            </div>
            <div className="mt-3 h-56 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm whitespace-pre-wrap">
              {preview || "Le texte extrait s’affichera ici quand l’OCR/TTS démarre."}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold mb-3">Progression</h2>
            <ProgressBar progress={progress} />
          </div>
        </div>
      </div>

      {/* Résultats */}
      {(mp3 || m4b) && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Résultats</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <AudioPlayer src={mp3} downloadUrl={dlMp3} label="MP3" />
            <AudioPlayer src={m4b} downloadUrl={dlM4b} label="M4B" />
          </div>
        </div>
      )}
    </div>
  );
}
