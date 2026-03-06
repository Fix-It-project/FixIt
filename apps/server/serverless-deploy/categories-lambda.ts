import serverlessExpress from '@codegenie/serverless-express';
import categoriesRoutes from '../src/modules/categories/categories.routes.js';
import app from '../src/shared-app.js';

app.use('/api/categories', categoriesRoutes);

export const handler = serverlessExpress({ app });