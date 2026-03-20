import type { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { TodoRepository } from '../repositories/todoRepository';
import { EventPublisher } from '../services/eventPublisher';
import type { CreateTodoInput, Todo } from '../types/todo';
import { logger } from '../utils/logger';
import { jsonResponse } from '../utils/response';
import { parseJsonBody, validateCreateTodoInput } from '../utils/validator';

const repository = new TodoRepository();
const eventPublisher = new EventPublisher();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  try {
    const payload = parseJsonBody<CreateTodoInput>(event.body ?? null);
    validateCreateTodoInput(payload);

    const now = new Date().toISOString();

    const todo: Todo = {
      id: uuidv4(),
      title: payload.title.trim(),
      description: payload.description?.trim(),
      dueDate: payload.dueDate,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now
    };

    await repository.create(todo);

    await eventPublisher.publish({
      detailType: 'todo.created',
      source: 'todo-service',
      detail: {
        todoId: todo.id,
        title: todo.title,
        status: todo.status,
        createdAt: todo.createdAt
      }
    });

    logger.info('Todo created successfully', { todoId: todo.id });

    return jsonResponse(201, {
      message: 'Todo created successfully',
      data: todo
    });
  } catch (error) {
    logger.error('Failed to create todo', error);

    return jsonResponse(400, {
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
