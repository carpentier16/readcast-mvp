import React from "react";

export default function FileDropzone({ accept = "application/pdf", onFileSelected }) {
  const inputRef = React.useRef(null);
  const [dragOver, setDragOver] = React.useState(false);

  function onChoose(e) {
    const f = e.target.files?.[0];
    if (f && onFileSelected) onFileSelected(f);
  }
  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && onFileSelected) onFileSelected(f);
  }

  return (
    <div
      onDragOver={(e)=>{e.preventDefault(); setDragOver(true);}}
      onDragLeave={()=>setDragOver(false)}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${dragOver ? "border-brand-400 bg-brand-50" : "border-slate-300 hover:border-slate-400"}`}
      onClick={()=>inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onChoose} />
      <div className="text-lg font-medium">Glisse ton fichier ici</div>
      <div className="text-slate-500">ou clique pour choisir</div>
    </div>
  );
}
