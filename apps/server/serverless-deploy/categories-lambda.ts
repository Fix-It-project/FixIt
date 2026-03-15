import serverlessExpress from '@codegenie/serverless-express';
import categoriesRoutes from '../src/modules/categories/categories.routes.js';
import servicesRoutes from '../src/modules/services/services.routes.js';
import technicianRoutes from '../src/modules/technicians/technicians.routes.js';
import app from '../src/shared-app.js';

app.use('/api/categories', categoriesRoutes);
app.use('/api/categories/:categoryId/services', servicesRoutes);
app.use('/api/categories/:categoryId/technicians', technicianRoutes);
export const handler = serverlessExpress({ app });