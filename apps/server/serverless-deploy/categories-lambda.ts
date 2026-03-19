import serverlessExpress from '@codegenie/serverless-express';
import categoriesRoutes from '../src/modules/categories/categories.routes.js';
import servicesRoutes from '../src/modules/services/services.routes.js';
import { techniciansRoutes } from '../src/modules/technicians/index.js';
import app from '../src/shared-app.js';

app.use('/api/categories', categoriesRoutes);
app.use('/api/categories/:categoryId/services', servicesRoutes);
app.use('/api/categories/:categoryId/technicians', techniciansRoutes);
export const handler = serverlessExpress({ app });