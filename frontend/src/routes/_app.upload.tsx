import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import {
  Upload as UploadIcon,
  FileImage,
  Loader2,
  X,
  ScanText,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { uploadDocument } from "@/lib/api";
import { Chip, GlassCard, GradientButton, PageHeader } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/upload")({
  component: UploadPage,
  head: () => ({ meta: [{ title: "Upload — Lensread AI" }] }),
});

type Item = {
  id: string;
  name: string;
  size: number;
  preview: string;
  status: "uploading" | "processing" | "done" | "error";
  text?: string;
  error?: string;
};

function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [drag, setDrag] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      for (const file of Array.from(files)) {
        const id = crypto.randomUUID();
        
        // Create a preview (for images)
        let preview = "";
        if (file.type.startsWith("image/")) {
          preview = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        } else {
          // Default icon for PDFs
          preview = "https://cdn-icons-png.flaticon.com/512/337/337946.png";
        }

        setItems((p) => [
          { id, name: file.name, size: file.size, preview, status: "uploading" },
          ...p,
        ]);

        try {
          const data = await uploadDocument(file);
          setItems((p) =>
            p.map((i) =>
              i.id === id
                ? { ...i, status: "done", text: data.ocr_text }
                : i
            )
          );
        } catch (error) {
          console.error("Upload error:", error);
          setItems((p) =>
            p.map((i) => (i.id === id ? { ...i, status: "error", error: "Failed to process" } : i))
          );
        }
      }
    },
    [],
  );

  return (
    <>
      <PageHeader
        eyebrow="Documents"
        title="Upload & extract"
        description="Drop in PDFs or images. AI handles OCR, summary, and indexing automatically."
      />

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "glass relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-all",
          drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        )}
      >
        <motion.div
          animate={{ y: drag ? -4 : 0 }}
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow"
        >
          <UploadIcon className="h-7 w-7" />
        </motion.div>
        <p className="text-base font-semibold">Drop files here, or click to browse</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          PNG, JPG, WebP, PDF — up to 10MB each
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Chip tone="info">Multi-file</Chip>
          <Chip tone="info">Auto OCR</Chip>
          <Chip tone="info">RAG indexed</Chip>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="sr-only"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </label>

      {items.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent uploads</h2>
            <Link to="/ocr" className="text-xs text-primary hover:underline">
              Open results →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard className="overflow-hidden">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img src={it.preview} alt={it.name} className="h-full w-full object-cover" />
                    <button
                      onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))}
                      className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 backdrop-blur"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {it.status === "processing" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 backdrop-blur-sm">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-xs font-medium">Extracting text…</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                          <FileImage className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          {it.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {(it.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      {it.status === "done" && (
                        <Chip tone="success">
                          <CheckCircle2 className="h-3 w-3" /> Ready
                        </Chip>
                      )}
                      {it.status === "error" && <Chip tone="warning">Error</Chip>}
                    </div>
                    {it.text && (
                      <p className="mt-3 line-clamp-3 rounded-lg bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
                        {it.text || "(empty)"}
                      </p>
                    )}
                    {it.error && (
                      <p className="mt-3 text-xs text-destructive">{it.error}</p>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { t: "Pixel-perfect OCR", d: "Handwriting, screenshots, scans, receipts." },
            { t: "Auto summary", d: "Get key points the moment a doc is processed." },
            { t: "RAG-ready", d: "Searchable across every uploaded document." },
          ].map((f) => (
            <GlassCard key={f.t} className="p-5">
              <FileText className="mb-3 h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </GlassCard>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <GradientButton onClick={() => inputRef.current?.click()}>
          <ScanText className="h-4 w-4" /> Choose files
        </GradientButton>
      </div>
    </>
  );
}
