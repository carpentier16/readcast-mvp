export default function ProgressBar({ progress = 0, label }) {
  const p = Math.max(0, Math.min(100, Number(progress) || 0));
  return (
    <div>
      {label ? <div className="mb-1 text-sm text-slate-600">{label}</div> : null}
      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-3 bg-brand-600 transition-all" style={{ width: `${p}%` }} />
      </div>
      <div className="mt-1 text-right text-xs text-slate-500">{p}%</div>
    </div>
  );
}
