import {userAddressRoutes, technicianAddressRoutes} from '../src/modules/addresses/addresses.routes.js';
import app from '../src/shared-app.js';
import { createHttpHandler } from './http-handler.js';

app.use('/', userAddressRoutes);
app.use('/', technicianAddressRoutes);

export const handler = createHttpHandler(app);
