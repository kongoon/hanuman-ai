#!/bin/bash
# Setup hanuman-ai with frontend build
set -e

echo "🔧 Installing root dependencies..."
bun install

echo "🗄️ Setting up database..."
mkdir -p ~/.hanuman
bun run db:push  # Creates/updates tables from schema

echo "🔧 Installing frontend dependencies..."
cd frontend && bun install

echo "🔨 Building frontend..."
bun run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  bun run server     # Start HTTP server"
echo "  bun test           # Run tests"
echo ""
