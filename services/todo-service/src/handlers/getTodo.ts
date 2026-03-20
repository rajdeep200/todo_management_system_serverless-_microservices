import type { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { TodoRepository } from '../repositories/todoRepository';
import { logger } from '../utils/logger';
import { jsonResponse } from '../utils/response';

const repository = new TodoRepository();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return jsonResponse(400, { message: 'Todo id is required' });
    }

    const todo = await repository.getById(id);

    if (!todo) {
      return jsonResponse(404, { message: 'Todo not found' });
    }

    logger.info('Todo fetched successfully', { todoId: id });

    return jsonResponse(200, {
      message: 'Todo fetched successfully',
      data: todo
    });
  } catch (error) {
    logger.error('Failed to get todo', error);

    return jsonResponse(500, {
      message: 'Failed to get todo'
    });
  }
};
