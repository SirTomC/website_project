import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import ChatPanel from "./comp/chat";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] p-8 gap-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/flower.svg" alt="Logo" width={120} height={24} className="dark:invert mt-3" />
        </div>

        <nav className="flex items-center gap-3 text-sm">
          {session ? (
            <>
              <span className="opacity-70">Signed in as <b>{session.email}</b></span>
              <form action="/api/auth/logout" method="post">
                <button className="border px-4 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="border px-4 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Login</Link>
              <Link href="/register" className="border px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black hover:opacity-90">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main className="row-start-2 flex flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">WELLLLLLCOMMEEEE</h1>
        {!session ? (
          <p className="opacity-70 max-w-prose"><b>Login</b> or <b>Register</b> to start chatting with AI Assitant.</p>
        ) : (
          <>
            <p className="opacity-70"> Start Chatting With AI Assistant</p>
            <ChatPanel />
          </>
        )}
      </main>
    </div>
  );
}
