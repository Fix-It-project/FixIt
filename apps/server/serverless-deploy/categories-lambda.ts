import categoriesRoutes from '../src/modules/categories/categories.routes.js';
import servicesRoutes from '../src/modules/services/services.routes.js';
import { techniciansRoutes } from '../src/modules/technicians/technicians.routes.js';
import app from '../src/shared-app.js';
import { createHttpHandler } from './http-handler.js';

app.use('/', categoriesRoutes);
app.use('/:categoryId/services', servicesRoutes);
app.use('/:categoryId/technicians', techniciansRoutes);
export const handler = createHttpHandler(app);
