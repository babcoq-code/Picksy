function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderInlineMarkdown(input: string): string {
  return input
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s.,;:!?])_(.+?)_($|[\s.,;:!?])/g, "$1<em>$2</em>$3")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function renderParagraph(paragraph: string): string {
  const lines = paragraph.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return "";

  const isBulletList = lines.every((l) => /^[-•]\s+/.test(l));
  if (isBulletList) {
    const items = lines
      .map((l) => l.replace(/^[-•]\s+/, "").trim())
      .filter(Boolean)
      .map((item) => `<li>${renderInlineMarkdown(item)}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  }

  const content = lines.map(renderInlineMarkdown).join("<br />");
  return `<p>${content}</p>`;
}

export function renderMarkdown(text: string): string {
  const normalizedText = text.replace(/\r\n/g, "\n").trim();
  if (!normalizedText) return "";
  const escapedText = escapeHtml(normalizedText);
  return escapedText
    .split(/\n{2,}/)
    .map(renderParagraph)
    .filter(Boolean)
    .join("");
}
