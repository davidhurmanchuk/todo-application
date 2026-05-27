// Core domain types

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

// Request/Response DTOs

export interface CreateTodoDto {
  text: string;
  category_id: string;
}

export interface UpdateTodoDto {
  completed: boolean;
}

export interface BulkUpdateDto {
  ids: string[];
  completed: boolean;
}

export interface ApiError {
  error: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}
