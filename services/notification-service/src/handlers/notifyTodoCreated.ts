import type { EventBridgeEvent } from 'aws-lambda';
import type { TodoCreatedDetail } from '../types/events';
import { logger } from '../utils/logger';

export const handler = async (event: EventBridgeEvent<'todo.created', TodoCreatedDetail>): Promise<void> => {
  logger.info('Notification triggered for todo creation', {
    todoId: event.detail.todoId,
    title: event.detail.title,
    createdAt: event.detail.createdAt,
    source: event.source
  });
};
