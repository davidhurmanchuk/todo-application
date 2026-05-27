"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Todo, SnackbarItem, CreateTodoPayload } from "../types";
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  bulkUpdateTodos,
} from "../lib/api";

const UNDO_TIMEOUT_MS = 5000;

export function useTodos(categoryFilter: string) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([]);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const snackbarsRef = useRef(snackbars);
  useEffect(() => {
    snackbarsRef.current = snackbars;
  }, [snackbars]);

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTodos(categoryFilter || undefined);
      setTodos(data);
    } catch {
      setError("Failed to load tasks. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    loadTodos();
    setSelectedIds(new Set());
  }, [loadTodos]);

  const dismissSnackbar = useCallback((snackbarId: string) => {
    setSnackbars((prev) => {
      const item = prev.find((s) => s.id === snackbarId);
      if (item) clearTimeout(item.timerId);
      return prev.filter((s) => s.id !== snackbarId);
    });
  }, []);

  const pushSnackbar = useCallback(
    (
      todoSnapshot: Todo,
      action: "complete" | "delete",
      onExpire: () => void,
    ): string => {
      const snackbarId = `snack-${Date.now()}-${Math.random()}`;
      const message =
        action === "complete"
          ? `"${todoSnapshot.text}" marked as done`
          : `"${todoSnapshot.text}" deleted`;

      const timerId = setTimeout(() => {
        onExpire();
        setSnackbars((prev) => prev.filter((s) => s.id !== snackbarId));
        setPendingIds((prev) => {
          const n = new Set(prev);
          n.delete(todoSnapshot.id);
          return n;
        });
      }, UNDO_TIMEOUT_MS);

      const item: SnackbarItem = {
        id: snackbarId,
        message,
        todoSnapshot,
        action,
        timerId,
      };
      setSnackbars((prev) => [...prev, item]);
      return snackbarId;
    },
    [],
  );

  const completeTodo = useCallback(
    async (todo: Todo) => {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, completed: true } : t)),
      );
      setPendingIds((prev) => new Set(prev).add(todo.id));
      setSelectedIds((prev) => {
        const n = new Set(prev);
        n.delete(todo.id);
        return n;
      });

      try {
        await updateTodo(todo.id, true);
      } catch {
        setTodos((prev) =>
          prev.map((t) => (t.id === todo.id ? { ...t, completed: false } : t)),
        );
        setPendingIds((prev) => {
          const n = new Set(prev);
          n.delete(todo.id);
          return n;
        });
        return;
      }

      const snackbarId = pushSnackbar(todo, "complete", () => {
        setTodos((prev) => prev.filter((t) => t.id !== todo.id));
      });

      void snackbarId;
    },
    [pushSnackbar],
  );

  const undoAction = useCallback(
    async (snackbarItem: SnackbarItem) => {
      clearTimeout(snackbarItem.timerId);
      setSnackbars((prev) => prev.filter((s) => s.id !== snackbarItem.id));
      setPendingIds((prev) => {
        const n = new Set(prev);
        n.delete(snackbarItem.todoSnapshot.id);
        return n;
      });

      if (snackbarItem.action === "complete") {
        setTodos((prev) =>
          prev.map((t) =>
            t.id === snackbarItem.todoSnapshot.id
              ? { ...t, completed: false }
              : t,
          ),
        );
        try {
          await updateTodo(snackbarItem.todoSnapshot.id, false);
        } catch {
          setError("Failed to undo. Please refresh.");
        }
      } else {
        setTodos((prev) => [snackbarItem.todoSnapshot, ...prev]);
        try {
          await createTodo({
            text: snackbarItem.todoSnapshot.text,
            category_id: snackbarItem.todoSnapshot.category_id,
          });
        } catch {
          loadTodos();
        }
      }
    },
    [loadTodos],
  );

  const removeTodo = useCallback(
    async (todo: Todo) => {
      setTodos((prev) => prev.filter((t) => t.id !== todo.id));
      setSelectedIds((prev) => {
        const n = new Set(prev);
        n.delete(todo.id);
        return n;
      });

      try {
        await deleteTodo(todo.id);
      } catch {
        setTodos((prev) => [todo, ...prev]);
        return;
      }

      pushSnackbar(todo, "delete", () => {});
    },
    [pushSnackbar],
  );

  const addTodo = useCallback(
    async (payload: CreateTodoPayload): Promise<void> => {
      const newTodo = await createTodo(payload);
      setTodos((prev) => [newTodo, ...prev]);
    },
    [],
  );

  const bulkComplete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const snapshots = todos.filter((t) => ids.includes(t.id));

    setTodos((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, completed: true } : t)),
    );
    setPendingIds((prev) => {
      const n = new Set(prev);
      ids.forEach((id) => n.add(id));
      return n;
    });
    setSelectedIds(new Set());

    try {
      await bulkUpdateTodos(ids, true);
    } catch {
      setTodos((prev) =>
        prev.map((t) => (ids.includes(t.id) ? { ...t, completed: false } : t)),
      );
      setPendingIds((prev) => {
        const n = new Set(prev);
        ids.forEach((id) => n.delete(id));
        return n;
      });
      return;
    }

    for (const snap of snapshots) {
      pushSnackbar(snap, "complete", () => {
        setTodos((prev) => prev.filter((t) => t.id !== snap.id));
      });
    }
  }, [selectedIds, todos, pushSnackbar]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const selectAll = useCallback(() => {
    const activeTodos = todos.filter(
      (t) => !t.completed && !pendingIds.has(t.id),
    );
    setSelectedIds(new Set(activeTodos.map((t) => t.id)));
  }, [todos, pendingIds]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  return {
    todos,
    loading,
    error,
    snackbars,
    pendingIds,
    selectedIds,
    completeTodo,
    removeTodo,
    addTodo,
    undoAction,
    dismissSnackbar,
    bulkComplete,
    toggleSelect,
    selectAll,
    clearSelection,
    reload: loadTodos,
  };
}
