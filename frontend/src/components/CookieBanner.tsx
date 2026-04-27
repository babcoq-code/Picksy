"use client";
import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("cookie_pref")) setVisible(true);
  }, []);
  const accept = () => {
    localStorage.setItem("cookie_pref", "accepted");
    setVisible(false);
  };
  const refuse = () => {
    localStorage.setItem("cookie_pref", "refused");
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 p-4 shadow-xl z-50">
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-4 justify-between">
        <p className="text-sm text-stone-700">
          Troviio utilise des cookies d'analyse (anonymes) et d'affiliation.{" "}
          <a href="/cookies" className="underline text-stone-900 hover:text-stone-600">
            En savoir plus
          </a>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={refuse}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50 transition"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="rounded-full bg-stone-950 text-white px-4 py-2 text-sm hover:bg-stone-800 transition"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
