// src/components/layout/AppShell.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { HistorySidebar } from "@/components/sidebar/HistorySidebar";

const SIDEBAR_WIDTH_EXPANDED = 268;
const SIDEBAR_WIDTH_COLLAPSED = 56;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setIsMobileOpen(false); }, [pathname]);

  useEffect(() => {
    function onResize() { if (window.innerWidth >= 768) setIsMobileOpen(false); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sidebarWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div className="flex min-h-screen w-full bg-white">

      {/* DESKTOP SIDEBAR */}
      <aside
        className="hidden md:block flex-shrink-0 sticky top-0 h-screen z-30"
        style={{ width: sidebarWidth, transition: "width 250ms cubic-bezier(0.16,1,0.3,1)" }}
        aria-label="Historique des recherches"
      >
        <HistorySidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      <div className="md:hidden" aria-hidden={!isMobileOpen}>
        <div
          className="fixed inset-0 z-40"
          style={{
            background: "rgba(14,16,32,0.52)",
            backdropFilter: "blur(4px)",
            opacity: isMobileOpen ? 1 : 0,
            pointerEvents: isMobileOpen ? "auto" : "none",
            transition: "opacity 240ms ease",
          }}
          onClick={() => setIsMobileOpen(false)}
        />
        <div
          className="fixed inset-y-0 left-0 z-50"
          style={{
            width: SIDEBAR_WIDTH_EXPANDED,
            transform: isMobileOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 300ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <HistorySidebar isCollapsed={false} onToggle={() => setIsCollapsed((prev) => !prev)} onMobileClose={() => setIsMobileOpen(false)} />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header
          className="md:hidden flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-20 bg-white/90 backdrop-blur-sm"
          style={{ borderColor: "rgba(176,170,162,0.2)" }}
        >
          <button type="button" onClick={() => setIsMobileOpen(true)} className="p-2 rounded-xl hover:bg-black/5 transition-colors" aria-label="Ouvrir l'historique">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#161827" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <span className="font-bold" style={{ fontFamily: "'Sora', sans-serif", fontSize: "17px", letterSpacing: "-0.03em", color: "#161827" }}>
            Trovi<span style={{ color: "#FF6B5F" }}>i</span><span style={{ color: "#3ED6A3" }}>o</span>
          </span>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
