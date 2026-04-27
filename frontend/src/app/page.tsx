"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { chatWithAI, subscribeNewsletter } from "@/lib/api";
import { ScoreRing } from "@/components/ScoreRing";
import { ThinkingIndicator } from "@/components/chat/ThinkingIndicator";
import CategoryGrid from "@/components/home/CategoryGrid";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import {
  getCategoryBySlug,
  type ChatCategory,
} from "@/app/constants/chat-categories";
import { ChatHeader } from "@/components/chat/ChatHeader";

const ChatBubble = dynamic(() => import("@/components/ChatBubble"), { ssr: false });

// Génère un ID de session unique sans dépendance externe
function genId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<
    {
      role: "user" | "ai";
      text: string;
      options?: string[];
      result_id?: string | null;
    }[]
  >([]);
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ChatCategory | null>(null);

  const aiOpeningQuestionRef = useRef<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restored = useRef(false);

  const { upsertEntry, setResultId } = useConversationHistory();
  const sessionIdRef = useRef(genId());

  // ── Restaurer l'historique depuis localStorage (retour depuis "Affiner") ──
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      const savedChat = localStorage.getItem(STORAGE_KEYS.CHAT);
      if (savedHistory && savedChat) {
        const parsedHistory = JSON.parse(savedHistory);
        const parsedChat = JSON.parse(savedChat);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          setHistory(parsedHistory);
          setChat(parsedChat);
          localStorage.removeItem(STORAGE_KEYS.HISTORY);
          localStorage.removeItem(STORAGE_KEYS.CHAT);
        }
      }
    } catch {}
  }, []);

  // ── Scroll automatique vers le bas du chat ──
  useEffect(() => {
    const chatSection = document.getElementById("chat");
    if (!chatSection) return;
    const rect = chatSection.getBoundingClientRect();
    const isChatVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!isChatVisible) return;

    const chatEndElement = chatEndRef.current;
    if (!chatEndElement) return;

    const container =
      (chatEndElement.closest("[data-chat-scroll]") as HTMLElement | null) ??
      chatEndElement.parentElement;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 80;
    if (isNearBottom) {
      chatEndElement.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [chat]);

  // ── Sauvegarder dans sessionStorage (récupéré par la page résultats) ──
  useEffect(() => {
    if (history.length > 0) {
      try {
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_HISTORY, JSON.stringify(history));
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_CHAT, JSON.stringify(chat));
      } catch {}
    }
  }, [history, chat]);

  // ── Envoi d'un message ──
  const handleSend = async (overrideMsg?: string) => {
    const userMsg = (overrideMsg ?? message).trim();
    if (!userMsg || loading) return;
    setMessage("");

    // Ne pas injecter la question d'ouverture dans l'historique API
    // L'IA a déjà l'exemple dans son SYSTEM_PROMPT — le frontend l'affiche localement
    const historyToSend = history;

    // Créer/mettre à jour l'entrée dans l'historique de conversations
    if (history.length === 0) {
      upsertEntry({
        id: sessionIdRef.current,
        categorySlug: selectedCategory?.slug ?? "recherche",
        categoryLabel: selectedCategory?.label ?? "Recherche",
        categoryEmoji: selectedCategory?.emoji ?? "🔍",
        summary: userMsg.slice(0, 72),
        createdAt: new Date().toISOString(),
      });
    }

    setChat((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await chatWithAI(userMsg, historyToSend);
      const aiText = res.reply;

      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          text: aiText,
          options: res.options ?? [],
          result_id: res.result_id ?? null,
        },
      ]);
      setHistory((prev) => [
        ...prev,
        { role: "user", content: userMsg },
        { role: "assistant", content: aiText },
      ]);

      // Lier le result_id à la session historique
      if (res.result_id) {
        setResultId(sessionIdRef.current, res.result_id);
      }
    } catch {
      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Désolé, une erreur s'est produite. Réessaie !",
          result_id: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Inscription newsletter ──
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    try {
      await subscribeNewsletter(email);
    } catch {}
    setSubscribed(true);
  };

  // ── Sélection d'une catégorie → IA parle en premier (0 latence) ──
  const handleCategorySelect = (slug: string) => {
    const cat = getCategoryBySlug(slug);
    if (!cat) return;

    setSelectedCategory(cat);
    setHistory([]);
    sessionIdRef.current = genId(); // Nouvelle session à chaque recherche
    aiOpeningQuestionRef.current = cat.openingQuestion;

    setChat([
      {
        role: "ai",
        text: cat.openingQuestion,
        options: [...cat.openingOptions],
        result_id: null,
      },
    ]);

    // Scroll vers le chat
    setTimeout(() => {
      document.getElementById("chat")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // ── Reset vers la grille de catégories ──
  const handleReset = () => {
    setSelectedCategory(null);
    setChat([]);
    setHistory([]);
    setMessage("");
    aiOpeningQuestionRef.current = null;
    sessionIdRef.current = genId();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main
      className="min-h-screen"
      style={{ background: "#0E1020", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ══ HEADER ══ */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background: "rgba(14,16,32,0.85)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.svg" alt="Troviio" className="h-7 w-7" />
            <span
              className="text-lg font-bold text-white"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Troviio
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-white/60">
            <a href="#adn" className="transition-colors hover:text-white">
              La méthode
            </a>
            <a href="/a-propos" className="transition-colors hover:text-white">
              À propos
            </a>
          </nav>
        </div>
      </header>

      {/* ══════════════════════════════════════
          1. HERO
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6">
        {/* Glow background */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, #FF6B5F 0%, #4257FF 50%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badges */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold text-white/80"
              style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}
            >
              IA nourrie par des milliers d'avis — guidée par TA vie
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
              style={{
                borderColor: "rgba(62,214,163,0.30)",
                background: "rgba(62,214,163,0.08)",
                color: "#3ED6A3",
              }}
            >
              Zéro biais · Transparence totale · Zéro pression
            </span>
          </div>

          {/* H1 */}
          <h1
            className="mb-4 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Pas le meilleur.&nbsp;&nbsp;
            <span style={{ color: "#FF6B5F" }}>Le tien.</span>
          </h1>

          {/* Ligne secondaire */}
          <p className="mb-3 text-xl font-medium text-white/60">
            Les vendeurs vendent. Troviio trouve.
          </p>

          {/* Sous-titre */}
          <p className="mx-auto max-w-2xl text-base text-white/50">
            Dis-nous comment tu vis, ce que tu veux éviter, ton budget et tes contraintes.
            Troviio croise ta vraie vie avec des milliers d'avis pour te donner une réponse
            claire — pas une liste.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          1.5 GRILLE CATÉGORIES
      ══════════════════════════════════════ */}
      <section className="px-4 pb-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <CategoryGrid
            onSelect={handleCategorySelect}
            selectedSlug={selectedCategory?.slug ?? null}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════
          2. CHAT
      ══════════════════════════════════════ */}
      <section
        id="chat"
        className="mx-auto max-w-2xl px-4 pb-12 sm:px-6"
      >
        {/* ChatHeader conditionnel */}
        {selectedCategory && (
          <ChatHeader
            category={selectedCategory}
            historyLength={history.length}
            onReset={handleReset}
          />
        )}

        {/* Zone messages */}
        <div
          data-chat-scroll
          className="overflow-y-auto rounded-3xl border"
          style={{
            minHeight: "320px",
            maxHeight: "520px",
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex flex-col gap-4 p-4">
            {chat.length === 0 ? (
              /* ── État vide ── */
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <span className="text-4xl">🛍️</span>
                <p className="text-sm font-semibold text-white/60">
                  Choisis une catégorie ci-dessus
                </p>
                <p className="text-xs text-white/30">
                  Troviio t'accompagne étape par étape
                </p>
              </div>
            ) : (
              <>
                {(() => {
                  // Chips uniquement sur le dernier message IA
                  const lastAiIndex = chat.reduce(
                    (lastIdx, msg, idx) => (msg.role === "ai" ? idx : lastIdx),
                    -1
                  );
                  return chat.map((msg, i) => {
                    const isLastAiMessage = i === lastAiIndex && msg.role === "ai";
                    return (
                      <ChatBubble
                        key={i}
                        role={msg.role}
                        text={msg.text}
                        options={isLastAiMessage ? (msg.options ?? []) : []}
                        result_id={msg.result_id ?? null}
                        onSuggestionSelect={msg.role === "ai" ? handleSend : undefined}
                      />
                    );
                  });
                })()}

                {loading && <ThinkingIndicator />}
                <div ref={chatEndRef} />
              </>
            )}
          </div>
        </div>

        {/* ── Input ── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-3 flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={message}
            placeholder="Réponds ou précise ta recherche…"
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-full border px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#3ED6A3]"
            style={{
              background: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex-shrink-0 rounded-full px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
            style={{
              background: loading
                ? "rgba(255,255,255,0.1)"
                : "linear-gradient(135deg, #FF6B5F, #FFB020)",
              boxShadow: loading ? "none" : "0 8px 24px rgba(255,107,95,0.35)",
            }}
          >
            {loading ? "⏳" : "Trouve le mien ✨"}
          </button>
        </form>

        <p className="mt-2 text-center text-xs text-white/30">
          Exemple : "Un aspirateur robot pour 70m² avec un chien, sans y passer mes soirées."
        </p>
      </section>

      {/* ══ Score ring démo ══ */}
      <section className="pb-12 text-center">
        <div className="inline-flex flex-col items-center gap-2">
          <ScoreRing score={94} size={72} />
        </div>
        <p className="mt-4 text-xs text-white/30">
          Gratuit · Sans inscription · Recommandations indépendantes
        </p>
      </section>

      {/* ══════════════════════════════════════
          3. ADN TROVIIO
      ══════════════════════════════════════ */}
      <section
        id="adn"
        className="border-t px-4 py-20 sm:px-6"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="mx-auto max-w-4xl">
          <h2
            className="mb-4 text-center text-3xl font-bold text-white sm:text-4xl"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Troviio ne compare pas des produits.{" "}
            <span style={{ color: "#FF6B5F" }}>Troviio comprend ta vie.</span>
          </h2>
          <p className="mb-12 text-center text-base text-white/50">
            Un bon achat n'est pas universel. Il dépend de ton espace, ton budget, tes
            contraintes et ce que tu refuses de supporter.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "🔍",
                title: "Tes contraintes d'abord",
                text: "Surface, bruit, animaux, enfants, place disponible, budget, usage réel : Troviio commence par ce qui compte chez toi.",
              },
              {
                icon: "📊",
                title: "Des milliers d'avis ensuite",
                text: "Troviio lit les signaux faibles : les défauts qui reviennent, les usages où le produit déçoit, les profils pour qui ça marche vraiment.",
              },
              {
                icon: "✅",
                title: "Une réponse, pas une liste",
                text: "Tu ne viens pas chercher 47 options. Tu viens chercher le choix qui a le plus de chances de marcher chez toi.",
              },
            ].map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border p-6"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div className="mb-3 text-3xl">{b.icon}</div>
                <h3 className="mb-2 text-base font-bold text-white">{b.title}</h3>
                <p className="text-sm text-white/50">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          4. COMMENT TROVIIO TROUVE LE TIEN
      ══════════════════════════════════════ */}
      <section
        className="border-t px-4 py-20 sm:px-6"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="mx-auto max-w-4xl">
          <h2
            className="mb-12 text-center text-3xl font-bold text-white sm:text-4xl"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Comment Troviio trouve le tien
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                n: "1",
                title: "Tu décris ta vraie situation",
                text: "Budget, pièce, usage, contraintes, préférences et irritants.",
              },
              {
                n: "2",
                title: "Troviio lit entre les lignes",
                text: "Troviio croise les avis, les défauts récurrents et les usages réels sur des milliers de produits.",
              },
              {
                n: "3",
                title: "Tu obtiens une recommandation claire",
                text: "Pas une liste infinie. Un choix expliqué, avec les raisons de l'acheter ou de l'éviter.",
              },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #FF6B5F, #FFB020)" }}
                >
                  {step.n}
                </div>
                <h3 className="mb-2 text-base font-bold text-white">{step.title}</h3>
                <p className="text-sm text-white/50">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          5. COMPARATEUR VS COMPARATEURS
      ══════════════════════════════════════ */}
      <section
        className="border-t px-4 py-20 sm:px-6"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="mx-auto max-w-3xl">
          <h2
            className="mb-10 text-center text-3xl font-bold text-white sm:text-4xl"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Les comparateurs notent.{" "}
            <span style={{ color: "#3ED6A3" }}>Troviio choisit avec toi.</span>
          </h2>
          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <div
              className="grid grid-cols-2 border-b text-xs font-bold uppercase tracking-wide"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}
            >
              <div className="px-5 py-3 text-white/40">Un comparateur classique</div>
              <div className="px-5 py-3" style={{ color: "#3ED6A3" }}>Troviio</div>
            </div>
            {[
              ["Classe les produits par score moyen", "Comprend ton contexte et tes contraintes"],
              ["Te laisse arbitrer seul face à 20 options", "Écarte ce qui risque de te décevoir"],
              ["Parle à tout le monde pareil", "Te donne une recommandation adaptée à TA situation"],
              ["Tests labo sans connaître ton logement", "Croise tests experts ET avis d'usage réel"],
              ["Revenus générés par l'affiliation", "Zéro biais, transparence totale"],
            ].map(([left, right], i) => (
              <div
                key={i}
                className="grid grid-cols-2 border-b last:border-0"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="px-5 py-4 text-sm text-white/40">{left}</div>
                <div className="px-5 py-4 text-sm font-medium text-white/80">{right}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          6. TESTIMONIALS
      ══════════════════════════════════════ */}
      <section
        className="border-t px-4 py-20 sm:px-6"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="mx-auto max-w-4xl">
          <h2
            className="mb-10 text-center text-2xl font-bold text-white sm:text-3xl"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Ce que Troviio évite
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                quote: "Je voulais juste un aspirateur robot. Troviio m'a évité celui qui se bloque sous mon canapé.",
                cas: "Cas typique : appartement 50m², meubles bas",
              },
              {
                quote: "Troviio m'a surtout demandé combien de bruit j'acceptais le matin. Pas la machine à café qui me convenait.",
                cas: "Cas typique : cuisine ouverte sur salon",
              },
              {
                quote: "La TV la mieux notée n'était pas la meilleure pour mon salon très lumineux.",
                cas: "Cas typique : pièce très éclairée",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border p-6"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <p className="mb-3 text-sm italic text-white/70">"{t.quote}"</p>
                <p className="text-xs text-white/30">{t.cas}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          7. NEWSLETTER
      ══════════════════════════════════════ */}
      <section
        className="border-t px-4 py-20 sm:px-6"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="mx-auto max-w-xl text-center">
          <h3
            className="mb-2 text-2xl font-bold text-white"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            💌 Rentre chez toi. Troviio s'occupe du choix.
          </h3>
          <p className="mb-6 text-sm text-white/50">
            Chaque semaine, des recommandations pensées pour la vraie vie : petits espaces,
            budgets serrés, animaux, enfants, bruit, entretien, durabilité.
          </p>
          {subscribed ? (
            <p className="text-sm font-semibold text-[#3ED6A3]">✅ Parfait, tu es inscrit !</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="ton@email.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-full border px-4 py-3 text-sm text-white outline-none focus:border-[#3ED6A3] placeholder:text-white/30"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(255,255,255,0.12)",
                }}
              />
              <button
                type="submit"
                className="flex-shrink-0 rounded-full px-5 py-3 text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #4257FF, #3ED6A3)" }}
              >
                Recevoir les bons choix →
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          8. CTA FINAL
      ══════════════════════════════════════ */}
      <section
        className="border-t px-4 py-24 text-center sm:px-6"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <h2
          className="mb-2 text-3xl font-bold text-white sm:text-4xl"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Tu n'as pas besoin du meilleur produit.
        </h2>
        <p className="mb-8 text-base text-white/50">
          Tu as besoin de celui qui va vraiment marcher chez toi.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rounded-full px-8 py-4 text-base font-bold text-white transition hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #FF6B5F, #FFB020)",
              boxShadow: "0 8px 32px rgba(255,107,95,0.35)",
            }}
          >
            Trouve le mien ✨
          </button>
          <a
            href="#adn"
            className="rounded-full border px-8 py-4 text-base font-bold text-white/70 transition hover:text-white"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            Comprendre la méthode →
          </a>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer
        className="border-t px-4 py-10 sm:px-6"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center text-xs text-white/30 sm:flex-row sm:justify-between sm:text-left">
          <p>© 2026 Troviio — Recommandations indépendantes</p>
          <nav className="flex gap-4">
            <a href="/mentions-legales" className="hover:text-white/60 transition-colors">
              Mentions légales
            </a>
            <a href="/politique-confidentialite" className="hover:text-white/60 transition-colors">
              Confidentialité
            </a>
            <a href="/a-propos" className="hover:text-white/60 transition-colors">
              À propos
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
