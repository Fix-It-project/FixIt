import serverlessExpress from "@codegenie/serverless-express";
import app from "../src/shared-app.js";
import notificationsRoutes from "../src/modules/notifications/notifications.routes.js";

app.use("/api/notifications", notificationsRoutes);

export const handler = serverlessExpress({ app });
