'use client';

import { useRef, useState } from 'react';
import { AccessoriesChatMessage } from '@/lib/types/accessories';

export function AccessoriesChat({ productId, productName }: {
  productId?: string; productName?: string;
}) {
  const [messages, setMessages] = useState<AccessoriesChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: `Je vous aide à choisir ${productName ? `les meilleurs accessoires pour ${productName}` : 'vos accessoires'}. Que cherchez-vous ?` },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const userMsg: AccessoriesChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const assistantId = crypto.randomUUID();
    const assistantMsg: AccessoriesChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch('/api/accessories/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: userMsg.content,
          productId,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Erreur');
      const reader = res.body?.getReader();
      if (!reader) throw new Error('Pas de reader');

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readDone } = await reader.read();
        done = readDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: m.content || 'Désolé, une erreur est survenue. Réessayez.' }
            : m
        )
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  return (
    <section className="mt-12 rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-black text-stone-950">💬 Un conseil personnalisé ?</h2>
        <p className="mt-2 text-stone-600">
          Demandez à Troviio quel accessoire correspond à votre besoin.
        </p>
      </div>

      <div className="max-h-80 space-y-4 overflow-y-auto px-6 pb-4 md:px-8">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-3xl px-5 py-3 text-sm leading-6 ${
                msg.role === 'user'
                  ? 'bg-stone-950 text-white'
                  : 'bg-stone-100 text-stone-950'
              }`}
            >
              {msg.content || (msg.role === 'assistant' && streaming ? '...' : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-stone-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question…"
            disabled={streaming}
            className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-3 text-sm text-stone-950 placeholder-stone-400 outline-none transition focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10 disabled:opacity-50"
          />
          {streaming ? (
            <button type="button" onClick={handleCancel}
              className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700">
              ✕
            </button>
          ) : (
            <button type="submit" disabled={!input.trim()}
              className="inline-flex items-center justify-center rounded-2xl bg-stone-950 px-5 py-3 text-sm font-black text-white transition hover:bg-stone-800 disabled:opacity-50">
              Envoyer
            </button>
          )}
        </form>
      </div>
    </section>
  );
}
