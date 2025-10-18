import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";

const COOKIE = "session";
const SECRET = process.env.JWT_SECRET || "dev_only_change_me";

export type Session = { email: string };

export async function setSession(email: string) {
  const token = jwt.sign({ email } as Session, SECRET, { expiresIn: "7d" });
  const store = await cookies(); // ⬅️ Next.js 15: await cookies()
  store.set({
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const store = await cookies(); // ⬅️
  store.set({ name: COOKIE, value: "", path: "/", maxAge: 0 });
}

export async function getSession(): Promise<Session | null> {
  try {
    const store = await cookies(); // ⬅️
    const token = store.get(COOKIE)?.value;
    if (!token) return null;
    return jwt.verify(token, SECRET) as Session;
  } catch {
    return null;
  }
}
