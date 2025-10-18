import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email & password required" }, { status: 400 });
  }
  await setSession(email);
  return NextResponse.json({ ok: true });
}
