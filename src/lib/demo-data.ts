import type { Document, IngestionStatus, ParserResult, RagAnswer, RagSnapshot, SearchHistoryEntry, SearchResult, Workspace, WorkspaceMember } from "./types";

export const demoWorkspace: Workspace = {
  id: "ws_legal", name: "Legal & Compliance Knowledge Base", memberCount: 12, documentCount: 47, totalChunks: 1423
};

export const demoMembers: WorkspaceMember[] = [
  { id: "m_1", name: "Claire Delgado", role: "owner", initials: "CD" },
  { id: "m_2", name: "Ravi Krishnan", role: "editor", initials: "RK" },
  { id: "m_3", name: "Sarah Okonkwo", role: "viewer", initials: "SO" }
];

export const demoDocuments: Document[] = [
  { id: "doc_001", workspaceId: "ws_legal", name: "Q2 2026 Compliance Audit Report.pdf", type: "PDF", size: "4.2 MB", parser: "docling-v2", parseQuality: 92, chunksCreated: 87, ingestedAt: "2026-06-07T09:30:00Z", lastModifiedAt: "2026-06-01T00:00:00Z", status: "ready" },
  { id: "doc_002", workspaceId: "ws_legal", name: "Data Processing Agreement — Vendor X.docx", type: "DOCX", size: "1.1 MB", parser: "mistral-ocr", parseQuality: 85, chunksCreated: 34, ingestedAt: "2026-06-07T10:15:00Z", lastModifiedAt: "2026-05-28T00:00:00Z", status: "ready" },
  { id: "doc_003", workspaceId: "ws_legal", name: "ISO 27001:2022 Certification Scope.pdf", type: "PDF", size: "2.8 MB", parser: "docling-v2", parseQuality: 78, chunksCreated: 52, ingestedAt: "2026-06-07T11:00:00Z", lastModifiedAt: "2026-06-15T09:00:00Z", status: "ready" },
  { id: "doc_004", workspaceId: "ws_legal", name: "Employee Handbook v3.1.pdf", type: "PDF", size: "6.5 MB", parser: "mistral-ocr", parseQuality: 96, chunksCreated: 203, ingestedAt: "2026-06-06T14:00:00Z", lastModifiedAt: "2026-05-15T00:00:00Z", status: "ready" },
  { id: "doc_005", workspaceId: "ws_legal", name: "Vendor Risk Assessment Matrix.xlsx", type: "XLSX", size: "0.8 MB", parser: "docling-v2", parseQuality: 42, chunksCreated: 28, ingestedAt: "2026-06-07T08:45:00Z", status: "error" }
];

export const demoParserResults: ParserResult[] = [
  { parser: "docling-v2", quality: 92, textSample: "Executive Summary: This report covers the Q2 2026 compliance audit conducted across 14 business units. Key findings include...", chunks: 87, errors: 2 },
  { parser: "mistral-ocr", quality: 96, textSample: "Section 3.2 — Remote Work Policy: Employees working remotely must adhere to the same security standards as on-site staff...", chunks: 203, errors: 0 },
  { parser: "pypdf-baseline", quality: 31, textSample: "Q2 2 0 2 6\nC o m p l i a n c e\nA u d i t\nR e p o r t\n\n(Table data lost — detected as image)...", chunks: 45, errors: 28 }
];

const mockSearchResults: SearchResult[] = [
  { chunkId: "c_042", documentName: "Q2 2026 Compliance Audit Report.pdf", chunkText: "Section 4.3: Data retention periods for personally identifiable information (PII) must not exceed 7 years from the date of last business interaction, unless extended by regulatory requirement (e.g., FINRA Rule 4511 for broker-dealer records).", score: 0.92, confidence: "high", method: "vector" },
  { chunkId: "c_103", documentName: "Data Processing Agreement — Vendor X.docx", chunkText: "Clause 8.2(b): The Data Processor shall retain Personal Data only for the duration specified in Schedule 3. Upon termination, the Processor shall delete or return all Personal Data within 30 calendar days, certified in writing.", score: 0.87, confidence: "high", method: "hybrid" },
  { chunkId: "c_301", documentName: "Employee Handbook v3.1.pdf", chunkText: "5.1.4: Employee data retention follows the corporate schedule: payroll records — 7 years, performance reviews — 3 years post-employment, recruitment records (unsuccessful candidates) — 12 months.", score: 0.81, confidence: "medium", method: "bm25" },
  { chunkId: "c_150", documentName: "ISO 27001:2022 Certification Scope.pdf", chunkText: "A.8.3.1 Information classification: All data shall be classified as Public, Internal, Confidential, or Restricted. Retention periods are defined per classification in Appendix B.", score: 0.68, confidence: "medium", method: "vector" },
  { chunkId: "c_055", documentName: "Vendor Risk Assessment Matrix.xlsx", chunkText: "Cell B12: (parse error — table row data could not be extracted. Raw content: 'Vendor retention clause: see contract A-447. Risk: medium.')", score: 0.31, confidence: "low", method: "bm25" }
];

export const demoAnswer: RagAnswer = {
  answer: "Based on the documents in your knowledge base, data retention periods vary by data type and regulatory context. Under the Q2 2026 Compliance Audit Report (Section 4.3), PII retention is limited to 7 years from last business interaction, with FINRA-regulated broker-dealer records potentially extended. The Data Processing Agreement with Vendor X (Clause 8.2b) requires data return or deletion within 30 days of contract termination. Employee data follows the corporate schedule in the Employee Handbook (Section 5.1.4): payroll 7 years, performance reviews 3 years post-employment, recruitment records 12 months. ISO 27001 classification in Appendix B provides additional category-specific retention guidance.",
  citations: [
    { documentName: "Q2 2026 Compliance Audit Report.pdf", chunkPosition: 42, excerpt: "Data retention periods for PII must not exceed 7 years...", score: 0.92, coverage: "direct", verificationNote: "Supports the answer's 7-year PII retention claim." },
    { documentName: "Data Processing Agreement — Vendor X.docx", chunkPosition: 103, excerpt: "The Data Processor shall retain Personal Data only for the duration...", score: 0.87, coverage: "direct", verificationNote: "Supports the 30-day deletion or return obligation after termination." },
    { documentName: "Employee Handbook v3.1.pdf", chunkPosition: 301, excerpt: "Employee data retention follows the corporate schedule...", score: 0.81, coverage: "supporting", verificationNote: "Adds HR-specific retention schedules without driving the primary compliance answer." }
  ],
  confidence: "high", generatedAt: "2026-06-08T15:00:00Z"
};

export const demoSearchHistory: SearchHistoryEntry[] = [
  { id: "sh_1", query: "data retention policy for PII", resultCount: 4, topScore: 0.92, searchedAt: "2026-06-08T15:00:00Z" },
  { id: "sh_2", query: "vendor data deletion after contract end", resultCount: 3, topScore: 0.87, searchedAt: "2026-06-08T14:45:00Z" },
  { id: "sh_3", query: "ISO 27001 retention schedule", resultCount: 2, topScore: 0.68, searchedAt: "2026-06-08T14:30:00Z" },
  { id: "sh_4", query: "how long should we keep employee HR files", resultCount: 3, topScore: 0.81, searchedAt: "2026-06-08T14:10:00Z" },
  { id: "sh_5", query: "GDPR right to erasure vs retention requirements", resultCount: 1, topScore: 0.55, searchedAt: "2026-06-08T13:50:00Z" }
];

export const demoIngestionStatus: IngestionStatus = {
  workspaceId: "ws_legal", totalDocuments: 47, totalChunks: 1423,
  avgParseQuality: 79, lastIngestedAt: "2026-06-07T11:00:00Z",
  staleThresholdDays: 90, staleDocumentCount: 3,
  sourceModifiedAfterIngestionCount: 1
};

export const demoSnapshot: RagSnapshot = {
  workspace: demoWorkspace,
  members: demoMembers,
  documents: demoDocuments,
  searchResults: mockSearchResults,
  answer: demoAnswer,
  searchHistory: demoSearchHistory,
  ingestionStatus: demoIngestionStatus,
  parserResults: demoParserResults
};
