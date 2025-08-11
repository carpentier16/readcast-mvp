const API_URL = import.meta.env.VITE_API_BASE;

export default function History() {
  async function load() {
    const r = await fetch(`${API_URL}/api/jobs/history`);
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  }

  return (
    <Loader loader={load} />
  );
}

function Loader({ loader }) {
  const [items, setItems] = React.useState([]);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    loader().then(setItems).catch(e => setErr(String(e)));
  }, [loader]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Historique</h1>
      {err && <pre className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</pre>}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-medium text-slate-500 border-b border-slate-200">
          <div className="col-span-5">Fichier</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-3">Créé</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {items.map(j => (
          <div key={j.id} className="grid grid-cols-12 gap-3 px-4 py-3 border-b last:border-b-0 border-slate-100 items-center">
            <div className="col-span-5 truncate">{j.input_filename}</div>
            <div className="col-span-2"><span className="badge">{j.status}</span></div>
            <div className="col-span-3 text-sm text-slate-600">{new Date(j.created_at || Date.now()).toLocaleString()}</div>
            <div className="col-span-2 text-right space-x-2">
              {j.output_mp3_url && <a className="btn btn-ghost text-sm" href={j.output_mp3_url} target="_blank" rel="noreferrer">Écouter</a>}
              {j.download_mp3_url && <a className="btn btn-primary text-sm" href={j.download_mp3_url} download target="_blank" rel="noreferrer">MP3</a>}
            </div>
          </div>
        ))}
        {items.length === 0 && (<div className="p-6 text-center text-slate-500">Aucune conversion pour le moment.</div>)}
      </div>
    </div>
  );
}
