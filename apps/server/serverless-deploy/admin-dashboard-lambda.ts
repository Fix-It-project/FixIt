import adminDashboardRoutes from "../src/modules/admin-dashboard/admin-dashboard.routes.js";
import app from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

app.use("/", adminDashboardRoutes);

export const handler = createHttpHandler(app);
