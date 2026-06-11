import technicianAuthRoutes from "../src/modules/technician-auth/technician-auth.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", technicianAuthRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
