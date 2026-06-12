import adminAuthRoutes from "../src/modules/admin-auth/admin-auth.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", adminAuthRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
