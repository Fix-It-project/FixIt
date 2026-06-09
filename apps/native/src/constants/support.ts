/**
 * Support contact details surfaced on the technician verification screen.
 * TODO: confirm the real support inbox with the team before release.
 */
export const SUPPORT_EMAIL = "support@fixit.app";

/** Builds a `mailto:` URL with an optional prefilled subject. */
export function supportMailto(subject?: string): string {
	const base = `mailto:${SUPPORT_EMAIL}`;
	return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
