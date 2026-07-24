export function ProgressBar({ pct }: { pct: number }) {
  const filled = Math.min(Math.max(pct, 0), 100);
  const isOver = pct > 100;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full border border-bark overflow-hidden">
        <div className="h-full bg-bark" style={{ width: `${filled}%` }} />
      </div>
      <span className={`text-xs shrink-0 ${isOver ? "font-bold" : ""}`}>
        {isOver ? "!" : ""}
        {Math.round(pct)}%
      </span>
    </div>
  );
}
