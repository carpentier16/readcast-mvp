import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import ProgressBar from "../components/ProgressBar"; // si absent, remplacez par un div simple
const API_URL = import.meta.env.VITE_API_BASE;

export default function Convert() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState("");
  const [mp3, setMp3] = useState("");
  const [m4b, setM4b] = useState("");
  const [dlMp3, setDlMp3] = useState("");
  const [dlM4b, setDlM4b] = useState("");
  const fileRef = useRef();

  const onChoose = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  async function startJob() {
    if (!file) return;
    setStatus("PENDING");
    setProgress(5);

    const form = new FormData();
    form.append("file", file);
    // Optionnel: form.append("voice","Rachel"); form.append("lang","fra");

    const r = await fetch(`${API_URL}/api/jobs`, { method: "POST", body: form });
    const data = await r.json();
    if (!r.ok) {
      alert(data.detail || "Erreur lors de la création du job");
      return;
    }
    const jobId = data.id;
    setStatus(data.status || "PENDING");
    setProgress(10);

    // SSE temps réel
    const es = new EventSource(`${API_URL}/api/jobs/${jobId}/events`);
    es.onmessage = (ev) => {
      try {
        const d = JSON.parse(ev.data);
        if (d.status) setStatus(d.status);
        if (typeof d.error === "string" && d.error.startsWith("PROGRESS::")) {
          const p = Number(d.error.split("::")[1] || "0");
          if (!Number.isNaN(p)) setProgress(p);
        }
        if (d.output_mp3_url) setMp3(d.output_mp3_url);
        if (d.output_m4b_url) setM4b(d.output_m4b_url);
        if (d.download_mp3_url) setDlMp3(d.download_mp3_url);
        if (d.download_m4b_url) setDlM4b(d.download_m4b_url);
        if (d.preview_text) setPreview((p)=> p || d.preview_text);
        if (d.status === "DONE" || d.status === "ERROR") es.close();
      } catch {}
    };
    es.addEventListener("progress", (ev)=>{
      const p = Number(ev.data || "0");
      if (!Number.isNaN(p)) setProgress(p);
    });
    es.addEventListener("end", ()=> es.close());
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">Convertir un PDF</h1>

      <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-brand-400 transition">
        <input type="file" accept="application/pdf" className="hidden" ref={fileRef} onChange={onChoose} />
        <button className="btn btn-ghost" onClick={()=>fileRef.current?.click()}>
          <Upload className="mr-2" size={18}/> {file ? file.name : "Choisir un PDF"}
        </button>
      </div>

      <button onClick={startJob} className="btn btn-primary w-full">Convertir en audiobook</button>

      {!!status && (
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-2">Statut: <b>{status}</b></div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-3 bg-brand-600" style={{width: `${progress}%`}}/>
          </div>
          <div className="text-right text-xs mt-1">{progress}%</div>
        </div>
      )}

      {preview && (
        <div className="card p-4">
          <div className="font-semibold mb-2">Aperçu du texte</div>
          <div className="text-sm whitespace-pre-wrap max-h-48 overflow-auto bg-slate-50 border border-slate-200 rounded-xl p-3">
            {preview}
          </div>
        </div>
      )}

      {(mp3 || m4b) && (
        <div className="card p-4">
          <div className="grid md:grid-cols-2 gap-6">
            {mp3 && (
              <div>
                <div className="font-medium mb-1">MP3</div>
                <audio controls src={mp3} className="w-full mb-2"/>
                <a href={dlMp3 || mp3} download target="_blank" rel="noreferrer" className="btn btn-ghost">Télécharger MP3</a>
              </div>
            )}
            {m4b && (
              <div>
                <div className="font-medium mb-1">M4B</div>
                <audio controls src={m4b} className="w-full mb-2"/>
                <a href={dlM4b || m4b} download target="_blank" rel="noreferrer" className="btn btn-ghost">Télécharger M4B</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
