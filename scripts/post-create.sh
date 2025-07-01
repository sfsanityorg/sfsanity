#!/bin/bash
set -e

echo "🔧 Installing dependencies..."
pnpm install

echo "🔧 Setting up Supabase local dev (if available)..."
if command -v supabase &> /dev/null; then
  supabase start
fi

echo "🔧 Running database setup scripts..."
if [ -f scripts/create-sample-table.sql ]; then
  echo "  - Creating sample table"
  supabase db execute --file scripts/create-sample-table.sql || true
fi
if [ -f scripts/add-more-sample-data.sql ]; then
  echo "  - Adding sample data"
  supabase db execute --file scripts/add-more-sample-data.sql || true
fi

echo "✅ Dev container setup complete."
