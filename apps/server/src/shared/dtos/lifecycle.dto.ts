import { z } from "zod";

/**
 * Lifecycle DTOs — Zod schemas for every route mounted by Plan 03.
 * One schema per route body/params; mirrors `reschedule.dto.ts` style.
 *
 * NOTE: Card support is enabled for the Paymob sandbox flow, so the payment
 * method schema now accepts both `cash` and `card`.
 */

// ─── Order submission ────────────────────────────────────────────────────────

/**
 * POST /user/orders — extends the legacy CreateOrderBodySchema with the
 * optional `destination_address_id` (D6 — backend auto-picks active address
 * if omitted; explicit override still validated for ownership in service).
 * `scheduled_start_at` is required and must map to one of the fixed Cairo
 * slots (08:00, 11:00, 14:00, 17:00, 20:00); service layer enforces this.
 */
export const SubmitOrderBodySchema = z.object({
	technician_id: z.string().uuid("technician_id must be a valid UUID"),
	service_id: z.string().uuid("service_id must be a valid UUID"),
	scheduled_date: z
		.string()
		.regex(
			/^\d{4}-\d{2}-\d{2}$/,
			"scheduled_date must be in YYYY-MM-DD format",
		),
	scheduled_start_at: z.iso.datetime({ offset: true }),
	payment_method: z.enum(["cash", "card"]),
	problem_description: z.string().max(1000).optional(),
	destination_address_id: z
		.string()
		.uuid("destination_address_id must be a valid UUID")
		.optional(),
});

// ─── Cancellation / decline (reason-only bodies) ─────────────────────────────

/**
 * POST /user/orders/:id/cancel, POST /technician/orders/:id/cancel.
 */
export const CancelOrderBodySchema = z.object({
	reason: z
		.string()
		.max(500, "reason must be 500 characters or fewer")
		.optional(),
});

/**
 * POST /technician/orders/:id/decline — same shape as cancel; kept as a
 * distinct schema so future divergence (e.g. required reason on decline)
 * is a one-line edit.
 */
export const OrderActionBodySchema = z.object({
	reason: z
		.string()
		.max(500, "reason must be 500 characters or fewer")
		.optional(),
});

// ─── Quotes ──────────────────────────────────────────────────────────────────

/**
 * POST /:role/orders/:id/quotes — submit or counter a quote.
 * amount is an integer (whole EGP); notes is free text (max 1000).
 */
export const SubmitQuoteBodySchema = z.object({
	amount: z
		.number()
		.int("amount must be an integer")
		.nonnegative("amount must be >= 0"),
	notes: z
		.string()
		.max(1000, "notes must be 1000 characters or fewer")
		.optional(),
});

/**
 * URL params for POST /:role/orders/:id/quotes/:quoteId/accept.
 */
export const AcceptQuoteParamsSchema = z.object({
	id: z.string().uuid("Order ID must be a valid UUID"),
	quoteId: z.string().uuid("Quote ID must be a valid UUID"),
});

/**
 * URL params for nested quote routes that only need :quoteId.
 */
export const QuoteIdParamsSchema = z.object({
	quoteId: z.string().uuid("Quote ID must be a valid UUID"),
});

// ─── Payment / completion ────────────────────────────────────────────────────

/** @deprecated Payment method is chosen upfront by POST /user/orders. */
export const ChoosePaymentMethodBodySchema = z.object({
	method: z.enum(["cash", "card"]),
});

/**
 * POST /:role/orders/:id/confirm-completion — body intentionally empty;
 * file shape preserved for future fields (e.g. customer rating prompt).
 */
export const ConfirmCompletionBodySchema = z.object({}).strict();

// ─── Live location ───────────────────────────────────────────────────────────

/**
 * POST /technician/orders/:id/location — upsert tracking point.
 * Lat/Lng bounded to WGS-84 valid ranges. Heading is optional (0..360).
 */
export const UpsertLocationBodySchema = z.object({
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
	heading: z.number().min(0).max(360).optional(),
	accuracy: z.number().nonnegative().optional(),
});

// ─── Events listing ──────────────────────────────────────────────────────────

/**
 * GET /:role/orders/:id/events — offset pagination per CONTEXT.md.
 */
export const EventsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

// ─── Inspection fee preview ────────────────────────────────────────────────

/**
 * GET /user/inspection-fee-preview — compute the snapped inspection fee before
 * the booking is submitted.
 */
export const InspectionFeePreviewQuerySchema = z.object({
	technician_id: z.string().uuid("technician_id must be a valid UUID"),
	destination_address_id: z
		.string()
		.uuid("destination_address_id must be a valid UUID"),
});

// ─── Inferred types ──────────────────────────────────────────────────────────

export type SubmitOrderBody = z.infer<typeof SubmitOrderBodySchema>;
export type CancelOrderBody = z.infer<typeof CancelOrderBodySchema>;
export type OrderActionBody = z.infer<typeof OrderActionBodySchema>;
export type SubmitQuoteBody = z.infer<typeof SubmitQuoteBodySchema>;
export type AcceptQuoteParams = z.infer<typeof AcceptQuoteParamsSchema>;
export type QuoteIdParams = z.infer<typeof QuoteIdParamsSchema>;
export type ChoosePaymentMethodBody = z.infer<
	typeof ChoosePaymentMethodBodySchema
>;
export type ConfirmCompletionBody = z.infer<typeof ConfirmCompletionBodySchema>;
export type UpsertLocationBody = z.infer<typeof UpsertLocationBodySchema>;
export type EventsQuery = z.infer<typeof EventsQuerySchema>;
export type InspectionFeePreviewQuery = z.infer<
	typeof InspectionFeePreviewQuerySchema
>;
