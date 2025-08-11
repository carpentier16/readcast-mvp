import React from "react";

const VOICES = [
  { id: "Rachel", label: "Rachel" },
  { id: "Bella", label: "Bella" },
  { id: "Antoine", label: "Antoine" },
  { id: "Thomas", label: "Thomas" },
];

export default function VoicePicker({ value, onChange }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="text-sm mb-3 text-neutral-300">Voix</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {VOICES.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onChange?.(v.id)}
            className={`rounded-lg border px-3 py-2 text-sm ${
              value === v.id
                ? "border-white bg-white text-black"
                : "border-neutral-700 hover:border-neutral-500 text-neutral-200"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
