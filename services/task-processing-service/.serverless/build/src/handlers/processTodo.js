"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/handlers/processTodo.ts
var processTodo_exports = {};
__export(processTodo_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(processTodo_exports);

// src/repositories/todoRepository.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({});
var documentClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var tableName = process.env.TODOS_TABLE;
var TodoRepository = class {
  async getById(id) {
    const result = await documentClient.send(
      new import_lib_dynamodb.GetCommand({
        TableName: tableName,
        Key: { id }
      })
    );
    return result.Item ?? null;
  }
  async updateStatus(id, status) {
    const result = await documentClient.send(
      new import_lib_dynamodb.UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updatedAt": "updatedAt"
        },
        ExpressionAttributeValues: {
          ":status": status,
          ":updatedAt": (/* @__PURE__ */ new Date()).toISOString()
        },
        ConditionExpression: "attribute_exists(id)",
        ReturnValues: "ALL_NEW"
      })
    );
    return result.Attributes ?? null;
  }
};

// src/services/eventPublisher.ts
var import_client_eventbridge = require("@aws-sdk/client-eventbridge");
var eventBridgeClient = new import_client_eventbridge.EventBridgeClient({});
var eventBusName = process.env.TODO_EVENT_BUS_NAME;
var EventPublisher = class {
  async publish(detailType, source, detail) {
    await eventBridgeClient.send(
      new import_client_eventbridge.PutEventsCommand({
        Entries: [
          {
            EventBusName: eventBusName,
            DetailType: detailType,
            Source: source,
            Detail: JSON.stringify({
              eventVersion: "1.0",
              ...detail
            })
          }
        ]
      })
    );
  }
};

// src/utils/logger.ts
var logger = {
  info: (message, meta) => {
    console.log(JSON.stringify({ level: "INFO", message, meta }));
  },
  error: (message, meta) => {
    console.error(JSON.stringify({ level: "ERROR", message, meta }));
  }
};

// src/handlers/processTodo.ts
var repository = new TodoRepository();
var eventPublisher = new EventPublisher();
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var handler = async (event) => {
  for (const record of event.Records) {
    try {
      const envelope = JSON.parse(record.body);
      const todoId = envelope.detail?.todoId;
      if (!todoId) {
        logger.error("SQS message missing todoId", { body: record.body });
        continue;
      }
      logger.info("Starting async processing for todo", { todoId });
      await repository.updateStatus(todoId, "PROCESSING");
      await sleep(2e3);
      const updatedTodo = await repository.updateStatus(todoId, "COMPLETED");
      await eventPublisher.publish("todo.completed", "task-processing-service", {
        todoId,
        status: "COMPLETED",
        completedAt: updatedTodo?.updatedAt ?? (/* @__PURE__ */ new Date()).toISOString()
      });
      logger.info("Todo processed successfully", { todoId });
    } catch (error) {
      logger.error("Failed to process todo message", {
        error,
        messageBody: record.body
      });
      throw error;
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=processTodo.js.map
