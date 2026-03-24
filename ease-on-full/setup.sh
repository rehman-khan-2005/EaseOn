#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Ease-On Quick Start Script (macOS)
# ═══════════════════════════════════════════════════════════

set -e
echo ""
echo "🌿  Ease-On — Quick Start"
echo "═══════════════════════════════════════"
echo ""

# ── Check prerequisites ──────────────────────────────────
check_cmd() {
  if ! command -v "$1" &> /dev/null; then
    echo "❌ $1 is not installed."
    echo "   $2"
    exit 1
  else
    echo "✅ $1 found: $(command -v $1)"
  fi
}

echo "Checking prerequisites..."
echo ""
check_cmd node "Install via: brew install node"
check_cmd npm "Comes with Node.js"
check_cmd psql "Install via: brew install postgresql@16"

NODE_V=$(node -v)
echo "   Node version: $NODE_V"
echo ""

# ── Install dependencies ─────────────────────────────────
echo "📦 Installing backend dependencies..."
cd backend && npm install
echo ""

echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install
cd ..
echo ""

# ── Setup environment ────────────────────────────────────
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "📝 Created backend/.env from .env.example"
  echo ""
  echo "⚠️  IMPORTANT: Edit backend/.env with your PostgreSQL credentials:"
  echo "   nano backend/.env"
  echo ""
  echo "   At minimum, set:"
  echo "   DB_USER=your_mac_username    (run 'whoami' to check)"
  echo "   DB_PASSWORD=                  (blank if no password set)"
  echo "   DB_NAME=ease_on_dev"
  echo ""
fi

# ── Create database ──────────────────────────────────────
echo "🗄️  Checking database..."
if psql -lqt | cut -d \| -f 1 | grep -qw ease_on_dev; then
  echo "   Database 'ease_on_dev' already exists."
else
  echo "   Creating database 'ease_on_dev'..."
  createdb ease_on_dev 2>/dev/null && echo "   ✅ Database created." || echo "   ⚠️  Could not create DB automatically. Create it manually: createdb ease_on_dev"
fi
echo ""

# ── Run migrations ───────────────────────────────────────
echo "🏗️  Running database migrations..."
cd backend
npx sequelize-cli db:migrate 2>/dev/null && echo "   ✅ Tables created." || echo "   ⚠️  Migration failed. Check your .env DB credentials."

echo ""
echo "🌱 Seeding sample data..."
npx sequelize-cli db:seed:all 2>/dev/null && echo "   ✅ Sample data loaded." || echo "   ⚠️  Seeding failed (may already be seeded)."
cd ..

echo ""
echo "═══════════════════════════════════════"
echo "✅ Setup complete!"
echo ""
echo "To start the app, open TWO terminal tabs:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend && npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo "═══════════════════════════════════════"
echo ""
