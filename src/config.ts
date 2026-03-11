/**
 * Hanuman v2 Configuration Constants
 *
 * Pure config — no DB connections, no table creation.
 * Extracted from src/server/db.ts to break circular dependencies.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES Module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root (parent of src/)
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Configuration
export const PORT = parseInt(String(process.env.HANUMAN_PORT || 47778), 10);
export const HOME_DIR = process.env.HOME || process.env.USERPROFILE || '/tmp';
export const HANUMAN_DATA_DIR = process.env.HANUMAN_DATA_DIR || path.join(HOME_DIR, '.hanuman');
export const DB_PATH = process.env.HANUMAN_DB_PATH || path.join(HANUMAN_DATA_DIR, 'hanuman.db');
// REPO_ROOT for features that need knowledge base context
// When running from source: defaults to project root (where ψ/ lives)
// When running via bunx: set HANUMAN_REPO_ROOT explicitly
// Fallback: ~/.hanuman for bunx installs
export const REPO_ROOT = process.env.HANUMAN_REPO_ROOT ||
  (fs.existsSync(path.join(PROJECT_ROOT, 'ψ')) ? PROJECT_ROOT : HANUMAN_DATA_DIR);

// Ensure data directory exists (for fresh installs via bunx)
if (!fs.existsSync(HANUMAN_DATA_DIR)) {
  fs.mkdirSync(HANUMAN_DATA_DIR, { recursive: true });
}
