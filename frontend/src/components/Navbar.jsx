import React from 'react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgb(var(--bg))]/80 backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--bg))]/60">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-[rgb(var(--brand))] grid place-items-center font-bold">R</div>
          <div className="text-lg font-semibold">Readcast</div>
          <span className="badge">Beta</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-white/60">
          <span className="hidden md:inline">API:</span>
          <a className="btn-muted" href="https://audiobook-api-xbmz.onrender.com" target="_blank" rel="noreferrer">
            audiobook-api… <span className="kbd">↗</span>
          </a>
        </div>
      </div>
    </header>
  );
}
