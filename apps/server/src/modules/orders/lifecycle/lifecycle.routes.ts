/**
  lifecycle.routes.ts — Phase 2 Plan 02-03 Task 2
 
  Express Router wiring every Phase-2 lifecycle endpoint. Mounted under
  `orders.routes.ts` via `router.use(lifecycleRoutes)`.
 
 * ─── Route table (CONTEXT.md §Route map) ──────────────────────────────────
 
  | Verb | Path                                                          | Auth | Body schema                     |
  |------|---------------------------------------------------------------|------|---------------------------------|
  | POST | /user/orders/:id/cancel                                       | user | CancelOrderBodySchema           |
  | POST | /user/orders/:id/quotes                                       | user | SubmitQuoteBodySchema           |
  | POST | /user/orders/:id/quotes/:quoteId/accept                       | user | -                               |
  | POST | /user/orders/:id/confirm-completion                           | user | ConfirmCompletionBodySchema     |
  | POST | /user/orders/:id/checkout                                     | user | ChoosePaymentMethodBodySchema   |
  | POST | /technician/orders/:id/accept                                 | tech | -                               |
  | POST | /technician/orders/:id/decline                                | tech | OrderActionBodySchema           |
  | POST | /technician/orders/:id/cancel                                 | tech | OrderActionBodySchema           |
  | POST | /technician/orders/:id/start-tracking                         | tech | -                               |
  | POST | /technician/orders/:id/location                               | tech | UpsertLocationBodySchema        |
  | POST | /technician/orders/:id/start-inspection                       | tech | -                               |
  | POST | /technician/orders/:id/finish-inspection                      | tech | -                               |
  | POST | /technician/orders/:id/quotes                                 | tech | SubmitQuoteBodySchema           |
  | POST | /technician/orders/:id/quotes/:quoteId/accept                 | tech | -                               |
  | POST | /technician/orders/:id/confirm-completion                     | tech | ConfirmCompletionBodySchema     |
  | POST | /technician/orders/:id/mark-cash-received                     | tech | -                               |
  | GET  | /user/orders/:id/events                                       | user | params + EventsQuerySchema      |
  | GET  | /user/orders/:id/quotes                                       | user | -                               |
  | GET  | /technician/orders/:id/events                                 | tech | params + EventsQuerySchema      |
  | GET  | /technician/orders/:id/quotes                                 | tech | -                               |
 
  Every route mounts auth (requireUserAuth | requireTechnicianAuth) BEFORE
  `validate(...)`. Controllers are thin glue (see `lifecycle.controller.ts`).
  Errors funnel through `next(error)` and are caught by the local error
  middleware appended at the bottom of this file (normalises AppError →
  `{ error: <message> }` JSON envelope mirroring the rest of the API).
 */

import type { Router as RouterType } from "express";
import { type ErrorRequestHandler, Router } from "express";
import {
	AcceptQuoteParamsSchema,
	CancelOrderBodySchema,
	ChoosePaymentMethodBodySchema,
	ConfirmCompletionBodySchema,
	EventsQuerySchema,
	OrderActionBodySchema,
	OrderIdParamsSchema,
	SubmitQuoteBodySchema,
	UpsertLocationBodySchema,
} from "../../../shared/dtos/index.js";
import { normalizeError } from "../../../shared/errors/index.js";
import { requireTechnicianAuth } from "../../../shared/middlewares/technician-auth.middleware.js";
import { requireUserAuth } from "../../../shared/middlewares/user-auth.middleware.js";
import { validate } from "../../../shared/middlewares/validate.middleware.js";
import { lifecycleController } from "./lifecycle.controller.js";

const router: RouterType = Router();

// ─── User surface ────────────────────────────────────────────────────────────

router.post(
	"/user/orders/:id/cancel",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema, body: CancelOrderBodySchema }),
	lifecycleController.userCancelOrder,
);

router.post(
	"/user/orders/:id/quotes",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema, body: SubmitQuoteBodySchema }),
	lifecycleController.userSubmitQuote,
);

router.post(
	"/user/orders/:id/quotes/:quoteId/accept",
	requireUserAuth,
	validate({ params: AcceptQuoteParamsSchema }),
	lifecycleController.userAcceptQuote,
);

router.post(
	"/user/orders/:id/confirm-completion",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema, body: ConfirmCompletionBodySchema }),
	lifecycleController.userConfirmCompletion,
);

router.post(
	"/user/orders/:id/decline-completion",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema }),
	lifecycleController.userDeclineCompletion,
);

router.post(
	"/user/orders/:id/checkout",
	requireUserAuth,
	validate({
		params: OrderIdParamsSchema,
		body: ChoosePaymentMethodBodySchema,
	}),
	lifecycleController.userCheckout,
);

// ─── Technician surface ──────────────────────────────────────────────────────

router.post(
	"/technician/orders/:id/accept",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	lifecycleController.techAccept,
);

router.post(
	"/technician/orders/:id/decline",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema, body: OrderActionBodySchema }),
	lifecycleController.techDecline,
);

router.post(
	"/technician/orders/:id/cancel",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema, body: OrderActionBodySchema }),
	lifecycleController.techCancel,
);

router.post(
	"/technician/orders/:id/start-tracking",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	lifecycleController.techStartTracking,
);

router.post(
	"/technician/orders/:id/location",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema, body: UpsertLocationBodySchema }),
	lifecycleController.techUpsertLocation,
);

router.post(
	"/technician/orders/:id/start-inspection",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	lifecycleController.techStartInspection,
);

router.post(
	"/technician/orders/:id/finish-inspection",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	lifecycleController.techFinishInspection,
);

router.post(
	"/technician/orders/:id/quotes",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema, body: SubmitQuoteBodySchema }),
	lifecycleController.techSubmitQuote,
);

router.post(
	"/technician/orders/:id/quotes/:quoteId/accept",
	requireTechnicianAuth,
	validate({ params: AcceptQuoteParamsSchema }),
	lifecycleController.techAcceptQuote,
);

router.post(
	"/technician/orders/:id/confirm-completion",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema, body: ConfirmCompletionBodySchema }),
	lifecycleController.techConfirmCompletion,
);

router.post(
	"/technician/orders/:id/decline-completion",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	lifecycleController.techDeclineCompletion,
);

router.post(
	"/technician/orders/:id/mark-cash-received",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	lifecycleController.techMarkCashReceived,
);

// ─── GET sub-resources (events + quotes per role) ────────────────────────────

router.get(
	"/user/orders/:id/events",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema, query: EventsQuerySchema }),
	lifecycleController.getUserOrderEvents,
);

router.get(
	"/user/orders/:id/quotes",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema }),
	lifecycleController.getUserOrderQuotes,
);

router.get(
	"/technician/orders/:id/events",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema, query: EventsQuerySchema }),
	lifecycleController.getTechnicianOrderEvents,
);

router.get(
	"/technician/orders/:id/quotes",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	lifecycleController.getTechnicianOrderQuotes,
);

// ─── Distance / ETA / geofence (Phase 4a Plan 04) ───────────────────────────

router.get(
	"/user/orders/:id/distance",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema }),
	lifecycleController.getUserOrderDistance,
);

router.get(
	"/technician/orders/:id/distance",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	lifecycleController.getTechnicianOrderDistance,
);

// ─── Local error middleware (JSON envelope for `next(error)` calls) ─────────
// Mirrors the `normalizeError` pattern used by the other controllers, but at
// the router level so handlers can stay thin and consistent with Express's
// canonical `next(error)` flow. AppError instances retain their HTTP status;
// everything else becomes a 500 with the original message.

const lifecycleErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	const { status, message } = normalizeError(err);
	res.status(status).json({ error: message });
};

router.use(lifecycleErrorHandler);

export const lifecycleRoutes = router;
export default router;
