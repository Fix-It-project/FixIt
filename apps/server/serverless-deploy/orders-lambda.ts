import serverlessExpress from '@codegenie/serverless-express';
import app from '../src/shared-app.js';
import ordersRoutes from '../src/modules/orders/orders.routes.js';

app.use('/api/orders', ordersRoutes);

export const handler = serverlessExpress({ app });