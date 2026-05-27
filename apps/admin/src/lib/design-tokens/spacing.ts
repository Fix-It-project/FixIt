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

export const spacing = {
	screen: {
		paddingX: 24,
		paddingY: 20,
		paddingBottom: 32,
		contentMaxWidth: 1440,
	},
	sidebar: {
		width: 260,
		widthCollapsed: 72,
		itemHeight: 40,
		itemPaddingX: 12,
		itemGap: 8,
		sectionGap: 24,
	},
	header: {
		height: 64,
		paddingX: 24,
	},
	card: {
		padding: 20,
		gap: 16,
		radius: 12,
		compact: { padding: 12, gap: 8, radius: 8 },
		roomy: { padding: 28, gap: 20, radius: 16 },
	},
	table: {
		rowHeight: 48,
		headerHeight: 44,
		cellPaddingX: 12,
		cellPaddingY: 10,
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
	},
	button: {
		height: { sm: 32, md: 40, lg: 48 },
		paddingX: 16,
		paddingXSm: 12,
		paddingXLg: 24,
	},
	input: {
		height: 40,
		paddingX: 12,
	},
	icon: {
		xs: 14,
		sm: 16,
		md: 20,
		lg: 24,
		xl: 32,
	},
} as const;

export type Spacing = typeof spacing;
