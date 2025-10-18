'use client';

import { useState } from 'react';
import { createClientBrowser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const supabase = createClientBrowser();
  const router = useRouter();
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {mode === 'login' ? 'Log in' : 'Create account'}
        </h2>
        <button
          className="text-sm underline"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Need an account?' : 'Have an account? Log in'}
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          required
        />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="w-full border p-2 rounded disabled:opacity-60" disabled={loading}>
          {loading ? 'Please wait…' : (mode === 'login' ? 'Log in' : 'Register')}
        </button>
      </form>

      <button onClick={logout} className="w-full text-sm underline opacity-70">
        Sign out
      </button>
    </div>
  );
}
