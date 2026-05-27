"use client";

import { Todo, Category } from "../../types";
import { TodoItem } from "./TodoItem";
import { Spinner } from "../ui/Spinner";
import { ClipboardList, CheckSquare, Square } from "lucide-react";
import { cn } from "../../lib/utils";

interface TodoListProps {
  todos: Todo[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  pendingIds: Set<string>;
  selectedIds: Set<string>;
  categoryFilter: string;
  onCategoryFilterChange: (id: string) => void;
  onComplete: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkComplete: () => void;
}

export function TodoList({
  todos,
  categories,
  loading,
  error,
  pendingIds,
  selectedIds,
  categoryFilter,
  onCategoryFilterChange,
  onComplete,
  onDelete,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onBulkComplete,
}: TodoListProps) {
  const activeTodos = todos.filter(
    (t) => !t.completed && !pendingIds.has(t.id),
  );
  const doneTodos = todos.filter((t) => t.completed || pendingIds.has(t.id));
  const allSelected =
    activeTodos.length > 0 && activeTodos.every((t) => selectedIds.has(t.id));

  return (
    <div className="bg-app-card border border-app-border rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-app-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-app-muted uppercase tracking-wider">
            Tasks
          </span>
          {!loading && (
            <span className="text-xs bg-app-accent text-app-muted px-2 py-0.5 rounded-full font-medium">
              {activeTodos.length}
            </span>
          )}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border border-app-border bg-app-accent text-app-primary outline-none cursor-pointer appearance-none"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {activeTodos.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-2.5 bg-app-accent border-b border-app-border">
          <button
            onClick={allSelected ? onClearSelection : onSelectAll}
            className="flex items-center gap-1.5 text-xs font-medium text-app-muted hover:text-app-primary cursor-pointer transition-colors"
          >
            {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
            {allSelected ? "Deselect all" : "Select all"}
          </button>

          {selectedIds.size > 0 && (
            <>
              <span className="text-app-border text-lg">|</span>
              <span className="text-xs text-app-muted">
                {selectedIds.size} selected
              </span>
              <button
                onClick={onBulkComplete}
                className="ml-auto text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1 rounded-lg cursor-pointer transition-colors"
              >
                Mark done
              </button>
              <button
                onClick={onClearSelection}
                className="text-xs text-app-muted hover:text-app-primary cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      <div className="p-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner className="text-app-muted" />
            <p className="text-sm text-app-muted">Loading tasks…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex justify-center py-12">
            <div className="text-center px-4 py-5 bg-red-50 border border-red-200 rounded-xl max-w-sm">
              <p className="text-sm font-medium text-red-600">{error}</p>
              <p className="text-xs text-red-400 mt-1">
                Make sure the backend is running on port 4000
              </p>
            </div>
          </div>
        )}

        {!loading && !error && todos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-app-muted">
            <ClipboardList size={36} className="opacity-30" />
            <p className="text-sm font-medium">No tasks yet</p>
            <p className="text-xs opacity-60">Add your first task above</p>
          </div>
        )}

        {!loading && !error && activeTodos.length > 0 && (
          <div className="flex flex-col gap-2">
            {activeTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isPending={pendingIds.has(todo.id)}
                isSelected={selectedIds.has(todo.id)}
                onComplete={onComplete}
                onDelete={onDelete}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </div>
        )}

        {!loading && !error && doneTodos.length > 0 && (
          <div
            className={cn(
              "flex flex-col gap-2",
              activeTodos.length > 0 && "mt-4 pt-4 border-t border-app-border",
            )}
          >
            <p className="text-xs font-medium text-app-muted uppercase tracking-wide mb-1">
              Completed
            </p>
            {doneTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isPending={pendingIds.has(todo.id)}
                isSelected={false}
                onComplete={onComplete}
                onDelete={onDelete}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
