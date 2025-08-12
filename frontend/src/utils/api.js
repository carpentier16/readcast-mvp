const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "");

export async function uploadPDF(file, voiceId) {
  const form = new FormData();
  form.append("file", file);
  if (voiceId) form.append("voice_id", voiceId);

  const res = await fetch(`${API_BASE}/api/jobs`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json(); // { id }
}

export async function getJob(id) {
  const res = await fetch(`${API_BASE}/api/jobs/${id}`);
  if (!res.ok) throw new Error("Job fetch failed");
  return res.json();
}

export async function listJobs(limit = 20) {
  // si tu as un endpoint /api/jobs?limit=… côté backend, sinon stocke localStorage côté front
  try {
    const res = await fetch(`${API_BASE}/api/jobs?limit=${limit}`);
    if (res.ok) return res.json();
  } catch {}
  return [];
}
