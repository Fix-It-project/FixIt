import serverlessExpress from '@codegenie/serverless-express';
import { technicianSelfRoutes, technicianProfileRoutes } from '../src/modules/technicians/technicians.routes.js';
import app from '../src/shared-app.js';

app.use('/api/technicians', technicianSelfRoutes);
app.use('/api/technicians', technicianProfileRoutes);

export const handler = serverlessExpress({ app });