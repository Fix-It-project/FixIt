import serverlessExpress from '@codegenie/serverless-express';
import app from '../src/shared-app.js';
import technicianCalendarRoutes from '../src/modules/technician-calendar/technician-calendar.routes';

app.use('/api/technician-calendar', technicianCalendarRoutes);

export const handler = serverlessExpress({ app });