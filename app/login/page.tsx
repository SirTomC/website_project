"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Frontend-only for now:
    console.log("LOGIN submit", { email, password });
    alert(`Login pressed for ${email} (no backend yet)`);
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
          onChange={e=>setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          required
        />
        <button className="w-full border rounded p-2 bg-black text-white dark:bg-white dark:text-black">
          Log in
        </button>
        <p className="text-sm opacity-70">
          No account? <Link className="underline" href="/register">Register</Link>
        </p>
        <Link className="text-sm underline opacity-70" href="/">← Back home</Link>
      </form>
    </div>
  );
}
