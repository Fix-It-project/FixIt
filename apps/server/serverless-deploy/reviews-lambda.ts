import serverlessExpress from '@codegenie/serverless-express';
import app from '../src/shared-app.js';
import reviewRoutes from '../src/modules/reviews/reviews.routes.js';

app.use('/api/reviews', reviewRoutes);

export const handler = serverlessExpress({ app });