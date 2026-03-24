# 🌿 Ease-On Backend

**Community Wellness App — Node.js Backend**

Built with Express, Sequelize ORM, PostgreSQL, Firebase Auth, and Socket.IO for real-time messaging.

> CSCI 380 — Intro to Software Engineering | Section M01

---

## Team

| Member        | Role                        |
|---------------|-----------------------------|
| Rehman Khan   | Team Lead, Backend          |
| Xavier Perez  | Backend, Database           |
| Randy Dean    | Backend                     |
| Alisha Karim  | Frontend, UI Development    |
| Aleeza Ejaz   | Frontend                    |

---

## Architecture

This backend implements the **layered architecture** described in the project proposal:

```
Client (React Native)
    │
    ▼
┌──────────────────────────┐
│  API Routes Layer        │  /api/users, /api/moods, /api/circles, /api/messages, /api/notifications
│  routes/*.js             │
├──────────────────────────┤
│  Controller Layer        │  Request handling, input validation, calls services
│  controllers/*.js        │
├──────────────────────────┤
│  Service Layer           │  Business logic, karma algorithm, streak calculation
│  services/*.js           │
├──────────────────────────┤
│  Database Layer          │  Sequelize ORM → SQL queries
│  models/*.js             │
├──────────────────────────┤
│  PostgreSQL Database     │  Central source of truth
└──────────────────────────┘
```

Plus **Socket.IO** for real-time DMs and group chat, and **Firebase Admin SDK** for authentication.

---

## Database Schema (7 Entities)

Matches the ER Diagram from the proposal:

- **Users** — UUID PK, auth credentials, karma_score, auth_provider
- **MoodCheckIns** — mood_value (1-5), emoji_label, reflection, timestamp
- **JournalEntries** — body, visibility (private/circle/public), mood_value
- **SupportCircles** — name, description, visibility, creator_id FK
- **CircleMemberships** — junction table with role (admin/moderator/member)
- **Messages** — sender_id, recipient_id, circle_id, is_read
- **Notifications** — type, content, reference_id, is_read

---

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** >= 9
- (Optional) **Firebase** project for authentication

---

## Quick Start

### 1. Install dependencies

```bash
cd ease-on
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Create the database

```bash
createdb ease_on_dev
# Or via psql:
# psql -c "CREATE DATABASE ease_on_dev;"
```

### 4. Run migrations (create tables)

```bash
npm run db:migrate
```

### 5. Seed sample data

```bash
npm run db:seed
```

### 6. Start the server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:3001`

### Reset database (drop + migrate + seed)

```bash
npm run db:reset
```

---

## API Endpoints

### Authentication

| Method | Endpoint                  | Description                    | Auth |
|--------|---------------------------|--------------------------------|------|
| POST   | `/api/users/register`     | Register new account           | No   |
| POST   | `/api/users/login`        | Login (email/password → JWT)   | No   |
| POST   | `/api/users/firebase-auth`| Exchange Firebase token for JWT| Yes  |

### Users

| Method | Endpoint                       | Description              | Auth |
|--------|--------------------------------|--------------------------|------|
| GET    | `/api/users/me`                | Get own profile          | Yes  |
| PUT    | `/api/users/me`                | Update profile           | Yes  |
| GET    | `/api/users/top-contributors`  | Karma leaderboard        | Yes  |
| GET    | `/api/users/:id`               | Get user by ID           | Yes  |

### Moods (Check-Ins)

| Method | Endpoint             | Description                | Auth |
|--------|----------------------|----------------------------|------|
| POST   | `/api/moods`         | Log a mood check-in        | Yes  |
| GET    | `/api/moods`         | Get mood history           | Yes  |
| GET    | `/api/moods/trends`  | Get mood trends for graph  | Yes  |

### Journals

| Method | Endpoint              | Description              | Auth |
|--------|-----------------------|--------------------------|------|
| POST   | `/api/journals`       | Create journal entry     | Yes  |
| GET    | `/api/journals`       | Get all entries          | Yes  |
| GET    | `/api/journals/:id`   | Get single entry         | Yes  |
| PUT    | `/api/journals/:id`   | Update entry             | Yes  |
| DELETE | `/api/journals/:id`   | Delete entry             | Yes  |

### Circles (Support Groups)

| Method | Endpoint                      | Description              | Auth |
|--------|-------------------------------|--------------------------|------|
| POST   | `/api/circles`                | Create circle            | Yes  |
| GET    | `/api/circles`                | Browse all circles       | Yes  |
| GET    | `/api/circles/joined`         | Get joined circles       | Yes  |
| GET    | `/api/circles/:id`            | Circle detail + members  | Yes  |
| POST   | `/api/circles/:id/join`       | Join circle              | Yes  |
| POST   | `/api/circles/:id/leave`      | Leave circle             | Yes  |
| PUT    | `/api/circles/:id/members`    | Update member role       | Yes  |

### Messages (DMs & Group Chat)

| Method | Endpoint                           | Description              | Auth |
|--------|------------------------------------|--------------------------|------|
| GET    | `/api/messages/inbox`              | Conversation list        | Yes  |
| POST   | `/api/messages/direct`             | Send DM                  | Yes  |
| GET    | `/api/messages/direct/:userId`     | Get DM conversation      | Yes  |
| PUT    | `/api/messages/read/:senderId`     | Mark as read             | Yes  |
| POST   | `/api/messages/circle/:circleId`   | Send circle message      | Yes  |
| GET    | `/api/messages/circle/:circleId`   | Get circle messages      | Yes  |

### Notifications

| Method | Endpoint                         | Description              | Auth |
|--------|----------------------------------|--------------------------|------|
| GET    | `/api/notifications`             | Get all notifications    | Yes  |
| PUT    | `/api/notifications/read-all`    | Mark all as read         | Yes  |
| PUT    | `/api/notifications/:id/read`    | Mark single as read      | Yes  |

---

## Socket.IO Events

Connect with a JWT token:

```javascript
const socket = io("http://localhost:3001", {
  auth: { token: "your_jwt_token" }
});
```

### Client → Server

| Event                  | Payload                              | Description          |
|------------------------|--------------------------------------|----------------------|
| `join_circle`          | `circleId`                           | Join circle room     |
| `leave_circle`         | `circleId`                           | Leave circle room    |
| `send_dm`              | `{ recipientId, content, messageId }`| Send DM              |
| `send_circle_message`  | `{ circleId, content, messageId }`   | Send group message   |
| `typing_start`         | `{ recipientId }` or `{ circleId }`  | Typing indicator on  |
| `typing_stop`          | `{ recipientId }` or `{ circleId }`  | Typing indicator off |
| `mark_read`            | `{ senderId }`                       | Read receipt         |

### Server → Client

| Event                  | Payload                              | Description           |
|------------------------|--------------------------------------|-----------------------|
| `new_message`          | `{ id, sender, content, sent_at }`   | Incoming DM           |
| `circle_message`       | `{ id, sender, circle_id, ... }`     | Incoming group msg    |
| `user_typing`          | `{ userId, username }`               | Someone is typing     |
| `user_stopped_typing`  | `{ userId }`                         | Stopped typing        |
| `messages_read`        | `{ readBy }`                         | Read receipt          |

---

## Firebase Setup (Optional)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (or use existing)
3. **Authentication** → Enable Email/Password, Google, GitHub, Anonymous
4. **Project Settings** → Service Accounts → Generate New Private Key
5. Save the JSON as `firebase-service-account.json` in project root
6. Set `FIREBASE_PROJECT_ID` in `.env`

Without Firebase, the server runs in **JWT-only mode** — users register/login via email+password and receive JWTs directly.

---

## Project Structure

```
ease-on/
├── server.js                 # Entry point — Express + Socket.IO
├── package.json
├── .env.example
├── .gitignore
├── .sequelizerc              # Sequelize CLI paths
│
├── config/
│   ├── database.js           # PostgreSQL connection config
│   ├── firebase.js           # Firebase Admin SDK init
│   └── socket.js             # Socket.IO event handlers
│
├── models/
│   ├── index.js              # Sequelize init + all associations
│   ├── User.js
│   ├── MoodCheckIn.js
│   ├── JournalEntry.js
│   ├── SupportCircle.js
│   ├── CircleMembership.js
│   ├── Message.js
│   └── Notification.js
│
├── controllers/
│   ├── userController.js
│   ├── moodController.js
│   ├── journalController.js
│   ├── circleController.js
│   ├── messageController.js
│   └── notificationController.js
│
├── services/
│   ├── userService.js        # Auth, profile, karma ranking
│   ├── moodService.js        # Check-ins, trends, streaks
│   ├── journalService.js     # CRUD, visibility
│   ├── circleService.js      # Create, join, leave, roles
│   ├── messageService.js     # DMs, group chat, inbox
│   └── notificationService.js
│
├── routes/
│   ├── index.js              # Mount all route groups
│   ├── users.js              # /api/users/*
│   ├── moods.js              # /api/moods/*
│   ├── journals.js           # /api/journals/*
│   ├── circles.js            # /api/circles/*
│   ├── messages.js           # /api/messages/*
│   └── notifications.js      # /api/notifications/*
│
├── middleware/
│   ├── auth.js               # Firebase + JWT auth
│   ├── validate.js           # express-validator runner
│   └── errorHandler.js       # Global error handler
│
├── migrations/
│   └── 20260322000001-create-all-tables.js
│
├── seeders/
│   └── 20260322000001-seed-data.js
│
└── utils/                    # (empty — add helpers here)
```

---

## Example API Usage

### Register

```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"sarah10","email":"sarah@example.com","password":"secret123"}'
```

### Log Mood

```bash
curl -X POST http://localhost:3001/api/moods \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mood_value":4,"emoji_label":"good","reflection":"Feeling pretty good today!"}'
```

### Create Journal Entry

```bash
curl -X POST http://localhost:3001/api/journals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"body":"I passed all of my exams!","visibility":"private","mood_value":5}'
```

---

## License

MIT — CSCI 380 Project, NYIT
