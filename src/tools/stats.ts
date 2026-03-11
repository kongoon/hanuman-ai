/**
 * Hanuman Stats Handler
 *
 * Knowledge base statistics and health status.
 */

import { sql, and, ne, isNotNull } from 'drizzle-orm';
import { hanumanDocuments } from '../db/schema.ts';
import type { ToolContext, ToolResponse, HanumanStatsInput } from './types.ts';

export const statsToolDef = {
  name: 'hanuman_stats',
  description: 'Get Hanuman knowledge base statistics and health status. Returns document counts by type, indexing status, and ChromaDB connection status.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function handleStats(ctx: ToolContext, _input: HanumanStatsInput): Promise<ToolResponse> {
  const typeCounts = ctx.db.select({
    type: hanumanDocuments.type,
    count: sql<number>`count(*)`,
  })
    .from(hanumanDocuments)
    .groupBy(hanumanDocuments.type)
    .all();

  const byType: Record<string, number> = {};
  let totalDocs = 0;
  for (const row of typeCounts) {
    byType[row.type] = row.count;
    totalDocs += row.count;
  }

  const ftsCount = ctx.sqlite.prepare('SELECT COUNT(*) as count FROM hanuman_fts').get() as { count: number };

  const lastIndexed = ctx.db.select({
    lastIndexed: sql<number | null>`MAX(indexed_at)`,
  }).from(hanumanDocuments).get();

  const conceptsResult = ctx.db.select({
    concepts: hanumanDocuments.concepts,
  })
    .from(hanumanDocuments)
    .where(and(isNotNull(hanumanDocuments.concepts), ne(hanumanDocuments.concepts, '[]')))
    .all();

  const uniqueConcepts = new Set<string>();
  for (const row of conceptsResult) {
    try {
      const concepts = JSON.parse(row.concepts);
      if (Array.isArray(concepts)) {
        concepts.forEach((c: string) => uniqueConcepts.add(c));
      }
    } catch {
      // Ignore parse errors
    }
  }

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        total_documents: totalDocs,
        by_type: byType,
        fts_indexed: ftsCount.count,
        unique_concepts: uniqueConcepts.size,
        last_indexed: lastIndexed?.lastIndexed
          ? new Date(lastIndexed.lastIndexed).toISOString()
          : null,
        vector_status: ctx.vectorStatus,
        fts_status: ftsCount.count > 0 ? 'healthy' : 'empty',
        version: ctx.version,
      }, null, 2)
    }]
  };
}
