# Todo Management System – Serverless Microservices

A production-style backend assignment built on **AWS Serverless** using **Node.js + TypeScript** and the **Serverless Framework**.

This project demonstrates a **microservices architecture** with **event-driven communication** across services using **API Gateway, AWS Lambda, DynamoDB, EventBridge, and SQS**.

---

## Overview

The system is split into three backend microservices plus one shared infrastructure stack:

- **Todo Service**  
  Exposes REST APIs for todo CRUD operations.

- **Task Processing Service**  
  Consumes asynchronous events from a queue and simulates background processing.

- **Notification Service**  
  Listens to domain events and handles notification workflows.

- **Infra Stack**  
  Provisions shared AWS resources like:
  - DynamoDB table
  - EventBridge event bus
  - SQS queue + dead-letter queue

---

## Architecture

```text
Client
  |
  v
API Gateway
  |
  v
Todo Service (Lambda)
  |
  +--> DynamoDB
  |
  +--> EventBridge (todo.created / todo.completed)
            |
            +--> Notification Service (Lambda)
            |
            +--> Rule -> SQS
                         |
                         v
              Task Processing Service (Lambda)
                         |
                         +--> DynamoDB status update
                         |
                         +--> EventBridge (todo.completed)
```

---

## Tech Stack

- **Language:** Node.js, TypeScript
- **Framework:** Serverless Framework v4
- **Compute:** AWS Lambda
- **API Layer:** API Gateway HTTP API
- **Database:** DynamoDB
- **Async Messaging:** SQS
- **Event Routing:** EventBridge
- **Logging:** CloudWatch Logs

---

## Microservices

### 1) Todo Service

Responsible for synchronous CRUD operations.

#### APIs
- `POST /todos` → Create Todo
- `GET /todos` → List Todos
- `GET /todos/{id}` → Get Todo by ID
- `PUT /todos/{id}` → Update Todo
- `DELETE /todos/{id}` → Delete Todo

#### Responsibilities
- Store todo items in DynamoDB
- Publish domain events such as:
  - `todo.created`
  - `todo.completed`

---

### 2) Task Processing Service

Responsible for background task execution.

#### Responsibilities
- Triggered asynchronously from **SQS**
- Processes newly created todos
- Updates todo status in DynamoDB
- Publishes follow-up events such as:
  - `todo.completed`

Typical status lifecycle:
- `PENDING`
- `PROCESSING`
- `COMPLETED`

---

### 3) Notification Service

Responsible for event-driven notifications.

#### Responsibilities
- Triggered via **EventBridge**
- Reacts to:
  - `todo.created`
  - `todo.completed`
- Logs notification activity in CloudWatch

---

## Shared Infrastructure

The `infra` stack provisions:

- **EventBridge Bus**
- **DynamoDB Table**
- **SQS Queue**
- **SQS Dead Letter Queue**
- **EventBridge Rule → SQS target**

### Infra Outputs
These are consumed by the service stacks using CloudFormation references:

- `TodosTableName`
- `TodoEventBusName`
- `TodoEventBusArn`
- `TaskQueueArn`
- `TaskQueueUrl`
- `TaskQueueDLQArn`

---

## Project Structure

```text
todo-management-system/
│
├── infra/
│   ├── package.json
│   ├── serverless.yml
│   └── tsconfig.json
│
├── services/
│   ├── todo-service/
│   │   ├── package.json
│   │   ├── serverless.yml
│   │   └── src/
│   │       ├── handlers/
│   │       ├── repositories/
│   │       ├── services/
│   │       ├── types/
│   │       └── utils/
│   │
│   ├── task-processing-service/
│   │   ├── package.json
│   │   ├── serverless.yml
│   │   └── src/
│   │       ├── handlers/
│   │       ├── repositories/
│   │       ├── services/
│   │       └── utils/
│   │
│   └── notification-service/
│       ├── package.json
│       ├── serverless.yml
│       └── src/
│           ├── handlers/
│           └── utils/
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Environment Variables

Example `.env`:

```env
STAGE=dev
AWS_REGION=ap-south-1
AWS_PROFILE=default
LOG_LEVEL=INFO
PROCESSING_DELAY_MS=2000
```

> Shared resource names like DynamoDB table name and EventBridge bus are resolved through CloudFormation outputs from the `infra` stack.

---

## Prerequisites

Before running the project, make sure you have:

- Node.js installed
- npm installed
- AWS CLI installed and configured
- Serverless Framework installed
- AWS account with permissions to deploy:
  - CloudFormation
  - Lambda
  - API Gateway
  - DynamoDB
  - SQS
  - EventBridge
  - S3
  - SSM
  - IAM role creation / pass role

---

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd todo-management-system
```

### 2. Install dependencies

Install dependencies inside each deployable folder:

```bash
cd infra && npm install
cd ../services/todo-service && npm install
cd ../task-processing-service && npm install
cd ../notification-service && npm install
```

### 3. Configure AWS credentials locally

```bash
aws configure --profile default
```

### 4. Add environment file

Create `.env` in the project root:

```env
STAGE=dev
AWS_REGION=ap-south-1
AWS_PROFILE=default
LOG_LEVEL=INFO
PROCESSING_DELAY_MS=2000
```

---

## Deployment Order

Deploy the stacks in this order:

### 1. Deploy infra

```bash
cd infra
serverless deploy
```

### 2. Deploy Todo Service

```bash
cd ../services/todo-service
serverless deploy
```

### 3. Deploy Task Processing Service

```bash
cd ../task-processing-service
serverless deploy
```

### 4. Deploy Notification Service

```bash
cd ../notification-service
serverless deploy
```

---

## Deployed API

Base URL:

```text
https://sq6nkacspa.execute-api.ap-south-1.amazonaws.com
```

---

## API Documentation

### Create Todo

**POST** `/todos`

#### Request
```json
{
  "title": "Learn Serverless",
  "description": "Verify end-to-end event flow"
}
```

#### cURL
```bash
curl -X POST "https://sq6nkacspa.execute-api.ap-south-1.amazonaws.com/todos" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Learn Serverless\",\"description\":\"Verify end-to-end event flow\"}"
```

---

### List Todos

**GET** `/todos`

#### cURL
```bash
curl "https://sq6nkacspa.execute-api.ap-south-1.amazonaws.com/todos"
```

---

### Get Todo By ID

**GET** `/todos/{id}`

#### cURL
```bash
curl "https://sq6nkacspa.execute-api.ap-south-1.amazonaws.com/todos/<TODO_ID>"
```

---

### Update Todo

**PUT** `/todos/{id}`

#### Request
```json
{
  "title": "Learn Serverless Updated",
  "status": "COMPLETED"
}
```

#### cURL
```bash
curl -X PUT "https://sq6nkacspa.execute-api.ap-south-1.amazonaws.com/todos/<TODO_ID>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Learn Serverless Updated\",\"status\":\"COMPLETED\"}"
```

---

### Delete Todo

**DELETE** `/todos/{id}`

#### cURL
```bash
curl -X DELETE "https://sq6nkacspa.execute-api.ap-south-1.amazonaws.com/todos/<TODO_ID>"
```

---

## Event Flow

### Todo Creation Flow

1. Client sends `POST /todos`
2. Todo Service stores the record in DynamoDB
3. Todo Service publishes `todo.created` to EventBridge
4. EventBridge rule pushes the event to SQS
5. Task Processing Service consumes from SQS
6. Task status is updated in DynamoDB
7. Task Processing Service publishes `todo.completed`
8. Notification Service receives and logs relevant events

---

## Verification Steps

After deployment, verify the system using this flow:

### 1. Create a todo
Call:

```bash
curl -X POST "https://sq6nkacspa.execute-api.ap-south-1.amazonaws.com/todos" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Test Todo\",\"description\":\"Async flow test\"}"
```

### 2. Copy the returned `id`

### 3. Fetch the todo immediately

```bash
curl "https://sq6nkacspa.execute-api.ap-south-1.amazonaws.com/todos/<TODO_ID>"
```

### 4. Wait a few seconds, then fetch again

If async processing works correctly, status should move through:
- `PENDING`
- `PROCESSING`
- `COMPLETED`

### 5. Verify in AWS Console

Check:
- **DynamoDB** → todo item exists
- **SQS** → queue activity occurred
- **CloudWatch Logs** → logs available for all services
- **EventBridge** → rules are attached to the shared bus

---

## Logging and Error Handling

This project includes:

- structured Lambda logging
- modular service separation
- async event-driven processing
- runtime environment variable usage
- reusable repository/service layers
- error handling inside handlers

---

## Key Design Decisions

### Why EventBridge?
Used for domain-level event routing between services.

### Why SQS?
Used for reliable asynchronous processing and decoupling.

### Why DynamoDB?
Fast and serverless-friendly NoSQL database for todo storage.

### Why separate infra stack?
Improves reuse and keeps shared resources independent from business services.

---

## Challenges Solved During Implementation

Some practical issues handled during implementation:

- cross-stack references using CloudFormation outputs
- Serverless Framework v4 built-in ESBuild handling
- IAM deploy permissions for CloudFormation / Lambda / S3 / API Gateway
- orphaned SQS event source mapping cleanup
- reusing an existing EventBridge bus across multiple services

---

## Cleanup

To remove all resources:

```bash
cd services/notification-service && serverless remove
cd ../task-processing-service && serverless remove
cd ../todo-service && serverless remove
cd ../../infra && serverless remove
```

> Remove service stacks before removing the infra stack.


---

## Author

Built by **Rajdeep Ghosh** as part of a serverless microservices backend assignment.
