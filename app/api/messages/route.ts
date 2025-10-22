import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json([], { status: 200 });

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) return NextResponse.json([], { status: 200 });

    const convo = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: session.userId },
      select: { id: true },
    });
    if (!convo) return NextResponse.json([], { status: 200 });

    const msgs = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      select: { id: true, role: true, content: true, createdAt: true },
    });
    return NextResponse.json(msgs);
  } catch (e) {
    console.error("GET /api/messages error:", e);
    return NextResponse.json([], { status: 200 });
  }
}
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId, content } = await req.json().catch(() => ({} as any));
  if (!conversationId || !content) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo || convo.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.message.create({
    data: { conversationId, role: "user", content: String(content) },
  });

const history = await prisma.message.findMany({
  where: { conversationId },
  orderBy: { createdAt: "asc" },
  select: { role: true, content: true },
  take: 12,
});

// types to keep Next build happy
type HistoryRow = { role: string; content: string };
type GeminiContent = { role: "user" | "model"; parts: { text: string }[] };

const toGeminiRole = (r: string): "user" | "model" =>
  r === "assistant" ? "model" : "user";

const contents: GeminiContent[] = [
  {
    role: "user",
    parts: [
      {
        text:
          "You are a helpful assistant that is very anxious about every answer you give and dont know if its the right answer. Keep words limited to 20.",
      },
    ],
  },
  ...history.map((m: HistoryRow) => ({
    role: toGeminiRole(m.role),
    parts: [{ text: m.content }],
  })),
  { role: "user", parts: [{ text: String(content) }] },
];

  let reply = "Sorry, I couldn't generate a response.";
  try {
    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GEMINI_API;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY/GEMINI_API");

    const modelId = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
        signal: controller.signal,
      });
      const j = await r.json();
      if (r.ok) {
        reply = j.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || reply;
      } else {
        console.error("Gemini REST error", r.status, j);
      }
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    console.error("Gemini fatal error:", err);
  }

  await prisma.message.create({
    data: { conversationId, role: "assistant", content: reply },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
