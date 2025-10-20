"use client";

import { useEffect, useState } from "react";

type Msg = { id: string; role: "user" | "assistant"; content: string; createdAt: string };
type Convo = { id: string; title: string; createdAt: string };

export default function ChatPanel() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await fetch("/api/conversations", { cache: "no-store" });
      if (list.ok) {
        const convos: Convo[] = await list.json();
        if (convos.length > 0) { setConversationId(convos[0].id); return; }
      }
      const create = await fetch("/api/conversations", { method: "POST" });
      if (create.ok) {
        const c: Convo = await create.json();
        setConversationId(c.id);
      }
    })();
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    (async () => {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`, { cache: "no-store" });
      if (res.ok) setMessages(await res.json());
    })();
  }, [conversationId]);

  async function send() {
    if (!text.trim() || !conversationId) return;
    setLoading(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, content: text }),
    });
    setText("");
    const res = await fetch(`/api/messages?conversationId=${conversationId}`, { cache: "no-store" });
    if (res.ok) setMessages(await res.json());
    setLoading(false);
  }

  return (
    <div className="w-full max-w-2xl mx-auto border rounded-2xl p-4 space-y-3 text-left">
      <div className="h-[50vh] overflow-y-auto space-y-2">
        {messages.map(m => (
          <div key={m.id} className={m.role === "user" ? "text-right" : ""}>
            <div className="inline-block rounded px-3 py-2 border">
              <div className="text-xs opacity-60">{m.role}</div>
              <div>{m.content}</div>
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="opacity-60 text-center">Start the conversation…</p>}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          placeholder="Type a message…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => (e.key === "Enter" ? send() : null)}
        />
        <button className="border rounded px-4 disabled:opacity-50" onClick={send} disabled={loading || !conversationId}>
          {loading ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
