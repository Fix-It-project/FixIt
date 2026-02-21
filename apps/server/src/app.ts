import app from './shared-app.js';
import authRoutes from './modules/auth/auth.routes.js';
import technicianAuthRoutes from './modules/technician-auth/technician-auth.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/technician-auth', technicianAuthRoutes);

export default app;