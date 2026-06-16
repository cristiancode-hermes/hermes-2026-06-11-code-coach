import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { Challenge } from './../src/challenges/challenge.entity';
import { Submission } from './../src/submissions/submission.entity';

// ────────────────────────────────────────────────────────────
// EXISTING TESTS – DO NOT MODIFY
// ────────────────────────────────────────────────────────────
describe('AppController (e2e) — placeholder', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Note: this test exists only for backward compatibility.
  // The app does not serve a root route — full API e2e tests are below.
  it('/ (GET) — no root route, expect 404', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404);
  });

  afterEach(async () => {
    await app.close();
  });
});

// ────────────────────────────────────────────────────────────
// COMPREHENSIVE API E2E TESTS  –  in-memory SQLite
// ────────────────────────────────────────────────────────────
describe('API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    // Force in-memory SQLite for tests (override root .env which sets postgres)
    process.env.DATABASE_TYPE = 'better-sqlite3';
    process.env.DATABASE_URL = ':memory:';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Match real app behaviour: validation + transformation
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = app.get(DataSource);
  }, 30000);

  afterAll(async () => {
    await app.close();
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_TYPE;
  });

  /** Reset the database between tests so each starts clean */
  beforeEach(async () => {
    if (dataSource.isInitialized) {
      await dataSource.synchronize(true);
    }
  });

  // ── helpers ─────────────────────────────────────────────
  const challengePayload = (overrides: Record<string, unknown> = {}) => ({
    title: 'Test Challenge',
    description: 'A challenge for testing',
    difficulty: 'easy',
    category: 'algorithms',
    starterCode: 'function solve() { /* your code */ }',
    ...overrides,
  });

  const submissionPayload = (overrides: Record<string, unknown> = {}) => ({
    code: 'function solve() { return 42; }',
    language: 'javascript',
    ...overrides,
  });

  async function createChallenge(
    payload: Record<string, unknown> = {},
  ): Promise<{ id: number; body: Record<string, unknown> }> {
    const res = await request(app.getHttpServer())
      .post('/challenges')
      .send(challengePayload(payload))
      .expect(201);
    return { id: res.body.id as number, body: res.body };
  }

  // ═══════════════════════════════════════════════════════════
  //  GET /
  // ═══════════════════════════════════════════════════════════
  describe('GET /', () => {
    it('returns 404 when no root route handler is registered', () => {
      return request(app.getHttpServer()).get('/').expect(404);
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  GET /challenges
  // ═══════════════════════════════════════════════════════════
  describe('GET /challenges', () => {
    it('returns an empty array when no challenges exist', async () => {
      const res = await request(app.getHttpServer())
        .get('/challenges')
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('returns all challenges', async () => {
      await createChallenge({ title: 'Alpha' });
      await createChallenge({ title: 'Beta' });

      const res = await request(app.getHttpServer())
        .get('/challenges')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body.map((c: { title: string }) => c.title).sort()).toEqual([
        'Alpha',
        'Beta',
      ]);
    });

    it('filters by difficulty query parameter', async () => {
      await createChallenge({ title: 'Easy One', difficulty: 'easy' });
      await createChallenge({ title: 'Hard One', difficulty: 'hard' });

      const res = await request(app.getHttpServer())
        .get('/challenges?difficulty=hard')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Hard One');
    });

    it('filters by category query parameter', async () => {
      await createChallenge({ title: 'Algo', category: 'algorithms' });
      await createChallenge({ title: 'Strings', category: 'strings' });

      const res = await request(app.getHttpServer())
        .get('/challenges?category=algorithms')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Algo');
    });

    it('returns all challenges when no matching filter', async () => {
      await createChallenge({ title: 'A' });
      await createChallenge({ title: 'B' });

      const res = await request(app.getHttpServer())
        .get('/challenges?difficulty=impossible')
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  GET /challenges/:id
  // ═══════════════════════════════════════════════════════════
  describe('GET /challenges/:id', () => {
    it('returns 404 for a non-existing challenge', async () => {
      await request(app.getHttpServer()).get('/challenges/99999').expect(404);
    });

    it('returns 400 for a non-numeric id (ParseIntPipe)', async () => {
      await request(app.getHttpServer()).get('/challenges/abc').expect(400);
    });

    it('returns the challenge by its id', async () => {
      const { id } = await createChallenge({
        title: 'Find Me',
        difficulty: 'medium',
        category: 'sorting',
      });

      const res = await request(app.getHttpServer())
        .get(`/challenges/${id}`)
        .expect(200);

      expect(res.body.id).toBe(id);
      expect(res.body.title).toBe('Find Me');
      expect(res.body.difficulty).toBe('medium');
      expect(res.body.category).toBe('sorting');
      expect(res.body).toHaveProperty('starterCode');
      expect(res.body).toHaveProperty('description');
      expect(res.body).toHaveProperty('createdAt');
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  POST /challenges
  // ═══════════════════════════════════════════════════════════
  describe('POST /challenges', () => {
    it('creates a challenge and returns 201 with the full entity', async () => {
      const res = await request(app.getHttpServer())
        .post('/challenges')
        .send(challengePayload({ title: 'Brand New' }))
        .expect(201);

      expect(res.body.id).toBeGreaterThan(0);
      expect(res.body.title).toBe('Brand New');
      expect(res.body.description).toBe('A challenge for testing');
      expect(res.body.difficulty).toBe('easy');
      expect(res.body.category).toBe('algorithms');
      expect(res.body.starterCode).toBe('function solve() { /* your code */ }');
      expect(res.body.testCases).toBe('[]');
      expect(res.body.createdAt).toBeDefined();
    });

    it('accepts an optional testCases field', async () => {
      const testCases = JSON.stringify([
        { input: { n: 1 }, expected: 2 },
      ]);

      const res = await request(app.getHttpServer())
        .post('/challenges')
        .send(challengePayload({ testCases }))
        .expect(201);

      expect(res.body.testCases).toBe(testCases);
    });

    it('returns 400 when title is missing', async () => {
      const { title: _, ...rest } = challengePayload();
      await request(app.getHttpServer())
        .post('/challenges')
        .send(rest)
        .expect(400);
    });

    it('returns 400 when description is missing', async () => {
      const { description: _, ...rest } = challengePayload();
      await request(app.getHttpServer())
        .post('/challenges')
        .send(rest)
        .expect(400);
    });

    it('returns 400 when difficulty is missing', async () => {
      const { difficulty: _, ...rest } = challengePayload();
      await request(app.getHttpServer())
        .post('/challenges')
        .send(rest)
        .expect(400);
    });

    it('returns 400 when difficulty is not one of the allowed values', async () => {
      await request(app.getHttpServer())
        .post('/challenges')
        .send(challengePayload({ difficulty: 'impossible' }))
        .expect(400);
    });

    it('returns 400 when category is missing', async () => {
      const { category: _, ...rest } = challengePayload();
      await request(app.getHttpServer())
        .post('/challenges')
        .send(rest)
        .expect(400);
    });

    it('returns 400 when starterCode is missing', async () => {
      const { starterCode: _, ...rest } = challengePayload();
      await request(app.getHttpServer())
        .post('/challenges')
        .send(rest)
        .expect(400);
    });

    it('returns 400 for an empty body', async () => {
      await request(app.getHttpServer())
        .post('/challenges')
        .send({})
        .expect(400);
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  PUT /challenges/:id   (the controller uses @Put, not @Patch)
  // ═══════════════════════════════════════════════════════════
  describe('PUT /challenges/:id', () => {
    it('returns 404 when the challenge does not exist', async () => {
      const payload = challengePayload();
      await request(app.getHttpServer())
        .put('/challenges/99999')
        .send(payload)
        .expect(404);
    });

    it('fully updates an existing challenge', async () => {
      const { id } = await createChallenge({ title: 'Before' });

      const res = await request(app.getHttpServer())
        .put(`/challenges/${id}`)
        .send(
          challengePayload({
            title: 'After',
            difficulty: 'hard',
            category: 'strings',
          }),
        )
        .expect(200);

      expect(res.body.id).toBe(id);
      expect(res.body.title).toBe('After');
      expect(res.body.difficulty).toBe('hard');
      expect(res.body.category).toBe('strings');
    });

    it('returns 400 when required fields are missing from the body', async () => {
      const { id } = await createChallenge();

      await request(app.getHttpServer())
        .put(`/challenges/${id}`)
        .send({})
        .expect(400);
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  DELETE /challenges/:id
  // ═══════════════════════════════════════════════════════════
  describe('DELETE /challenges/:id', () => {
    it('returns 404 when the challenge does not exist', async () => {
      await request(app.getHttpServer()).delete('/challenges/99999').expect(404);
    });

    it('deletes an existing challenge', async () => {
      const { id } = await createChallenge();

      await request(app.getHttpServer())
        .delete(`/challenges/${id}`)
        .expect(200);

      // Verify it's really gone
      await request(app.getHttpServer()).get(`/challenges/${id}`).expect(404);
    });

    it('cascades to delete associated submissions', async () => {
      const { id: challengeId } = await createChallenge();

      // Create a submission
      const subRes = await request(app.getHttpServer())
        .post(`/challenges/${challengeId}/submissions`)
        .send(submissionPayload())
        .expect(201);

      const submissionId = subRes.body.id as number;

      // Delete the challenge
      await request(app.getHttpServer())
        .delete(`/challenges/${challengeId}`)
        .expect(200);

      // Submission should no longer exist
      await request(app.getHttpServer())
        .get(`/submissions/${submissionId}`)
        .expect(404);
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  POST /challenges/:challengeId/submissions
  // ═══════════════════════════════════════════════════════════
  describe('POST /challenges/:challengeId/submissions', () => {
    it('returns 404 when the challenge does not exist', async () => {
      await request(app.getHttpServer())
        .post('/challenges/99999/submissions')
        .send(submissionPayload())
        .expect(404);
    });

    it('creates a submission and returns 201 with the full entity', async () => {
      const { id: challengeId } = await createChallenge();

      const res = await request(app.getHttpServer())
        .post(`/challenges/${challengeId}/submissions`)
        .send(submissionPayload({ code: 'function solve() { return 1; }' }))
        .expect(201);

      expect(res.body.id).toBeGreaterThan(0);
      expect(res.body.challengeId).toBe(challengeId);
      expect(res.body.code).toBe('function solve() { return 1; }');
      expect(res.body.language).toBe('javascript');
      expect(res.body.status).toBe('completed');
      expect(res.body.resultAnalysis).toBeDefined();
      expect(res.body.submittedAt).toBeDefined();

      // resultAnalysis should be valid JSON
      const analysis = JSON.parse(res.body.resultAnalysis as string);
      expect(analysis).toHaveProperty('linesOfCode');
      expect(analysis).toHaveProperty('qualityScore');
      expect(analysis).toHaveProperty('suggestions');
    });

    it('accepts an optional language field', async () => {
      const { id: challengeId } = await createChallenge();

      const res = await request(app.getHttpServer())
        .post(`/challenges/${challengeId}/submissions`)
        .send(submissionPayload({ language: 'python', code: 'print("hello")' }))
        .expect(201);

      expect(res.body.language).toBe('python');
    });

    it('defaults language to javascript when omitted', async () => {
      const { id: challengeId } = await createChallenge();

      const res = await request(app.getHttpServer())
        .post(`/challenges/${challengeId}/submissions`)
        .send({ code: 'console.log("hi");' })
        .expect(201);

      expect(res.body.language).toBe('javascript');
    });

    it('returns 400 when code is missing', async () => {
      const { id: challengeId } = await createChallenge();

      await request(app.getHttpServer())
        .post(`/challenges/${challengeId}/submissions`)
        .send({})
        .expect(400);
    });

    it('returns 400 when code is empty', async () => {
      const { id: challengeId } = await createChallenge();

      await request(app.getHttpServer())
        .post(`/challenges/${challengeId}/submissions`)
        .send({ code: '' })
        .expect(400);
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  GET /submissions/:id
  // ═══════════════════════════════════════════════════════════
  describe('GET /submissions/:id', () => {
    it('returns 404 for a non-existing submission', async () => {
      await request(app.getHttpServer()).get('/submissions/99999').expect(404);
    });

    it('returns 400 for a non-numeric id (ParseIntPipe)', async () => {
      await request(app.getHttpServer()).get('/submissions/abc').expect(400);
    });

    it('returns a submission by its id with the related challenge', async () => {
      const { id: challengeId } = await createChallenge({ title: 'Parent' });

      const createRes = await request(app.getHttpServer())
        .post(`/challenges/${challengeId}/submissions`)
        .send(submissionPayload({ code: 'return true;' }))
        .expect(201);

      const submissionId = createRes.body.id as number;

      const res = await request(app.getHttpServer())
        .get(`/submissions/${submissionId}`)
        .expect(200);

      expect(res.body.id).toBe(submissionId);
      expect(res.body.challengeId).toBe(challengeId);
      expect(res.body.code).toBe('return true;');
      expect(res.body.challenge).toBeDefined();
      expect(res.body.challenge.id).toBe(challengeId);
      expect(res.body.challenge.title).toBe('Parent');
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  GET /challenges/:challengeId/submissions
  // ═══════════════════════════════════════════════════════════
  describe('GET /challenges/:challengeId/submissions', () => {
    it('returns an empty array when no submissions exist', async () => {
      const { id: challengeId } = await createChallenge();

      const res = await request(app.getHttpServer())
        .get(`/challenges/${challengeId}/submissions`)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('returns all submissions for a challenge', async () => {
      const { id: challengeId } = await createChallenge({
        title: 'Multi Submission',
      });

      await request(app.getHttpServer())
        .post(`/challenges/${challengeId}/submissions`)
        .send(submissionPayload({ code: '// sub 1' }))
        .expect(201);

      await request(app.getHttpServer())
        .post(`/challenges/${challengeId}/submissions`)
        .send(submissionPayload({ code: '// sub 2', language: 'python' }))
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/challenges/${challengeId}/submissions`)
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].challengeId).toBe(challengeId);
      // Results are ordered by submittedAt DESC (see service)
      expect(res.body.map((s: { code: string }) => s.code)).toContain('// sub 1');
      expect(res.body.map((s: { code: string }) => s.code)).toContain('// sub 2');
    });

    it('returns submissions for the correct challenge only', async () => {
      const { id: chA } = await createChallenge({ title: 'A' });
      const { id: chB } = await createChallenge({ title: 'B' });

      await request(app.getHttpServer())
        .post(`/challenges/${chA}/submissions`)
        .send(submissionPayload({ code: '// for A' }))
        .expect(201);

      await request(app.getHttpServer())
        .post(`/challenges/${chB}/submissions`)
        .send(submissionPayload({ code: '// for B' }))
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/challenges/${chA}/submissions`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].code).toBe('// for A');
    });
  });
});
