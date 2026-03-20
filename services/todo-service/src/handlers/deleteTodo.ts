import type { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { TodoRepository } from '../repositories/todoRepository';
import { EventPublisher } from '../services/eventPublisher';
import { logger } from '../utils/logger';
import { jsonResponse } from '../utils/response';

const repository = new TodoRepository();
const eventPublisher = new EventPublisher();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return jsonResponse(400, { message: 'Todo id is required' });
    }

    const existingTodo = await repository.getById(id);

    if (!existingTodo) {
      return jsonResponse(404, { message: 'Todo not found' });
    }

    await repository.delete(id);

    await eventPublisher.publish({
      detailType: 'todo.deleted',
      source: 'todo-service',
      detail: {
        todoId: id,
        deletedAt: new Date().toISOString()
      }
    });

    logger.info('Todo deleted successfully', { todoId: id });

    return jsonResponse(200, {
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete todo', error);

    return jsonResponse(500, {
      message: 'Failed to delete todo'
    });
  }
};
