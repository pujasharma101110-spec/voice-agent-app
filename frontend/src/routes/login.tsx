import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { login, register, googleLogin } from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Lensread AI" }] }),
});

declare global {
  interface Window {
    google: any;
  }
}

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load Google script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "430295196357-hl318ihl48fg7a1nfm3iageb77dkrdd1.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-btn"),
          { theme: "outline", size: "large", width: "100%" }
        );
      }
    };
    document.head.appendChild(script);
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    try {
      await googleLogin(response.credential);
      navigate({ to: "/" });
    } catch (err: any) {
      setError("Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signin") {
        await login(email, password);
        navigate({ to: "/" });
      } else {
        await register(email, password);
        await login(email, password);
        navigate({ to: "/" });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Animated background omitted for brevity in replace, but kept in full file */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-gradient-brand opacity-30 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-40 bottom-0 h-[600px] w-[600px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--gradient-end), transparent)" }}
          animate={{ x: [0, -40, 0], y: [0, -60, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="hidden flex-1 flex-col justify-between p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Lensread AI</span>
        </Link>

        <div>
          <h1 className="text-balance text-5xl font-semibold leading-tight tracking-tight">
            The AI workspace for your <span className="text-gradient">documents</span>.
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground">
            OCR, voice assistant, and document chat — unified in one beautiful, fast workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["OCR", "RAG search", "Voice AI", "Citations", "Privacy-first"].map((b) => (
              <span
                key={b}
                className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs backdrop-blur"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">© 2026 Lensread AI · Made with care.</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass w-full max-w-md rounded-3xl p-8 shadow-glow"
        >
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">Lensread AI</span>
          </Link>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to continue to your workspace."
              : "Start your free account — no card required."}
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="mt-6">
             <div id="google-btn" className="w-full" />
          </div>


          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or with email <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-border bg-card/60 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/60"
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-card/60 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/60"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
