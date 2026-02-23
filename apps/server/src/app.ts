import app from './shared-app.js';
import authRoutes from './modules/auth/auth.routes.js';
import technicianAuthRoutes from './modules/technician-auth/technician-auth.routes.js';
import { userAddressRoutes, technicianAddressRoutes } from './modules/addresses/addresses.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/auth', userAddressRoutes);
app.use('/api/technician-auth', technicianAuthRoutes);
app.use('/api/technician-auth', technicianAddressRoutes);

export default app;