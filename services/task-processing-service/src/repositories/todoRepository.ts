import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { Todo } from '../types/todo';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TODOS_TABLE as string;

export class TodoRepository {
  async getById(id: string): Promise<Todo | null> {
    const result = await documentClient.send(
      new GetCommand({
        TableName: tableName,
        Key: { id }
      })
    );

    return (result.Item as Todo | undefined) ?? null;
  }

  async updateStatus(id: string, status: Todo['status']): Promise<Todo | null> {
    const result = await documentClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#updatedAt': 'updatedAt'
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':updatedAt': new Date().toISOString()
        },
        ConditionExpression: 'attribute_exists(id)',
        ReturnValues: 'ALL_NEW'
      })
    );

    return (result.Attributes as Todo | undefined) ?? null;
  }
}
