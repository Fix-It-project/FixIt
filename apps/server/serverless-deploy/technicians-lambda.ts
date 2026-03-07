import serverlessExpress from '@codegenie/serverless-express';
import { techniciansRoutes } from '../src/modules/technicians/index.js';
import app from '../src/shared-app.js';

app.use('/api/categories/:categoryId/technicians', techniciansRoutes);

export const handler = serverlessExpress({ app });