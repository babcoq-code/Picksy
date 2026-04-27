// src/components/sidebar/NewSearchButton.tsx
"use client";

interface Props {
  collapsed?: boolean;
  onClick?: () => void;
}

export function NewSearchButton({ collapsed = false, onClick }: Props) {
  return (
    <button
      type="button"
      className={["troviio-new-search-btn", collapsed ? "is-collapsed" : ""].filter(Boolean).join(" ")}
      onClick={onClick}
      aria-label="Nouvelle recherche"
      title={collapsed ? "Nouvelle recherche" : undefined}
    >
      <span aria-hidden="true" className="text-base leading-none">✨</span>
      {!collapsed && <span className="whitespace-nowrap">Nouvelle recherche</span>}
    </button>
  );
}
