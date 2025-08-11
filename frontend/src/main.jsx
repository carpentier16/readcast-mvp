import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

function start() {
  try {
    const el = document.getElementById("root");
    if (!el) {
      throw new Error("Div #root introuvable");
    }
    const root = createRoot(el);
    root.render(<App />);
  } catch (e) {
    // Affiche l’erreur à l’écran + log console
    console.error("Erreur de démarrage :", e);
    const el = document.getElementById("root");
    if (el) {
      el.innerHTML = `
        <div style="max-width:720px;text-align:center;padding:40px;">
          <h1 style="margin:0 0 12px;font-size:20px;">Erreur d’initialisation</h1>
          <pre style="text-align:left;white-space:pre-wrap;background:#121212;padding:12px;border-radius:8px;border:1px solid #333;overflow:auto;">
${(e && (e.stack || e.message)) || e}
          </pre>
        </div>`;
    }
  }
}

start();
