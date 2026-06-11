import technicianAuthRoutes from '../src/modules/technician-auth/technician-auth.routes.js';
import app from '../src/shared-app.js';
import { createHttpHandler } from './http-handler.js';

app.use('/', technicianAuthRoutes);

export const handler = createHttpHandler(app);
