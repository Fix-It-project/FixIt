import {
	technicianProfileRoutes,
	technicianSelfRoutes,
} from "../src/modules/technicians/technicians.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", technicianSelfRoutes);
app.use("/", technicianProfileRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
