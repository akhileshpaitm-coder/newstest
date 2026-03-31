# NewsApp — Personalised News Aggregator

A full-stack news aggregation platform with a user-facing feed and an admin dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, TypeScript, MongoDB (Mongoose) |
| Background jobs | node-cron |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| HTTP client | Axios |
| Ad visibility | `react-intersection-observer` (IntersectionObserver API) |

---

## Project Structure

```
newstest/
├── server/          # Express + TypeScript backend
│   └── src/
│       ├── controllers/   # auth, user, agent, ad, feed
│       ├── jobs/          # rss.job.ts  (background fetcher)
│       ├── middlewares/   # authMiddleware, adminOnly
│       ├── models/        # User, Agent, Article, Ad, AdAnalytics
│       ├── routes/        # auth, user, agent, ad, feed
│       └── validators/
└── client/          # React + Vite frontend
    └── src/
        ├── api/           # axios instance + per-resource functions
        ├── components/    # ArticleCard, AdCard, FeedList, AdminNav, …
        ├── context/       # AuthContext
        ├── hooks/         # useFeed (infinite scroll)
        ├── pages/
        │   ├── user/      # Login, Register, Onboarding, Feed
        │   └── admin/     # Dashboard, AgentsPage, AdsPage, StatsPage
        └── types/         # Shared TypeScript interfaces
```

---

## Setup & Run

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (default port 27017)

### 1. Backend

```bash
cd server
cp .env.example .env        # edit MONGO_URI and JWT_SECRET
npm install
npm run dev                 # starts on :5000
```

**Environment variables (`server/.env`)**

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/newsapp
JWT_SECRET=replace_with_a_long_random_string
```

### 2. Frontend

```bash
cd client
cp .env.example .env        # set VITE_API_URL if backend is not on :5000
npm install
npm run dev                 # starts on :3000
```

**Environment variables (`client/.env`)**

```
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed an admin user

After starting the backend, register normally via `POST /api/auth/register`, then open MongoDB and set `role: "ADMIN"` on that document, or use mongosh:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "ADMIN" } })
```

### 4. Seed RSS agents

Log in as admin, go to **RSS Agents → Seed Default Feeds**. This creates all 9 pre-configured feeds (BBC, NYT, CNN, TechCrunch, The Verge, Wired, WSJ, NYT Business, CNBC).

---

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login → JWT |
| GET  | `/api/auth/me` | user | Current user |
| PUT  | `/api/user/preferences` | user | Update categories |
| POST | `/api/user/save/:id` | user | Toggle bookmark |
| GET  | `/api/user/saved` | user | Get saved articles |
| GET  | `/api/feed?page=1&limit=10&category=Technology` | user | Paginated feed with injected ads |
| POST | `/api/ads/view` | user | Record ad impression |
| POST | `/api/ads/click` | user | Record ad click |
| GET  | `/api/agents` | admin | List RSS agents |
| POST | `/api/agents` | admin | Create agent |
| PUT  | `/api/agents/:id` | admin | Update agent |
| DELETE | `/api/agents/:id` | admin | Delete agent |
| GET  | `/api/ads` | admin | List ads |
| POST | `/api/ads` | admin | Create ad |
| PUT  | `/api/ads/:id` | admin | Update ad |
| DELETE | `/api/ads/:id` | admin | Delete ad |
| GET  | `/api/ads/stats` | admin | Campaign analytics |

---

## Architectural Decisions

### Ad tracking & unique view accuracy

`AdAnalytics` uses a **compound unique index** on `{ ad, user }`:

```ts
AdAnalyticsSchema.index({ ad: 1, user: 1 }, { unique: true });
```

View and click events use `updateOne` with `{ upsert: true }` + `$set`. If a record already exists the operation is a no-op for that field — MongoDB's atomic upsert guarantees uniqueness without application-level locking.  
CTR is calculated at query time as `(clicks / views) * 100`, so it never goes stale.

### Ad visibility (IntersectionObserver)

`AdCard` uses `react-intersection-observer` with a **50 % visibility threshold** and `triggerOnce: true`. The view API call fires only once, only when the ad is actually on screen, preventing phantom impressions from server-side rendering or pre-fetching.

### Background RSS agents

Agents are grouped by their `fetchInterval` (minutes). One `node-cron` task is created per unique interval, running all agents in that group. A `setTimeout(scheduleAgents, 3000)` on startup allows MongoDB to connect first. An hourly `scheduleAgents` call picks up any admin changes without a restart.

`Article.bulkWrite` with `$setOnInsert` + a unique `linkHash` index ensures:
- **No duplicate articles** — MD5 hash of the article URL is the idempotency key.
- **Non-destructive updates** — fields are never overwritten after first insert.
- **Isolated failures** — errors in one agent's `try/catch` do not abort the rest.

### Database indexing

| Collection | Index | Purpose |
|------------|-------|---------|
| `articles` | `{ publicationDate: -1 }` | Fast descending sort for feed |
| `articles` | `{ category: 1 }` | Category filter |
| `articles` | `{ linkHash: 1 }` unique | Duplicate prevention |
| `users` | `{ email: 1 }` unique | Login lookup |
| `adanalytics` | `{ ad: 1, user: 1 }` unique | Unique impression / click |
| `adanalytics` | `{ ad: 1 }` | Aggregate stats per ad |
