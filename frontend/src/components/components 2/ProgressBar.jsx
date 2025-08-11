import React from "react";

export default function ProgressBar({ value = 0 }) {
  return (
    <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
      <div
        className="h-full bg-white transition-[width] duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
