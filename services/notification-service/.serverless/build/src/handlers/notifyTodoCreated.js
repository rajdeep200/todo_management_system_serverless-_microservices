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

// src/handlers/notifyTodoCreated.ts
var notifyTodoCreated_exports = {};
__export(notifyTodoCreated_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(notifyTodoCreated_exports);

// src/utils/logger.ts
var logger = {
  info: (message, meta) => {
    console.log(JSON.stringify({ level: "INFO", message, meta }));
  },
  error: (message, meta) => {
    console.error(JSON.stringify({ level: "ERROR", message, meta }));
  }
};

// src/handlers/notifyTodoCreated.ts
var handler = async (event) => {
  logger.info("Notification triggered for todo creation", {
    todoId: event.detail.todoId,
    title: event.detail.title,
    createdAt: event.detail.createdAt,
    source: event.source
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=notifyTodoCreated.js.map
