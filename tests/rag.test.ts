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

describe("retrieval safety review", () => {
  it("flags embedded instruction and egress requests before answer use", () => {
    const unsafeResults = demoSnapshot.searchResults.filter(r => r.safetyReview.status !== "allowed");
    expect(unsafeResults.length).toBeGreaterThanOrEqual(2);

    const egressRisk = unsafeResults.find(r => r.safetyReview.risk === "egress_request");
    expect(egressRisk).toBeDefined();
    expect(egressRisk?.safetyReview.status).toBe("blocked");
    expect(egressRisk?.safetyReview.externalTarget).toMatch(/vendor-audit/);
    expect(egressRisk?.safetyReview.reviewNote).toMatch(/external target|block/i);
  });

  it("keeps blocked retrievals out of generated citations", () => {
    const blockedResults = demoSnapshot.searchResults.filter(r => r.safetyReview.status === "blocked");
    const citations = demoSnapshot.answer?.citations ?? [];
    expect(blockedResults.length).toBeGreaterThan(0);

    for (const result of blockedResults) {
      expect(citations.some(citation => citation.documentName === result.documentName)).toBe(false);
    }
  });

  it("uses only safety-cleared retrievals for direct citations", () => {
    const directCitations = demoSnapshot.answer?.citations.filter(c => c.coverage === "direct") ?? [];
    expect(directCitations.length).toBeGreaterThan(0);

    for (const citation of directCitations) {
      const matchingResult = demoSnapshot.searchResults.find(result =>
        result.documentName === citation.documentName && result.score >= citation.score - 0.01
      );
      expect(matchingResult?.safetyReview.status).toBe("allowed");
    }
  });
});

describe("answer grounding audit", () => {
  it("accounts for cited and unsupported claims", () => {
    const audit = demoSnapshot.answer?.groundingAudit;
    expect(audit).toBeDefined();
    expect(audit!.citedClaims + audit!.unsupportedClaimCount).toBe(audit!.totalClaims);
    expect(audit!.citedClaims).toBe(demoSnapshot.answer?.citations.length);
  });

  it("requires review when an answer includes unsupported claims", () => {
    const audit = demoSnapshot.answer?.groundingAudit;
    expect(audit?.unsupportedClaimCount).toBeGreaterThan(0);
    expect(audit?.reviewRequired).toBe(true);
    expect(audit?.reviewNote).toMatch(/direct citation/i);
  });

  it("maps every answer claim to attribution evidence or review action", () => {
    const audit = demoSnapshot.answer?.groundingAudit;
    expect(audit?.claimAttributions).toHaveLength(audit!.totalClaims);

    const supported = audit!.claimAttributions.filter(attribution => attribution.supportStatus === "supported");
    expect(supported).toHaveLength(audit!.citedClaims);

    for (const attribution of supported) {
      const matchingCitation = demoSnapshot.answer?.citations.find(citation =>
        citation.documentName === attribution.citationDocumentName &&
        citation.chunkPosition === attribution.citationChunkPosition
      );
      expect(matchingCitation).toBeDefined();
      expect(attribution.supportingExcerpt).toBeTruthy();
      expect(attribution.reviewerAction.length).toBeGreaterThan(24);
    }
  });

  it("keeps unsupported claims out of citation mappings until review", () => {
    const audit = demoSnapshot.answer?.groundingAudit;
    const needsCitation = audit!.claimAttributions.filter(attribution => attribution.supportStatus === "needs_citation");
    expect(needsCitation).toHaveLength(audit!.unsupportedClaimCount);

    for (const attribution of needsCitation) {
      expect(attribution.citationDocumentName).toBeNull();
      expect(attribution.citationChunkPosition).toBeNull();
      expect(attribution.supportingExcerpt).toBeNull();
      expect(attribution.reviewerAction).toMatch(/citation|retrieve|attach/i);
    }
  });

  it("tracks stale citations separately from changed source documents", () => {
    const citations = demoSnapshot.answer?.citations ?? [];
    const citedDocumentNames = new Set(citations.map(citation => citation.documentName));
    const staleCitedDocuments = demoDocuments.filter(
      document => citedDocumentNames.has(document.name) && document.lastModifiedAt != null && document.lastModifiedAt > document.ingestedAt
    );
    expect(staleCitedDocuments.length).toBe(demoSnapshot.answer?.groundingAudit.staleCitationCount);
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
