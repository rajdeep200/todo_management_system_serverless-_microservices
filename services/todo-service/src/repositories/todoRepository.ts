import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import type { Todo, UpdateTodoInput } from '../types/todo';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TODOS_TABLE as string;

export class TodoRepository {
  async create(todo: Todo): Promise<void> {
    await documentClient.send(
      new PutCommand({
        TableName: tableName,
        Item: todo
      })
    );
  }

  async list(): Promise<Todo[]> {
    const result = await documentClient.send(
      new ScanCommand({
        TableName: tableName
      })
    );

    return (result.Items as Todo[] | undefined) ?? [];
  }

  async getById(id: string): Promise<Todo | null> {
    const result = await documentClient.send(
      new GetCommand({
        TableName: tableName,
        Key: { id }
      })
    );

    return (result.Item as Todo | undefined) ?? null;
  }

  async update(id: string, updates: UpdateTodoInput): Promise<Todo | null> {
    const expressionAttributeNames: Record<string, string> = {
      '#updatedAt': 'updatedAt'
    };

    const expressionAttributeValues: Record<string, unknown> = {
      ':updatedAt': new Date().toISOString()
    };

    const setExpressions: string[] = ['#updatedAt = :updatedAt'];

    if (updates.title !== undefined) {
      expressionAttributeNames['#title'] = 'title';
      expressionAttributeValues[':title'] = updates.title;
      setExpressions.push('#title = :title');
    }

    if (updates.description !== undefined) {
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = updates.description;
      setExpressions.push('#description = :description');
    }

    if (updates.dueDate !== undefined) {
      expressionAttributeNames['#dueDate'] = 'dueDate';
      expressionAttributeValues[':dueDate'] = updates.dueDate;
      setExpressions.push('#dueDate = :dueDate');
    }

    if (updates.status !== undefined) {
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = updates.status;
      setExpressions.push('#status = :status');
    }

    const result = await documentClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression: `SET ${setExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: 'attribute_exists(id)',
        ReturnValues: 'ALL_NEW'
      })
    );

    return (result.Attributes as Todo | undefined) ?? null;
  }

  async delete(id: string): Promise<void> {
    await documentClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { id }
      })
    );
  }
}
