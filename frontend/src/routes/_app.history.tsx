import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, MessageSquare, Mic, ScanText } from "lucide-react";
import { Chip, GlassCard, PageHeader } from "@/components/ui-bits";
import { getHistory } from "@/lib/api";

export const Route = createFileRoute("/_app/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "History — Lensread AI" }] }),
});

const ICONS = { chat: MessageSquare, voice: Mic, ocr: ScanText } as const;

function HistoryPage() {
  const [q, setQ] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory().then((data) => {
      setHistory(data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filtered = history.filter(
    (h) => h.title.toLowerCase().includes(q.toLowerCase()) || h.excerpt.toLowerCase().includes(q.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="History"
        title="Conversations & sessions"
        description="Everything you've created — chats, voice sessions, OCR jobs."
      />

      <GlassCard className="mb-6 p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations…"
            className="w-full bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none"
          />
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((h) => {
          const Icon = ICONS[h.type as keyof typeof ICONS] || MessageSquare;
          const date = new Date(h.time).toLocaleDateString(undefined, {
             month: 'short',
             day: 'numeric',
             hour: '2-digit',
             minute: '2-digit'
          });

          return (
            <GlassCard key={h.id} className="cursor-pointer p-5 transition hover:border-primary/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <Chip tone={h.type === 'ocr' ? 'success' : 'info'}>{h.tag}</Chip>
              </div>
              <h3 className="mt-3 text-sm font-semibold">{h.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{h.excerpt}</p>
              <p className="mt-3 text-xs text-muted-foreground">{date}</p>
            </GlassCard>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-3xl">
             <p className="text-sm text-muted-foreground">No history items found.</p>
          </div>
        )}
      </div>
    </>
  );
}
