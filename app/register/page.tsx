"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password !== confirm) return setErr("Passwords do not match.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Registration failed");
      }
      router.push("/"); // auto-logged-in
      router.refresh();
    } catch (e:any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded-2xl p-6">
        <h1 className="text-xl font-semibold">Create account</h1>
        <input className="w-full border rounded p-2" type="email" placeholder="Email"
               value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border rounded p-2" type="password" placeholder="Password"
               value={password} onChange={e=>setPassword(e.target.value)} required />
        <input className="w-full border rounded p-2" type="password" placeholder="Confirm password"
               value={confirm} onChange={e=>setConfirm(e.target.value)} required />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="w-full border rounded p-2 bg-black text-white dark:bg-white dark:text-black disabled:opacity-60" disabled={loading}>
          {loading ? "Creating…" : "Register"}
        </button>
        <p className="text-sm opacity-70">
          Already have an account? <Link className="underline" href="/login">Log in</Link>
        </p>
        <Link className="text-sm underline opacity-70" href="/">← Back home</Link>
      </form>
    </div>
  );
}
