# 🌿 Ease-On — Community Wellness App

**CSCI 380 — Intro to Software Engineering | NYIT**

Live: https://easeon-380.web.app

---

## Setup Guide — Step by Step

### Prerequisites

Install these on your Mac if you don't have them:

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify
node -v   # Should show v18+
npm -v    # Should show 9+
```

---

### Step 1: Install Dependencies

```bash
cd ease-on

# Frontend
cd frontend && npm install

# Backend
cd ../functions && npm install

cd ..
```

---

### Step 2: Get Firebase Config for Frontend

The frontend needs your Firebase project's web config to use Firebase Auth.

1. Go to https://console.firebase.google.com
2. Select **easeon-380**
3. Click the **gear icon** (top left) → **Project Settings**
4. Scroll down to **"Your apps"** → click the **web app** (</> icon)
   - If no web app exists, click **"Add app"** → select **Web** → name it "Ease-On" → Register
5. Copy the `firebaseConfig` object it shows you

Open `frontend/src/firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",           // ← paste your actual values
  authDomain: "easeon-380.firebaseapp.com",
  projectId: "easeon-380",
  storageBucket: "easeon-380.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

Save the file.

---

### Step 3: Enable Firebase Authentication

1. In the Firebase Console, go to **Build → Authentication**
2. Click **"Get Started"**
3. Click **Email/Password** → **Enable** → **Save**

This lets users register and log in with email + password.

---

### Step 4: Enable Firebase Blaze Plan (required for Cloud Functions)

1. In the Firebase Console → bottom left → click **Upgrade**
2. Select **Blaze (pay-as-you-go)**
3. Add a payment method

You won't be charged for normal class project usage. The free tier limits are very generous.

---

### Step 5: Login to Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase use easeon-380
```

---

### Step 6: Build and Deploy

```bash
# Build the frontend
cd frontend && npm run build && cd ..

# Deploy everything (frontend + backend)
firebase deploy
```

After "Deploy complete!", your app is live at:
- **Website:** https://easeon-380.web.app
- **API:** https://easeon-380.web.app/api/health

---

### Step 7: Verify

1. Open https://easeon-380.web.app
2. Click **Register**
3. Fill in name, username, email, password
4. You should be logged in and see an empty dashboard
5. Log a mood, create a journal entry, make a post
6. Refresh the page — your data should still be there

---

## Building the APK (Android)

```bash
cd frontend

# Install Capacitor (if not already)
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize
npx cap init "Ease-On" "com.easeon380.app"

# Build web app
npm run build

# Add Android
npx cap add android

# Sync
npx cap sync

# Open in Android Studio
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync (2-5 min first time)
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. APK is at: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

---

## Building for iOS

```bash
cd frontend
npm install @capacitor/ios@6
npx cap add ios
npm run build
npx cap sync
npx cap open ios
```

In Xcode: pick an iPhone simulator → hit ▶

---

## Redeploying After Changes

```bash
# Rebuild and deploy everything
cd frontend && npm run build && cd ..
firebase deploy

# Rebuild APK
cd frontend && npm run build && npx cap sync
# Then Build → Build APK in Android Studio

# Push to GitHub
git add . && git commit -m "update" && git push
```

---

## Architecture

```
Frontend (React + Vite)
    ↓ Firebase Auth (login/register)
    ↓ API calls with Firebase ID token
Backend (Express on Cloud Functions)
    ↓ Verifies token with Firebase Admin SDK
    ↓ CRUD operations
PostgreSQL (Neon)
    ↓ 9 tables: users, moods, journals, circles,
      memberships, messages, notifications, posts, comments
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Auth | Firebase Authentication |
| Backend | Node.js, Express, Firebase Cloud Functions |
| Database | PostgreSQL on Neon, Sequelize ORM |
| Hosting | Firebase Hosting |
| Mobile | Capacitor (Android APK, iOS) |

---

## Team

| Member | Role |
|---|---|
| Rehman Khan | Team Lead, Backend, Frontend |
| Alisha Karim | Frontend, UI Development |
| Xavier Perez | Backend, Database Development |
| Randy Dean | Backend |
| Aleeza Ejaz | Frontend |
