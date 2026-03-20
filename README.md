# Todo Management System – Serverless Microservices

A starter implementation of a Todo Management backend using **AWS Lambda**, **API Gateway**, **DynamoDB**, **SQS**, and **EventBridge** with the **Serverless Framework** and **TypeScript**.

## Architecture

- **Todo Service**
  - REST APIs for CRUD operations
  - Persists todo items in DynamoDB
  - Publishes domain events (`todo.created`, `todo.updated`, `todo.completed`, `todo.deleted`) to EventBridge

- **Task Processing Service**
  - Consumes newly created todo events asynchronously through SQS
  - Simulates background work
  - Updates todo status from `PENDING` -> `PROCESSING` -> `COMPLETED`
  - Publishes `todo.completed` after processing

- **Notification Service**
  - Subscribes to events from EventBridge
  - Logs notification messages for `todo.created` and `todo.completed`

## Event Flow

1. `POST /todos` creates a todo in DynamoDB with status `PENDING`
2. Todo Service publishes `todo.created` to EventBridge
3. EventBridge routes `todo.created` to:
   - Notification Service
   - SQS queue for Task Processing Service
4. Task Processing Service updates the task to `PROCESSING`, simulates work, then marks it `COMPLETED`
5. Task Processing Service publishes `todo.completed`
6. Notification Service reacts to `todo.completed`

## Repository Structure

```text
.
├── infra/
│   ├── package.json
│   └── serverless.yml
├── services/
│   ├── todo-service/
│   ├── task-processing-service/
│   └── notification-service/
├── package.json
└── README.md
```

## Prerequisites

- Node.js 20+
- AWS CLI configured (`aws configure`)
- Serverless Framework credentials access to your AWS account

## Deployment Order

Deploy these in order because the services consume CloudFormation outputs from the infra stack.

### 1) Deploy infrastructure

```bash
cd infra
npm install
npx serverless deploy --stage dev
```

### 2) Deploy Todo Service

```bash
cd ../services/todo-service
npm install
npx serverless deploy --stage dev
```

### 3) Deploy Task Processing Service

```bash
cd ../task-processing-service
npm install
npx serverless deploy --stage dev
```

### 4) Deploy Notification Service

```bash
cd ../notification-service
npm install
npx serverless deploy --stage dev
```

## API Endpoints

After deploying `todo-service`, Serverless will print the API Gateway base URL. Use it for the following endpoints:

- `POST /todos`
- `GET /todos`
- `GET /todos/{id}`
- `PUT /todos/{id}`
- `DELETE /todos/{id}`

## Example Requests

### Create Todo

```bash
curl -X POST '<API_BASE_URL>/todos'   -H 'Content-Type: application/json'   -d '{
    "title": "Learn AWS Lambda",
    "description": "Finish the coding assignment",
    "dueDate": "2026-03-25"
  }'
```

### List Todos

```bash
curl '<API_BASE_URL>/todos'
```

### Get Todo by ID

```bash
curl '<API_BASE_URL>/todos/<TODO_ID>'
```

### Update Todo

```bash
curl -X PUT '<API_BASE_URL>/todos/<TODO_ID>'   -H 'Content-Type: application/json'   -d '{
    "title": "Learn AWS Lambda deeply",
    "status": "COMPLETED"
  }'
```

### Delete Todo

```bash
curl -X DELETE '<API_BASE_URL>/todos/<TODO_ID>'
```

## Notes

- `GET /todos` uses a DynamoDB Scan for simplicity in this starter project.
- The Notification Service logs notifications to CloudWatch; you can later swap this with email, SMS, or WebSocket notifications.
- The Task Processing Service includes a delay to simulate background work.
- An SQS DLQ is included in the infra stack for resiliency.

## Suggested Enhancements

- Add `zod` or `joi` request validation
- Add unit tests using `vitest` or `jest`
- Add a GSI on status for filtered listing
- Add OpenAPI documentation
- Add CI/CD using GitHub Actions
