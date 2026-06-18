import { techniciansRouter } from "../src/modules/admin-dashboard/admin-dashboard.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", techniciansRouter);
app.use("/api/admin/technicians", techniciansRouter);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
