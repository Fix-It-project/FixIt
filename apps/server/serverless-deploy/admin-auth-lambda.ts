import adminAuthRoutes from "../src/modules/admin-auth/admin-auth.routes.js";
import app from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

app.use("/", adminAuthRoutes);

export const handler = createHttpHandler(app);
