export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Todo {
  id: string;
  text: string;
  category_id: string;
  category_name: string;
  category_color: string;
  completed: boolean;
  created_at: string;
}

export interface CreateTodoPayload {
  text: string;
  category_id: string;
}

export interface ApiError {
  error: string;
  message: string;
}

export interface SnackbarItem {
  id: string;
  message: string;
  todoSnapshot: Todo;
  action: "complete" | "delete";
  timerId: ReturnType<typeof setTimeout>;
}
