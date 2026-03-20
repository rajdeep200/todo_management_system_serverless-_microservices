import type { APIGatewayProxyResult } from 'aws-lambda';
import { TodoRepository } from '../repositories/todoRepository';
import { logger } from '../utils/logger';
import { jsonResponse } from '../utils/response';

const repository = new TodoRepository();

export const handler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const todos = await repository.list();

    logger.info('Todos fetched successfully', { count: todos.length });

    return jsonResponse(200, {
      message: 'Todos fetched successfully',
      data: todos
    });
  } catch (error) {
    logger.error('Failed to list todos', error);

    return jsonResponse(500, {
      message: 'Failed to list todos'
    });
  }
};
