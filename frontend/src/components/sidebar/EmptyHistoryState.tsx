// src/components/sidebar/EmptyHistoryState.tsx
"use client";

interface Props {
  onStart?: () => void;
}

export function EmptyHistoryState({ onStart }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] px-5 py-8 text-center">
      <div
        className="flex items-center justify-center w-36 h-28 mb-5 rounded-[32px]"
        style={{
          background:
            "radial-gradient(circle at 34% 18%, rgba(255,107,95,0.12), transparent 28%), radial-gradient(circle at 72% 78%, rgba(62,214,163,0.15), transparent 32%)",
        }}
        aria-hidden="true"
      >
        <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
          <rect x="10" y="10" width="62" height="52" rx="16" fill="#FFF7ED" stroke="#EFE3D6" strokeWidth="1.5" />
          <path d="M24 30H56" stroke="#161827" strokeWidth="4" strokeLinecap="round" opacity="0.1" />
          <path d="M24 42H46" stroke="#161827" strokeWidth="4" strokeLinecap="round" opacity="0.1" />
          <circle cx="73" cy="56" r="15" fill="#3ED6A3" opacity="0.15" />
          <circle cx="73" cy="56" r="9" stroke="#3ED6A3" strokeWidth="3.5" />
          <path d="M79 63L87 71" stroke="#3ED6A3" strokeWidth="4" strokeLinecap="round" />
          <path d="M19 13C20.2 7.6 24 4.2 29.5 3C24 1.8 20.2-1.6 19-7C17.8-1.6 14-1.8 8.5 3C14 4.2 17.8 7.6 19 13Z" transform="translate(-1 9)" fill="#FF6B5F" />
          <path d="M76 24C77.2 19 80.4 16.1 85 15C80.4 13.9 77.2 11 76 6C74.8 11 71.6 13.9 67 15C71.6 16.1 74.8 19 76 24Z" fill="#4257FF" opacity="0.85" />
        </svg>
      </div>

      <h3 className="max-w-[200px] mb-2 font-bold leading-tight text-[#161827]" style={{ fontFamily: "'Sora', sans-serif", fontSize: "17px", letterSpacing: "-0.03em" }}>
        Ton historique est prêt à se remplir
      </h3>

      <p className="max-w-[220px] mb-5 text-xs leading-relaxed" style={{ fontFamily: "'Inter', sans-serif", color: "rgba(22,24,39,0.58)" }}>
        Lance une première recherche Troviio et retrouve ici tes recommandations en un clic.
      </p>

      {onStart && (
        <button type="button" className="troviio-new-search-btn" onClick={onStart}>
          <span>✨</span>
          Commencer ma 1ère recherche
        </button>
      )}
    </div>
  );
}
