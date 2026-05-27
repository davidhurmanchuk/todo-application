"use client";

import { SnackbarItem } from "../../types";

interface SnackbarStackProps {
  items: SnackbarItem[];
  onUndo: (item: SnackbarItem) => void;
  onDismiss: (id: string) => void;
}

export function SnackbarStack({
  items,
  onUndo,
  onDismiss,
}: SnackbarStackProps) {
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {items.map((item) => (
        <div
          key={item.id}
          className="anim-slide-up pointer-events-auto flex items-center gap-3 bg-app-primary text-white px-4 py-3 rounded-xl shadow-lg text-sm min-w-72 max-w-md relative overflow-hidden"
        >
          <div className="absolute bottom-0 left-0 h-0.5 bg-white/20 anim-shrink" />

          <span className="flex-1 truncate">{item.message}</span>

          <button
            onClick={() => onUndo(item)}
            className="font-semibold text-amber-400 hover:text-amber-300 shrink-0 cursor-pointer transition-colors"
          >
            Undo
          </button>

          <button
            onClick={() => onDismiss(item.id)}
            className="text-white/40 hover:text-white/80 shrink-0 cursor-pointer text-lg leading-none transition-colors"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
