import { useEffect, useState } from "react";
import { Search, Filter, BookOpen, FileText, Sparkles, Database } from "lucide-react";
import { Chip, GlassCard, PageHeader } from "@/components/ui-bits";
import { listDocuments } from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/knowledge")({
  component: Knowledge,
  head: () => ({ meta: [{ title: "Knowledge Base — Lensread AI" }] }),
});

function Knowledge() {
  const [q, setQ] = useState("");
  const [allDocs, setAllDocs] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDocuments().then((docs) => {
      setAllDocs(docs || []);
      setLoading(false);
    });
  }, []);

  const handleSearch = () => {
    if (!q.trim()) return;
    setIsSearching(true);
    // Real search logic would go here
    setTimeout(() => {
      setIsSearching(false);
    }, 600);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground">Loading knowledge base...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="RAG engine"
        title="Knowledge base"
        description="Every document you upload is automatically indexed into our vector search engine."
      />

      <GlassCard className="p-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search across all your documents…"
              className="w-full bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-50"
            disabled={isSearching}
          >
            <Sparkles className="h-4 w-4" /> {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </GlassCard>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-sm font-semibold flex items-center gap-2">
             <Database className="h-4 w-4 text-primary" /> {allDocs.length} Indexed Documents
           </h3>
        </div>

        {allDocs.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allDocs.map((doc, i) => (
              <GlassCard key={doc.id} className="p-4 group hover:border-primary/40 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Chip tone="success">Ready</Chip>
                </div>
                <h4 className="text-sm font-semibold truncate" title={doc.filename}>{doc.filename}</h4>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{doc.file_type}</p>
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                   <span className="text-[10px] text-muted-foreground">ID: #{doc.id}</span>
                   <span className="text-[10px] text-primary font-medium">{doc.ocr_text?.length || 0} chars indexed</span>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Workspace is empty</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-1">
              Upload documents to build your personal AI knowledge base.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
