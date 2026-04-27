// src/components/sidebar/SidebarToggleButton.tsx
"use client";

interface Props {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function SidebarToggleButton({ collapsed = false, onToggle }: Props) {
  return (
    <button
      type="button"
      className="troviio-sidebar-toggle"
      onClick={onToggle}
      aria-label={collapsed ? "Déplier la sidebar" : "Replier la sidebar"}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        style={{
          transition: "transform 220ms cubic-bezier(0.2,0.8,0.2,1)",
          transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        <path d="M11.25 4.5L6.75 9L11.25 13.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
