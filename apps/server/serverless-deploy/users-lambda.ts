import app from '../src/shared-app.js';
import usersRoutes from '../src/modules/users/users.routes.js';
import { createHttpHandler } from './http-handler.js';

app.use('/', usersRoutes);

export const handler = createHttpHandler(app);
