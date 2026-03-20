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

// src/handlers/createTodo.ts
var createTodo_exports = {};
__export(createTodo_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(createTodo_exports);

// ../../node_modules/uuid/dist/esm/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// ../../node_modules/uuid/dist/esm/rng.js
var import_crypto = require("crypto");
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    (0, import_crypto.randomFillSync)(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// ../../node_modules/uuid/dist/esm/native.js
var import_crypto2 = require("crypto");
var native_default = { randomUUID: import_crypto2.randomUUID };

// ../../node_modules/uuid/dist/esm/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

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

// src/utils/validator.ts
var parseJsonBody = (body) => {
  if (!body) {
    throw new Error("Request body is required");
  }
  return JSON.parse(body);
};
var validateCreateTodoInput = (payload) => {
  if (!payload.title || payload.title.trim().length < 3) {
    throw new Error("title must be at least 3 characters long");
  }
};

// src/handlers/createTodo.ts
var repository = new TodoRepository();
var eventPublisher = new EventPublisher();
var handler = async (event) => {
  try {
    const payload = parseJsonBody(event.body ?? null);
    validateCreateTodoInput(payload);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const todo = {
      id: v4_default(),
      title: payload.title.trim(),
      description: payload.description?.trim(),
      dueDate: payload.dueDate,
      status: "PENDING",
      createdAt: now,
      updatedAt: now
    };
    await repository.create(todo);
    await eventPublisher.publish({
      detailType: "todo.created",
      source: "todo-service",
      detail: {
        todoId: todo.id,
        title: todo.title,
        status: todo.status,
        createdAt: todo.createdAt
      }
    });
    logger.info("Todo created successfully", { todoId: todo.id });
    return jsonResponse(201, {
      message: "Todo created successfully",
      data: todo
    });
  } catch (error) {
    logger.error("Failed to create todo", error);
    return jsonResponse(400, {
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=createTodo.js.map
