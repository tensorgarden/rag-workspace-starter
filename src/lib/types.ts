export type ConfidenceLevel = "high" | "medium" | "low";

export interface WorkspaceMember {
  id: string; name: string; role: "owner" | "editor" | "viewer"; initials: string;
}

export interface Workspace {
  id: string; name: string; memberCount: number; documentCount: number; totalChunks: number;
}

export interface Document {
  id: string; workspaceId: string; name: string; type: string; size: string; parser: string;
  parseQuality: number; chunksCreated: number; ingestedAt: string;
  /** ISO timestamp of the source file's last modification — distinct from ingestedAt. When
   *  lastModifiedAt > ingestedAt the source changed after ingestion and embeddings are stale. */
  lastModifiedAt?: string;
  status: "ready" | "parsing" | "error";
}

export interface Chunk {
  id: string; documentId: string; workspaceId: string; text: string; summary: string;
  semanticBoundary: string; position: number; tokenCount: number;
}

export type RetrievalSafetyStatus = "allowed" | "review_required" | "blocked";
export type RetrievalRiskType = "none" | "embedded_instruction" | "egress_request" | "parser_error";

export interface RetrievalSafetyReview {
  status: RetrievalSafetyStatus;
  risk: RetrievalRiskType;
  externalTarget: string | null;
  reviewNote: string;
}

export interface SearchResult {
  chunkId: string; documentName: string; chunkText: string; score: number;
  confidence: ConfidenceLevel; method: "vector" | "bm25" | "hybrid";
  safetyReview: RetrievalSafetyReview;
}

export type ClaimSupportStatus = "supported" | "needs_citation" | "contradicted";

export interface ClaimAttribution {
  claim: string;
  supportStatus: ClaimSupportStatus;
  citationDocumentName: string | null;
  citationChunkPosition: number | null;
  supportingExcerpt: string | null;
  reviewerAction: string;
}

export interface GroundingAudit {
  totalClaims: number; citedClaims: number; unsupportedClaimCount: number;
  staleCitationCount: number; reviewRequired: boolean; reviewNote: string;
  claimAttributions: ClaimAttribution[];
}

export interface RagAnswer {
  answer: string; citations: Citation[]; confidence: ConfidenceLevel; generatedAt: string;
  groundingAudit: GroundingAudit;
}

export interface Citation {
  documentName: string; chunkPosition: number; excerpt: string; score: number;
  coverage: "direct" | "supporting";
  verificationNote: string;
}

export interface SearchHistoryEntry {
  id: string; query: string; resultCount: number; topScore: number; searchedAt: string;
}

export interface IngestionStatus {
  workspaceId: string; totalDocuments: number; totalChunks: number;
  avgParseQuality: number; lastIngestedAt: string;
  staleThresholdDays: number; staleDocumentCount: number;
  /** Documents whose source was modified after the last ingestion — embeddings are definitely stale. */
  sourceModifiedAfterIngestionCount: number;
}

export interface ParserResult {
  parser: string; quality: number; textSample: string; chunks: number; errors: number;
}

export interface RagSnapshot {
  workspace: Workspace;
  members: WorkspaceMember[];
  documents: Document[];
  searchResults: SearchResult[];
  answer: RagAnswer | null;
  searchHistory: SearchHistoryEntry[];
  ingestionStatus: IngestionStatus;
  parserResults: ParserResult[];
}
