// src/App.jsx
import { useState } from "react";

import Navbar from "./components/Navbar.jsx";
import UploadCard from "./components/UploadCard.jsx";
import FileDropzone from "./components/FileDropzone.jsx"; // <-- CORRECT
import VoicePicker from "./components/VoicePicker.jsx";
import ProgressBar from "./components/ProgressBar.jsx";
import AudioResult from "./components/AudioResult.jsx";
import History from "./pages/History.jsx";

export default function App() {
  const [file, setFile] = useState(null);
  const [voice, setVoice] = useState("Rachel");
  const [job, setJob] = useState(null);         // { id, status, mp3_url, m4b_url, ...}
  const [progress, setProgress] = useState(0);  // 0..100

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Zone d’upload + sélection de voix */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UploadCard
            file={file}
            onClear={() => setFile(null)}
            onConvert={() => {/* tu déclenches l’appel API ici si tu veux */}}
          />

          <div className="space-y-4">
            <FileDropzone
              onSelect={(f) => setFile(f)}
              accept={{
                "application/pdf": [".pdf"],
                "application/epub+zip": [".epub"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
              }}
              maxSizeMB={100}
            />

            <VoicePicker value={voice} onChange={setVoice} />
          </div>
        </section>

        {/* Barre de progression temps réel (si tu branches le polling / SSE) */}
        {progress > 0 && progress < 100 && (
          <section>
            <ProgressBar value={progress} />
          </section>
        )}

        {/* Résultat audio */}
        {job && (
          <section>
            <AudioResult job={job} />
          </section>
        )}

        {/* Historique local (ou venant de l’API si tu veux) */}
        <section>
          <History />
        </section>
      </main>
    </div>
  );
}
