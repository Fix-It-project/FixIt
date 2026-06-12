import reviewRoutes from "../src/modules/reviews/reviews.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", reviewRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
