# Taskify — Todo App with Categories

A full-stack task management app built with **Next.js + TypeScript** (frontend) and **Express.js + TypeScript + SQLite** (backend).

## Features

- ✅ Create tasks with text and a category
- ✅ Mark tasks as completed (with 5-second undo via snackbar)
- ✅ Delete tasks (with undo)
- ✅ Filter tasks by category
- ✅ Max 5 tasks per category (enforced on backend, surfaced on frontend)
- ✅ Loading / error / empty states
- ✅ **Bonus:** Bulk select & mark done
- ✅ **Bonus:** Jest tests (13 backend tests)
- ✅ **Bonus:** docker-compose

## Tech Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | Next.js 16, TypeScript, Tailwind CSS, React Hook Form, Zod, Axios |
| Backend   | Express.js, TypeScript, sql.js (SQLite) |
| Testing   | Jest, Supertest, ts-jest |
| Infra     | Docker, docker-compose |

---

## Running locally (without Docker)

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 1. Backend

```bash
cd backend
npm install
npm run dev          # starts on http://localhost:4000
```

The database file is auto-created at `backend/data/todos.db` on first run.
Five default categories are seeded automatically (Work, Personal, Shopping, Health, Learning).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000).

---

## Running with Docker

```bash
# From the project root
docker-compose up --build
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:4000
- SQLite data is persisted in a named Docker volume (`todo-data`)

---

## Running tests

```bash
cd backend
npm test             # runs Jest with coverage
```

### What's tested (13 tests)

- `GET /todos` — empty list, category filter
- `POST /todos` — success, missing text, missing category, 5-task limit, unknown category
- `PATCH /todos/:id` — complete, 404, invalid body
- `DELETE /todos/:id` — success, 404
- `GET /categories` — returns list

---

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/todos?category=<id>` | List todos (optional filter) |
| `POST` | `/todos` | Create todo `{ text, category_id }` |
| `PATCH` | `/todos/:id` | Update status `{ completed: bool }` |
| `PATCH` | `/todos/bulk` | Bulk update `{ ids: string[], completed: bool }` |
| `DELETE` | `/todos/:id` | Delete todo |
| `GET` | `/categories` | List categories |
| `GET` | `/health` | Health check |

### Error responses

```json
{ "error": "category_limit_exceeded", "message": "This category already has 5 tasks..." }
{ "error": "validation_error",        "message": "Task text is required" }
{ "error": "not_found",               "message": "Todo not found" }
```

---

## Project structure

```
todo-app/
├── backend/
│   ├── src/
│   │   ├── __tests__/todos.test.ts   # Jest tests
│   │   ├── db/database.ts            # sql.js wrapper + migrations + seeding
│   │   ├── middleware/errorHandler.ts
│   │   ├── routes/
│   │   │   ├── todos.ts              # CRUD + bulk
│   │   │   └── categories.ts
│   │   ├── types/index.ts
│   │   ├── app.ts                    # Express app factory
│   │   └── index.ts                 # Server entry
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── todos/
│   │   │   │   ├── TodoForm.tsx      # react-hook-form + zod
│   │   │   │   ├── TodoItem.tsx
│   │   │   │   └── TodoList.tsx
│   │   │   └── ui/
│   │   │       ├── CategoryBadge.tsx
│   │   │       ├── SnackbarStack.tsx
│   │   │       └── Spinner.tsx
│   │   ├── hooks/useTodos.ts         # all todo state & actions
│   │   ├── lib/
│   │   │   ├── api.ts                # Axios API client
│   │   │   └── utils.ts             # cn() helper
│   │   ├── types/index.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## AI usage answers

**1. Did you use AI at any stage?**
Yes — to accelerate boilerplate generation and discuss architectural decisions.

**2. What problems did AI help resolve?**
- Deciding between `better-sqlite3` vs `sql.js` when native builds were unavailable
- Structuring the Undo/snackbar flow with pending-ID sets to avoid race conditions
- Keeping the `PATCH /todos/bulk` route before `PATCH /todos/:id` to avoid Express route conflict
