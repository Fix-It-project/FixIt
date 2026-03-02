import app from './shared-app.js';
import authRoutes from './modules/auth/auth.routes.js';
import technicianAuthRoutes from './modules/technician-auth/technician-auth.routes.js';
import { userAddressRoutes, technicianAddressRoutes } from './modules/addresses/addresses.routes.js';
import technicianCalendarRoutes from './modules/technician-calendar/technician-calendar.routes.js';
import usersRoutes from './modules/users/users.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/technician-auth', technicianAuthRoutes);
app.use('/api/addresses', userAddressRoutes);
app.use('/api/addresses', technicianAddressRoutes);
app.use('/api/technician-calendar', technicianCalendarRoutes);
app.use('/api/users', usersRoutes);
export default app;