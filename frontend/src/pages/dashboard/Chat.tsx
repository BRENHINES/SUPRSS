import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  listRooms,
  createRoom,
  listMessages,
  sendMessage,
  type ChatRoom,
  type ChatMessage,
} from "@/services/chat";

const Chat: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [active, setActive] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    (async () => {
      try {
        const rs = await listRooms();
        setRooms(rs);
        setActive(rs[0] ?? null);
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? "Chargement des salons impossible");
      }
    })();
  }, []);

  useEffect(() => {
    if (!active) return;
    let mounted = true;
    (async () => {
      try {
        setErr(null);
        const ms = await listMessages(active.id);
        if (mounted) setMessages(ms);
        setTimeout(scrollToBottom, 50);
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? "Chargement des messages impossible");
      }
    })();

    // petit polling simple (5s)
    const t = setInterval(async () => {
      try {
        const ms = await listMessages(active.id);
        setMessages(ms);
      } catch {}
    }, 5000);

    return () => { mounted = false; clearInterval(t); };
  }, [active?.id]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    try {
      setBusy(true);
      await sendMessage(active.id, text.trim());
      setText("");
      const ms = await listMessages(active.id);
      setMessages(ms);
      setTimeout(scrollToBottom, 50);
    } finally {
      setBusy(false);
    }
  };

  const onCreateRoom = async () => {
    const name = window.prompt("Nom du salon ?");
    if (!name) return;
    const r = await createRoom(name);
    setRooms((prev) => [r, ...prev]);
    setActive(r);
  };

  const header = useMemo(() => (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="text-lg font-semibold">Chat</div>
      <button className="px-3 py-1 rounded-xl border" onClick={onCreateRoom}>+ Nouveau salon</button>
    </div>
  ), []);

  return (
    <div className="max-w-5xl mx-auto border rounded-2xl overflow-hidden">
      {header}
      <div className="grid md:grid-cols-[220px_1fr]">
        {/* Sidebar rooms */}
        <aside className="border-r p-3 space-y-2">
          {rooms.map((r) => (
            <button
              key={r.id}
              onClick={() => setActive(r)}
              className={`block w-full text-left px-3 py-2 rounded-xl border ${
                active?.id === r.id ? "bg-black text-white" : "bg-white"
              }`}
            >
              #{r.name}
            </button>
          ))}
          {rooms.length === 0 && <div className="text-sm text-neutral-600">Aucun salon.</div>}
        </aside>

        {/* Messages */}
        <section className="flex flex-col h-[70vh]">
          <div ref={scroller} className="flex-1 overflow-auto p-4 space-y-3">
            {err && <div className="text-red-600">{err}</div>}
            {messages.map((m) => (
              <div key={m.id} className="rounded-2xl border p-3">
                <div className="text-sm text-neutral-600">
                  <span className="font-medium">{m.author_name}</span>{" "}
                  <span>• {new Date(m.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-1">{m.content}</div>
              </div>
            ))}
            {messages.length === 0 && !err && (
              <div className="text-neutral-600">Aucun message.</div>
            )}
          </div>

          <form onSubmit={onSend} className="border-t p-3 flex gap-2">
            <input
              className="flex-1 border rounded-xl px-3 py-2"
              placeholder={active ? `Message dans #${active.name}` : "Choisis un salon"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!active}
            />
            <button className="px-4 py-2 rounded-xl bg-black text-white" disabled={!active || busy}>
              Envoyer
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Chat;
