import React from "react";

export default function ProgressBar({ value }) {
  return (
    <div className="w-full">
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 animate-[pulse_1.3s_ease-in-out_infinite]"
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-white/70">{value}%</div>
    </div>
  );
}
