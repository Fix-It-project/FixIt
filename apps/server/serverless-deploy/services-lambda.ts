import serverlessExpress from '@codegenie/serverless-express';
import servicesRoutes from '../src/modules/services/services.routes.js';
import app from '../src/shared-app.js';

app.use('/api/categories/:categoryId/services', servicesRoutes);

export const handler = serverlessExpress({ app });