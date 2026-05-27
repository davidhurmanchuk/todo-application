"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "../../lib/utils";
import { Category, CreateTodoPayload } from "../../types";
import { Spinner } from "../ui/Spinner";
import { Plus } from "lucide-react";
import axios from "axios";

const schema = z.object({
  text: z
    .string()
    .min(1, "Task text is required")
    .max(500, "Too long (max 500 chars)"),
  category_id: z.string().min(1, "Please select a category"),
});

type FormValues = z.infer<typeof schema>;

interface TodoFormProps {
  categories: Category[];
  onSubmit: (payload: CreateTodoPayload) => Promise<void>;
}

const fieldBase =
  "w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors duration-150";
const fieldIdle =
  "bg-app-accent border-transparent text-app-primary placeholder:text-app-muted focus:border-app-primary focus:bg-white";
const fieldErr = "bg-red-50 border-red-400";

export function TodoForm({ categories, onSubmit }: TodoFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const handleFormSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values);
      reset();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError("root", { message: err.response.data.message });
      } else {
        setError("root", {
          message: "Failed to create task. Please try again.",
        });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="bg-app-card border border-app-border rounded-2xl p-5 shadow-sm"
    >
      <h2 className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-4">
        New Task
      </h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            {...register("text")}
            placeholder="What needs to be done?"
            disabled={isSubmitting}
            className={cn(fieldBase, errors.text ? fieldErr : fieldIdle)}
          />
          {errors.text && (
            <p className="mt-1 text-xs text-red-500">{errors.text.message}</p>
          )}
        </div>

        <div className="sm:w-44">
          <select
            {...register("category_id")}
            disabled={isSubmitting}
            className={cn(
              fieldBase,
              "appearance-none cursor-pointer",
              errors.category_id ? fieldErr : fieldIdle,
            )}
          >
            <option value="">Category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-xs text-red-500">
              {errors.category_id.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-app-primary text-white hover:opacity-90 disabled:opacity-50 cursor-pointer transition-opacity"
        >
          {isSubmitting ? <Spinner /> : <Plus size={16} />}
          Add
        </button>
      </div>

      {errors.root && (
        <p className="mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {errors.root.message}
        </p>
      )}
    </form>
  );
}
