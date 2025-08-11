import React from "react";

function VoiceCard({ active, name, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-4 border transition grid grid-cols-[auto,1fr,auto] gap-3 items-center
        ${active ? "border-indigo-400 bg-indigo-500/5" : "border-white/10 bg-white/5 hover:bg-white/10"}
      `}
    >
      <div className="rounded-md bg-white/10 p-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 15c2.21 0 4-1.79 4-4V7a4 4 0 10-8 0v4c0 2.21 1.79 4 4 4z"
            stroke="#fff"
            strokeWidth="1.5"
          />
          <path
            d="M5 11v1a7 7 0 0014 0v-1"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-white/60">{subtitle}</div>
      </div>
      {active && (
        <span className="text-xs px-2 py-1 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
          Sélectionnée
        </span>
      )}
    </button>
  );
}

export default function VoicePicker({ voices, selected, onSelect }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-base font-medium mb-3">Choisir la voix narratrice</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {voices.map((v) => (
          <VoiceCard
            key={`${v.name}-${v.subtitle}`}
            active={selected?.name === v.name}
            name={v.name}
            subtitle={v.subtitle}
            onClick={() => onSelect(v)}
          />
        ))}
      </div>
      <p className="text-xs text-white/50 mt-3">
        (Astuce) les voix supplémentaires peuvent être branchées plus tard sur
        ElevenLabs : mappe leur ID réel côté backend.
      </p>
    </div>
  );
}
