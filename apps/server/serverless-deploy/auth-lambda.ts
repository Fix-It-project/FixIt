import serverlessExpress from '@codegenie/serverless-express';
import authRoutes from '../src/modules/auth/auth.routes.js';
import app from '../src/shared-app.js';

app.use('/api/auth', authRoutes);

export const handler = serverlessExpress({ app });