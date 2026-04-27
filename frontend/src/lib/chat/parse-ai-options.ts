export type ParsedAIOptions = {
  cleanText: string;
  options: string[];
};

const MAX_EXTRACTED_OPTIONS = 6;

function normalizeOptionLabel(value: string): string {
  return value
    .replace(/^option\s+\d+\s*[:.)-]?\s*/i, "")
    .replace(/^[A-Z]\s*[:.)-]\s*/i, "")
    .replace(/^\d+\s*[:.)-]\s*/i, "")
    .replace(/^[-•]\s*/, "")
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

  let workingText = text.replace(/\r\n/g, "\n");
  const options: string[] = [];

  // Pattern multiline : "1. Option" ou "A) Option" ou "- Option"
  const multilineOptionRegex =
    /^(?:\s*)(?:(?:\d{1,2}|[A-Z])[\s]*[.)-]|[-•]\s*(?:Option\s+\d+)?\s*[:.)-]?)(?:\s+)(.+?)\s*$/gim;

  workingText = workingText.replace(multilineOptionRegex, (_match, rawOption: string) => {
    const normalized = normalizeOptionLabel(rawOption);
    if (normalized.length >= 2) options.push(normalized);
    return "";
  });

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
