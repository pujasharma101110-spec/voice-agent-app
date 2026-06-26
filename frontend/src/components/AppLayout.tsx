import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Upload,
  MessageSquare,
  Mic,
  ScanText,
  BookOpen,
  History,
  Settings,
  Sparkles,
  Search,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload Documents", icon: Upload },
  { to: "/chat", label: "AI Chat", icon: MessageSquare },
  { to: "/voice", label: "Voice Assistant", icon: Mic },
  { to: "/ocr", label: "OCR Results", icon: ScanText },
  { to: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => setMobileOpen(false), [path]);

  return (
    <div className="app-bg min-h-screen text-foreground">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-sidebar/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">Lensread AI</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                OCR · Voice · RAG
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-0.5 p-3">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Workspace
          </p>
          {NAV.map((item) => {
            const active = path === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-gradient-brand"
                  />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-3 bottom-3">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              AI Assistant Ready
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Groq Llama 3.1 · Connected
            </p>
            <Link
              to="/upload"
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-glow"
            >
              + New document
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/60 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search documents, chats, knowledge…"
              className="w-full max-w-xl rounded-xl border border-border bg-card/60 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
            />
          </div>
          <button
            onClick={() => setDark((v) => !v)}
            className="rounded-lg border border-border bg-card/60 p-2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div 
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="hidden items-center gap-2 rounded-xl border border-border bg-card/60 py-1.5 pl-1.5 pr-3 text-sm font-medium hover:border-destructive/40 sm:flex cursor-pointer group"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand text-xs font-bold text-white group-hover:bg-destructive group-hover:from-destructive group-hover:to-destructive transition-colors">
              U
            </span>
            <span className="group-hover:text-destructive">Logout</span>
          </div>
        </header>

        <main className="px-4 pb-16 pt-6 sm:px-6 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={path}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
