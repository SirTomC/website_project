"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  setErr(null);
  setLoading(true);
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Login failed");
    }
    router.push("/");
    router.refresh();
  } catch (err: any) {
    setErr(err.message);
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded-2xl p-6">
        <h1 className="text-xl font-semibold">Log in</h1>
        <input
          className="w-full border rounded p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button
          className="w-full border rounded p-2 bg-black text-white dark:bg-white dark:text-black disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
        <p className="text-sm opacity-70">
          No account? <Link className="underline" href="/register">Register</Link>
        </p>
        <Link className="text-sm underline opacity-70" href="/">← Back home</Link>
      </form>
    </div>
  );
}
