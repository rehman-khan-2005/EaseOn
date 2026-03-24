# Ease-On — Full Stack Community Wellness App

**CSCI 380 — Intro to Software Engineering | NYIT**

```
Frontend:  React + Vite (port 3000)
Backend:   Node.js + Express + Sequelize (port 3001)
Database:  PostgreSQL
Realtime:  Socket.IO
Auth:      Firebase Admin SDK + JWT fallback
```

---

## Project Structure

```
ease-on/
├── frontend/              ← React app (Vite)
│   ├── src/
│   │   ├── EaseOn.jsx     ← Main app component (all screens)
│   │   └── main.jsx       ← Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/               ← Node.js API server
│   ├── server.js          ← Entry point (Express + Socket.IO)
│   ├── config/            ← DB, Firebase, Socket configs
│   ├── routes/            ← API endpoints
│   ├── controllers/       ← Request handlers
│   ├── services/          ← Business logic
│   ├── models/            ← Sequelize models (7 tables)
│   ├── middleware/         ← Auth, validation, errors
│   ├── migrations/        ← DB schema
│   ├── seeders/           ← Sample data
│   └── package.json
│
├── setup.sh               ← One-command Mac setup
├── package.json            ← Root scripts
└── README.md               ← You are here
```

---

## Running on macOS — Step by Step

### Step 1: Install Prerequisites

Open **Terminal** (Cmd + Space → type "Terminal") and run:

```bash
# Install Homebrew (if you don't have it)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (v18+)
brew install node

# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16
```

Verify everything installed:

```bash
node -v      # Should show v18+ or v20+
npm -v       # Should show 9+
psql --version   # Should show 16+
```

### Step 2: Unzip & Run Setup

```bash
# Navigate to where you downloaded the zip
cd ~/Downloads

# Unzip
unzip ease-on-full.zip

# Enter the project
cd ease-on-full

# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

The setup script will:
1. Check that Node.js, npm, and PostgreSQL are installed
2. Install all npm dependencies (frontend + backend)
3. Create the `.env` config file
4. Create the `ease_on_dev` database
5. Run migrations (create all 7 tables)
6. Seed sample data (users, circles, moods, journals, messages)

### Step 3: Configure Database Credentials

Open the backend environment file:

```bash
nano backend/.env
```

Update these lines with your Mac's PostgreSQL credentials:

```
DB_USER=your_mac_username
DB_PASSWORD=
DB_NAME=ease_on_dev
```

**To find your Mac username:**
```bash
whoami
```

**Note:** On macOS, PostgreSQL typically uses your Mac username with no password. So if `whoami` returns `rehman`, set `DB_USER=rehman` and leave `DB_PASSWORD=` blank.

Save and exit nano: `Ctrl+O` → Enter → `Ctrl+X`

### Step 4: Start the App

You need **two Terminal windows** (or tabs):

**Terminal 1 — Backend API:**
```bash
cd ease-on-full/backend
npm run dev
```

You should see:
```
Ease-On API Server
HTTP:      http://localhost:3001
Socket.IO: ws://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd ease-on-full/frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready
➜  Local:   http://localhost:3000/
```

### Step 5: Open the App

Go to **http://localhost:3000** in your browser.

That's it! Log in or continue as guest to use the app.

---

## Quick Reference Commands

| What | Command |
|------|---------|
| Start backend | `cd backend && npm run dev` |
| Start frontend | `cd frontend && npm run dev` |
| Reset database | `cd backend && npm run db:reset` |
| Run migrations only | `cd backend && npm run db:migrate` |
| Seed data only | `cd backend && npm run db:seed` |
| Check API health | `curl http://localhost:3001/api/health` |

---

## Troubleshooting

### "psql: command not found"

PostgreSQL isn't in your PATH. Run:
```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### "role 'postgres' does not exist"

On macOS, PostgreSQL uses your Mac username, not `postgres`. Update `backend/.env`:
```
DB_USER=your_mac_username
DB_PASSWORD=
```

### "database 'ease_on_dev' does not exist"

Create it manually:
```bash
createdb ease_on_dev
```

### "ECONNREFUSED 127.0.0.1:5432"

PostgreSQL isn't running. Start it:
```bash
brew services start postgresql@16
```

### "port 3000 already in use"

Kill the process using it:
```bash
lsof -ti:3000 | xargs kill -9
```

### Frontend loads but API calls fail

Make sure the backend is running in a separate terminal. The Vite config proxies `/api` requests to `localhost:3001`.

---

## Features Included

**Frontend (all screens working):**
- Login / Register / Guest mode (Google, GitHub, Anonymous buttons)
- Home dashboard with mood check-in, streak, calendar
- Journal — create, edit, delete entries with mood + visibility
- Support Circles — browse, join, leave, create new, group chat
- Direct Messages — inbox with unread badges, compose new DM, search users
- Top Contributors — podium, leaderboard, time filters, DM from profile
- User Profiles — karma, rank, posts, bio, DM button
- Post creation with circle tags, mood, public/private audience
- Search across users, circles, and posts
- Notifications with read/unread state
- Settings — anonymous mode, profile editing, logout
- Mood trends graph + reminders

**Backend (full REST API + WebSocket):**
- 6 route groups: `/api/users`, `/api/moods`, `/api/journals`, `/api/circles`, `/api/messages`, `/api/notifications`
- Firebase Auth + JWT authentication middleware
- 7 Sequelize models matching the ER diagram
- Socket.IO for real-time DMs and group chat
- Karma / Top Contributor ranking system
- Mood streak calculation
- Database migrations + seed data

---

## Team

| Member | Role |
|--------|------|
| Rehman Khan | Team Lead, Backend |
| Alisha Karim | Frontend, UI Development |
| Xavier Perez | Backend, Database Development |
| Randy Dean | Backend |
| Aleeza Ejaz | Frontend |
