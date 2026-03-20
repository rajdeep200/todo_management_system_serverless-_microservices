import { TODO_STATUSES, type CreateTodoInput, type UpdateTodoInput } from '../types/todo';

export const parseJsonBody = <T>(body: string | null): T => {
  if (!body) {
    throw new Error('Request body is required');
  }

  return JSON.parse(body) as T;
};

export const validateCreateTodoInput = (payload: CreateTodoInput): void => {
  if (!payload.title || payload.title.trim().length < 3) {
    throw new Error('title must be at least 3 characters long');
  }
};

export const validateUpdateTodoInput = (payload: UpdateTodoInput): void => {
  if (payload.title !== undefined && payload.title.trim().length < 3) {
    throw new Error('title must be at least 3 characters long');
  }

  if (payload.status !== undefined && !TODO_STATUSES.includes(payload.status)) {
    throw new Error(`status must be one of: ${TODO_STATUSES.join(', ')}`);
  }
};
