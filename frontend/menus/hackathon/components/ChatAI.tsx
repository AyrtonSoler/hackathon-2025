'use client';
import React, { useEffect, useRef, useState } from 'react';

type Message = { role: 'user' | 'ai'; content: string };

const MAX_HISTORY = 8;

export default function ChatAI() {
  // Estado TIPADO desde el inicio
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: '¡Hola! Soy tu asistente. ¿En qué te ayudo hoy?' } as const,
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    // Fuerza tipos literales y tipa el array resultante
    const nextHistory: Message[] = [
      ...messages,
      { role: 'user' as const, content: text },
    ];

    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: nextHistory.slice(-MAX_HISTORY),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error del modelo');

      const reply = (data.reply as string) ?? 'No recibí respuesta.';
      setMessages((m) => [...m, { role: 'ai', content: reply } as const]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'ai', content: 'Error al comunicarse con la IA. Intenta de nuevo.' } as const,
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="flex w-full flex-col rounded-2xl border p-3">
      {/* Mensajes */}
      <div className="mb-3 flex-1 space-y-2 overflow-y-auto pr-1" style={{ minHeight: 160, maxHeight: 320 }}>
        {messages.map((m, i) => (
          <div key={i} className={`text-sm ${m.role === 'user' ? 'text-right' : ''}`}>
            <span
              className={`inline-block max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 ${
                m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && <div className="text-sm italic text-gray-500">Pensando…</div>}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 rounded-xl border px-3 py-2 focus:outline-none focus:ring"
          placeholder="Escribe un mensaje… (Enter para enviar)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="h-10 rounded-xl bg-blue-600 px-4 text-white disabled:opacity-60"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}