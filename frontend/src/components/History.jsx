export default function HistoryList({ items = [] }) {
  if (!items.length) {
    return <div className="text-sm text-white/50">Aucun élément pour le moment.</div>;
  }
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.id} className="card p-4 flex items-center justify-between">
          <div className="min-w-0">
            <div className="truncate font-medium">{it.input_filename || "Fichier"}</div>
            <div className="text-xs text-white/50 mt-0.5">{it.id}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${it.status === "DONE" ? "bg-green-500/20 text-green-200" : it.status === "ERROR" ? "bg-red-500/20 text-red-200" : ""}`}>
              {it.status}
            </span>
            {it.output_mp3_url && (
              <a className="btn-muted" href={it.output_mp3_url} download>MP3</a>
            )}
            {it.output_m4b_url && (
              <a className="btn-muted" href={it.output_m4b_url} download>M4B</a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
