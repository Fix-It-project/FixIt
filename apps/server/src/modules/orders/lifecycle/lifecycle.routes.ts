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
  | POST | /user/orders/:id/switch-to-cash                               | user | -                               |
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
  | GET  | /user/orders/:id/events                                       | user | params + EventsQuerySchema      |
  | GET  | /user/orders/:id/quotes                                       | user | -                               |
  | GET  | /technician/orders/:id/events                                 | tech | params + EventsQuerySchema      |
  | GET  | /technician/orders/:id/quotes                                 | tech | -                               |
 
  Every route mounts auth (requireUserAuth | requireTechnicianAuth) BEFORE
  `validate(...)`. Controllers are thin glue (see `lifecycle.controller.ts`).
  Errors funnel through `next(error)` and are caught by the app-level Problem
  Details middleware so native clients receive `code`, `userMessage`, and
  machine-readable `token` fields.
 */

import type { Router as RouterType } from "express";
import { Router } from "express";
import {
	AcceptQuoteParamsSchema,
	CancelOrderBodySchema,
	ConfirmCompletionBodySchema,
	EventsQuerySchema,
	InspectionFeePreviewQuerySchema,
	OrderActionBodySchema,
	OrderIdParamsSchema,
	SubmitQuoteBodySchema,
	UpsertLocationBodySchema,
} from "../../../shared/dtos/index.js";
import { requireTechnicianAuth } from "../../../shared/middlewares/technician-auth.middleware.js";
import { requireUserAuth } from "../../../shared/middlewares/user-auth.middleware.js";
import { validate } from "../../../shared/middlewares/validate.middleware.js";
import {
	userCancelOrder,
	getUserInspectionFeePreview,
	userSubmitQuote,
	userAcceptQuote,
	userConfirmCompletion,
	userDeclineCompletion,
	userSwitchToCash,
	userCreateCardSession,
	techAccept,
	techDecline,
	techCancel,
	techStartTracking,
	techUpsertLocation,
	techStartInspection,
	techFinishInspection,
	techSubmitQuote,
	techAcceptQuote,
	techConfirmCompletion,
	techDeclineCompletion,
	getUserOrderEvents,
	getUserOrderQuotes,
	getTechnicianOrderEvents,
	getTechnicianOrderQuotes,
	getUserOrderDistance,
	getTechnicianOrderDistance,
} from "./lifecycle.controller.js";

const router: RouterType = Router();

// ─── User surface ────────────────────────────────────────────────────────────

router.get(
	"/user/inspection-fee-preview",
	requireUserAuth,
	validate({ query: InspectionFeePreviewQuerySchema }),
	getUserInspectionFeePreview,
);

router.post(
	"/user/orders/:id/cancel",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema, body: CancelOrderBodySchema }),
	userCancelOrder,
);

router.post(
	"/user/orders/:id/quotes",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema, body: SubmitQuoteBodySchema }),
	userSubmitQuote,
);

router.post(
	"/user/orders/:id/quotes/:quoteId/accept",
	requireUserAuth,
	validate({ params: AcceptQuoteParamsSchema }),
	userAcceptQuote,
);

router.post(
	"/user/orders/:id/confirm-completion",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema, body: ConfirmCompletionBodySchema }),
	userConfirmCompletion,
);

router.post(
	"/user/orders/:id/decline-completion",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema }),
	userDeclineCompletion,
);

router.post(
	"/user/orders/:id/switch-to-cash",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema }),
	userSwitchToCash,
);

router.post(
	"/user/orders/:id/card-session",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema }),
	userCreateCardSession,
);

// ─── Technician surface ──────────────────────────────────────────────────────

router.post(
	"/technician/orders/:id/accept",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	techAccept,
);

router.post(
	"/technician/orders/:id/decline",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema, body: OrderActionBodySchema }),
	techDecline,
);

router.post(
	"/technician/orders/:id/cancel",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema, body: OrderActionBodySchema }),
	techCancel,
);

router.post(
	"/technician/orders/:id/start-tracking",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	techStartTracking,
);

router.post(
	"/technician/orders/:id/location",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema, body: UpsertLocationBodySchema }),
	techUpsertLocation,
);

router.post(
	"/technician/orders/:id/start-inspection",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	techStartInspection,
);

router.post(
	"/technician/orders/:id/finish-inspection",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	techFinishInspection,
);

router.post(
	"/technician/orders/:id/quotes",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema, body: SubmitQuoteBodySchema }),
	techSubmitQuote,
);

router.post(
	"/technician/orders/:id/quotes/:quoteId/accept",
	requireTechnicianAuth,
	validate({ params: AcceptQuoteParamsSchema }),
	techAcceptQuote,
);

router.post(
	"/technician/orders/:id/confirm-completion",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema, body: ConfirmCompletionBodySchema }),
	techConfirmCompletion,
);

router.post(
	"/technician/orders/:id/decline-completion",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	techDeclineCompletion,
);

// ─── GET sub-resources (events + quotes per role) ────────────────────────────

router.get(
	"/user/orders/:id/events",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema, query: EventsQuerySchema }),
	getUserOrderEvents,
);

router.get(
	"/user/orders/:id/quotes",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema }),
	getUserOrderQuotes,
);

router.get(
	"/technician/orders/:id/events",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema, query: EventsQuerySchema }),
	getTechnicianOrderEvents,
);

router.get(
	"/technician/orders/:id/quotes",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	getTechnicianOrderQuotes,
);

// ─── Distance / ETA / geofence (Phase 4a Plan 04) ───────────────────────────

router.get(
	"/user/orders/:id/distance",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema }),
	getUserOrderDistance,
);

router.get(
	"/technician/orders/:id/distance",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	getTechnicianOrderDistance,
);

export const lifecycleRoutes = router;
export default router;
