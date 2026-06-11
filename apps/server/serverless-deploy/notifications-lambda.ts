import app from "../src/shared-app.js";
import notificationsRoutes from "../src/modules/notifications/notifications.routes.js";
import { createHttpHandler } from "./http-handler.js";

app.use("/", notificationsRoutes);

export const handler = createHttpHandler(app);
