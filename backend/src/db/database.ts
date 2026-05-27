import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(__dirname, "../../data/todos.db");

let SQL: SqlJsStatic;
let db: Database;

export async function initDb(): Promise<void> {
  if (db) return;

  SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON;");
  runMigrations();
  persist();
}

export function getDb(): Database {
  if (!db) throw new Error("Database not initialised — call initDb() first");
  return db;
}

export function setDb(instance: Database): void {
  db = instance;
}

export function persist(): void {
  if (process.env.NODE_ENV === "test") return;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export function run(sql: string, ...params: unknown[]): void {
  getDb().run(sql, params as never[]);
  persist();
}

export function getRow<T = Record<string, unknown>>(
  sql: string,
  ...params: unknown[]
): T | undefined {
  const stmt = getDb().prepare(sql);
  stmt.bind(params as never[]);
  if (!stmt.step()) {
    stmt.free();
    return undefined;
  }
  const row = stmt.getAsObject() as unknown as T;
  stmt.free();
  return row;
}

export function getAll<T = Record<string, unknown>>(
  sql: string,
  ...params: unknown[]
): T[] {
  const stmt = getDb().prepare(sql);
  stmt.bind(params as never[]);
  const results: T[] = [];
  while (stmt.step()) results.push(stmt.getAsObject() as unknown as T);
  stmt.free();
  return results;
}

function runMigrations(): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE,
      color      TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );

    CREATE TABLE IF NOT EXISTS todos (
      id          TEXT PRIMARY KEY,
      text        TEXT NOT NULL,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      completed   INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );
  `);

  const { count } = getRow<{ count: number }>(
    "SELECT COUNT(*) as count FROM categories",
  )!;
  if (count === 0) seedCategories();
}

function seedCategories(): void {
  const defaults = [
    { name: "Work", color: "#6366f1" },
    { name: "Personal", color: "#f59e0b" },
    { name: "Shopping", color: "#10b981" },
    { name: "Health", color: "#ef4444" },
    { name: "Learning", color: "#3b82f6" },
  ];
  for (const cat of defaults) {
    db.run("INSERT INTO categories (id, name, color) VALUES (?, ?, ?)", [
      uuidv4(),
      cat.name,
      cat.color,
    ]);
  }
}
