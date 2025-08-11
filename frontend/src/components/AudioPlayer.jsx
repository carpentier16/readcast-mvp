export default function AudioPlayer({ src, downloadUrl, label = "Écouter" }) {
  if (!src) return null;
  return (
    <div>
      <div className="font-medium mb-2">{label}</div>
      <audio controls src={src} className="w-full mb-2" />
      <a href={downloadUrl || src} download target="_blank" rel="noreferrer" className="btn btn-ghost">
        Télécharger
      </a>
    </div>
  );
}
