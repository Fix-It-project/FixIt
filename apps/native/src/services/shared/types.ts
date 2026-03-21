/**
 * Shared types used across multiple service modules.
 */

/** Canonical order-status union — single source of truth for both user and technician flows. */
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled_by_user'
  | 'cancelled_by_technician'
  | 'completed';
