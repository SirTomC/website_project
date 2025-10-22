"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { id: string; role: "user" | "assistant"; content: string; createdAt: string };
type Convo = { id: string; title: string; createdAt: string };

export default function ChatPanel() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  async function fetchConversations() {
    const res = await fetch("/api/conversations", { cache: "no-store", credentials: "same-origin" });
    const data = await res.json().catch(() => []);
    if (Array.isArray(data)) setConvos(data);
    return Array.isArray(data) ? data : [];
  }

  async function fetchMessages(id: string) {
    try {
      const res = await fetch(`/api/messages?conversationId=${encodeURIComponent(id)}`, {
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => null);
      if (Array.isArray(data)) {
        setMessages(data);
        setError(null);
        scrollToBottom();
      } else {
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
        const list = await fetchConversations();
        if (list.length > 0) {
          setConversationId(list[0].id);
          await fetchMessages(list[0].id);
          return;
        }
        const create = await fetch("/api/conversations", { method: "POST", credentials: "same-origin" });
        const c: Convo | null = await create.json().catch(() => null);
        if (c?.id) {
          setConvos([c]);
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
  useEffect(() => {
    if (conversationId) fetchMessages(conversationId);
  }, [conversationId]);

  async function newConversation() {
    setError(null);
    const res = await fetch("/api/conversations", { method: "POST", credentials: "same-origin" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || "Failed to create conversation.");
      return;
    }
    const c: Convo = await res.json();
    setConvos(prev => [c, ...prev]);
    setConversationId(c.id);
    setMessages([]);
  }

  async function send() {
    if (!text.trim() || !conversationId) return;
    const toSend = text;
    setText("");
    setLoading(true);
    setError(null);
    setMessages(prev => [
      ...prev,
      { id: `local-${Date.now()}`, role: "user", content: toSend, createdAt: new Date().toISOString() },
    ]);
    scrollToBottom();
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ conversationId, content: toSend }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to send message.");
      }
      await fetchMessages(conversationId);
    } catch (e: any) {
      setError(e?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
      <aside className="border rounded-2xl p-3 h-[70vh] md:h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Conversations</h2>
          <button
            onClick={newConversation}
            className="text-xs border rounded px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
          >
            New Chat
          </button>
        </div>
        {convos.length === 0 ? (
          <p className="text-sm opacity-60">No chats yet.</p>
        ) : (
          <ul className="space-y-1">
            {convos.map(c => (
              <li key={c.id}>
                <button
                  onClick={() => setConversationId(c.id)}
                  className={`w-full text-left px-3 py-2 rounded border hover:bg-black/5 dark:hover:bg-white/10 ${
                    c.id === conversationId ? "bg-black/5 dark:bg-white/10" : ""
                  }`}
                >
                  <div className="text-sm font-medium truncate">{c.title || "Conversation"}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <section className="border rounded-2xl p-4 flex flex-col h-[70vh] md:h-[80vh]">
        {error && (
          <div className="mb-2 text-sm text-red-600 border border-red-300 bg-red-50 rounded p-2">{error}</div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {messages.length === 0 ? (
            <p className="opacity-60 text-center mt-10">Say Something :D</p>
          ) : (
            <>
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded px-3 py-2 border ${
                        isUser ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent"
                      }`}
                    >
                      <div className="text-[11px] opacity-60 mb-0.5">{m.role}</div>
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          <div ref={endRef} />
        </div>

        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 border rounded p-2"
            placeholder={conversationId ? "Type a message…" : "Create or select a conversation…"}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => (e.key === "Enter" ? send() : null)}
            disabled={!conversationId}
          />
          <button
            className="border rounded px-4 disabled:opacity-50"
            onClick={send}
            disabled={loading || !conversationId || !text.trim()}
          >
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
      </section>
    </div>
  );
}
