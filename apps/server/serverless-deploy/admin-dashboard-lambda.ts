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
// Backwards-compatible mounts: the live API Gateway in eu-west-3 still points
// /api/admin/orders|homeowners|technicians to this Lambda.
app.use("/api/admin/orders", ordersRouter);
app.use("/api/admin/homeowners", homeownersRouter);
app.use("/api/admin/technicians", techniciansRouter);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
