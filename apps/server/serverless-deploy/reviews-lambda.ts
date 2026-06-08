import reviewRoutes from '../src/modules/reviews/reviews.routes.js';
import app from '../src/shared-app.js';
import { createHttpHandler } from './http-handler.js';

app.use('/', reviewRoutes);

export const handler = createHttpHandler(app);
