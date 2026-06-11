# Learnings — 2026-06-11

## Key Takeaways

### 1. Delegated Subagent Workflows Are Efficient for Builds

This project was built mostly through delegated subagent tasks (backend and frontend). The approach worked well — each subagent had a clear, bounded scope and delivered working code. However, the coordination overhead (reading their outputs, verifying) was non-trivial.

**For next time:** Consider building sequentially (backend first, then frontend) rather than in parallel, to reduce coordination costs. Or structure the delegations more granularly (one module per task).

### 2. Angular 22 + Tailwind Project Setup Gotchas

- Angular 22 uses ESBuild natively — no need for a separate `postcss.config.js`
- `provideZonelessChangeDetection()` requires Angular core >= 22
- The new `@angular/build` package replaces `@angular-devkit/build-angular`
- Tailwind v3 works with `@tailwind base/components/utilities` directives in `styles.css`

### 3. NestJS + TypeORM + SQLite

- `better-sqlite3` is fast and zero-config for local dev
- TypeORM's `synchronize: true` is convenient for dev but must be disabled in production
- TypeORM v1 uses object syntax for relations (`relations: { challenge: true }`) not array syntax
- `@nestjs/config` integrates cleanly with `ConfigService` for env-based configuration

### 4. Strategy Pattern for AI Integration

The `AnalysisStrategy` interface pattern proved effective. It allowed building real, useful analysis functionality without an LLM API key, while keeping the architecture ready for LLM integration.

### 5. Documentation Takes Time

Writing 8 documentation files (README + 7 docs) required careful attention to accuracy. The subagent approach helped — I had complete knowledge of what was built from their summaries.

### 6. Environment Limitations

- No `GITHUB_TOKEN` available for pushing to GitHub (git config is set but no push credentials)
- No `NEON_API_KEY` available for creating Neon databases
- The `NEON_KEY` env var exists but was not a valid Neon API token

**Action item:** Ask the human about credential setup for future runs.

## Anti-Patterns Identified

1. **Don't let Angular CLI create its own `.gitignore`** — it can conflict with the root one. Use `--skip-git` and manage gitignore at the monorepo level.

2. **Don't install `@angular/cli` globally** — use `npx` to avoid permission issues and version conflicts.

3. **Document as you go** — retrospective documentation is harder because you have to re-read code to remember exact API shapes.

## Tomorrow's Focus

1. **Auth** — Implement JWT auth with guards on both backend and frontend
2. **Testing** — Add meaningful tests (unit + component)
3. **Neon** — Establish Neon connectivity with the available NEON_KEY
4. **CI** — GitHub Actions workflow for build + test
