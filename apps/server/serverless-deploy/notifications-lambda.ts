import notificationsRoutes from "../src/modules/notifications/notifications.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", notificationsRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
