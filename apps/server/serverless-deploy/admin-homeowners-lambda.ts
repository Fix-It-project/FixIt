import { homeownersRouter } from "../src/modules/admin-dashboard/admin-dashboard.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", homeownersRouter);
app.use("/api/admin/homeowners", homeownersRouter);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
