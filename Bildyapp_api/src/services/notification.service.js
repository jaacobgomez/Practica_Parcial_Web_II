import { EventEmitter } from "node:events";

const notificationService = new EventEmitter();

notificationService.on("user:registered", (payload) => {
  console.log("user:registered", payload);
});

notificationService.on("user:verified", (payload) => {
  console.log("user:verified", payload);
});

notificationService.on("user:invited", (payload) => {
  console.log("user:invited", payload);
});

notificationService.on("user:deleted", (payload) => {
  console.log("user:deleted", payload);
});

export default notificationService;