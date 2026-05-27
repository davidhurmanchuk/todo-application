"use client";

import { useState, useEffect } from "react";
import { Category } from "./types";
import { fetchCategories } from "./lib/api";
import { useTodos } from "./hooks/useTodos";
import { TodoForm } from "./components/todos/TodoForm";
import { TodoList } from "./components/todos/TodoList";
import { SnackbarStack } from "./components/ui/SnackbarStack";
import { CheckSquare } from "lucide-react";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");

  const {
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
  } = useTodos(categoryFilter);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="sticky top-0 z-30 border-b border-app-border bg-app-card/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-app-primary flex items-center justify-center shrink-0">
            <CheckSquare size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none">Taskify</h1>
            <p className="text-xs text-app-muted mt-0.5">Stay organised</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <TodoForm categories={categories} onSubmit={addTodo} />
        <TodoList
          todos={todos}
          categories={categories}
          loading={loading}
          error={error}
          pendingIds={pendingIds}
          selectedIds={selectedIds}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          onComplete={completeTodo}
          onDelete={removeTodo}
          onToggleSelect={toggleSelect}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onBulkComplete={bulkComplete}
        />
      </main>

      <SnackbarStack
        items={snackbars}
        onUndo={undoAction}
        onDismiss={dismissSnackbar}
      />
    </div>
  );
}
