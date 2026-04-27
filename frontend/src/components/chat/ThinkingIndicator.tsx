export function ThinkingIndicator() {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-surface-light px-5 py-4"
      aria-live="polite"
      aria-label="Troviio réfléchit"
    >
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span
          className="size-2 rounded-full animate-picksy-dot"
          style={{ backgroundColor: "#3ED6A3", animationDelay: "0ms" }}
        />
        <span
          className="size-2 rounded-full animate-picksy-dot"
          style={{ backgroundColor: "#3ED6A3", animationDelay: "140ms" }}
        />
        <span
          className="size-2 rounded-full animate-picksy-dot"
          style={{ backgroundColor: "#3ED6A3", animationDelay: "280ms" }}
        />
      </div>
      <span className="text-sm font-medium text-muted">
        Troviio réfléchit...
      </span>
    </div>
  );
}
