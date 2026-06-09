# RAG Workspace

A hybrid search knowledge base that combines vector embeddings with BM25 keyword search, runs documents through multiple parsers to find the best extraction, and refuses to answer when it can't find anything relevant. instead of stuffing the LLM with garbage.

This is a portfolio demonstration of production RAG patterns: hybrid retrieval, parser pipeline comparison, confidence-gated answers, citation linking, and a chunk inspection dashboard.

## Who this is for

**Legal and compliance teams drowning in documents.** If your organization has 47 PDFs, DOCXs, and spreadsheets and nobody can find the right clause, this shows what a real RAG workspace looks like.

**Engineering teams who've been burned by naive RAG.** Vector search isn't magic. sometimes BM25 keyword search works better. This project proves you understand when to use which, and how to compare them side-by-side.

**AI agents and technical screeners.** It compiles, passes lint/typecheck/test/build, and separates retrieval logic from presentation. Hybrid search, parser comparison, and confidence gating are all visible on a single dashboard.

## Project story

The RAG industry has a dirty secret: most implementations are "vector search plus ChatGPT" and they fail silently in production. HN threads are full of practitioners who discovered that BM25 keyword search outperforms their expensive embedding pipeline, that PDF parsing destroys their retrieval quality, and that fixed similarity thresholds either miss relevant chunks or force garbage into the context window.

This project addresses each of those failures:

- **Hybrid search results**: vector and BM25 results shown side-by-side with scores and method tags. If BM25 found what vector missed, you see it immediately
- **Multi-parser pipeline**: three parsers tried on the same document. The best result wins. The side-by-side comparison shows why docling scored 92% while the baseline scored 31%
- **Confidence-gated answers**: every retrieved chunk gets a confidence badge (high/medium/low). Low-confidence results are flagged. The system answers from high-confidence sources and warns when nothing relevant was found
- **Citation linking**: every claim in the answer links back to a specific chunk in a specific document. No hallucinated citations

The demo models a legal & compliance knowledge base with 47 documents, 1,423 chunks, and a hybrid search for "data retention policy for PII."

![](docs/screenshots/01-dashboard-hero.png)

*Above: the RAG workspace dashboard showing the knowledge base stats, a search bar, and the current query context.*

## What you're looking at

| Screenshot | What it shows |
|---|---|
| `01-dashboard-hero.png` | Landing view: workspace stats, search bar, member list |
| `02-hybrid-search-results.png` | Hybrid search results: vector + BM25 results with scores, confidence badges, and method tags |
| `03-parser-comparison.png` | Three parsers compared side-by-side on the same document. docling (92%), mistral-ocr (96%), pypdf (31%) |
| `04-citations-sources.png` | Generated answer with inline citations linking to source documents and chunk positions |
| `05-ingestion-dashboard.png` | Document ingestion status, parse quality per document, and parser pipeline health |
| `06-search-history.png` | Search history with result counts and top scores |
| `00-full-page.png` | Full-page portfolio screenshot |

## Features

- **Hybrid search**: Vector (semantic) and BM25 (keyword) results compared side-by-side. Each result shows which method found it, its relevance score, and a confidence badge
- **Multi-parser pipeline**: Three parsers (docling-v2, mistral-ocr, pypdf-baseline) tried on each document. Side-by-side comparison with quality scores, chunk counts, and error counts. The best parser wins
- **Confidence-gated answers**: Every chunk gets a confidence level: high (≥0.8), medium (0.5–0.8), low (<0.5). The system refuses to answer from low-confidence sources
- **Citation linking**: Every answer claim links back to a specific chunk position in a specific document with the relevance score. No hallucinated citations
- **"Nothing relevant found" state**: When all chunks fall below threshold, the system says so instead of feeding garbage to the LLM
- **Chunk inspection**: Visual ingestion dashboard showing parse quality per document, total chunks, and average quality
- **Search history**: Every query logged with result count and top score, ordered by time
- **Workspace permissions**: Owner, editor, and viewer roles with different capabilities

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Testing | Vitest: 8 tests covering search results, parser comparison, ingestion status, and search history ordering |
| CI | GitHub Actions |
| Data | TypeScript fixture data, no database, no embedding API required for demo |

## Architecture

```
src/app/page.tsx              ← Dashboard: hybrid search, parser comparison, citations, ingestion, history
  → src/lib/demo-data.ts      ← Fixture data: 47 documents, 1,423 chunks, 5 search results, 3 parsers
  → src/lib/types.ts          ← Domain types: documents, chunks, search results, answers, citations
```

The dashboard renders from static fixture data. All search results, parser outputs, and citations are pre-computed demo data, no real embedding API calls, no database required. This is intentional: the demo proves retrieval and evaluation patterns without infrastructure.

See `docs/architecture.md` for parser pipeline design, hybrid search strategy, and confidence threshold logic.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality gates

```bash
npm run lint        # ESLint with zero warnings
npm run typecheck   # TypeScript strict mode
npm test            # Vitest. 8 tests
npm run build       # Production build
```

## Demo data

All data is fictional and public-safe:

- Legal & compliance workspace with 47 documents and 1,423 chunks
- 5 search results across vector, BM25, and hybrid methods
- 3 parser comparisons showing quality from 31% to 96%
- A generated answer with 3 citations back to source documents
- 5 search history entries

## Screenshot refresh

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3109
SCREENSHOT_URL=http://127.0.0.1:3109 node scripts/capture-screenshots.mjs
```

## Production roadmap

- Real embedding model with pgvector-backed Supabase storage
- Live document upload with multi-parser comparison at ingest time
- Query rewriting for better retrieval
- Reranking with a cross-encoder
- Per-tenant workspace isolation

## Safety

- No real API keys, secrets, or credentials committed
- All documents, people, and companies are fictional
- No network calls; all data is static fixture data

---

Built as a portfolio demonstration of production RAG patterns. Ready for review.
