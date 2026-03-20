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

// src/handlers/notifyTodoCompleted.ts
var notifyTodoCompleted_exports = {};
__export(notifyTodoCompleted_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(notifyTodoCompleted_exports);

// src/utils/logger.ts
var logger = {
  info: (message, meta) => {
    console.log(JSON.stringify({ level: "INFO", message, meta }));
  },
  error: (message, meta) => {
    console.error(JSON.stringify({ level: "ERROR", message, meta }));
  }
};

// src/handlers/notifyTodoCompleted.ts
var handler = async (event) => {
  logger.info("Notification triggered for todo completion", {
    todoId: event.detail.todoId,
    status: event.detail.status,
    completedAt: event.detail.completedAt,
    source: event.source
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=notifyTodoCompleted.js.map
