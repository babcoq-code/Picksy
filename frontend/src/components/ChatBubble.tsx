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
  result_id?: string | null;
  onSuggestionSelect?: (value: string) => void | Promise<void>;
};

const ChatBubble = memo(function ChatBubble({
  role,
  text,
  result_id,
  onSuggestionSelect,
}: ChatBubbleProps) {
  const isUser = role === "user";
  const isAI = role === "ai";

  // Si l'IA retourne un result_id → afficher le composant de redirection
  if (isAI && result_id) {
    return <ResultRedirectMessage result_id={result_id} />;
  }

  const parsed = useMemo(() => {
    if (!isAI) return { cleanText: text, options: [] };
    return parseAIOptions(text);
  }, [isAI, text]);

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
              : "rounded-bl-lg border border-white/8 bg-surface-light text-white/90",
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
        {isAI && parsed.options.length > 0 && onSuggestionSelect && (
          <SuggestionChips
            options={parsed.options}
            onSelect={onSuggestionSelect}
          />
        )}
      </div>
    </article>
  );
});

export default ChatBubble;
