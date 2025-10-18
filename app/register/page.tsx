"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }
    // Frontend-only for now:
    console.log("REGISTER submit", { email, password });
    alert(`Register pressed for ${email} (no backend yet)`);
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded-2xl p-6">
        <h1 className="text-xl font-semibold">Create account</h1>
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
        <input
          className="w-full border rounded p-2"
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={e=>setConfirm(e.target.value)}
          required
        />
        <button className="w-full border rounded p-2 bg-black text-white dark:bg-white dark:text-black">
          Register
        </button>
        <p className="text-sm opacity-70">
          Already have an account? <Link className="underline" href="/login">Log in</Link>
        </p>
        <Link className="text-sm underline opacity-70" href="/">← Back home</Link>
      </form>
    </div>
  );
}
