/**
 * Hanuman v2 Type Definitions
 * Following claude-mem patterns for granular vector documents
 */

export type HanumanDocumentType = 'principle' | 'pattern' | 'learning' | 'retro';

/**
 * Granular document stored in vector DB
 * Following claude-mem's pattern of splitting large documents into smaller chunks
 */
export interface HanumanDocument {
  id: string;           // e.g., "resonance_hanuman_principle_1"
  type: HanumanDocumentType;
  source_file: string;  // Relative path from repo root
  content: string;      // The actual text to embed
  concepts: string[];   // Tags for filtering: ['trust', 'patterns', 'mirror']
  created_at: number;   // Unix timestamp
  updated_at: number;   // Unix timestamp
  project?: string | null; // Source project (null = universal, undefined = inherit)
}

/**
 * Metadata stored in SQLite (source of truth)
 */
export interface HanumanMetadata {
  id: string;
  type: HanumanDocumentType;
  source_file: string;
  concepts: string;     // JSON array as string
  created_at: number;
  updated_at: number;
  indexed_at: number;   // When this was indexed
}

/**
 * Search result from hybrid search
 */
export interface SearchResult {
  document: HanumanDocument;
  score: number;        // Relevance score from vector search
  source: 'vector' | 'fts' | 'hybrid';
}

/**
 * Tool input schemas
 */
export interface HanumanSearchInput {
  query: string;
  type?: HanumanDocumentType | 'all';
  limit?: number;
}

export interface HanumanConsultInput {
  decision: string;
  context?: string;
}

export interface HanumanReflectInput {
  // No parameters - returns random wisdom
}

/**
 * hanuman_list input - browse documents without search query
 */
export interface HanumanListInput {
  type?: HanumanDocumentType | 'all';
  limit?: number;
  offset?: number;
}

/**
 * Tool output types
 */
export interface HanumanSearchOutput {
  results: SearchResult[];
  total: number;
}

export interface HanumanConsultOutput {
  principles: SearchResult[];
  patterns: SearchResult[];
  guidance: string;
}

export interface HanumanReflectOutput {
  principle: HanumanDocument;
}

/**
 * hanuman_list output - paginated document list
 */
export interface HanumanListOutput {
  documents: Array<{
    id: string;
    type: HanumanDocumentType;
    title: string;
    content: string;
    source_file: string;
    concepts: string[];
    indexed_at: number;
  }>;
  total: number;
  limit: number;
  offset: number;
  type: string;
}

/**
 * Hybrid search options for combining FTS and vector results
 */
export interface HybridSearchOptions {
  ftsWeight?: number;     // Weight for FTS results (default 0.5)
  vectorWeight?: number;  // Weight for vector results (default 0.5)
}

/**
 * Indexer configuration
 */
export interface IndexerConfig {
  repoRoot: string;
  dbPath: string;
  chromaPath: string;
  sourcePaths: {
    resonance: string;
    learnings: string;
    retrospectives: string;
  };
}
