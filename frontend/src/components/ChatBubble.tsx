"use client";

import { memo, useMemo } from "react";
import { parseAIOptions } from "@/lib/chat/parse-ai-options";
import { renderMarkdown } from "@/lib/chat/render-markdown";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { ResultRedirectMessage } from "@/components/chat/ResultRedirectMessage";

export type ChatMessageRole = "user" | "ai";

export type ChatMessage = {
  role: ChatMessageRole;
  text: string;
  result_id?: string | null;
};

type ChatBubbleProps = {
  role: ChatMessageRole;
  text: string;
  options?: string[];
  result_id?: string | null;
  isLoading?: boolean;
  isLastAiMessage?: boolean;
  onSuggestionSelect?: (value: string) => void | Promise<void>;
};

const ChatBubble = memo(function ChatBubble({
  role,
  text,
  options: externalOptions,
  result_id,
  isLoading,
  isLastAiMessage,
  onSuggestionSelect,
}: ChatBubbleProps) {
  const isUser = role === "user";
  const isAI = role === "ai";

  // Si l'IA retourne un result_id → afficher le texte + le composant de redirection
  const showRedirect = isAI && result_id;

  const parsed = useMemo(() => {
    if (!isAI) return { cleanText: text, options: [] };
    // Les options externes (passées depuis page.tsx) prennent le pas sur le parsing
    if (externalOptions && externalOptions.length > 0) {
      return { cleanText: text, options: externalOptions };
    }
    return parseAIOptions(text);
  }, [isAI, text, externalOptions]);

  const html = useMemo(() => {
    return renderMarkdown(parsed.cleanText);
  }, [parsed.cleanText]);

  return (
    <article
      className={["flex w-full animate-fade-in", isUser ? "justify-end" : "justify-start"].join(" ")}
    >
      <div className={["max-w-[88%] sm:max-w-[75%]", isUser ? "items-end" : "items-start"].join(" ")}>
        {/* Bulle principale */}
        <div
          className={[
            "rounded-3xl px-5 py-4 text-[15px] leading-relaxed",
            isUser
              ? "rounded-br-lg text-white"
              : "rounded-bl-lg border border-white/10 bg-[rgba(255,255,255,0.08)] text-white",
          ].join(" ")}
          style={
            isUser
              ? {
                  background: "linear-gradient(135deg, #4257FF, #8C98FF)",
                  boxShadow: "0 4px 20px rgba(66,87,255,0.25)",
                }
              : {}
          }
        >
          {html ? (
            <div
              className="picksy-ai-markdown"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <span>{text}</span>
          )}
        </div>

        {/* Chips cliquables sous les bulles IA */}
        {isAI && parsed.options.length > 0 && onSuggestionSelect && !result_id && (
          <SuggestionChips
            options={parsed.options}
            onSelect={onSuggestionSelect}
          />
        )}

        {/* ResultRedirectMessage visible sous le texte, pas à la place */}
        {showRedirect && result_id && (
          <div className="mt-2 w-full">
            <ResultRedirectMessage result_id={result_id} />
          </div>
        )}
      </div>
    </article>
  );
});

export default ChatBubble;
