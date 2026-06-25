import { Router, type Router as RouterType } from 'express';
import multer from 'multer';
import { technicianAuthController } from './technician-auth.controller.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import {
  TechnicianSignUpBodySchema,
  TechnicianSignInBodySchema,
  TechnicianRefreshTokenBodySchema,
  CheckEmailBodySchema,
  CancelApplicationBodySchema,
} from '../../shared/dtos/index.js';

const router: RouterType = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  // Cap upload size to bound memory use and reject oversized payloads (DoS guard).
  limits: { fileSize: 10 * 1024 * 1024 },
});

const documentFields = upload.fields([
  { name: 'criminal_record', maxCount: 1 },
  { name: 'birth_certificate', maxCount: 1 },
  { name: 'national_id', maxCount: 1 },
]);

router.post('/check-email', validate({ body: CheckEmailBodySchema }), technicianAuthController.checkEmail);
router.post('/signup', documentFields, validate({ body: TechnicianSignUpBodySchema }), technicianAuthController.signUp);
router.post('/signin', validate({ body: TechnicianSignInBodySchema }), technicianAuthController.signIn);
router.post('/cancel', validate({ body: CancelApplicationBodySchema }), technicianAuthController.cancelApplication);
router.post('/signout', technicianAuthController.signOut);
router.get('/profile', technicianAuthController.getCurrentTechnician);
router.post('/refresh', validate({ body: TechnicianRefreshTokenBodySchema }), technicianAuthController.refreshToken);

export default router;
