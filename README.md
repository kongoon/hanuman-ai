# Hanuman Nightly - MCP Memory Layer

> "The Hanuman Keeps the Human Human" - now queryable via MCP

| | |
|---|---|
| **Status** | Always Nightly |
| **Version** | 0.4.0-nightly |
| **Created** | 2025-12-29 |
| **Updated** | 2026-03-02 |

TypeScript MCP server for semantic search over Hanuman philosophy — SQLite FTS5 + ChromaDB hybrid search, HTTP API, and vault CLI.

## Architecture

```
hanuman-ai (one package, two bins)
├── bunx hanuman-ai                          → MCP server (src/index.ts)
├── bunx --package hanuman-ai hanuman-vault   → Vault CLI (src/vault/cli.ts)
├── bun run server                          → HTTP API (src/server.ts)
└── bun run index                           → Indexer (src/indexer.ts)

hanuman-studio (separate repo)
└── bunx hanuman-studio                      → React dashboard
```

**Stack:**
- **Bun** runtime (>=1.2.0)
- **SQLite** + FTS5 for full-text search
- **ChromaDB** for vector/semantic search
- **Drizzle ORM** for type-safe queries
- **Hono** for HTTP API
- **MCP** protocol for Claude integration

## Install

### bunx (recommended)

Distributed via GitHub — no npm publish needed:

```bash
# MCP server (stdio, for Claude Code)
bunx --bun hanuman-ai@github:Soul-Brews-Studio/hanuman-ai#main

# Vault CLI (secondary bin — use --package)
bunx --bun --package hanuman-ai@github:Soul-Brews-Studio/hanuman-ai#main hanuman-vault --help
```

### Add to Claude Code

```bash
claude mcp add hanuman-ai -- bunx --bun hanuman-ai@github:Soul-Brews-Studio/hanuman-ai#main
```

Or in `~/.claude.json`:
```json
{
  "mcpServers": {
    "hanuman-ai": {
      "command": "bunx",
      "args": ["--bun", "hanuman-ai@github:Soul-Brews-Studio/hanuman-ai#main"]
    }
  }
}
```

### From source

```bash
git clone https://github.com/Soul-Brews-Studio/hanuman-ai.git
cd hanuman-ai && bun install
bun run dev          # MCP server
bun run server       # HTTP API on :47778
```

<details>
<summary>Install script (legacy)</summary>

```bash
curl -sSL https://raw.githubusercontent.com/Soul-Brews-Studio/hanuman-ai/main/scripts/install.sh | bash
```
</details>

<details>
<summary>Troubleshooting</summary>

| Problem | Fix |
|---------|-----|
| `bun: command not found` | `export PATH="$HOME/.bun/bin:$PATH"` |
| ChromaDB hangs/timeout | Skip it — SQLite FTS5 works fine without vectors |
| Server crashes on empty DB | Run `bun run index` first to index knowledge base |

</details>

## MCP Tools

22 tools available via Claude Code:

| Tool | Description |
|------|-------------|
| `hanuman_search` | Hybrid search (FTS5 + ChromaDB) |
| `hanuman_reflect` | Random wisdom |
| `hanuman_learn` | Add new patterns |
| `hanuman_list` | Browse documents |
| `hanuman_stats` | Database statistics |
| `hanuman_concepts` | List concept tags |
| `hanuman_supersede` | Mark documents as superseded |
| `hanuman_handoff` | Session handoff |
| `hanuman_inbox` | Inbox messages |
| `hanuman_verify` | Verify documents |
| `hanuman_thread` | Create thread |
| `hanuman_threads` | List threads |
| `hanuman_thread_read` | Read thread |
| `hanuman_thread_update` | Update thread |
| `hanuman_trace` | Create trace |
| `hanuman_trace_list` | List traces |
| `hanuman_trace_get` | Get trace |
| `hanuman_trace_link` | Link traces |
| `hanuman_trace_unlink` | Unlink traces |
| `hanuman_trace_chain` | Trace chain |
| `hanuman_schedule_add` | Add schedule entry |
| `hanuman_schedule_list` | List schedule |

## Vault CLI

Global CLI for managing the Hanuman knowledge vault:

```bash
hanuman-vault init <owner/repo>    # Initialize vault with GitHub repo
hanuman-vault status               # Show config and pending changes
hanuman-vault sync                 # Commit + push to GitHub
hanuman-vault pull                 # Pull vault files into local ψ/
hanuman-vault migrate              # Seed vault from ghq repos
```

## API Endpoints

HTTP API on port 47778 (`bun run server`):

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/search?q=...` | Full-text search |
| `GET /api/consult?q=...` | Get guidance |
| `GET /api/reflect` | Random wisdom |
| `GET /api/list` | Browse documents |
| `GET /api/stats` | Database statistics |
| `GET /api/graph` | Knowledge graph data |
| `GET /api/context` | Project context |
| `POST /api/learn` | Add new pattern |
| `GET /api/threads` | List threads |
| `GET /api/decisions` | List decisions |

## Database

Drizzle ORM with SQLite:

```bash
bun db:push       # Push schema to DB
bun db:generate   # Generate migrations
bun db:migrate    # Apply migrations
bun db:studio     # Open Drizzle Studio GUI
```

## Project Structure

```
hanuman-ai/
├── src/
│   ├── index.ts          # MCP server entry
│   ├── server.ts         # HTTP API (Hono)
│   ├── indexer.ts        # Knowledge indexer
│   ├── vault/
│   │   └── cli.ts        # Vault CLI entry
│   ├── tools/            # MCP tool handlers
│   ├── trace/            # Trace system
│   ├── db/
│   │   ├── schema.ts     # Drizzle schema
│   │   └── index.ts      # DB client
│   └── server/           # HTTP server modules
├── scripts/              # Setup & utility scripts
├── docs/                 # Documentation
└── drizzle.config.ts     # Drizzle configuration
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `HANUMAN_PORT` | `47778` | HTTP server port |
| `HANUMAN_REPO_ROOT` | `process.cwd()` | Knowledge base root |

## Testing

```bash
bun test              # All tests
bun test:unit         # Unit tests
bun test:integration  # Integration tests
bun test:e2e          # Playwright E2E tests
bun test:coverage     # With coverage
```

## References

- [TIMELINE.md](./TIMELINE.md) - Full evolution history
- [docs/API.md](./docs/API.md) - API documentation
- [docs/architecture.md](./docs/architecture.md) - Architecture details
- [Drizzle ORM](https://orm.drizzle.team/)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## Acknowledgments

Inspired by [claude-mem](https://github.com/thedotmack/claude-mem) by Alex Newman — process manager pattern, worker service architecture, and hook system concepts.
