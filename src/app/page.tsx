import {
  demoAnswer,
  demoDocuments,
  demoIngestionStatus,
  demoMembers,
  demoParserResults,
  demoSearchHistory,
  demoSnapshot,
  demoWorkspace
} from "@/lib/demo-data";
import type { ConfidenceLevel } from "@/lib/types";

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: string }) {
  const t: Record<string, string> = {
    slate: "border-slate-200 bg-white text-slate-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    purple: "border-indigo-200 bg-indigo-50 text-indigo-700",
    indigo: "border-indigo-200 bg-indigo-100 text-indigo-700"
  };
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${t[tone]}`}>{children}</span>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur ${className}`}>{children}</section>;
}

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const m = { high: { label: "High", tone: "green" }, medium: { label: "Medium", tone: "amber" }, low: { label: "Low", tone: "red" } };
  return <Badge tone={m[level].tone as "green" | "amber" | "red"}>{m[level].label}</Badge>;
}

function ProgressBar({ value, max, tone = "indigo" }: { value: number; max: number; tone?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${tone === "red" ? "bg-red-500" : tone === "emerald" ? "bg-emerald-500" : "bg-indigo-600"}`} style={{ width: `${pct}%` }} /></div>;
}

export default function Home() {
  const results = demoSnapshot.searchResults;
  const hasLowConfidence = results.some(r => r.confidence === "low");
  const parserWinner = demoParserResults.reduce((a, b) => a.quality > b.quality ? a : b);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-5 py-8 md:px-8 lg:px-10 bg-slate-50">
      {/* HEADER */}
      <header className="grid gap-6 rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-sm backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone="purple">Hybrid RAG</Badge>
            <Badge tone="green">{demoWorkspace.name}</Badge>
            <Badge>{demoWorkspace.documentCount} documents</Badge>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-600">Knowledge Base</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">RAG Workspace</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">
            Hybrid search across {demoWorkspace.totalChunks.toLocaleString()} chunks from 47 documents.
            Vector + BM25 results compared side-by-side. Confidence-gated responses that refuse to answer when nothing relevant is found.
          </p>
          {/* Search bar */}
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-slate-400 text-sm">
            data retention policy for PII
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Documents", value: demoIngestionStatus.totalDocuments },
            { label: "Total chunks", value: demoIngestionStatus.totalChunks.toLocaleString() },
            { label: "Avg parse quality", value: `${demoIngestionStatus.avgParseQuality}%` },
            { label: "Low confidence", value: hasLowConfidence ? "1 result" : "None" }
          ].map(s => (
            <div key={s.label} className="rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-sm text-slate-300">{s.label}</p>
              <p className="text-3xl font-black">{s.value}</p>
            </div>
          ))}
        </div>
      </header>

      {/* HYBRID SEARCH RESULTS */}
      <section className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
        <Card>
          <h2 className="text-xl font-bold text-slate-950">Hybrid Search Results</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Vector (semantic) and BM25 (keyword) results compared. Each result shows which method found it and a confidence score.
          </p>
          <div className="mt-4 space-y-3">
            {results.map(r => (
              <div key={r.chunkId} className={`rounded-2xl border p-4 ${r.confidence === "low" ? "border-red-200 bg-red-50/30" : r.confidence === "medium" ? "border-amber-100 bg-amber-50/20" : "border-emerald-100 bg-emerald-50/20"}`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{r.method.toUpperCase()}</span>
                    <span className="text-xs text-slate-400">{r.documentName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tabular-nums text-slate-700">{r.score.toFixed(2)}</span>
                    <ConfidenceBadge level={r.confidence} />
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-700">{r.chunkText}</p>
                {r.confidence === "low" && (
                  <p className="mt-2 text-xs font-semibold text-red-600">⚠ Parse error — table data could not be extracted. Consider re-ingesting with a different parser.</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* ANSWER + CITATIONS */}
        <Card>
          <h2 className="text-xl font-bold text-slate-950">Generated Answer</h2>
          <div className="mt-2 flex items-center gap-2">
            <ConfidenceBadge level={demoAnswer.confidence} />
            <span className="text-xs text-slate-400">Generated {new Date(demoAnswer.generatedAt).toLocaleTimeString()}</span>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-700">{demoAnswer.answer}</p>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sources cited</p>
            <div className="mt-2 space-y-2">
              {demoAnswer.citations.map((c, i) => (
                <div key={i} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-indigo-700">{c.documentName}</span>
                      <Badge tone={c.coverage === "direct" ? "green" : "slate"}>{c.coverage}</Badge>
                    </div>
                    <span className="text-xs tabular-nums text-slate-400">chunk #{c.chunkPosition} · {c.score.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">&ldquo;{c.excerpt}&rdquo;</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{c.verificationNote}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* PARSER COMPARISON + INGESTION STATUS */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold text-slate-950">Multi-Parser Pipeline</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Three parsers tried on the same document. The best result wins. Below: side-by-side comparison on the Employee Handbook.
          </p>
          <div className="mt-4 space-y-3">
            {demoParserResults.map(p => (
              <div key={p.parser} className={`rounded-2xl border p-4 ${p.parser === parserWinner.parser ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-semibold text-sm ${p.parser === parserWinner.parser ? "text-emerald-700" : "text-slate-700"}`}>
                    {p.parser} {p.parser === parserWinner.parser && "✓"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{p.chunks} chunks</span>
                    <span className={`text-xs font-bold ${p.quality >= 80 ? "text-emerald-600" : p.quality >= 50 ? "text-amber-600" : "text-red-600"}`}>{p.quality}%</span>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500 font-mono bg-slate-50 rounded-lg p-2">{p.textSample}</p>
                {p.errors > 0 && <p className="mt-1 text-xs text-red-500">{p.errors} extraction errors</p>}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950">Ingestion Dashboard</h2>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Documents indexed</span>
              <span className="font-bold">{demoIngestionStatus.totalDocuments} / {demoIngestionStatus.totalDocuments}</span>
            </div>
            <div className="mt-2"><ProgressBar value={demoIngestionStatus.totalDocuments} max={demoIngestionStatus.totalDocuments} tone="emerald" /></div>
          </div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Avg parse quality</span>
              <span className="font-bold">{demoIngestionStatus.avgParseQuality}%</span>
            </div>
            <div className="mt-2"><ProgressBar value={demoIngestionStatus.avgParseQuality} max={100} tone={demoIngestionStatus.avgParseQuality >= 80 ? "emerald" : "indigo"} /></div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Recent documents</p>
            {demoDocuments.map(d => (
              <div key={d.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 mb-1 text-sm">
                <span className="truncate max-w-[250px]">{d.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{d.parser}</span>
                  <span className={`text-xs font-semibold ${d.parseQuality >= 80 ? "text-emerald-600" : d.parseQuality >= 50 ? "text-amber-600" : "text-red-600"}`}>{d.parseQuality}%</span>
                </div>
              </div>
            ))}
          </div>
          {demoIngestionStatus.sourceModifiedAfterIngestionCount > 0 && (
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold text-amber-800">
                ⚠ {demoIngestionStatus.sourceModifiedAfterIngestionCount} document source changed after ingestion — embeddings may be stale
              </p>
            </div>
          )}
          <p className="mt-4 text-xs text-slate-400">Last ingested: {new Date(demoIngestionStatus.lastIngestedAt).toLocaleDateString()}</p>
        </Card>
      </div>

      {/* SEARCH HISTORY + MEMBERS */}
      <div className="grid gap-6 lg:grid-cols-[1fr_0.5fr]">
        <Card>
          <h2 className="text-xl font-bold text-slate-950">Search History</h2>
          <div className="mt-4 space-y-2">
            {demoSearchHistory.map(h => (
              <div key={h.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{h.query}</p>
                  <p className="text-xs text-slate-400">{new Date(h.searchedAt).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-indigo-700">{h.resultCount} results</p>
                  <p className="text-xs text-slate-400">top {h.topScore.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-slate-950">Members</h2>
          <div className="mt-4 space-y-3">
            {demoMembers.map(m => (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{m.initials}</span>
                <div>
                  <p className="font-semibold text-slate-950">{m.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{m.role} · Can {m.role === "viewer" ? "search only" : m.role === "editor" ? "upload & search" : "manage workspace"}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
