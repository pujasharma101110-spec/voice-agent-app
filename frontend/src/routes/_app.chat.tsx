import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Paperclip, SendHorizonal, Sparkles, FileText, Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import { Chip, GlassCard } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { chatWithAI, getSessionHistory, getKnowledgeBase } from "@/lib/api";

export const Route = createFileRoute("/_app/chat")({
  component: ChatPage,
  head: () => ({ meta: [{ title: "AI Chat — Lensread AI" }] }),
});

type Msg = { role: "user" | "ai"; text: string; streaming?: boolean };

const SUGGESTIONS = [
  "Summarize my uploaded documents",
  "What information is in my files?",
  "Extract key points from my documents",
  "How can you help me today?",
];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "";
    const saved = localStorage.getItem("chat_session_id");
    if (saved) return saved;
    const fresh = `session_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem("chat_session_id", fresh);
    return fresh;
  });
  
  const [docs, setDocs] = useState<any[]>([]);
  const [activeDocId, setActiveDocId] = useState(() => 
    typeof window !== "undefined" ? (localStorage.getItem("active_doc_id") || "") : ""
  );
  
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getKnowledgeBase().then(setDocs).catch(console.error);
    getSessionHistory(sessionId).then(hist => {
      if (hist && hist.length > 0) {
        setMessages(hist);
      } else {
        setMessages([{
          role: "ai",
          text: "Hi! I'm your document AI assistant. Ask me anything about your uploaded files.",
        }]);
      }
    }).catch(() => {
      setMessages([{
        role: "ai",
        text: "Hi! I'm your document AI assistant. Ask me anything about your uploaded files.",
      }]);
    });
  }, [sessionId]);

  useEffect(() => {
    if (activeDocId) localStorage.setItem("active_doc_id", activeDocId);
    else localStorage.removeItem("active_doc_id");
  }, [activeDocId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text: t }, { role: "ai", text: "", streaming: true }]);

    try {
      const history = messages.map(m => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text
      }));
      const data = await chatWithAI(t, sessionId, history);
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "ai", text: data.response, streaming: false };
        return copy;
      });
    } catch (error) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "ai", text: "Error connecting to AI.", streaming: false };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid h-[calc(100vh-7rem)] gap-6 lg:grid-cols-[1fr_320px]">
      <GlassCard className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Document AI</p>
              <p className="text-xs text-muted-foreground">Persistent Session</p>
            </div>
          </div>
          <Chip tone="success">● Ready</Chip>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}
            >
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", m.role === "ai" ? "bg-gradient-brand text-white" : "bg-muted text-foreground")}>
                {m.role === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className={cn("max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed", m.role === "ai" ? "border border-border bg-card/60" : "bg-gradient-brand text-white shadow-glow")}>
                <p className="whitespace-pre-wrap">{m.text || (m.streaming ? "…" : "")}</p>
              </div>
            </motion.div>
          ))}
          <div ref={endRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-border p-3">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card/60 p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask about your documents..."
              rows={1}
              className="flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
            />
            <button type="submit" disabled={busy || !input.trim()} className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow disabled:opacity-50">
              <SendHorizonal className="h-4 w-4" />
            </button>
          </div>
        </form>
      </GlassCard>

      <div className="hidden lg:block">
        <GlassCard className="p-5">
          <h3 className="mb-3 text-sm font-semibold">Context</h3>
          <div className="space-y-3">
             <div className="flex flex-col gap-1.5">
               <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Active Document</label>
               <select 
                 value={activeDocId}
                 onChange={(e) => setActiveDocId(e.target.value)}
                 className="w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-xs outline-none focus:border-primary/60"
               >
                 <option value="">All indexed documents</option>
                 {docs.map(d => (
                   <option key={d.id} value={d.id}>{d.filename}</option>
                 ))}
               </select>
             </div>
             {activeDocId && (
               <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                 <div className="flex items-center gap-2 text-primary">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-medium">Focused Context</span>
                 </div>
               </div>
             )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
