/**
 * Hanuman Reflect Handler
 *
 * Return random wisdom from the knowledge base.
 */

import { sql, inArray } from 'drizzle-orm';
import { hanumanDocuments } from '../db/schema.ts';
import type { ToolContext, ToolResponse, HanumanReflectInput } from './types.ts';

export const reflectToolDef = {
  name: 'hanuman_reflect',
  description: 'Get a random principle or learning for reflection. Use this for periodic wisdom or to align with Hanuman philosophy.',
  inputSchema: {
    type: 'object',
    properties: {}
  }
};

export async function handleReflect(ctx: ToolContext, _input: HanumanReflectInput): Promise<ToolResponse> {
  const randomDoc = ctx.db.select({
    id: hanumanDocuments.id,
    type: hanumanDocuments.type,
    sourceFile: hanumanDocuments.sourceFile,
    concepts: hanumanDocuments.concepts,
  })
    .from(hanumanDocuments)
    .where(inArray(hanumanDocuments.type, ['principle', 'learning']))
    .orderBy(sql`RANDOM()`)
    .limit(1)
    .get();

  if (!randomDoc) {
    throw new Error('No documents found in Hanuman knowledge base');
  }

  const content = ctx.sqlite.prepare(`
    SELECT content FROM hanuman_fts WHERE id = ?
  `).get(randomDoc.id) as { content: string } | undefined;

  if (!content) {
    throw new Error('Document content not found in FTS index');
  }

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        principle: {
          id: randomDoc.id,
          type: randomDoc.type,
          content: content.content,
          source_file: randomDoc.sourceFile,
          concepts: JSON.parse(randomDoc.concepts || '[]')
        }
      }, null, 2)
    }]
  };
}
