/**
 * Re-exports Zod-inferred types from the schema file — single source of truth.
 *
 * All consumers that previously imported from this file continue to work
 * without changes.
 */
export type {
  TechnicianListItem,
  TechniciansResponse,
  TechnicianProfile,
  TechnicianProfileResponse,
} from './schema';
