import adminDashboardRoutes from "../src/modules/admin-dashboard/admin-dashboard.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", adminDashboardRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
