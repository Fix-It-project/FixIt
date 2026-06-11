import { type Request, type Response } from "express";
import {
	technicianAddressRoutes,
	userAddressRoutes,
} from "./modules/addresses/addresses.routes.js";
import adminAuthRoutes from "./modules/admin-auth/admin-auth.routes.js";
import adminDashboardRoutes, {
	homeownersRouter as adminHomeownersRoutes,
	ordersRouter as adminOrdersRoutes,
	techniciansRouter as adminTechniciansRoutes,
} from "./modules/admin-dashboard/admin-dashboard.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import categoriesRoutes from "./modules/categories/categories.routes.js";
import ordersRoutes from "./modules/orders/orders.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
import reviewsRoutes from "./modules/reviews/reviews.routes.js";
import servicesRoutes from "./modules/services/services.routes.js";
import technicianAuthRoutes from "./modules/technician-auth/technician-auth.routes.js";
import technicianCalendarRoutes from "./modules/technician-calendar/technician-calendar.routes.js";
import {
	technicianProfileRoutes,
	technicianSelfRoutes,
	techniciansRoutes,
} from "./modules/technicians/technicians.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import { createSharedApp, mountTerminalHandlers } from "./shared-app.js";

const app = createSharedApp();

app.get("/", (_req: Request, res: Response) => {
	res.json({ message: "FixIt API Server is running" });
});

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/orders", adminOrdersRoutes);
app.use("/api/admin/homeowners", adminHomeownersRoutes);
app.use("/api/admin/technicians", adminTechniciansRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/technician-auth", technicianAuthRoutes);
app.use("/api/addresses", userAddressRoutes);
app.use("/api/addresses", technicianAddressRoutes);
app.use("/api/technician-calendar", technicianCalendarRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/categories/:categoryId/services", servicesRoutes);
app.use("/api/categories/:categoryId/technicians", techniciansRoutes);
app.use("/api/technicians", technicianSelfRoutes);
app.use("/api/technicians", technicianProfileRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/reviews", reviewsRoutes);

mountTerminalHandlers(app);

export default app;
