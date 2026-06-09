import app from '../src/shared-app.js';
import technicianCalendarRoutes from '../src/modules/technician-calendar/technician-calendar.routes';
import { createHttpHandler } from './http-handler.js';

app.use('/', technicianCalendarRoutes);

export const handler = createHttpHandler(app);
