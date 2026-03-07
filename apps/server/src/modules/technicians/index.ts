export {
  techniciansRepository,
  type ITechnicianQueryRepository,
  type ITechniciansRepository,
  type CreateTechnicianData,
  type UpdateTechnicianData,
} from './technicians.repository.js';
export { TechniciansService, type ITechniciansService, type TechnicianProfile } from './technicians.service.js';
export { TechniciansController } from './technicians.controller.js';
export { default as techniciansRoutes } from './technicians.routes.js';
export { default as technicianProfileRoutes } from './technician-profile.routes.js';

