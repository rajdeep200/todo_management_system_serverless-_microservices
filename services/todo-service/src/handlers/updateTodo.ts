import type { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { TodoRepository } from '../repositories/todoRepository';
import { EventPublisher } from '../services/eventPublisher';
import type { UpdateTodoInput } from '../types/todo';
import { logger } from '../utils/logger';
import { jsonResponse } from '../utils/response';
import { parseJsonBody, validateUpdateTodoInput } from '../utils/validator';

const repository = new TodoRepository();
const eventPublisher = new EventPublisher();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return jsonResponse(400, { message: 'Todo id is required' });
    }

    const payload = parseJsonBody<UpdateTodoInput>(event.body ?? null);
    validateUpdateTodoInput(payload);

    const existingTodo = await repository.getById(id);

    if (!existingTodo) {
      return jsonResponse(404, { message: 'Todo not found' });
    }

    const updatedTodo = await repository.update(id, payload);

    await eventPublisher.publish({
      detailType: 'todo.updated',
      source: 'todo-service',
      detail: {
        todoId: id,
        status: updatedTodo?.status,
        updatedAt: updatedTodo?.updatedAt
      }
    });

    if (payload.status === 'COMPLETED' && existingTodo.status !== 'COMPLETED') {
      await eventPublisher.publish({
        detailType: 'todo.completed',
        source: 'todo-service',
        detail: {
          todoId: id,
          status: 'COMPLETED',
          completedAt: new Date().toISOString()
        }
      });
    }

    logger.info('Todo updated successfully', { todoId: id });

    return jsonResponse(200, {
      message: 'Todo updated successfully',
      data: updatedTodo
    });
  } catch (error) {
    logger.error('Failed to update todo', error);

    const message = error instanceof Error ? error.message : 'Failed to update todo';
    const statusCode = message.includes('attribute_exists') ? 404 : 400;

    return jsonResponse(statusCode, { message });
  }
};
