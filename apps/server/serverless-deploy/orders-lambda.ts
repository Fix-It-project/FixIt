import ordersRoutes from '../src/modules/orders/orders.routes.js';
import app from '../src/shared-app.js';
import { createHttpHandler } from './http-handler.js';

app.use('/', ordersRoutes);

export const handler = createHttpHandler(app);
