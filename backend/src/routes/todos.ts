import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getAll, getRow, run } from "../db/database";
import { CreateTodoDto, UpdateTodoDto, BulkUpdateDto, Todo } from "../types";

const router = Router();

export const CATEGORY_TASK_LIMIT = 5;

const TODO_SELECT = `
  SELECT
    t.id,
    t.text,
    t.category_id,
    c.name  AS category_name,
    c.color AS category_color,
    t.completed,
    t.created_at
  FROM todos t
  JOIN categories c ON c.id = t.category_id
`;

function normalizeTodo(t: Todo): Todo {
  return { ...t, completed: Boolean(t.completed) };
}

router.get("/", (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let todos: Todo[];

    if (category && typeof category === "string") {
      todos = getAll<Todo>(
        `${TODO_SELECT} WHERE t.category_id = ? ORDER BY t.created_at DESC`,
        category,
      );
    } else {
      todos = getAll<Todo>(`${TODO_SELECT} ORDER BY t.created_at DESC`);
    }

    res.json(todos.map(normalizeTodo));
  } catch (err) {
    console.error("[GET /todos]", err);
    res
      .status(500)
      .json({ error: "server_error", message: "Failed to fetch todos" });
  }
});

router.post("/", (req: Request, res: Response) => {
  try {
    const { text, category_id }: CreateTodoDto = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "validation_error", message: "Task text is required" });
    }
    if (!category_id || typeof category_id !== "string") {
      return res
        .status(400)
        .json({ error: "validation_error", message: "Category is required" });
    }
    if (text.trim().length > 500) {
      return res
        .status(400)
        .json({
          error: "validation_error",
          message: "Task text is too long (max 500 chars)",
        });
    }

    const category = getRow(
      "SELECT id FROM categories WHERE id = ?",
      category_id,
    );
    if (!category) {
      return res
        .status(404)
        .json({ error: "not_found", message: "Category not found" });
    }

    const countRow = getRow<{ count: number }>(
      "SELECT COUNT(*) as count FROM todos WHERE category_id = ?",
      category_id,
    );
    if ((countRow?.count ?? 0) >= CATEGORY_TASK_LIMIT) {
      return res.status(400).json({
        error: "category_limit_exceeded",
        message: `This category already has ${CATEGORY_TASK_LIMIT} tasks. Please complete or delete some first.`,
      });
    }

    const id = uuidv4();
    run(
      "INSERT INTO todos (id, text, category_id) VALUES (?, ?, ?)",
      id,
      text.trim(),
      category_id,
    );

    const todo = getRow<Todo>(`${TODO_SELECT} WHERE t.id = ?`, id);
    return res.status(201).json(normalizeTodo(todo!));
  } catch (err) {
    console.error("[POST /todos]", err);
    return res
      .status(500)
      .json({ error: "server_error", message: "Failed to create todo" });
  }
});

router.patch("/bulk", (req: Request, res: Response) => {
  try {
    const { ids, completed }: BulkUpdateDto = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({
          error: "validation_error",
          message: "`ids` must be a non-empty array",
        });
    }
    if (typeof completed !== "boolean") {
      return res
        .status(400)
        .json({
          error: "validation_error",
          message: "`completed` must be a boolean",
        });
    }

    for (const todoId of ids) {
      run(
        "UPDATE todos SET completed = ? WHERE id = ?",
        completed ? 1 : 0,
        todoId,
      );
    }

    const placeholders = ids.map(() => "?").join(",");
    const todos = getAll<Todo>(
      `${TODO_SELECT} WHERE t.id IN (${placeholders}) ORDER BY t.created_at DESC`,
      ...ids,
    );

    return res.json(todos.map(normalizeTodo));
  } catch (err) {
    console.error("[PATCH /todos/bulk]", err);
    return res
      .status(500)
      .json({ error: "server_error", message: "Failed to bulk update todos" });
  }
});

router.patch("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { completed }: UpdateTodoDto = req.body;

    if (typeof completed !== "boolean") {
      return res
        .status(400)
        .json({
          error: "validation_error",
          message: "`completed` must be a boolean",
        });
    }

    const existing = getRow("SELECT id FROM todos WHERE id = ?", id);
    if (!existing) {
      return res
        .status(404)
        .json({ error: "not_found", message: "Todo not found" });
    }

    run("UPDATE todos SET completed = ? WHERE id = ?", completed ? 1 : 0, id);

    const todo = getRow<Todo>(`${TODO_SELECT} WHERE t.id = ?`, id);
    return res.json(normalizeTodo(todo!));
  } catch (err) {
    console.error("[PATCH /todos/:id]", err);
    return res
      .status(500)
      .json({ error: "server_error", message: "Failed to update todo" });
  }
});

router.delete("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = getRow("SELECT id FROM todos WHERE id = ?", id);
    if (!existing) {
      return res
        .status(404)
        .json({ error: "not_found", message: "Todo not found" });
    }

    run("DELETE FROM todos WHERE id = ?", id);
    return res.json({ success: true, id });
  } catch (err) {
    console.error("[DELETE /todos/:id]", err);
    return res
      .status(500)
      .json({ error: "server_error", message: "Failed to delete todo" });
  }
});

export default router;
