import React from "react";

export default function Header() {
  return (
    <header className="py-6 flex items-center justify-between">
      <a href="/" className="text-lg font-semibold tracking-tight">Readcast</a>
      <a
        href="/api"
        className="text-sm text-neutral-400 hover:text-neutral-200"
        onClick={(e) => e.preventDefault()}
      >
        API
      </a>
    </header>
  );
}
