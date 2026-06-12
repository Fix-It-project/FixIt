import categoriesRoutes from "../src/modules/categories/categories.routes.js";
import servicesRoutes from "../src/modules/services/services.routes.js";
import { techniciansRoutes } from "../src/modules/technicians/technicians.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", categoriesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/:categoryId/services", servicesRoutes);
app.use("/:categoryId/technicians", techniciansRoutes);
app.use("/api/categories/:categoryId/services", servicesRoutes);
app.use("/api/categories/:categoryId/technicians", techniciansRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
