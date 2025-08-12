const FALLBACK = "https://audiobook-api-xbmz.onrender.com";

function safeBase() {
  // Vite en prod: injecte VITE_API_BASE si défini dans Vercel
  const envVal = import.meta?.env?.VITE_API_BASE;
  try {
    return new URL(envVal || FALLBACK).toString().replace(/\/+$/, "");
  } catch {
    return FALLBACK;
  }
}

export const API_BASE = safeBase();

export async function uploadPdf(file, voice = "Rachel") {
  const form = new FormData();
  form.append("file", file);
  form.append("voice", voice);

  const res = await fetch(`${API_BASE}/api/jobs`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST /api/jobs ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export async function getJob(id) {
  const res = await fetch(`${API_BASE}/api/jobs/${id}`);
  if (!res.ok) throw new Error(`GET /api/jobs/${id} ${res.status}`);
  return res.json();
}
