/**
 * Border width tokens for repeated product controls.
 */
export const borderWidth = {
	focus: 1.5,
	selected: 2,
} as const;

export type BorderWidth = typeof borderWidth;
