import {
	adminCustomServiceRoutes,
} from "../src/modules/custom-services/custom-services.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", adminCustomServiceRoutes);
app.use("/api/admin/service-requests", adminCustomServiceRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
