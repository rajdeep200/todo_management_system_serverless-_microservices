import type { SQSEvent } from 'aws-lambda';
import { TodoRepository } from '../repositories/todoRepository';
import { EventPublisher } from '../services/eventPublisher';
import type { TodoCreatedEventDetail } from '../types/todo';
import { logger } from '../utils/logger';

const repository = new TodoRepository();
const eventPublisher = new EventPublisher();

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    try {
      const envelope = JSON.parse(record.body) as { detail: TodoCreatedEventDetail };
      const todoId = envelope.detail?.todoId;

      if (!todoId) {
        logger.error('SQS message missing todoId', { body: record.body });
        continue;
      }

      logger.info('Starting async processing for todo', { todoId });

      await repository.updateStatus(todoId, 'PROCESSING');
      await sleep(2000);
      const updatedTodo = await repository.updateStatus(todoId, 'COMPLETED');

      await eventPublisher.publish('todo.completed', 'task-processing-service', {
        todoId,
        status: 'COMPLETED',
        completedAt: updatedTodo?.updatedAt ?? new Date().toISOString()
      });

      logger.info('Todo processed successfully', { todoId });
    } catch (error) {
      logger.error('Failed to process todo message', {
        error,
        messageBody: record.body
      });
      throw error;
    }
  }
};
