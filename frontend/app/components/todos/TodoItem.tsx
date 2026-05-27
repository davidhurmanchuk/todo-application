"use client";

import { Todo } from "../../types";
import { CategoryBadge } from "../ui/CategoryBadge";
import { Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface TodoItemProps {
  todo: Todo;
  isPending: boolean;
  isSelected: boolean;
  onComplete: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onToggleSelect: (id: string) => void;
}

export function TodoItem({
  todo,
  isPending,
  isSelected,
  onComplete,
  onDelete,
  onToggleSelect,
}: TodoItemProps) {
  const isDone = todo.completed || isPending;

  return (
    <div
      className={cn(
        "group anim-fade-in flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-150",
        isDone ? "opacity-50" : "",
        isSelected
          ? "bg-app-accent border-app-muted"
          : "bg-app-card border-app-border hover:border-gray-300",
      )}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(todo.id)}
        disabled={isDone}
        className="w-4 h-4 rounded shrink-0 accent-app-primary cursor-pointer disabled:cursor-not-allowed"
        aria-label="Select task"
      />

      <button
        onClick={() => !isDone && onComplete(todo)}
        disabled={isDone}
        className={cn(
          "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors duration-150",
          todo.completed
            ? "bg-emerald-500 border-emerald-500"
            : "border-gray-300 hover:border-emerald-400 cursor-pointer",
          isDone && !todo.completed ? "cursor-default" : "",
        )}
        aria-label={todo.completed ? "Completed" : "Mark as complete"}
      >
        {todo.completed && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <span
        className={cn(
          "flex-1 text-sm leading-snug",
          isDone ? "line-through text-app-muted" : "text-app-primary",
        )}
      >
        {todo.text}
      </span>

      <CategoryBadge
        name={todo.category_name}
        color={todo.category_color}
        small
      />

      <button
        onClick={() => onDelete(todo)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-app-muted hover:bg-red-50 hover:text-red-500 cursor-pointer shrink-0 transition-all duration-150"
        aria-label="Delete task"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
