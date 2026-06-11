# Hermes Code Coach 🎯

> **AI-powered coding challenge platform** — Browse challenges, submit solutions, and get structured code quality analysis.

![Stack: Angular 22 + NestJS + SQLite/Neon + Tailwind CSS](https://img.shields.io/badge/Stack-Angular%2022%20%7C%20NestJS%20%7C%20SQLite%2FNeon%20%7C%20Tailwind-6366f1)

## Features

- 📚 **Browse Challenges** — 6 pre-seeded challenges across Easy/Medium/Hard difficulties and categories (Algorithms, Strings, Data Structures, Sorting)
- ✍️ **Submit Solutions** — Built-in code editor to write and submit solutions
- 🤖 **AI-Powered Analysis** — Automated code quality analysis with metrics and suggestions
- 📊 **Submission History** — Track your progress on each challenge
- 🎨 **Modern UI** — Dark theme with responsive design, smooth transitions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Angular 22 (standalone, signals, zoneless) |
| **Styling** | Tailwind CSS v3 |
| **Backend** | NestJS 11 |
| **Database** | SQLite (local) / Neon Postgres (production) |
| **ORM** | TypeORM |
| **API Docs** | Swagger / OpenAPI at `/api/docs` |
| **AI Analysis** | Rule-based engine (swappable to LLM) |

## Architecture Overview

```
┌─────────────┐     HTTP/REST     ┌──────────────┐     TypeORM     ┌──────────┐
│  Angular 22  │ ──────────────> │   NestJS API  │ ─────────────> │  SQLite  │
│  (localhost  │ <────────────── │  (localhost   │ <───────────── │   / DB   │
│    :4200)    │     JSON        │    :3000)     │                │          │
└─────────────┘                  └──────┬───────┘                └──────────┘
                                        │
                                  ┌─────▼──────┐
                                  │  Analysis   │
                                  │  Service    │
                                  │  (Rule-     │
                                  │   based)    │
                                  └────────────┘
```

## Prerequisites

- Node.js >= 22
- npm >= 10

## Local Setup

### 1. Clone and install

```bash
cd apps/api
npm install
cd ../web
npm install
```

### 2. Configure environment

```bash
# In apps/api, copy and edit:
cp .env.example .env
# Defaults work for local development (SQLite)
```

### 3. Run database migrations

The app uses TypeORM `synchronize: true`, so tables are auto-created on startup.

For manual SQL reference: `apps/api/migrations/initial.sql`

### 4. Seed the database

```bash
cd apps/api
SEED_DB=true npm run start:dev
# Ctrl+C after seeing "Seeded 6 challenges successfully."
```

### 5. Start development servers

```bash
# Terminal 1 — Backend (port 3000)
cd apps/api
npm run start:dev

# Terminal 2 — Frontend (port 4200)
cd apps/web
npm start
```

### 6. Open the app

- **Frontend:** http://localhost:4200
- **API Docs:** http://localhost:3000/api/docs

## AI Capability

Code Coach implements **AI Ladder Rung 1** — Single structured analysis call.

When a user submits a solution, the AnalysisService:
1. Counts lines of code, functions, loops, conditionals
2. Calculates a quality score (1–10) based on code structure heuristics
3. Generates actionable suggestions (e.g., "Remove console.log statements", "Break into smaller functions")
4. Returns structured JSON to the frontend for display

The analysis strategy is pluggable via the `AnalysisStrategy` interface. To swap to an LLM-based analyzer, implement the interface and call `analysisService.setStrategy(new LLMStrategy(...))`.

**Planned upgrades:**
- **Rung 2:** Streaming analysis results + structured JSON output
- **Rung 3:** Semantic search over past submissions with pgvector

## Project Structure

```
2026-06-11-code-coach/
├── apps/
│   ├── api/                  # NestJS backend
│   │   ├── migrations/       # SQL migration files
│   │   └── src/
│   │       ├── challenges/   # Challenge entity + CRUD
│   │       ├── submissions/  # Submission entity + CRUD
│   │       ├── analysis/     # Analysis service (AI logic)
│   │       ├── app.module.ts # Root module
│   │       ├── main.ts       # Bootstrap + Swagger
│   │       └── seed.ts       # Seed data
│   └── web/                  # Angular frontend
│       └── src/app/
│           ├── models/       # TypeScript interfaces
│           ├── services/     # API service
│           └── pages/        # Route components
├── docs/                     # Documentation
└── .gitignore
```

## Roadmap

- [ ] **Authentication** — User accounts to track individual progress
- [ ] **LLM-Powered Analysis** — Swap rule-based engine for GPT/Claude analysis
- [ ] **Collaborative Features** — Share solutions, community leaderboard
- [ ] **Neon Production** — Migrate from SQLite to Neon Postgres with pgvector
- [ ] **Testing** — Unit tests for analysis service, component tests
- [ ] **CI/CD** — GitHub Actions for build + test

## License

MIT
