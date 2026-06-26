import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from "react";
import { Copy, Download, FileText, Hash, ListChecks, Sparkles, AlertCircle } from "lucide-react";
import { Chip, GlassCard, PageHeader } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { listDocuments } from "@/lib/api";

export const Route = createFileRoute("/_app/ocr")({
  component: OcrResults,
  head: () => ({ meta: [{ title: "OCR Results — Lensread AI" }] }),
});

function OcrResults() {
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDocuments().then((docs) => {
      if (docs && docs.length > 0) {
        // Get the most recent document
        setDoc(docs[docs.length - 1]);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground">Fetching latest results...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">No documents found</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Upload a document first to see the extraction results here.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`OCR Results — ${doc.filename}`}
        title="Extraction complete"
        description={`Successfully extracted text from your ${doc.file_type.split('/')[1].toUpperCase()} document.`}
        actions={
          <>
            <button 
              onClick={() => navigator.clipboard.writeText(doc.ocr_text || "")}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-sm font-medium hover:border-primary/40 transition-colors"
            >
              <Copy className="h-4 w-4" /> Copy Text
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Raw Extracted Text
            </h3>
            <Chip tone="success">Success</Chip>
          </div>
          <div className="p-5">
            <div className="max-h-[600px] overflow-auto whitespace-pre-wrap rounded-xl bg-muted/30 p-6 font-mono text-xs leading-relaxed border border-border shadow-inner">
              {doc.ocr_text || "No text was extracted from this document."}
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> File Info
            </div>
            <div className="space-y-3">
              {[
                { l: "Filename", v: doc.filename },
                { l: "Type", v: doc.file_type },
                { l: "ID", v: `#${doc.id}` },
                { l: "Characters", v: doc.ocr_text?.length || 0 },
              ].map((item) => (
                <div key={item.l} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.l}</span>
                  <span className="font-medium truncate max-w-[150px]">{item.v}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Hash className="h-4 w-4 text-primary" /> RAG Status
            </div>
            <div className="flex flex-col gap-3">
               <div className="flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <span>Indexed in Vector DB</span>
               </div>
               <div className="flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <span>Ready for Voice Assistant</span>
               </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}
