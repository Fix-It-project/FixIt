import authRoutes from '../src/modules/auth/auth.routes.js';
import app from '../src/shared-app.js';
import { createHttpHandler } from './http-handler.js';

app.use('/', authRoutes);

export const handler = createHttpHandler(app);
