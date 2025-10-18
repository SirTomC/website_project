import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] p-8 gap-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/flower.svg" alt="Logo" width={120} height={24} className="dark:invert mt-3" />
        </div>
        <nav className="flex gap-3">
          <Link href="/login" className="border px-4 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">
            Login
          </Link>
          <Link href="/register" className="border px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black hover:opacity-90">
            Register
          </Link>
        </nav>
      </header>

      <main className="row-start-2 flex flex-col gap-6 items-center justify-center text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome</h1>
        <p className="opacity-70 max-w-prose">
          This is a frontend-only scaffold. Click <b>Login</b> or <b>Register</b> to see the forms.
          We’ll wire them to real auth next.
        </p>
        <div className="flex gap-3">
          <Link href="/login" className="border px-6 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Login</Link>
          <Link href="/register" className="border px-6 py-2 rounded bg-black text-white dark:bg-white dark:text-black hover:opacity-90">Register</Link>
        </div>
      </main>

      <footer className="row-start-3 text-center opacity-60 text-sm">
        © {new Date().getFullYear()} Your App
      </footer>
    </div>
  );
}
