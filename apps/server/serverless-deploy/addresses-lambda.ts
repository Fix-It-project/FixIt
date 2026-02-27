import serverlessExpress from '@codegenie/serverless-express';
import {userAddressRoutes, technicianAddressRoutes} from '../src/modules/addresses/addresses.routes.js';
import app from '../src/shared-app.js';

app.use('/api/addresses', userAddressRoutes);
app.use('/api/addresses', technicianAddressRoutes);

export const handler = serverlessExpress({ app });