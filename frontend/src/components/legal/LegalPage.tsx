import type { ReactNode } from "react";

type LegalPageProps = {
  title: string;
  updatedAt: string;
  description?: string;
  children: ReactNode;
};

export function LegalPage({ title, updatedAt, description, children }: LegalPageProps) {
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  }).format(new Date(updatedAt));
  return (
    <article className="mx-auto w-full max-w-3xl">
      <header className="border-b border-slate-200 pb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Informations légales</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        {description && <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{description}</p>}
        <p className="mt-5 text-sm text-slate-500">Dernière mise à jour : <time dateTime={updatedAt}>{formattedDate}</time></p>
      </header>
      <div className="legal-content mt-8">{children}</div>
    </article>
  );
}
