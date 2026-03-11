/**
 * Shared types for Hanuman tool handlers
 */

import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import type { Database } from 'bun:sqlite';
import type * as schema from '../db/schema.ts';
import type { VectorStoreAdapter } from '../vector/types.ts';

/**
 * Context object passed to all tool handlers.
 * Replaces `this` references from the old class methods.
 */
export interface ToolContext {
  db: BunSQLiteDatabase<typeof schema>;
  sqlite: Database;
  repoRoot: string;
  vectorStore: VectorStoreAdapter;
  vectorStatus: 'unknown' | 'connected' | 'unavailable';
  version: string;
}

export interface ToolResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

// ============================================================================
// Input interfaces (moved from index.ts)
// ============================================================================

export interface HanumanSearchInput {
  query: string;
  type?: 'principle' | 'pattern' | 'learning' | 'retro' | 'all';
  limit?: number;
  offset?: number;
  mode?: 'hybrid' | 'fts' | 'vector';
  project?: string;
  cwd?: string;
  model?: 'nomic' | 'qwen3' | 'bge-m3';
}

export interface HanumanReflectInput {}

export interface HanumanLearnInput {
  pattern: string;
  source?: string;
  concepts?: string[];
  project?: string;
}

export interface HanumanListInput {
  type?: 'principle' | 'pattern' | 'learning' | 'retro' | 'all';
  limit?: number;
  offset?: number;
}

export interface HanumanStatsInput {}

export interface HanumanConceptsInput {
  limit?: number;
  type?: 'principle' | 'pattern' | 'learning' | 'retro' | 'all';
}

export interface HanumanSupersededInput {
  oldId: string;
  newId: string;
  reason?: string;
}

export interface HanumanHandoffInput {
  content: string;
  slug?: string;
}

export interface HanumanInboxInput {
  limit?: number;
  offset?: number;
  type?: 'handoff' | 'all';
}

export interface HanumanVerifyInput {
  check?: boolean;
  type?: string;
}

export interface HanumanScheduleAddInput {
  date: string;
  event: string;
  time?: string;
  notes?: string;
  recurring?: 'daily' | 'weekly' | 'monthly';
}

export interface HanumanScheduleListInput {
  date?: string;
  from?: string;
  to?: string;
  filter?: string;
  status?: 'pending' | 'done' | 'cancelled' | 'all';
  limit?: number;
}

export interface HanumanReadInput {
  file?: string;
  id?: string;
}
