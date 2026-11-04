"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Send,
  Headphones,
  Search,
  ClipboardList,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
  Paperclip,
  FileText,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Message = {
  from: "user" | "bot";
  text: string;
  fileUrl?: string;
  fileName?: string;
};

type ChatMessageRow = {
  id: number;
  session_id: string;
  sender: "customer" | "ai" | "agent";
  message: string;
  created_at: string;
};

const CATEGORIES = [
  { label: "Informasi Produk & Estimasi", icon: Search, color: "bg-teal-600" },
  { label: "Ubah Data atau Kendala Pesanan", icon: ClipboardList, color: "bg-indigo-600" },
  { label: "Laporan Masalah Pengiriman & Barang Rusak", icon: AlertTriangle, color: "bg-red-500" },
];

const MAX_FILE_MB = 5;
const ACCEPTED = /^image\/(png|jpe?g|webp)$|^application\/pdf$/;
const POLL_MS = 3000;

export function ChatWidget() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"category" | "chat">("category");
  const [category, setCategory] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, stage]);

  // Tutup panel chat dengan Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Sinkronisasi riwayat pesan dari database Supabase (chat_messages)
  const syncMessagesFromDb = useCallback(async () => {
    if (!sessionId) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .select("id, sender, message, created_at")
      .eq("session_id", sessionId)
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) return;

    setMessages(
      (data as ChatMessageRow[]).map((item) => ({
        from: item.sender === "customer" ? ("user" as const) : ("bot" as const),
        text: item.message,
      }))
    );
  }, [sessionId]);

  // Realtime Supabase + Polling cadangan agar balasan CS/AI muncul seketika
  useEffect(() => {
    if (!open || !sessionId || stage !== "chat") return;

    syncMessagesFromDb();

    const channel = supabase
      .channel(`chat-realtime-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          syncMessagesFromDb();
        }
      )
      .subscribe();

    const interval = setInterval(syncMessagesFromDb, POLL_MS);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [open, sessionId, stage, syncMessagesFromDb]);

  if (pathname === "/login" || pathname === "/register") return null;

  const pickCategory = async (cat: string) => {
    const newSessionId = crypto.randomUUID();
    setCategory(cat);
    setSessionId(newSessionId);

    // Daftarkan sesi awal ke chat_handover dengan status 'ai'
    await supabase.from("chat_handover").upsert(
      { session_id: newSessionId, handled_by: "ai", updated_at: new Date().toISOString() },
      { onConflict: "session_id" }
    );

    setMessages([
      {
        from: "bot",
        text: `Baik, kamu memilih "${cat}". Ceritakan kendala atau pertanyaanmu, ya.`,
      },
    ]);
    setStage("chat");
  };

  const backToCategories = () => {
    setStage("category");
    setCategory(null);
    setSessionId("");
    setMessages([]);
    setFile(null);
    setFileError("");
  };

  const chooseFile = (f: File | null) => {
    setFileError("");
    if (!f) return;
    if (!ACCEPTED.test(f.type)) {
      setFileError("Format harus PNG, JPG, atau PDF.");
      return;
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`Ukuran maksimal ${MAX_FILE_MB} MB.`);
      return;
    }
    setFile(f);
  };

  const send = async () => {
    const text = input.trim();
    if ((!text && !file) || loading || !sessionId) return;

    const objectUrl = file ? URL.createObjectURL(file) : undefined;
    const userMsgText = text || "(mengirim lampiran)";

    // Tampilkan pesan pelanggan langsung di UI lokal
    setMessages((prev) => [
      ...prev,
      {
        from: "user",
        text: userMsgText,
        fileUrl: objectUrl,
        fileName: file?.name,
      },
    ]);

    setInput("");
    setLoading(true);
    const sendingFile = file;
    setFile(null);

    try {
      // 1. Simpan pesan pelanggan ke chat_messages
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        sender: "customer",
        message: userMsgText,
      });

      // 2. Simpan/update antrean di customer_chats agar muncul di dashboard CS
      await supabase.from("customer_chats").insert({
        session_id: sessionId,
        customer_name: "Pelanggan Toko",
        category: category ?? "Umum",
        question: userMsgText,
      });

      // 3. Panggil Webhook n8n (n8n akan cek node 'Get Handover Status' -> jika 'ai', AI akan menjawab)
      if (process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL) {
        let res: Response;

        if (sendingFile) {
          const fd = new FormData();
          fd.append("kategori", category ?? "");
          fd.append("chat_input", text);
          fd.append("session_id", sessionId);
          fd.append("file", sendingFile);
          res = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
            method: "POST",
            body: fd,
          });
        } else {
          res = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kategori: category,
              chat_input: text,
              session_id: sessionId,
            }),
          });
        }

        // Karena n8n memiliki node "Insert AI Message", balasan AI akan tersimpan di database
        // dan otomatis ter-render lewat syncMessagesFromDb / Realtime.
        if (res.ok) {
          await syncMessagesFromDb();
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: `Gagal mengirim pesan: ${(err as Error).message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka chat"
          className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-[#1D2B4D] text-[#FFD11A] shadow-lg transition hover:bg-[#25395F]"
        >
          <MessageSquare className="size-6" />
        </button>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="fixed bottom-5 right-5 z-50 flex w-[92vw] max-w-[340px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-2.5 bg-[#1D2B4D] px-4 py-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#FFD11A]">
                <Headphones className="size-4 text-[#1D2B4D]" />
              </span>
              <div className="leading-tight">
                <p className="text-[13px] font-bold text-white">Frontline AI</p>
                <p className="text-[10px] text-white/60">Customer Service Assistant</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium text-white">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-1.5 py-1 text-[10px] font-medium text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* STAGE 1: Pilih Kategori */}
            {stage === "category" ? (
              <>
                <div className="space-y-2 px-3 py-3">
                  <div className="rounded-xl bg-slate-100 px-3 py-2.5">
                    <p className="text-xs font-bold text-slate-900">Halo, saya Frontline AI 👋</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                      Mau konsultasi apa hari ini? Pilih kategori kendala kamu:
                    </p>
                  </div>

                  {CATEGORIES.map(({ label, icon: Icon, color }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => pickCategory(label)}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 text-left shadow-sm transition hover:border-[#1D2B4D]/30 hover:shadow"
                    >
                      <span className={`grid size-8 shrink-0 place-items-center rounded-full text-white ${color}`}>
                        <Icon className="size-4" />
                      </span>
                      <span className="flex-1 text-[11px] font-bold leading-snug text-slate-900">
                        {label}
                      </span>
                      <ChevronRight className="size-3.5 shrink-0 text-slate-300" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 px-4 pb-3">
                  <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <p className="text-[10px] text-slate-500">
                    Tim CS &amp; AI aktif — balas dalam ±1 menit
                  </p>
                </div>
              </>
            ) : (
              /* STAGE 2: Chat Percakapan */
              <div className="flex h-[400px] flex-col">
                <div
                  ref={scrollRef}
                  className="flex-1 space-y-2.5 overflow-y-auto bg-slate-50 px-3 py-3"
                >
                  <button
                    type="button"
                    onClick={backToCategories}
                    className="flex items-center gap-1 text-[10px] font-medium text-slate-400 transition hover:text-[#1D2B4D]"
                  >
                    <RotateCcw className="size-3" /> Percakapan baru
                  </button>

                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        m.from === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-snug ${
                          m.from === "user"
                            ? "rounded-br-sm bg-[#1D2B4D] text-white"
                            : "rounded-bl-sm bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
                        }`}
                      >
                        {m.fileUrl && m.fileName && /\.(png|jpe?g|webp)$/i.test(m.fileName) && (
                          <img
                            src={m.fileUrl}
                            alt={m.fileName}
                            className="mb-1.5 max-h-32 w-full rounded-lg object-cover"
                          />
                        )}
                        {m.fileUrl && m.fileName && !/\.(png|jpe?g|webp)$/i.test(m.fileName) && (
                          <span className="mb-1.5 flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1 text-[10px]">
                            <FileText className="size-3" /> {m.fileName}
                          </span>
                        )}
                        {m.text}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-xl rounded-bl-sm bg-white px-3 py-2 text-[10px] text-slate-400 shadow-sm ring-1 ring-slate-200">
                        Mengetik…
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Lampiran File */}
                {file && (
                  <div className="flex items-center gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2">
                    <FileText className="size-3.5 shrink-0 text-slate-400" />
                    <span className="flex-1 truncate text-[10px] text-slate-600">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="grid size-5 place-items-center rounded hover:bg-slate-200"
                    >
                      <X className="size-3 text-slate-400" />
                    </button>
                  </div>
                )}

                {fileError && (
                  <p className="border-t border-slate-200 px-3 pt-1.5 text-[10px] text-red-500">
                    {fileError}
                  </p>
                )}

                {/* Bar Input Pesan */}
                <div className="border-t border-slate-200 bg-white px-2.5 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#1D2B4D] hover:text-[#1D2B4D]"
                      aria-label="Lampirkan foto atau file"
                    >
                      <Paperclip className="size-3.5" />
                    </button>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") send();
                      }}
                      placeholder="Tulis pesan…"
                      className="h-9 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[11px] outline-none focus:border-[#1D2B4D]"
                    />
                    <button
                      type="button"
                      onClick={send}
                      disabled={loading || (!input.trim() && !file)}
                      className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#1D2B4D] text-[#FFD11A] transition hover:bg-[#25395F] disabled:opacity-40"
                      aria-label="Kirim"
                    >
                      <Send className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}