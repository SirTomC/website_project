import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const convos = await prisma.conversation.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true }
  });
  return NextResponse.json(convos);
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const convo = await prisma.conversation.create({
    data: { userId: session.userId, title: "New Conversation" },
    select: { id: true, title: true, createdAt: true }
  });
  return NextResponse.json(convo, { status: 201 });
}
