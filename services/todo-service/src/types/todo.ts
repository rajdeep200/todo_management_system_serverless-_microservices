export const TODO_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const;

export type TodoStatus = (typeof TODO_STATUSES)[number];

export interface Todo {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: TodoStatus;
}
