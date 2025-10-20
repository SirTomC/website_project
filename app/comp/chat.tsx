"use client";

import { useEffect, useState } from "react";

type Msg = { id: string; role: "user" | "assistant"; content: string; createdAt: string };
type Convo = { id: string; title: string; createdAt: string };

export default function ChatPanel() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

async function fetchMessages(id: string) {
  try {
    const res = await fetch(`/api/messages?conversationId=${encodeURIComponent(id)}`, {
      cache: "no-store",
      credentials: "same-origin",   // ensure auth cookie is sent
    });
    const data = await res.json().catch(() => null);
    if (Array.isArray(data)) {
      setMessages(data);
      setError(null);
    } else {
      console.warn("Unexpected GET /api/messages payload:", data);
      setMessages([]);
      setError("Unexpected response from server.");
    }
  } catch (e: any) {
    setMessages([]);
    setError(e?.message || "Failed to load messages.");
  }
}

  useEffect(() => {
    (async () => {
      try {
        const list = await fetch("/api/conversations", { cache: "no-store" });
        const convos: any = await list.json().catch(() => null);
        if (Array.isArray(convos) && convos.length > 0) {
          setConversationId(convos[0].id);
          await fetchMessages(convos[0].id);
          return;
        }
        const create = await fetch("/api/conversations", { method: "POST" });
        const c: any = await create.json().catch(() => null);
        if (c?.id) {
          setConversationId(c.id);
          await fetchMessages(c.id);
        } else {
          setError("Could not create conversation.");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to initialize chat.");
      }
    })();
  }, []);

  async function send() {
    if (!text.trim() || !conversationId) return;
    setLoading(true);
    setError(null);
    const body = { conversationId, content: text };
    setText("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await fetchMessages(conversationId);
    } catch (e: any) {
      setError(e?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto border rounded-2xl p-4 space-y-3 text-left">
      {error && (
        <div className="text-sm text-red-600 border border-red-300 bg-red-50 rounded p-2">
          {error}
        </div>
      )}

      <div className="h-[50vh] overflow-y-auto space-y-2">
        {messages.length > 0 ? (
          messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "text-right" : ""}>
              <div className="inline-block rounded px-3 py-2 border">
                <div className="text-xs opacity-60">{m.role}</div>
                <div>{m.content}</div>
              </div>
            </div>
          ))
        ) : (
          <p className="opacity-60 text-center">Start the conversation…</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
        />
        <button
          className="border rounded px-4 disabled:opacity-50"
          onClick={send}
          disabled={loading || !conversationId}
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
