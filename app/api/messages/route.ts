import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json([], { status: 200 });

  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo || convo.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const msgs = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  });
  return NextResponse.json(msgs);
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
    take: 20,
  });

  const contents = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  contents.unshift({
    role: "user",
    parts: [{ text: "You are a helpful assistant. Keep answers concise." }],
  });

  let reply = "(no response)";
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // or "gemini-1.5-pro"
    const result = await model.generateContent({ contents });
    reply = result.response.text().trim() || "(empty response)";
  } catch (err) {
    console.error("Gemini error:", err);
    reply = "Sorry, I couldn't generate a response.";
  }

  await prisma.message.create({
    data: { conversationId, role: "assistant", content: reply },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
