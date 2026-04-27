"use client";

import { useMemo, useState, type KeyboardEvent } from "react";

type SuggestionChipsProps = {
  options: string[];
  onSelect: (option: string) => void | Promise<void>;
  maxVisible?: number;
  className?: string;
};

export function SuggestionChips({
  options,
  onSelect,
  maxVisible = 4,
  className,
}: SuggestionChipsProps) {
  const [expanded, setExpanded] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const visibleOptions = useMemo(() => {
    return expanded ? options : options.slice(0, maxVisible);
  }, [expanded, maxVisible, options]);

  const hiddenCount = Math.max(options.length - maxVisible, 0);

  if (options.length === 0) return null;

  const handleSelect = async (option: string) => {
    if (isLeaving) return;
    setSelectedOption(option);
    setIsLeaving(true);
    window.setTimeout(() => void onSelect(option), 180);
  };

  const handleKeyboardSelect = (event: KeyboardEvent<HTMLButtonElement>, option: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void handleSelect(option);
    }
  };

  return (
    <div
      className={[
        "mt-3 flex flex-wrap gap-2 transition-all duration-200 ease-out",
        isLeaving ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100",
        className,
      ].filter(Boolean).join(" ")}
      aria-label="Suggestions de réponse"
    >
      {visibleOptions.map((option, index) => (
        <button
          key={`${option}-${index}`}
          type="button"
          onClick={() => void handleSelect(option)}
          onKeyDown={(e) => handleKeyboardSelect(e, option)}
          disabled={isLeaving}
          className={[
            "animate-picksy-chip-in rounded-full border px-4 py-2",
            "text-sm font-medium transition-all duration-200",
            "border-[#FF6B5F]/30 bg-[#FF6B5F]/8 text-[#FFB020]",
            "hover:bg-gradient-to-r hover:from-[#FF6B5F] hover:to-[#FFB020] hover:border-transparent hover:text-white hover:shadow-lg hover:shadow-[#FF6B5F]/20",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B5F]",
            "disabled:pointer-events-none disabled:opacity-60",
            selectedOption === option ? "scale-95 bg-gradient-to-r from-[#FF6B5F] to-[#FFB020] text-white" : "",
          ].join(" ")}
          style={{ animationDelay: `${index * 55}ms` }}
        >
          {option}
        </button>
      ))}

      {!expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          disabled={isLeaving}
          className={[
            "animate-picksy-chip-in rounded-full border px-4 py-2",
            "text-sm font-medium transition-all duration-200",
            "border-white/10 bg-surface-light text-muted",
            "hover:border-[var(--color-blueberry)]/40 hover:text-[var(--color-blueberry)]",
          ].join(" ")}
          style={{ animationDelay: `${visibleOptions.length * 55}ms` }}
        >
          Voir plus ({hiddenCount})
        </button>
      )}
    </div>
  );
}
