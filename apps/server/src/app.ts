import { technicianAddressRoutes, userAddressRoutes, } from "./modules/addresses/addresses.routes.js";
import adminAuthRoutes from "./modules/admin-auth/admin-auth.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import categoriesRoutes from "./modules/categories/categories.routes.js";
import ordersRoutes from "./modules/orders/orders.routes.js";
import reviewsRoutes from "./modules/reviews/reviews.routes.js";
import servicesRoutes from "./modules/services/services.routes.js";
import technicianAuthRoutes from "./modules/technician-auth/technician-auth.routes.js";
import technicianCalendarRoutes from "./modules/technician-calendar/technician-calendar.routes.js";
import { technicianProfileRoutes, technicianSelfRoutes, techniciansRoutes, } from "./modules/technicians/technicians.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import app from "./shared-app.js";
import { AppError } from "./shared/errors/app-error.js";
import { finalErrorMiddleware } from "./shared/errors/final-error-middleware.js";

app.use("/api/admin/auth", adminAuthRoutes);
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
app.use("/api/reviews", reviewsRoutes);

// Catch-all 404 handler for unmatched routes (after all other routes)
app.use((_req, _res, next) => {
	next(AppError.notFound('Resource not found'));
});

// Mount final error middleware LAST
app.use(finalErrorMiddleware);

export default app;
