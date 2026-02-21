import serverlessExpress from '@codegenie/serverless-express';
import technicianAuthRoutes from '../src/modules/technician-auth/technician-auth.routes.js';
import app from '../src/shared-app.js';

app.use('/api/technician-auth', technicianAuthRoutes);

export const handler = serverlessExpress({ app });