import adminDashboardRoutes, {
	homeownersRouter,
	ordersRouter,
	techniciansRouter,
} from "../src/modules/admin-dashboard/admin-dashboard.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", adminDashboardRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/orders", ordersRouter);
app.use("/api/admin/homeowners", homeownersRouter);
app.use("/api/admin/technicians", techniciansRouter);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
