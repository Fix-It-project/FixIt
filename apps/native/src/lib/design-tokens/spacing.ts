/**
 * Primitive spacing scale (4px base, Tailwind-aligned).
 * Use semantic `spacing` below before reaching for primitives.
 */
export const space = {
	0: 0,
	px: 1,
	0.5: 2,
	1: 4,
	1.5: 6,
	2: 8,
	2.5: 10,
	3: 12,
	4: 16,
	5: 20,
	6: 24,
	7: 28,
	8: 32,
	10: 40,
	12: 48,
	14: 56,
	16: 64,
	20: 80,
} as const;

export type SpacePrimitive = keyof typeof space;

/**
 * Semantic spacing — intent-named tokens. Prefer these in component authorship.
 * Theme-independent; consumed via direct import, not hooks.
 */
export const spacing = {
	screen: {
		paddingX: 20,
		paddingY: 16,
		paddingBottom: 24,
		// detail/scroll screens ending in sticky CTA or footer tab bar — extra end-of-scroll breathing room
		scrollBottomInset: 40,
		formBleed: 28,
	},
	card: {
		// default density — roomy surface cards (dominant product card pattern)
		padding: 16,
		gap: 12,
		radius: 16,
		// compact density — dense rows, banners, stat chips
		compact: {
			padding: 12,
			gap: 8,
			radius: 12,
		},
		// roomy density — profile/help/order surfaces
		roomy: {
			padding: 20,
			gap: 16,
			radius: 16,
		},
	},
	control: {
		back: {
			sm: 36,
			md: 40,
		},
		search: {
			height: 44,
			paddingX: 14,
			gap: 10,
		},
		buttonCompact: {
			paddingX: 12,
			gap: 6,
			paddingY: 6,
		},
		buttonSecondary: {
			gap: 8,
			paddingY: 14,
		},
		buttonSecondaryCompact: {
			paddingX: 20,
			paddingY: 10,
			gap: 8,
		},
		buttonAction: {
			gap: 8,
			paddingY: 16,
		},
		badge: {
			paddingX: 8,
			paddingY: 2,
			gap: 4,
		},
		chip: {
			height: 32,
			paddingX: 16,
			gap: 8,
		},
		pill: {
			paddingX: 16,
			paddingY: 6,
		},
		segmented: {
			shellPadding: 4,
			itemMinHeight: 40,
			itemPaddingX: 12,
			gap: 6,
		},
		trigger: {
			paddingX: 12,
			paddingY: 8,
			gap: 6,
		},
		iconBoxSm: {
			size: 32,
		},
		iconBoxMd: {
			size: 40,
		},
		iconBoxTouch: {
			size: 44,
		},
		iconBoxLg: {
			size: 48,
		},
		statusDot: {
			sm: 8,
			md: 14,
		},
	},
	section: {
		gap: 24,
		gapCompact: 16,
	},
	stack: {
		xs: 4,
		sm: 8,
		md: 12,
		lg: 16,
		xl: 24,
		"2xl": 32,
		"3xl": 48,
		"4xl": 64,
	},
	button: {
		height: {
			sm: 36,
			md: 48,
			lg: 56,
			xl: 64,
		},
		paddingX: 24,
		paddingXSm: 12,
		paddingXLg: 32,
	},
	input: {
		height: 56,
		paddingX: 16,
	},
	icon: {
		"2xs": 4,
		xs: 16,
		sm: 20,
		md: 24,
		lg: 32,
		xl: 40,
	},
	avatar: {
		sm: 40,
		md: 48,
		card: 68,
		lg: 56,
		xl: 64,
		hero: 80,
		"2xl": 96,
	},
	media: {
		attachmentPreviewHeight: 192,
		roleAvatarHeight: 160,
		roleAvatarWidth: 128,
		roleOrbSize: 224,
		toastWidthPercent: "90%",
		modalWidthPercent: "88%",
	},
	sheet: {
		padding: 20,
		handleHeight: 4,
		handleWidth: 40,
	},
	header: {
		minHeight: 64,
		dashboardHeight: 160,
		homePolygonHeight: 180,
		paddingX: 20,
		paddingY: 12,
		shellPaddingX: 16,
		shellPaddingTop: 10,
		shellPaddingBottom: 16,
	},
	tabBar: {
		height: 72,
	},
	list: {
		itemPadding: 16,
		itemGap: 12,
		rowPaddingY: 14,
		rowPaddingYComfortable: 16,
		rowGap: 12,
	},
	offset: {
		avatarOverlap: -16,
		hairlineNudge: -1,
	},
} as const;

export type Spacing = typeof spacing;
