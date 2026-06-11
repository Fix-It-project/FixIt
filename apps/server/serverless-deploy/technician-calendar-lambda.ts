import technicianCalendarRoutes from "../src/modules/technician-calendar/technician-calendar.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", technicianCalendarRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
