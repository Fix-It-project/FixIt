import {
	technicianCustomServiceRoutes,
} from "../src/modules/custom-services/custom-services.routes.js";
import {
	technicianReportRoutes,
} from "../src/modules/reports/reports.routes.js";
import {
	technicianProfileRoutes,
	technicianSelfRoutes,
} from "../src/modules/technicians/technicians.routes.js";
import { createSharedApp, mountTerminalHandlers } from "../src/shared-app.js";
import { createHttpHandler } from "./http-handler.js";

const app = createSharedApp();

app.use("/", technicianSelfRoutes);
app.use("/", technicianProfileRoutes);
app.use("/", technicianCustomServiceRoutes);
app.use("/", technicianReportRoutes);
app.use("/api/technicians", technicianSelfRoutes);
app.use("/api/technicians", technicianProfileRoutes);
app.use("/api/technicians", technicianCustomServiceRoutes);
app.use("/api/technicians", technicianReportRoutes);
mountTerminalHandlers(app);

export const handler = createHttpHandler(app);
