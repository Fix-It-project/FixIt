import { technicianSelfRoutes, technicianProfileRoutes } from '../src/modules/technicians/technicians.routes.js';
import app from '../src/shared-app.js';
import { createHttpHandler } from './http-handler.js';

app.use('/', technicianSelfRoutes);
app.use('/', technicianProfileRoutes);

export const handler = createHttpHandler(app);
