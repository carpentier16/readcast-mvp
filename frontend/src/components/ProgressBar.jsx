import React from 'react';

export default function Progress({ value = 0, label = "" }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-white/70">{label || "Progression"}</span>
        <span className="text-white/60">{Math.round(value)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-[rgb(var(--brand))] transition-[width] duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
