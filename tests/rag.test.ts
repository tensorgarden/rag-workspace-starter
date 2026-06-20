import { describe, it, expect } from "vitest";
import { demoSnapshot, demoParserResults, demoSearchHistory, demoDocuments } from "@/lib/demo-data";

describe("search results", () => {
  it("has results from multiple methods", () => {
    const methods = new Set(demoSnapshot.searchResults.map(r => r.method));
    expect(methods.size).toBeGreaterThanOrEqual(2);
  });

  it("has at least one high-confidence result", () => {
    expect(demoSnapshot.searchResults.some(r => r.confidence === "high")).toBe(true);
  });

  it("has low-confidence result flagged", () => {
    expect(demoSnapshot.searchResults.some(r => r.confidence === "low")).toBe(true);
  });

  it("answer has citations", () => {
    expect(demoSnapshot.answer?.citations.length).toBeGreaterThanOrEqual(2);
  });

  it("citations include claim coverage notes", () => {
    const citations = demoSnapshot.answer?.citations ?? [];
    expect(citations.some(c => c.coverage === "direct")).toBe(true);
    for (const citation of citations) {
      expect(citation.verificationNote.length).toBeGreaterThan(24);
    }
  });

  it("direct citations map back to retrieved chunks", () => {
    const directCitations = demoSnapshot.answer?.citations.filter(c => c.coverage === "direct") ?? [];
    expect(directCitations.length).toBeGreaterThanOrEqual(2);

    for (const citation of directCitations) {
      const matchingResult = demoSnapshot.searchResults.find(result =>
        result.documentName === citation.documentName &&
        result.score >= citation.score - 0.01 &&
        result.confidence === "high"
      );
      expect(matchingResult).toBeDefined();
    }
  });
});

describe("parser pipeline", () => {
  it("identifies best parser", () => {
    const best = [...demoParserResults].sort((a, b) => b.quality - a.quality)[0];
    expect(best.quality).toBeGreaterThanOrEqual(80);
  });

  it("baseline parser has lowest quality", () => {
    const baseline = demoParserResults.find(p => p.parser === "pypdf-baseline");
    expect(baseline?.quality).toBeLessThan(50);
  });
});

describe("ingestion", () => {
  it("all documents have parse quality", () => {
    for (const doc of demoDocuments) {
      expect(doc.parseQuality).toBeGreaterThan(0);
    }
  });

  it("search history is ordered", () => {
    const times = demoSearchHistory.map(h => new Date(h.searchedAt).getTime());
    for (let i = 1; i < times.length; i++) {
      expect(times[i]).toBeLessThanOrEqual(times[i-1]);
    }
  });

  it("reports stale document count when threshold is set", () => {
    const status = demoSnapshot.ingestionStatus;
    expect(status.staleThresholdDays).toBeGreaterThan(0);
    expect(status.staleDocumentCount).toBeGreaterThanOrEqual(0);
    expect(status.staleDocumentCount).toBeLessThanOrEqual(status.totalDocuments);
  });

  it("stale count is non-zero to surface freshness risk", () => {
    expect(demoSnapshot.ingestionStatus.staleDocumentCount).toBeGreaterThan(0);
  });

  it("tracks documents whose source changed after ingestion", () => {
    const status = demoSnapshot.ingestionStatus;
    expect(status.sourceModifiedAfterIngestionCount).toBeGreaterThanOrEqual(0);
    expect(status.sourceModifiedAfterIngestionCount).toBeLessThanOrEqual(status.totalDocuments);
  });
});

describe("document freshness", () => {
  it("at least one document has source modified after ingestion date", () => {
    const outOfSync = demoDocuments.filter(
      d => d.lastModifiedAt != null && d.lastModifiedAt > d.ingestedAt
    );
    expect(outOfSync.length).toBeGreaterThanOrEqual(1);
  });

  it("documents ingested after source modification stay in sync", () => {
    const inSync = demoDocuments.filter(
      d => d.lastModifiedAt != null && d.lastModifiedAt <= d.ingestedAt
    );
    expect(inSync.length).toBeGreaterThanOrEqual(2);
  });

  it("documents without lastModifiedAt are handled gracefully", () => {
    const noModTime = demoDocuments.filter(d => d.lastModifiedAt == null);
    expect(noModTime.length).toBeGreaterThanOrEqual(1);
    for (const doc of noModTime) {
      expect(doc.ingestedAt).toBeTruthy();
      expect(doc.parseQuality).toBeGreaterThan(0);
    }
  });

  it("source-modified count matches out-of-sync documents", () => {
    const outOfSync = demoDocuments.filter(
      d => d.lastModifiedAt != null && d.lastModifiedAt > d.ingestedAt
    );
    expect(outOfSync.length).toEqual(demoSnapshot.ingestionStatus.sourceModifiedAfterIngestionCount);
  });

  it("out-of-sync document still has parse quality recorded", () => {
    const outOfSync = demoDocuments.find(
      d => d.lastModifiedAt != null && d.lastModifiedAt > d.ingestedAt
    );
    expect(outOfSync).toBeDefined();
    expect(outOfSync!.parseQuality).toBeGreaterThan(0);
    expect(outOfSync!.chunksCreated).toBeGreaterThan(0);
  });
});
