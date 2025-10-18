import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const COOKIE = "session";
const SECRET = process.env.JWT_SECRET || "dev_only_change_me";

export type Session = { email: string };

export function setSession(email: string) {
  const token = jwt.sign({ email } satisfies Session, SECRET, { expiresIn: "7d" });
  cookies().set({
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSession() {
  cookies().set({ name: COOKIE, value: "", path: "/", maxAge: 0 });
}

export function getSession(): Session | null {
  try {
    const token = cookies().get(COOKIE)?.value;
    if (!token) return null;
    return jwt.verify(token, SECRET) as Session;
  } catch {
    return null;
  }
}
