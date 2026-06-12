import ordersRoutes from "../src/modules/orders/orders.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", ordersRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
