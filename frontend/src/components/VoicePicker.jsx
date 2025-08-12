const VOICES = [
  { id: "Rachel", ui: "Rachel", sub: "Féminine • Chaleureuse" },
  { id: "Emma",   ui: "Emma",   sub: "Féminine • Narrative"  },
  { id: "Thomas", ui: "Thomas", sub: "Masculine • Pro"       },
  { id: "Antoine",ui: "Antoine",sub: "Masculine • Dramatique"},
];

export default function VoicePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {VOICES.map(v => (
        <button
          key={v.id}
          onClick={() => onChange?.(v.id)}
          className={`card p-4 text-left transition hover:border-white/20 ${value === v.id ? "ring-2 ring-[rgb(var(--brand))]" : ""}`}
        >
          <div className="font-semibold">{v.ui}</div>
          <div className="text-xs text-white/60 mt-1">{v.sub}</div>
        </button>
      ))}
    </div>
  );
}
