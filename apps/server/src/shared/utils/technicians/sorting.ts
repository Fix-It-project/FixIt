import sortBy from 'lodash/sortBy.js';

/**
 * Sort items by `distance_km` ascending using lodash `sortBy`.
 * Items with a `null` distance are pushed to the end via `Infinity` substitution.
 *
 * @returns A new sorted array (does not mutate the original).
 */
export function sortByDistance<T extends { distance_km: number | null }>(
  list: T[],
): T[] {
  return sortBy(list, (item) => item.distance_km ?? Number.POSITIVE_INFINITY);
}
