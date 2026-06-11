# Database Design

## Schema

```mermaid
erDiagram
    CHALLENGES {
        int id PK
        string title
        string description
        string difficulty "easy|medium|hard"
        string category
        text starter_code
        text test_cases "JSON array"
        datetime created_at
    }

    SUBMISSIONS {
        int id PK
        int challenge_id FK
        text code
        string language
        string status "pending|analyzed"
        text result_analysis "JSON object"
        datetime submitted_at
    }

    CHALLENGES ||--o{ SUBMISSIONS : "has"
```

## Tables

### `challenges`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTOINCREMENT | Unique challenge ID |
| `title` | TEXT | NOT NULL | Challenge title |
| `description` | TEXT | NOT NULL | Problem description |
| `difficulty` | TEXT | NOT NULL, CHECK('easy','medium','hard') | Difficulty level |
| `category` | TEXT | NOT NULL | e.g., algorithms, strings, sorting |
| `starter_code` | TEXT | DEFAULT '' | Boilerplate code |
| `test_cases` | TEXT | DEFAULT '[]' | JSON array of test cases |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

### `submissions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTOINCREMENT | Unique submission ID |
| `challenge_id` | INTEGER | FK → challenges(id) | Related challenge |
| `code` | TEXT | NOT NULL | Submitted source code |
| `language` | TEXT | NOT NULL DEFAULT 'javascript' | Programming language |
| `status` | TEXT | DEFAULT 'pending' | pending → analyzed |
| `result_analysis` | TEXT | NULL | JSON from AnalysisService |
| `submitted_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Submission timestamp |

## Migration Strategy

### Local Development (SQLite)
```bash
cd apps/api
# TypeORM sync: true handles table creation automatically.
# For manual setup:
sqlite3 data/coach.db < migrations/initial.sql
```

### Production (Neon Postgres)

1. **Create Neon project:**
```bash
npx neonctl projects create --name code-coach --region aws-eu-west-1 --api-key "$NEON_API_KEY"
```

2. **Get connection string:**
```bash
npx neonctl connection-string --api-key "$NEON_API_KEY"
```

3. **Update `.env`:**
```env
DATABASE_URL=postgresql://user:***@ep-xxx.eu-west-1.aws.neon.tech/code-coach?sslmode=require
DATABASE_TYPE=postgres
```

4. **Update `app.module.ts`:**
```typescript
useFactory: (configService: ConfigService) => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [Challenge, Submission],
  synchronize: false, // Use migrations in production
  ssl: { rejectUnauthorized: false },
}),
```

5. **Run migrations:**
```bash
npx typeorm migration:run -d dist/data-source.js
```

### Neon Data API (Optional)

For read-only direct queries from the frontend, enable the Neon Data API:
```bash
npx neonctl data-api create --auth-provider neon_auth --api-key "$NEON_API_KEY"
```

This exposes RESTful CRUD on tables behind JWT auth, useful for fast reads while writes go through NestJS.

## Seed Data

Six challenges are seeded when `SEED_DB=true`:

| Title | Difficulty | Category |
|-------|------------|----------|
| Two Sum | easy | algorithms |
| Palindrome Check | easy | strings |
| Binary Search | medium | algorithms |
| Quick Sort | medium | sorting |
| LRU Cache | hard | data-structures |
| Regex Engine | hard | strings |

Run seed: `SEED_DB=true npm run start:dev` (auto-skips if data exists)
