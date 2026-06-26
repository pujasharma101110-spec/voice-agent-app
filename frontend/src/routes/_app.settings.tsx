import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Key, Mic, Palette, ScanText, User } from "lucide-react";
import { Chip, GlassCard, PageHeader } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/api";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Lensread AI" }] }),
});

const TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "ai", label: "AI", icon: Palette },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "ocr", label: "OCR", icon: ScanText },
  { id: "api", label: "API keys", icon: Key },
] as const;

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-6 w-11 rounded-full transition",
        on ? "bg-gradient-brand" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
          on ? "left-[1.375rem]" : "left-0.5",
        )}
      />
    </button>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("account");
  const user = getUser();
  const [t1, setT1] = useState(true);
  const [t2, setT2] = useState(false);
  const [t3, setT3] = useState(true);

  return (
    <>
      <PageHeader eyebrow="Preferences" title="Settings" description="Tune AI, voice, and OCR to your workflow." />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <GlassCard className="h-fit p-2">
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                  tab === t.id
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50",
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </GlassCard>

        <GlassCard className="p-6">
          {tab === "account" && (
            <>
              <h3 className="text-sm font-semibold">Account</h3>
              <div className="mt-2">
                <Row label="Display name">
                  <input
                    defaultValue={user?.email?.split('@')[0] || "User"}
                    className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-sm"
                  />
                </Row>
                <Row label="Email">
                  <input
                    defaultValue={user?.email || "user@example.com"}
                    className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-sm"
                  />
                </Row>
                <Row label="Plan" hint="Pro · renews Nov 14">
                  <Chip tone="info">Pro</Chip>
                </Row>
              </div>
            </>
          )}

          {tab === "ai" && (
            <>
              <h3 className="text-sm font-semibold">AI preferences</h3>
              <div className="mt-2">
                <Row label="Model" hint="Default model for chat & summaries">
                  <select className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-sm">
                    <option>gemini-3-flash-preview</option>
                    <option>gpt-5</option>
                    <option>gpt-5-mini</option>
                  </select>
                </Row>
                <Row label="Cite sources" hint="Always include document references">
                  <Toggle on={t1} onChange={setT1} />
                </Row>
                <Row label="Stream responses">
                  <Toggle on={t3} onChange={setT3} />
                </Row>
              </div>
            </>
          )}

          {tab === "voice" && (
            <>
              <h3 className="text-sm font-semibold">Voice</h3>
              <div className="mt-2">
                <Row label="Voice" hint="Assistant speech style">
                  <select className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-sm">
                    <option>Aurora (warm)</option>
                    <option>Nova (neutral)</option>
                    <option>Orion (deep)</option>
                  </select>
                </Row>
                <Row label="Auto end on silence">
                  <Toggle on={t1} onChange={setT1} />
                </Row>
                <Row label="Push-to-talk">
                  <Toggle on={t2} onChange={setT2} />
                </Row>
              </div>
            </>
          )}

          {tab === "ocr" && (
            <>
              <h3 className="text-sm font-semibold">OCR</h3>
              <div className="mt-2">
                <Row label="Auto-summary" hint="Generate summary after each upload">
                  <Toggle on={t1} onChange={setT1} />
                </Row>
                <Row label="Detect entities">
                  <Toggle on={t3} onChange={setT3} />
                </Row>
                <Row label="Default language">
                  <select className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-sm">
                    <option>Auto-detect</option>
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </Row>
              </div>
            </>
          )}

          {tab === "api" && (
            <>
              <h3 className="text-sm font-semibold">API keys</h3>
              <div className="mt-2">
                <Row label="Personal token" hint="Used for SDK & CLI access">
                  <code className="rounded-lg bg-muted px-3 py-1.5 font-mono text-xs">
                    lr_sk_••••••••••••AB12
                  </code>
                </Row>
                <Row label="Webhooks endpoint">
                  <input
                    defaultValue="https://api.lensread.ai/webhook"
                    className="w-72 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-sm"
                  />
                </Row>
              </div>
            </>
          )}

        </GlassCard>
      </div>
    </>
  );
}
