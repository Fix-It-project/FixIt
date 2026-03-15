/**
 * Sort items by `distance_km` ascending.  `null` distances are pushed to the
 * end of the list so that items with a known distance always appear first.
 *
 * @returns A **new** sorted array (does not mutate the original).
 */
export function sortByDistance<T extends { distance_km: number | null }>(
  list: T[],
): T[] {
  return [...list].sort((a, b) => {
    if (a.distance_km == null && b.distance_km == null) return 0;
    if (a.distance_km == null) return 1;
    if (b.distance_km == null) return -1;
    return a.distance_km - b.distance_km;
  });
}
