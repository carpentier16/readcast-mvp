const API = import.meta.env.VITE_API_BASE?.replace(/\/$/, "");

export async function createJob(file, voiceId) {
  if (!API) throw new Error("VITE_API_BASE manquant.");

  const form = new FormData();
  form.append("file", file);
  // côté backend, “voice” est optionnel — garde Rachel par défaut si non mappé
  form.append("voice", voiceId || "Rachel");

  const res = await fetch(`${API}/api/jobs`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "HTTP error");
  }
  return res.json();
}

export async function getJob(id) {
  const res = await fetch(`${API}/api/jobs/${id}`);
  if (!res.ok) throw new Error("HTTP error");
  return res.json();
}
