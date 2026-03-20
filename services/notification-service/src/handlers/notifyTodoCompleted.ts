import type { EventBridgeEvent } from 'aws-lambda';
import type { TodoCompletedDetail } from '../types/events';
import { logger } from '../utils/logger';

export const handler = async (event: EventBridgeEvent<'todo.completed', TodoCompletedDetail>): Promise<void> => {
  logger.info('Notification triggered for todo completion', {
    todoId: event.detail.todoId,
    status: event.detail.status,
    completedAt: event.detail.completedAt,
    source: event.source
  });
};
