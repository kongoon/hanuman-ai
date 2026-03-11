/**
 * Hanuman Nightly MCP Server
 *
 * Slim entry point: server lifecycle, tool registration, and routing.
 * Handler implementations live in src/tools/.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { type BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './db/schema.ts';
import { createDatabase } from './db/index.ts';
import { createVectorStore } from './vector/factory.ts';
import type { VectorStoreAdapter } from './vector/types.ts';
import path from 'path';
import fs from 'fs';

// Tool handlers (all extracted to src/tools/)
import type { ToolContext } from './tools/types.ts';
import {
  searchToolDef, handleSearch,
  learnToolDef, handleLearn,
  reflectToolDef, handleReflect,
  listToolDef, handleList,
  statsToolDef, handleStats,
  conceptsToolDef, handleConcepts,
  supersedeToolDef, handleSupersede,
  handoffToolDef, handleHandoff,
  inboxToolDef, handleInbox,
  verifyToolDef, handleVerify,
  scheduleAddToolDef, handleScheduleAdd,
  scheduleListToolDef, handleScheduleList,
  readToolDef, handleRead,
  forumToolDefs,
  handleThread, handleThreads, handleThreadRead, handleThreadUpdate,
  traceToolDefs,
  handleTrace, handleTraceList, handleTraceGet, handleTraceLink, handleTraceUnlink, handleTraceChain,
} from './tools/index.ts';

import type {
  HanumanSearchInput,
  HanumanLearnInput,
  HanumanListInput,
  HanumanStatsInput,
  HanumanConceptsInput,
  HanumanReflectInput,
  HanumanSupersededInput,
  HanumanHandoffInput,
  HanumanInboxInput,
  HanumanVerifyInput,
  HanumanScheduleAddInput,
  HanumanScheduleListInput,
  HanumanReadInput,
  HanumanThreadInput,
  HanumanThreadsInput,
  HanumanThreadReadInput,
  HanumanThreadUpdateInput,
} from './tools/index.ts';

import type {
  CreateTraceInput,
  ListTracesInput,
  GetTraceInput,
} from './trace/types.ts';

// Write tools that should be disabled in read-only mode
const WRITE_TOOLS = [
  'hanuman_learn',
  'hanuman_thread',
  'hanuman_thread_update',
  'hanuman_trace',
  'hanuman_supersede',
  'hanuman_handoff',
  'hanuman_schedule_add',
];

class HanumanMCPServer {
  private server: Server;
  private sqlite: Database;
  private db: BunSQLiteDatabase<typeof schema>;
  private repoRoot: string;
  private vectorStore: VectorStoreAdapter;
  private vectorStatus: 'unknown' | 'connected' | 'unavailable' = 'unknown';
  private readOnly: boolean;
  private version: string;

  constructor(options: { readOnly?: boolean } = {}) {
    this.readOnly = options.readOnly ?? false;
    if (this.readOnly) {
      console.error('[Hanuman] Running in READ-ONLY mode');
    }
    this.repoRoot = process.env.HANUMAN_REPO_ROOT || process.cwd();

    const homeDir = process.env.HOME || process.env.USERPROFILE || '/tmp';

    this.vectorStore = createVectorStore({
      dataPath: path.join(homeDir, '.chromadb'),
    });

    const pkg = JSON.parse(fs.readFileSync(path.join(import.meta.dirname || __dirname, '..', 'package.json'), 'utf-8'));
    this.version = pkg.version;
    this.server = new Server(
      { name: 'hanuman-nightly', version: this.version },
      { capabilities: { tools: {} } }
    );

    const hanumanDataDir = process.env.HANUMAN_DATA_DIR || path.join(homeDir, '.hanuman');
    const dbPath = process.env.HANUMAN_DB_PATH || path.join(hanumanDataDir, 'hanuman.db');
    const { sqlite, db } = createDatabase(dbPath);
    this.sqlite = sqlite;
    this.db = db;

    this.setupHandlers();
    this.setupErrorHandling();
    this.verifyVectorHealth();
  }

  /** Build ToolContext from server state */
  private get toolCtx(): ToolContext {
    return {
      db: this.db,
      sqlite: this.sqlite,
      repoRoot: this.repoRoot,
      vectorStore: this.vectorStore,
      vectorStatus: this.vectorStatus,
      version: this.version,
    };
  }

  private async verifyVectorHealth(): Promise<void> {
    try {
      const stats = await this.vectorStore.getStats();
      if (stats.count > 0) {
        this.vectorStatus = 'connected';
        console.error(`[VectorDB:${this.vectorStore.name}] ✓ hanuman_knowledge: ${stats.count} documents`);
      } else {
        this.vectorStatus = 'connected';
        console.error(`[VectorDB:${this.vectorStore.name}] ✓ Connected but collection empty`);
      }
    } catch (e) {
      this.vectorStatus = 'unavailable';
      console.error(`[VectorDB:${this.vectorStore.name}] ✗ Cannot connect:`, e instanceof Error ? e.message : String(e));
    }
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.cleanup();
      process.exit(0);
    });
  }

  private async cleanup(): Promise<void> {
    this.sqlite.close();
    await this.vectorStore.close();
  }

  private setupHandlers(): void {
    // ================================================================
    // List available tools
    // ================================================================
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const allTools = [
        // Meta-documentation tool
        {
          name: '____IMPORTANT',
          description: `HANUMAN WORKFLOW GUIDE (v${this.version}):\n\n1. SEARCH & DISCOVER\n   hanuman_search(query) → Find knowledge by keywords/vectors\n   hanuman_read(file/id) → Read full document content\n   hanuman_list() → Browse all documents\n   hanuman_concepts() → See topic coverage\n\n2. REFLECT\n   hanuman_reflect() → Random wisdom for alignment\n\n3. LEARN & REMEMBER\n   hanuman_learn(pattern) → Add new patterns/learnings\n   hanuman_thread(message) → Multi-turn discussions\n   ⚠️ BEFORE adding: search for similar topics first!\n   If updating old info → use hanuman_supersede(oldId, newId)\n\n4. TRACE & DISTILL\n   hanuman_trace(query) → Log discovery sessions with dig points\n   hanuman_trace_list() → Find past traces\n   hanuman_trace_get(id) → Explore dig points (files, commits, issues)\n   hanuman_trace_link(prevId, nextId) → Chain related traces together\n   hanuman_trace_chain(id) → View the full linked chain\n\n5. HANDOFF & INBOX\n   hanuman_handoff(content) → Save session context for next session\n   hanuman_inbox() → List pending handoffs\n\n6. SCHEDULE (shared across all Hanumans)\n   hanuman_schedule_add(date, event) → Add appointment to shared schedule\n   hanuman_schedule_list(filter?) → View upcoming events\n   Schedule lives at ~/.hanuman/ψ/inbox/schedule.md (per-human, not per-project)\n\n7. SUPERSEDE (when info changes)\n   hanuman_supersede(oldId, newId, reason) → Mark old doc as outdated\n   "Nothing is Deleted" — old preserved, just marked superseded\n\n7. VERIFY (health check)\n   hanuman_verify(check?) → Compare ψ/ files vs DB index\n   check=true (default): read-only report\n   check=false: also flag orphaned entries\n\nPhilosophy: "Nothing is Deleted" — All interactions logged.`,
          inputSchema: { type: 'object', properties: {} }
        },
        // Core tools (from src/tools/)
        searchToolDef,
        readToolDef,
        reflectToolDef,
        learnToolDef,
        listToolDef,
        statsToolDef,
        conceptsToolDef,
        // Forum tools (from src/tools/forum.ts)
        ...forumToolDefs,
        // Trace tools (from src/tools/trace.ts)
        ...traceToolDefs,
        // Supersede, Handoff, Inbox, Verify
        supersedeToolDef,
        handoffToolDef,
        inboxToolDef,
        verifyToolDef,
        scheduleAddToolDef,
        scheduleListToolDef,
      ];

      const tools = this.readOnly
        ? allTools.filter(t => !WRITE_TOOLS.includes(t.name))
        : allTools;

      return { tools };
    });

    // ================================================================
    // Handle tool calls — route to extracted handlers
    // ================================================================
    this.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<any> => {
      if (this.readOnly && WRITE_TOOLS.includes(request.params.name)) {
        return {
          content: [{
            type: 'text',
            text: `Error: Tool "${request.params.name}" is disabled in read-only mode. This Hanuman instance is configured for read-only access.`
          }],
          isError: true
        };
      }

      const ctx = this.toolCtx;

      try {
        switch (request.params.name) {
          // Core tools (delegated to src/tools/)
          case 'hanuman_search':
            return await handleSearch(ctx, request.params.arguments as unknown as HanumanSearchInput);
          case 'hanuman_read':
            return await handleRead(ctx, request.params.arguments as unknown as HanumanReadInput);
          case 'hanuman_reflect':
            return await handleReflect(ctx, request.params.arguments as unknown as HanumanReflectInput);
          case 'hanuman_learn':
            return await handleLearn(ctx, request.params.arguments as unknown as HanumanLearnInput);
          case 'hanuman_list':
            return await handleList(ctx, request.params.arguments as unknown as HanumanListInput);
          case 'hanuman_stats':
            return await handleStats(ctx, request.params.arguments as unknown as HanumanStatsInput);
          case 'hanuman_concepts':
            return await handleConcepts(ctx, request.params.arguments as unknown as HanumanConceptsInput);
          case 'hanuman_supersede':
            return await handleSupersede(ctx, request.params.arguments as unknown as HanumanSupersededInput);
          case 'hanuman_handoff':
            return await handleHandoff(ctx, request.params.arguments as unknown as HanumanHandoffInput);
          case 'hanuman_inbox':
            return await handleInbox(ctx, request.params.arguments as unknown as HanumanInboxInput);
          case 'hanuman_verify':
            return await handleVerify(ctx, request.params.arguments as unknown as HanumanVerifyInput);
          case 'hanuman_schedule_add':
            return await handleScheduleAdd(ctx, request.params.arguments as unknown as HanumanScheduleAddInput);
          case 'hanuman_schedule_list':
            return await handleScheduleList(ctx, request.params.arguments as unknown as HanumanScheduleListInput);

          // Forum tools (delegated to src/tools/forum.ts)
          case 'hanuman_thread':
            return await handleThread(request.params.arguments as unknown as HanumanThreadInput);
          case 'hanuman_threads':
            return await handleThreads(request.params.arguments as unknown as HanumanThreadsInput);
          case 'hanuman_thread_read':
            return await handleThreadRead(request.params.arguments as unknown as HanumanThreadReadInput);
          case 'hanuman_thread_update':
            return await handleThreadUpdate(request.params.arguments as unknown as HanumanThreadUpdateInput);

          // Trace tools (delegated to src/tools/trace.ts)
          case 'hanuman_trace':
            return await handleTrace(request.params.arguments as unknown as CreateTraceInput);
          case 'hanuman_trace_list':
            return await handleTraceList(request.params.arguments as unknown as ListTracesInput);
          case 'hanuman_trace_get':
            return await handleTraceGet(request.params.arguments as unknown as GetTraceInput);
          case 'hanuman_trace_link':
            return await handleTraceLink(request.params.arguments as unknown as { prevTraceId: string; nextTraceId: string });
          case 'hanuman_trace_unlink':
            return await handleTraceUnlink(request.params.arguments as unknown as { traceId: string; direction: 'prev' | 'next' });
          case 'hanuman_trace_chain':
            return await handleTraceChain(request.params.arguments as unknown as { traceId: string });

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    });
  }

  async preConnectVector(): Promise<void> {
    await this.vectorStore.connect();
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Hanuman Nightly MCP Server running on stdio (FTS5 mode)');
  }
}

async function main() {
  const readOnly = process.env.HANUMAN_READ_ONLY === 'true' || process.argv.includes('--read-only');
  const server = new HanumanMCPServer({ readOnly });

  try {
    console.error('[Startup] Pre-connecting to vector store...');
    await server.preConnectVector();
    console.error('[Startup] Vector store pre-connected successfully');
  } catch (e) {
    console.error('[Startup] Vector store pre-connect failed:', e instanceof Error ? e.message : e);
  }

  await server.run();
}

main().catch(console.error);
