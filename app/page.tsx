import { cookies } from "next/headers";

export default async function ChatPage() {
  const session = cookies().get("session")?.value;
  const res = await fetch(`${process.env.API_BASE}/messages`, { cache: "no-store", headers: { cookie: `session=${session}` }});
  const messages = await res.json();

  return (
    <main>
      <h1>My Chat</h1>
      <ul>{messages.map((m: any) => <li key={m.id}>{m.content}</li>)}</ul>
      {/* Client-side input lives in a client component */}
    </main>
  );
}
