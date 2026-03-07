import serverlessExpress from '@codegenie/serverless-express';
import app from '../src/shared-app.js';
import usersRoutes from '../src/modules/users/users.routes.js';

app.use('/api/users', usersRoutes);

export const handler = serverlessExpress({ app });