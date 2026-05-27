import axios from "axios";
import { Todo, Category, CreateTodoPayload } from "../types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
});

export async function fetchTodos(categoryId?: string): Promise<Todo[]> {
  const params = categoryId ? { category: categoryId } : {};
  const { data } = await api.get<Todo[]>("/todos", { params });
  return data;
}

export async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  const { data } = await api.post<Todo>("/todos", payload);
  return data;
}

export async function updateTodo(
  id: string,
  completed: boolean,
): Promise<Todo> {
  const { data } = await api.patch<Todo>(`/todos/${id}`, { completed });
  return data;
}

export async function deleteTodo(id: string): Promise<void> {
  await api.delete(`/todos/${id}`);
}

export async function bulkUpdateTodos(
  ids: string[],
  completed: boolean,
): Promise<Todo[]> {
  const { data } = await api.patch<Todo[]>("/todos/bulk", { ids, completed });
  return data;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/categories");
  return data;
}
