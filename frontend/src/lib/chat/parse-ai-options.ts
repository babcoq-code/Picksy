export type ParsedAIOptions = {
  cleanText: string;
  options: string[];
};

const MAX_EXTRACTED_OPTIONS = 6;

function normalizeOptionLabel(value: string): string {
  return value
    .replace(/^option\s+\d+\s*[:.)-]?\s*/i, "")
<<<<<<< HEAD
    .replace(/^[A-Z]\s*[:.)-]\s*/i, "")
    .replace(/^\d+\s*[:.)-]\s*/i, "")
    .replace(/^[-•]\s*/, "")
=======
    .replace(/^[A-Za-z]\s*[:.)-]\s*/i, "")
    .replace(/^\d+\s*[:.)-]\s*/i, "")
    .replace(/^[-•*]\s*/, "")
>>>>>>> 4e3d4795 (feat(chat): Chat IA v2 — clic catégorie → IA parle en premier)
    .trim();
}

function uniqueOptions(options: string[]): string[] {
  const seen = new Set<string>();
  return options.filter((option) => {
    const key = option.toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function parseAIOptions(text: string): ParsedAIOptions {
  if (!text.trim()) return { cleanText: "", options: [] };

<<<<<<< HEAD
  let workingText = text.replace(/\r\n/g, "\n");
  const options: string[] = [];

  // Pattern multiline : "1. Option" ou "A) Option" ou "- Option"
  const multilineOptionRegex =
    /^(?:\s*)(?:(?:\d{1,2}|[A-Z])[\s]*[.)-]|[-•]\s*(?:Option\s+\d+)?\s*[:.)-]?)(?:\s+)(.+?)\s*$/gim;
=======
  // Nettoyage Markdown bold/italic qui peut casser les regex
  let workingText = text.replace(/\r\n/g, "\n");
  const options: string[] = [];

  // ── STRATÉGIE 1 : Listes formatées multiline ──
  // Capture : "1. Option" | "1) Option" | "A. Option" | "A) Option" | "- Option" | "• Option" | "* Option"
  const multilineOptionRegex =
    /^(?:\s*)(?:(?:\d{1,2}|[A-Za-z])[\s]*[.)-]|[-•*]\s*(?:Option\s+\d+)?\s*[:.)-]?)(?:\s+)(.+?)\s*$/gim;
>>>>>>> 4e3d4795 (feat(chat): Chat IA v2 — clic catégorie → IA parle en premier)

  workingText = workingText.replace(multilineOptionRegex, (_match, rawOption: string) => {
    const normalized = normalizeOptionLabel(rawOption);
    if (normalized.length >= 2) options.push(normalized);
    return "";
  });

<<<<<<< HEAD
  // Pattern inline lettré : "A) Parquet B) Moquette"
  const inlineLetteredMatches = Array.from(
    workingText.matchAll(/(?:^|\s)([A-Z])\)\s+([^A-Z\n]+?)(?=\s+[A-Z]\)\s+|$)/g),
  );
  if (inlineLetteredMatches.length >= 2) {
    for (const match of inlineLetteredMatches) {
      const rawOption = match[2]?.trim();
      if (rawOption && rawOption.length >= 2) options.push(normalizeOptionLabel(rawOption));
    }
    workingText = workingText.replace(
      /(?:^|\s)([A-Z])\)\s+([^A-Z\n]+?)(?=\s+[A-Z]\)\s+|$)/g, " ",
    );
=======
  // ── STRATÉGIE 2 : Options inline séparées par | ou / ──
  if (options.length === 0 && (workingText.includes(" | ") || workingText.includes(" / "))) {
    const parts = workingText
      .split(/\s*[|/]\s*/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2 && s.length <= 80);
    if (parts.length >= 2 && parts.length <= MAX_EXTRACTED_OPTIONS) {
      parts.forEach((p) => options.push(p));
    }
  }

  // ── STRATÉGIE 3 : Format "A) Parquet B) Moquette" inline lettré ──
  if (options.length === 0) {
    const inlineLetteredMatches = Array.from(
      workingText.matchAll(/(?:^|\s)([A-Z])\)\s+([^A-Z\n]+?)(?=\s+[A-Z]\)\s+|$)/g)
    );
    if (inlineLetteredMatches.length >= 2) {
      for (const match of inlineLetteredMatches) {
        const rawOption = match[2]?.trim();
        if (rawOption && rawOption.length >= 2) {
          options.push(normalizeOptionLabel(rawOption));
        }
      }
    }
  }

  // ── STRATÉGIE 4 (fallback) : Lignes courtes comme réponses possibles ──
  // Si l'IA répond avec des lignes courtes séparées (sans marqueur de liste)
  if (options.length === 0) {
    const lines = workingText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length >= 3 && l.length <= 60 && !l.includes("?") && !l.endsWith("."));
    if (lines.length >= 2 && lines.length <= MAX_EXTRACTED_OPTIONS) {
      lines.forEach((l) => options.push(l));
    }
>>>>>>> 4e3d4795 (feat(chat): Chat IA v2 — clic catégorie → IA parle en premier)
  }

  const cleanedOptions = uniqueOptions(options)
    .map((o) => o.replace(/\s+/g, " ").trim())
    .filter((o) => o.length >= 2)
    .slice(0, MAX_EXTRACTED_OPTIONS);

  const cleanText = workingText
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return { cleanText, options: cleanedOptions };
}
