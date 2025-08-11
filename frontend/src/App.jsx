import { useRef, useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE; // ex: https://audiobook-api-xbmz.onrender.com

export default function App() {
  const fileRef = useRef(null);
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState("");
  const [mp3, setMp3] = useState("");
  const [m4b, setM4b] = useState("");
  const [downloadMp3, setDownloadMp3] = useState("");
  const [downloadM4b, setDownloadM4b] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function startJob(e) {
    e.preventDefault();
    setError("");
    setStatus("");
    setMp3("");
    setM4b("");
    setDownloadMp3("");
    setDownloadM4b("");
    setJobId("");
    setIsLoading(true);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choisis un PDF");
      setIsLoading(false);
      return;
    }

    try {
      const form = new FormData();
      form.append("file", file);
      // Optionnel : voice/lang
      // form.append("voice", "Rachel");
      // form.append("lang", "fra");

      const r = await fetch(`${API_BASE}/api/jobs`, { method: "POST", body: form });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Échec création job");

      setJobId(data.id);
      setStatus(data.status);
      setIsLoading(false);
    } catch (e) {
      setError(String(e));
      setIsLoading(false);
    }
  }

  // Temps réel via SSE (fallback polling)
  useEffect(() => {
    if (!jobId) return;

    let closed = false;

    if ("EventSource" in window) {
      const es = new EventSource(`${API_BASE}/api/jobs/${jobId}/events`);
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.error) setError(data.error);
          if (data.status) setStatus(data.status);
          if (data.output_mp3_url) setMp3(data.output_mp3_url);
          if (data.output_m4b_url) setM4b(data.output_m4b_url);
          if (data.download_mp3_url) setDownloadMp3(data.download_mp3_url);
          if (data.download_m4b_url) setDownloadM4b(data.download_m4b_url);
          if (data.status === "DONE" || data.status === "ERROR") {
            es.close();
          }
        } catch (e) {
          console.error(e);
        }
      };
      es.onerror = () => {
        es.close();
        if (!closed) startPolling();
      };
      return () => {
        closed = true;
        es.close();
      };
    } else {
      startPolling();
      return () => stopPolling();
    }

    function startPolling() {
      stopPolling();
      window.__poll = setInterval(async () => {
        try {
          const r = await fetch(`${API_BASE}/api/jobs/${jobId}`);
          const data = await r.json();
          if (data.error) setError(data.error);
          if (data.status) setStatus(data.status);
          if (data.output_mp3_url) setMp3(data.output_mp3_url);
          if (data.output_m4b_url) setM4b(data.output_m4b_url);
          if (data.download_mp3_url) setDownloadMp3(data.download_mp3_url);
          if (data.download_m4b_url) setDownloadM4b(data.download_m4b_url);
          if (data.status === "DONE" || data.status === "ERROR") stopPolling();
        } catch (e) {
          console.error(e);
          stopPolling();
        }
      }, 3000);
    }
    function stopPolling() {
      if (window.__poll) {
        clearInterval(window.__poll);
        window.__poll = null;
      }
    }
  }, [jobId]);

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", fontFamily: "Inter, system-ui, sans-serif", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 8 }}>📖→🎧 Readcast</h1>
      <p style={{ color: "#666", marginTop: 0 }}>Transforme un PDF/scan manuscrit en audiobook (MVP).</p>

      <form onSubmit={startJob} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input type="file" accept="application/pdf" ref={fileRef} />
        <button type="submit" disabled={isLoading} style={{ padding: "10px 14px" }}>
          {isLoading ? "Traitement…" : "Convertir en audiobook"}
        </button>
      </form>

      {jobId && (
        <div style={{ marginTop: 16 }}>
          <div>Job id&nbsp;: <code>{jobId}</code></div>
          <div>Statut&nbsp;: <strong>{status}</strong></div>
        </div>
      )}

      {error && (
        <pre style={{ marginTop: 16, background: "#fee", padding: 12, whiteSpace: "pre-wrap", border: "1px solid #fbb" }}>
          {error}
        </pre>
      )}

      {mp3 && (
        <div style={{ marginTop: 24 }}>
          <h3>MP3</h3>
          <audio controls src={mp3} style={{ width: "100%" }} />
          <div style={{ marginTop: 8 }}>
            <a href={downloadMp3 || mp3} download target="_blank" rel="noreferrer">
              Télécharger MP3
            </a>
          </div>
        </div>
      )}

      {m4b && (
        <div style={{ marginTop: 24 }}>
          <h3>M4B</h3>
          <audio controls src={m4b} style={{ width: "100%" }} />
          <div style={{ marginTop: 8 }}>
            <a href={downloadM4b || m4b} download target="_blank" rel="noreferrer">
              Télécharger M4B
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

