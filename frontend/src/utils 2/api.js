
// src/utils/api.js
const API_BASE_URL = "https://audiobook-api-xbmz.onrender.com";

export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Erreur lors de l'upload du fichier.");
  }

  return await response.json();
}

export async function getJobStatus(jobId) {
  const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération du statut.");
  }
  return await response.json();
}
