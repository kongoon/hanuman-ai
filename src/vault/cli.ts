#!/usr/bin/env bun
/**
 * Hanuman Vault CLI
 *
 * Global CLI for managing the Hanuman knowledge vault.
 * Can be run from any repo after `bun add -g @laris-co/hanuman-ai`.
 *
 * Usage:
 *   hanuman-vault init <owner/repo>
 *   hanuman-vault sync [--dry-run]
 *   hanuman-vault pull
 *   hanuman-vault status
 *   hanuman-vault migrate [--dry-run | --list]
 *   hanuman-vault --help | -h
 *   hanuman-vault --version | -v
 */

import { initVault, syncVault, pullVault, vaultStatus } from './handler.ts';
import { findPsiRepos, migrate } from './migrate.ts';
import { detectProject } from '../server/project-detect.ts';
import path from 'path';

const VERSION = '0.4.0-nightly';

const HELP = `
hanuman-vault v${VERSION} — Central knowledge brain for Hanuman

The vault repo IS your central ψ/. Once initialized, hanuman_learn and
hanuman_handoff write directly to the vault repo with project-nested paths.
The indexer scans the vault repo for cross-project search. Sync commits
and pushes to GitHub for backup.

Usage:
  hanuman-vault <command> [options]

Commands:
  init <owner/repo>    Initialize vault with a GitHub repo (cloned via ghq)
  sync [--dry-run]     Commit + push vault repo to GitHub (backup)
  pull                 Pull vault files into the local ψ/
  status               Show vault configuration and pending changes
  migrate [options]    Seed vault repo from all ghq repos with ψ/ directories
    --dry-run            Preview what would be copied
    --list               List repos with ψ/ directories (shows symlink status)
    --symlink            After copying, replace local ψ/ with symlink to vault

Options:
  -h, --help           Show this help message
  -v, --version        Show version

Environment:
  HANUMAN_REPO_ROOT     Override the repo root (default: cwd)

How it works:
  1. hanuman-vault init <repo>   Clone vault repo via ghq, save to settings
  2. hanuman_learn / handoff     Write directly to vault repo (project-nested)
  3. bun src/indexer.ts          Scan vault repo, index all projects
  4. hanuman_search               Cross-project search results
  5. hanuman-vault sync           git add + commit + push (backup)

Examples:
  hanuman-vault init Soul-Brews-Studio/hanuman-vault
  hanuman-vault migrate --list
  hanuman-vault migrate
  hanuman-vault sync
  hanuman-vault status
`.trim();

const repoRoot = process.env.HANUMAN_REPO_ROOT || process.cwd();
const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'init': {
    const repo = args[0];
    if (!repo) {
      console.error('Usage: hanuman-vault init <owner/repo>');
      process.exit(1);
    }
    const result = initVault(repo);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'sync': {
    const dryRun = args.includes('--dry-run');
    const result = syncVault({ dryRun, repoRoot });
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'pull': {
    const result = pullVault({ repoRoot });
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'status': {
    const result = vaultStatus(repoRoot);
    console.log(JSON.stringify(result, null, 2));
    break;
  }

  case 'migrate': {
    if (args.includes('--list')) {
      const fs = await import('fs');
      const repos = findPsiRepos();
      console.log(`Found ${repos.length} repos with ψ/ directories:\n`);
      for (const { repoPath, psiDir } of repos) {
        const project = detectProject(repoPath) ?? '(unknown)';
        const isSymlink = fs.lstatSync(psiDir).isSymbolicLink();
        if (isSymlink) {
          console.log(`  ${project} ✓ symlinked`);
        } else {
          let count = 0;
          const walk = (dir: string) => {
            if (!fs.existsSync(dir)) return;
            for (const item of fs.readdirSync(dir)) {
              const full = path.join(dir, item);
              const stat = fs.lstatSync(full);
              if (stat.isSymbolicLink()) continue;
              if (stat.isDirectory()) walk(full);
              else count++;
            }
          };
          walk(psiDir);
          console.log(`  ${project} (${count} files) ← local`);
        }
        console.log(`    ${repoPath}`);
      }
    } else {
      const dryRun = args.includes('--dry-run');
      const symlink = args.includes('--symlink');
      if (dryRun) console.error('[Vault] DRY RUN — no files will be copied\n');
      if (symlink) console.error('[Vault] SYMLINK MODE — local ψ/ will be replaced with symlinks\n');
      const result = migrate({ dryRun, symlink });
      console.log(JSON.stringify(result, null, 2));
    }
    break;
  }

  case '-h':
  case '--help':
  case 'help':
    console.log(HELP);
    break;

  case '-v':
  case '--version':
  case 'version':
    console.log(`hanuman-vault v${VERSION}`);
    break;

  case undefined:
    console.log(HELP);
    break;

  default:
    console.error(`Unknown command: ${command}\n`);
    console.error(HELP);
    process.exit(1);
}
