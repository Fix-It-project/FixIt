/**
 * Chatbot kill switch.
 *
 * `false` → the chat screen renders read-only behind a frosted scrim with an
 * "unavailable" message; no one can interact with it.
 * `true`  → the chatbot works normally.
 *
 * To re-enable the chatbot later, flip this to `true` (single source of truth).
 */
export const CHATBOT_ENABLED = false;

/** Copy shown on the unavailable overlay while the chatbot is disabled. */
export const CHATBOT_UNAVAILABLE_TITLE = "Chatbot is not currently available";
export const CHATBOT_UNAVAILABLE_SUBTITLE =
	"This feature is temporarily turned off. Please check back later.";
