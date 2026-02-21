import { Router, type Router as RouterType } from 'express';
import multer from 'multer';
import { technicianAuthController } from './technician-auth.controller.js';

const router: RouterType = Router();

// Keep files in memory so we can pass the buffer directly to Supabase Storage
const upload = multer({ storage: multer.memoryStorage() });

// Document fields expected during signup
const documentFields = upload.fields([
  { name: 'criminal_record', maxCount: 1 },
  { name: 'birth_certificate', maxCount: 1 },
  { name: 'national_id', maxCount: 1 },
]);

// POST /api/technician-auth/check-email – check if a technician email already exists
router.post('/check-email', (req, res) => technicianAuthController.checkEmail(req, res));

// POST /api/technician-auth/signup – register a new technician (multipart/form-data)
router.post('/signup', documentFields, (req, res) => technicianAuthController.signUp(req, res));

// POST /api/technician-auth/signin – login
router.post('/signin', (req, res) => technicianAuthController.signIn(req, res));

// POST /api/technician-auth/signout – logout
router.post('/signout', (req, res) => technicianAuthController.signOut(req, res));

// GET /api/technician-auth/me – get current technician profile
router.get('/profile', (req, res) => technicianAuthController.getCurrentTechnician(req, res));

// POST /api/technician-auth/refresh – refresh access token
router.post('/refresh', (req, res) => technicianAuthController.refreshToken(req, res));

export default router;
