import type { APIGatewayProxyResult } from 'aws-lambda';

export const jsonResponse = (statusCode: number, body: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
});
