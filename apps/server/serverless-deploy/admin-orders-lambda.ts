import { ordersRouter } from "../src/modules/admin-dashboard/admin-dashboard.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", ordersRouter);
app.use("/api/admin/orders", ordersRouter);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
