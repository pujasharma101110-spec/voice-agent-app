import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  FileText,
  MessageSquare,
  Mic,
  ScanText,
  Sparkles,
  TrendingUp,
  Upload as UploadIcon,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { Chip, GlassCard, GradientButton, PageHeader } from "@/components/ui-bits";
import { useEffect, useState } from "react";
import { listDocuments, getHistory } from "@/lib/api";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Dashboard — Lensread AI" }],
  }),
});

function Sparkline({ data }: { data: number[] }) {
  const w = 220;
  const h = 64;
  const max = Math.max(...data);
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 6) - 3}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <defs>
        <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--gradient-start)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--gradient-end)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sl" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="var(--gradient-start)" />
          <stop offset="100%" stopColor="var(--gradient-end)" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="url(#sl)" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#sg)" />
    </svg>
  );
}


function Dashboard() {
  const [docCount, setDocCount] = useState("0");
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([listDocuments(), getHistory()]).then(([docs, history]) => {
      setDocCount(docs.length.toString());
      setRecentDocs(docs.slice(0, 5));
      setActivity(history.slice(0, 5));
      setIsLoading(false);
    });
  }, []);

  const stats = [
    { label: "Documents", value: docCount, delta: "Live", icon: FileText },
    { label: "OCR status", value: docCount !== "0" ? "Active" : "Idle", delta: "Real-time", icon: ScanText },
    { label: "AI engine", value: "Groq", delta: "Connected", icon: Zap },
    { label: "Voice engine", value: "Whisper", delta: "Ready", icon: Mic },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Workspace overview"
        title="Welcome back"
        description="Your AI voice assistant is ready to process your documents and answer questions."
        actions={
          <>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm font-medium hover:border-primary/40"
            >
              <UploadIcon className="h-4 w-4" /> Upload
            </Link>
            <Link to="/chat">
              <GradientButton>
                <Sparkles className="h-4 w-4" /> Ask AI
              </GradientButton>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </span>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight">{s.value}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                <TrendingUp className="h-3 w-3" /> {s.delta}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Recent Activity</h3>
              <p className="text-xs text-muted-foreground">Your latest interactions</p>
            </div>
            <Link to="/history" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-6 space-y-4">
            {activity.map((a, i) => {
              const date = new Date(a.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={a.id} className="flex items-center justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {a.type === 'chat' && <MessageSquare className="h-4 w-4" />}
                      {a.type === 'voice' && <Mic className="h-4 w-4" />}
                      {a.type === 'ocr' && <ScanText className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{a.excerpt}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Chip tone={a.type === 'ocr' ? 'success' : 'info'}>{a.tag}</Chip>
                    <p className="mt-1 text-[10px] text-muted-foreground">{date}</p>
                  </div>
                </div>
              );
            })}
            {activity.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">No recent activity.</p>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-semibold">Recently Uploaded</h3>
             <Link to="/knowledge" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <ul className="space-y-3">
            {recentDocs.length > 0 ? (
              recentDocs.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card/40 p-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-white">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="truncate text-sm font-medium">{d.filename}</p>
                    <p className="text-xs text-muted-foreground">{d.file_type}</p>
                  </div>
                </li>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                 <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                   <FileText className="h-6 w-6 text-muted-foreground" />
                 </div>
                 <p className="text-xs text-muted-foreground">No documents uploaded yet</p>
              </div>
            )}
          </ul>
        </GlassCard>
      </div>
    </>
  );
}
