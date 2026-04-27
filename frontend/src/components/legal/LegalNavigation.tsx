"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { legalPages } from "@/lib/site";

export function LegalNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation des pages légales" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-950 mb-3">Pages légales</p>
      <ul className="space-y-1">
        {legalPages.map((page) => {
          const isActive = pathname === page.href;
          return (
            <li key={page.href}>
              <Link href={page.href} aria-current={isActive ? "page" : undefined}
                className={`block rounded-xl px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${isActive ? "bg-slate-950 text-white font-medium" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                {page.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
