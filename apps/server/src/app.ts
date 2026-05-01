import {
	technicianAddressRoutes,
	userAddressRoutes,
} from "./modules/addresses/addresses.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import categoriesRoutes from "./modules/categories/categories.routes.js";
import ordersRoutes from "./modules/orders/orders.routes.js";
import reviewsRoutes from "./modules/reviews/reviews.routes.js";
import servicesRoutes from "./modules/services/services.routes.js";
import technicianAuthRoutes from "./modules/technician-auth/technician-auth.routes.js";
import technicianCalendarRoutes from "./modules/technician-calendar/technician-calendar.routes.js";
import {
	technicianProfileRoutes,
	technicianSelfRoutes,
	techniciansRoutes,
} from "./modules/technicians/index.js";
import usersRoutes from "./modules/users/users.routes.js";
import app from "./shared-app.js";

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
app.use("/api", reviewsRoutes);
export default app;
