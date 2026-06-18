/**
 * Maximum saved addresses per owner. Mirrors the server-enforced cap in
 * `apps/server/src/modules/addresses/addresses.service.ts` (MAX_ADDRESSES_PER_OWNER).
 * The "Add address" action is disabled once this is reached.
 */
export const MAX_ADDRESSES = 3;
