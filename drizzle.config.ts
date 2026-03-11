import { defineConfig } from 'drizzle-kit';
import path from 'path';

// Default to ~/.hanuman/hanuman.db (same as server)
const HANUMAN_DATA_DIR = process.env.HANUMAN_DATA_DIR ||
  path.join(process.env.HOME || '/tmp', '.hanuman');
const DB_PATH = process.env.HANUMAN_DB_PATH || path.join(HANUMAN_DATA_DIR, 'hanuman.db');

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: DB_PATH,
  },
  // Tables managed by Drizzle (excludes FTS5 internal tables)
  tablesFilter: [
    'hanuman_documents',
    'indexing_status',
    'search_log',
    'consult_log',
    'learn_log',
    'document_access',
    'forum_threads',
    'forum_messages',
    'decisions',
    'trace_log',      // Issue #17
    'supersede_log',  // Issue #18
    'activity_log',   // User activity tracking
    'settings',       // Auth & app settings
    'schedule',       // Appointments & events
  ],
});
