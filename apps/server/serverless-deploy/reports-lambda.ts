import {
	adminReportRoutes,
	userReportRoutes,
} from "../src/modules/reports/reports.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", userReportRoutes);
app.use("/", adminReportRoutes);
app.use("/api/reports", userReportRoutes);
app.use("/api/admin/reports", adminReportRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
