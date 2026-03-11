/**
 * Hanuman Forum Types
 *
 * DB-first discussion threads with GitHub Issue mirroring.
 * Hanuman auto-answers from knowledge base, logs unanswered for later.
 */

// ============================================================================
// Thread & Message Types (DB-first)
// ============================================================================

export type ThreadStatus = 'active' | 'answered' | 'pending' | 'closed';
export type MessageRole = 'human' | 'hanuman' | 'claude';

export interface ForumThread {
  id: number;
  title: string;
  createdBy: string;
  status: ThreadStatus;
  issueUrl?: string;      // GitHub mirror (optional)
  issueNumber?: number;
  project?: string;       // Which project context
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;      // Last GitHub sync
}

export interface ForumMessage {
  id: number;
  threadId: number;
  role: MessageRole;
  content: string;
  author?: string;        // GitHub username or "hanuman"

  // Hanuman response metadata
  principlesFound?: number;
  patternsFound?: number;
  searchQuery?: string;

  // GitHub mirror
  commentId?: number;     // GitHub comment ID if synced

  createdAt: number;
}

// ============================================================================
// GitHub URL Utilities
// ============================================================================

export interface ParsedIssueUrl {
  owner: string;
  repo: string;
  issueNumber: number;
  url: string;
}

export function parseIssueUrl(url: string): ParsedIssueUrl | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
    issueNumber: parseInt(match[3], 10),
    url
  };
}

export function buildIssueUrl(owner: string, repo: string, issueNumber: number): string {
  return `https://github.com/${owner}/${repo}/issues/${issueNumber}`;
}

// ============================================================================
// MCP Tool Interfaces
// ============================================================================

// Start new thread or add to existing
export interface HanumanThreadInput {
  message: string;
  threadId?: number;      // If continuing existing thread
  title?: string;         // For new threads
  role?: MessageRole;     // Default: 'human'
  model?: string;         // e.g., 'opus', 'sonnet' for Claude calls
}

export interface HanumanThreadOutput {
  threadId: number;
  messageId: number;
  hanumanResponse?: {
    content: string;
    principlesFound: number;
    patternsFound: number;
  };
  status: ThreadStatus;
  issueUrl?: string;
}

// Sync thread to GitHub Issue
export interface HanumanSyncInput {
  threadId: number;
  createIssue?: boolean;  // Create new issue if not exists
}

export interface HanumanSyncOutput {
  synced: boolean;
  issueUrl?: string;
  messagesSync: number;
}

// List threads
export interface HanumanListThreadsInput {
  status?: ThreadStatus;
  limit?: number;
  offset?: number;
}

export interface HanumanListThreadsOutput {
  threads: Array<{
    id: number;
    title: string;
    status: ThreadStatus;
    messageCount: number;
    lastMessage: string;
    createdAt: string;
    issueUrl?: string;
  }>;
  total: number;
}

// ============================================================================
// Configuration
// ============================================================================

export interface ForumConfig {
  defaultRepo: string;
  autoAnswer: boolean;      // Hanuman auto-responds to questions
  autoSync: boolean;        // Auto-sync to GitHub
  labels: {
    question: string;
    answered: string;
    pending: string;
  };
}

export const DEFAULT_FORUM_CONFIG: ForumConfig = {
  defaultRepo: process.env.HANUMAN_FORUM_REPO || 'laris-co/Nat-s-Agents',
  autoAnswer: true,
  autoSync: false,  // Manual sync by default
  labels: {
    question: 'hanuman-thread',
    answered: 'hanuman-answered',
    pending: 'hanuman-pending'
  }
};
