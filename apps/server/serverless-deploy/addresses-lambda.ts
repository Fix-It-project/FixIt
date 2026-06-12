import {
	technicianAddressRoutes,
	userAddressRoutes,
} from "../src/modules/addresses/addresses.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", userAddressRoutes);
app.use("/", technicianAddressRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
