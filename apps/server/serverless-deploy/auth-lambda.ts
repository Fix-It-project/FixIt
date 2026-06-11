import authRoutes from "../src/modules/auth/auth.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", authRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
