import request from 'supertest';
import initSqlJs from 'sql.js';
import { createApp } from '../app';
import { setDb, run, getAll } from '../db/database';
import { CATEGORY_TASK_LIMIT } from '../routes/todos';
import { v4 as uuidv4 } from 'uuid';

let categoryId: string;

async function setupTestDb() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;');
  db.run(`
    CREATE TABLE categories (
      id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, color TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );
    CREATE TABLE todos (
      id TEXT PRIMARY KEY, text TEXT NOT NULL,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );
  `);
  setDb(db);

  categoryId = uuidv4();
  db.run('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)', [categoryId, 'Test', '#000']);
}

beforeEach(async () => {
  process.env.NODE_ENV = 'test';
  await setupTestDb();
});

const app = createApp();

describe('GET /todos', () => {
  it('returns empty array when no todos', async () => {
    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('filters by category', async () => {
    const otherId = uuidv4();
    run('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)', otherId, 'Other', '#fff');
    run('INSERT INTO todos (id, text, category_id) VALUES (?, ?, ?)', uuidv4(), 'Other task', otherId);
    run('INSERT INTO todos (id, text, category_id) VALUES (?, ?, ?)', uuidv4(), 'My task', categoryId);

    const res = await request(app).get(`/todos?category=${categoryId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].text).toBe('My task');
  });
});

describe('POST /todos', () => {
  it('creates todo successfully', async () => {
    const res = await request(app).post('/todos').send({ text: 'Buy milk', category_id: categoryId });
    expect(res.status).toBe(201);
    expect(res.body.text).toBe('Buy milk');
    expect(res.body.completed).toBe(false);
  });

  it('returns 400 when text is missing', async () => {
    const res = await request(app).post('/todos').send({ category_id: categoryId });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
  });

  it('returns 400 when category_id is missing', async () => {
    const res = await request(app).post('/todos').send({ text: 'Some task' });
    expect(res.status).toBe(400);
  });

  it(`returns 400 when category has ${CATEGORY_TASK_LIMIT} tasks`, async () => {
    for (let i = 0; i < CATEGORY_TASK_LIMIT; i++) {
      run('INSERT INTO todos (id, text, category_id) VALUES (?, ?, ?)', uuidv4(), `Task ${i}`, categoryId);
    }
    const res = await request(app).post('/todos').send({ text: 'One too many', category_id: categoryId });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('category_limit_exceeded');
  });

  it('returns 404 when category does not exist', async () => {
    const res = await request(app).post('/todos').send({ text: 'Ghost', category_id: uuidv4() });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /todos/:id', () => {
  it('marks todo as completed', async () => {
    const id = uuidv4();
    run('INSERT INTO todos (id, text, category_id) VALUES (?, ?, ?)', id, 'Do laundry', categoryId);
    const res = await request(app).patch(`/todos/${id}`).send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('returns 404 for unknown todo', async () => {
    const res = await request(app).patch(`/todos/${uuidv4()}`).send({ completed: true });
    expect(res.status).toBe(404);
  });

  it('returns 400 if completed is not boolean', async () => {
    const id = uuidv4();
    run('INSERT INTO todos (id, text, category_id) VALUES (?, ?, ?)', id, 'Task', categoryId);
    const res = await request(app).patch(`/todos/${id}`).send({ completed: 'yes' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /todos/:id', () => {
  it('deletes todo and returns success', async () => {
    const id = uuidv4();
    run('INSERT INTO todos (id, text, category_id) VALUES (?, ?, ?)', id, 'Delete me', categoryId);
    const res = await request(app).delete(`/todos/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const remaining = getAll('SELECT id FROM todos WHERE id = ?', id);
    expect(remaining).toHaveLength(0);
  });

  it('returns 404 for unknown todo', async () => {
    const res = await request(app).delete(`/todos/${uuidv4()}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /categories', () => {
  it('returns categories', async () => {
    const res = await request(app).get('/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
