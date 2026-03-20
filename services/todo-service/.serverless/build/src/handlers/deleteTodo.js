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

// src/handlers/deleteTodo.ts
var deleteTodo_exports = {};
__export(deleteTodo_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(deleteTodo_exports);

// src/repositories/todoRepository.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({});
var documentClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var tableName = process.env.TODOS_TABLE;
var TodoRepository = class {
  async create(todo) {
    await documentClient.send(
      new import_lib_dynamodb.PutCommand({
        TableName: tableName,
        Item: todo
      })
    );
  }
  async list() {
    const result = await documentClient.send(
      new import_lib_dynamodb.ScanCommand({
        TableName: tableName
      })
    );
    return result.Items ?? [];
  }
  async getById(id) {
    const result = await documentClient.send(
      new import_lib_dynamodb.GetCommand({
        TableName: tableName,
        Key: { id }
      })
    );
    return result.Item ?? null;
  }
  async update(id, updates) {
    const expressionAttributeNames = {
      "#updatedAt": "updatedAt"
    };
    const expressionAttributeValues = {
      ":updatedAt": (/* @__PURE__ */ new Date()).toISOString()
    };
    const setExpressions = ["#updatedAt = :updatedAt"];
    if (updates.title !== void 0) {
      expressionAttributeNames["#title"] = "title";
      expressionAttributeValues[":title"] = updates.title;
      setExpressions.push("#title = :title");
    }
    if (updates.description !== void 0) {
      expressionAttributeNames["#description"] = "description";
      expressionAttributeValues[":description"] = updates.description;
      setExpressions.push("#description = :description");
    }
    if (updates.dueDate !== void 0) {
      expressionAttributeNames["#dueDate"] = "dueDate";
      expressionAttributeValues[":dueDate"] = updates.dueDate;
      setExpressions.push("#dueDate = :dueDate");
    }
    if (updates.status !== void 0) {
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = updates.status;
      setExpressions.push("#status = :status");
    }
    const result = await documentClient.send(
      new import_lib_dynamodb.UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression: `SET ${setExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: "attribute_exists(id)",
        ReturnValues: "ALL_NEW"
      })
    );
    return result.Attributes ?? null;
  }
  async delete(id) {
    await documentClient.send(
      new import_lib_dynamodb.DeleteCommand({
        TableName: tableName,
        Key: { id }
      })
    );
  }
};

// src/services/eventPublisher.ts
var import_client_eventbridge = require("@aws-sdk/client-eventbridge");
var eventBridgeClient = new import_client_eventbridge.EventBridgeClient({});
var eventBusName = process.env.TODO_EVENT_BUS_NAME;
var EventPublisher = class {
  async publish(params) {
    await eventBridgeClient.send(
      new import_client_eventbridge.PutEventsCommand({
        Entries: [
          {
            EventBusName: eventBusName,
            Source: params.source,
            DetailType: params.detailType,
            Detail: JSON.stringify({
              eventVersion: "1.0",
              ...params.detail
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

// src/utils/response.ts
var jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
});

// src/handlers/deleteTodo.ts
var repository = new TodoRepository();
var eventPublisher = new EventPublisher();
var handler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return jsonResponse(400, { message: "Todo id is required" });
    }
    const existingTodo = await repository.getById(id);
    if (!existingTodo) {
      return jsonResponse(404, { message: "Todo not found" });
    }
    await repository.delete(id);
    await eventPublisher.publish({
      detailType: "todo.deleted",
      source: "todo-service",
      detail: {
        todoId: id,
        deletedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    logger.info("Todo deleted successfully", { todoId: id });
    return jsonResponse(200, {
      message: "Todo deleted successfully"
    });
  } catch (error) {
    logger.error("Failed to delete todo", error);
    return jsonResponse(500, {
      message: "Failed to delete todo"
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=deleteTodo.js.map
