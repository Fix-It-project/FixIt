import { Router, type Router as RouterType } from 'express';
import multer from 'multer';
import { technicianAuthController } from './technician-auth.controller.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import {
  TechnicianSignUpBodySchema,
  TechnicianSignInBodySchema,
  TechnicianRefreshTokenBodySchema,
  CheckEmailBodySchema,
} from '../../shared/dtos/index.js';

const router: RouterType = Router();

const upload = multer({ storage: multer.memoryStorage() });

const documentFields = upload.fields([
  { name: 'criminal_record', maxCount: 1 },
  { name: 'birth_certificate', maxCount: 1 },
  { name: 'national_id', maxCount: 1 },
]);

router.post('/check-email', validate({ body: CheckEmailBodySchema }), (req, res) => technicianAuthController.checkEmail(req, res));
router.post('/signup', documentFields, validate({ body: TechnicianSignUpBodySchema }), (req, res) => technicianAuthController.signUp(req, res));
router.post('/signin', validate({ body: TechnicianSignInBodySchema }), (req, res) => technicianAuthController.signIn(req, res));
router.post('/signout', (req, res) => technicianAuthController.signOut(req, res));
router.get('/profile', (req, res) => technicianAuthController.getCurrentTechnician(req, res));
router.post('/refresh', validate({ body: TechnicianRefreshTokenBodySchema }), (req, res) => technicianAuthController.refreshToken(req, res));

export default router;
