import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const key = process.env.GEMINI_API_KEY ?? process.env.GEMINI_API;
  if (!key) return NextResponse.json({ ok:false, error:"Missing GEMINI_API_KEY/GEMINI_API" }, { status: 500 });

  const modelId = "gemini-2.0-flash"; // <-- from your /api/gemini-models list
  const url = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${key}`;
  const body = { contents: [{ role: "user", parts: [{ text: "Reply with the word: pong" }] }] };

  const r = await fetch(url, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) return NextResponse.json({ ok:false, status:r.status, j }, { status: 500 });

  const text = j.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return NextResponse.json({ ok:true, model: modelId, text });
}
