import { Router, type Router as RouterType } from "express";
import { AdminLoginBodySchema } from "../../shared/dtos/index.js";
import { requireAdminAuth } from "../../shared/middlewares/admin-auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { adminAuthController } from "./admin-auth.controller.js";

const router: RouterType = Router();

router.post("/login", validate({ body: AdminLoginBodySchema }), adminAuthController.login);
router.post("/logout", adminAuthController.logout);
router.get("/me", requireAdminAuth, adminAuthController.getCurrentAdmin);

export default router;
