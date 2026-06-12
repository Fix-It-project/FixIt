import usersRoutes from "../src/modules/users/users.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", usersRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
