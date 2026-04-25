import { borderWidth } from "./border";
import { fontFamily } from "./typography";
import { radius } from "./radius";
import { spacing } from "./spacing";

function px(value: number): string {
	return `${value}px`;
}

function cssSize(value: number | string): string {
	return typeof value === "number" ? px(value) : value;
}

export const tailwindFontFamily = {
	"google-sans": fontFamily.regular,
	"google-sans-medium": fontFamily.medium,
	"google-sans-semibold": fontFamily.semibold,
	"google-sans-bold": fontFamily.bold,
} as const;

export const tailwindBorderRadius = {
	compact: px(radius.compact),
	card: px(radius.card),
	hero: px(radius.hero),
	input: px(radius.input),
	button: px(radius.button),
	sheet: px(radius.sheet),
	chip: px(radius.chip),
	pill: px(radius.pill),
	"control-segmented": px(radius.controlSegmented),
	"control-segmented-item": px(radius.controlSegmentedItem),
} as const;

export const tailwindBorderWidth = {
	focus: px(borderWidth.focus),
	selected: px(borderWidth.selected),
} as const;

export const tailwindHeight = {
	"btn-sm": px(spacing.button.height.sm),
	"btn-md": px(spacing.button.height.md),
	"btn-lg": px(spacing.button.height.lg),
	"btn-xl": px(spacing.button.height.xl),
	"control-back-sm": px(spacing.control.back.sm),
	"control-back-md": px(spacing.control.back.md),
	"control-chip": px(spacing.control.chip.height),
	"control-search": px(spacing.control.search.height),
	"control-segmented-item": px(spacing.control.segmented.itemMinHeight),
	input: px(spacing.input.height),
	header: px(spacing.header.minHeight),
	"tab-bar": px(spacing.tabBar.height),
	"avatar-sm": px(spacing.avatar.sm),
	"avatar-md": px(spacing.avatar.md),
	"avatar-card": px(spacing.avatar.card),
	"avatar-lg": px(spacing.avatar.lg),
	"avatar-xl": px(spacing.avatar.xl),
	"avatar-hero": px(spacing.avatar.hero),
	"avatar-2xl": px(spacing.avatar["2xl"]),
	"icon-2xs": px(spacing.icon["2xs"]),
	"icon-xs": px(spacing.icon.xs),
	"icon-sm": px(spacing.icon.sm),
	"icon-md": px(spacing.icon.md),
	"icon-lg": px(spacing.icon.lg),
	"icon-xl": px(spacing.icon.xl),
	"control-icon-box-sm": px(spacing.control.iconBoxSm.size),
	"control-icon-box-md": px(spacing.control.iconBoxMd.size),
	"control-icon-box-touch": px(spacing.control.iconBoxTouch.size),
	"control-icon-box-lg": px(spacing.control.iconBoxLg.size),
	"status-dot-sm": px(spacing.control.statusDot.sm),
	"status-dot-md": px(spacing.control.statusDot.md),
	"media-attachment": px(spacing.media.attachmentPreviewHeight),
	"media-role-avatar": px(spacing.media.roleAvatarHeight),
	"media-role-orb": px(spacing.media.roleOrbSize),
} as const;

export const tailwindWidth = {
	"control-back-sm": px(spacing.control.back.sm),
	"control-back-md": px(spacing.control.back.md),
	"avatar-sm": px(spacing.avatar.sm),
	"avatar-md": px(spacing.avatar.md),
	"avatar-card": px(spacing.avatar.card),
	"avatar-lg": px(spacing.avatar.lg),
	"avatar-xl": px(spacing.avatar.xl),
	"avatar-hero": px(spacing.avatar.hero),
	"avatar-2xl": px(spacing.avatar["2xl"]),
	"icon-2xs": px(spacing.icon["2xs"]),
	"icon-xs": px(spacing.icon.xs),
	"icon-sm": px(spacing.icon.sm),
	"icon-md": px(spacing.icon.md),
	"icon-lg": px(spacing.icon.lg),
	"icon-xl": px(spacing.icon.xl),
	"control-icon-box-sm": px(spacing.control.iconBoxSm.size),
	"control-icon-box-md": px(spacing.control.iconBoxMd.size),
	"control-icon-box-touch": px(spacing.control.iconBoxTouch.size),
	"control-icon-box-lg": px(spacing.control.iconBoxLg.size),
	"status-dot-sm": px(spacing.control.statusDot.sm),
	"status-dot-md": px(spacing.control.statusDot.md),
	"media-role-avatar": px(spacing.media.roleAvatarWidth),
	"media-role-orb": px(spacing.media.roleOrbSize),
	toast: cssSize(spacing.media.toastWidthPercent),
	modal: cssSize(spacing.media.modalWidthPercent),
} as const;

export const tailwindMinHeight = {
	header: px(spacing.header.minHeight),
} as const;

export const tailwindSpacing = {
	"screen-x": px(spacing.screen.paddingX),
	"screen-y": px(spacing.screen.paddingY),
	"screen-bottom-inset": px(spacing.screen.scrollBottomInset),
	"screen-form-bleed": px(spacing.screen.formBleed),
	"offset-avatar-overlap": px(spacing.offset.avatarOverlap),
	"offset-hairline-nudge": px(spacing.offset.hairlineNudge),
	card: px(spacing.card.padding),
	"card-compact": px(spacing.card.compact.padding),
	"card-roomy": px(spacing.card.roomy.padding),
	sheet: px(spacing.sheet.padding),
	"stack-xs": px(spacing.stack.xs),
	"stack-sm": px(spacing.stack.sm),
	"stack-md": px(spacing.stack.md),
	"stack-lg": px(spacing.stack.lg),
	"stack-xl": px(spacing.stack.xl),
	"stack-2xl": px(spacing.stack["2xl"]),
	"stack-3xl": px(spacing.stack["3xl"]),
	"stack-4xl": px(spacing.stack["4xl"]),
	"control-search": px(spacing.control.search.paddingX),
	"control-btn-compact": px(spacing.control.buttonCompact.paddingX),
	"button-x": px(spacing.button.paddingX),
	"button-sm-x": px(spacing.button.paddingXSm),
	"button-lg-x": px(spacing.button.paddingXLg),
	"control-action-y": px(spacing.control.buttonAction.paddingY),
	"control-cta-y": px(spacing.control.buttonSecondary.paddingY),
	"control-compact-cta-x": px(spacing.control.buttonSecondaryCompact.paddingX),
	"control-compact-cta-y": px(spacing.control.buttonSecondaryCompact.paddingY),
	"control-pill-x": px(spacing.control.pill.paddingX),
	"control-pill-y": px(spacing.control.pill.paddingY),
	"control-badge-x": px(spacing.control.badge.paddingX),
	"control-badge-y": px(spacing.control.badge.paddingY),
	"list-row": px(spacing.list.rowGap),
	"list-row-y": px(spacing.list.rowPaddingY),
	"list-row-comfortable-y": px(spacing.list.rowPaddingYComfortable),
} as const;

export const tailwindPadding = {
	"screen-x": px(spacing.screen.paddingX),
	"screen-y": px(spacing.screen.paddingY),
	card: px(spacing.card.padding),
	"card-compact": px(spacing.card.compact.padding),
	"card-roomy": px(spacing.card.roomy.padding),
	sheet: px(spacing.sheet.padding),
	"control-search": px(spacing.control.search.paddingX),
	"control-btn-compact": px(spacing.control.buttonCompact.paddingX),
	"button-x": px(spacing.button.paddingX),
	"button-sm-x": px(spacing.button.paddingXSm),
	"button-lg-x": px(spacing.button.paddingXLg),
	"control-chip": px(spacing.control.chip.paddingX),
	"control-action-y": px(spacing.control.buttonAction.paddingY),
	"control-cta-y": px(spacing.control.buttonSecondary.paddingY),
	"control-compact-cta-x": px(spacing.control.buttonSecondaryCompact.paddingX),
	"control-compact-cta-y": px(spacing.control.buttonSecondaryCompact.paddingY),
	"control-segmented-shell": px(spacing.control.segmented.shellPadding),
	"control-segmented-x": px(spacing.control.segmented.itemPaddingX),
	"control-pill-x": px(spacing.control.pill.paddingX),
	"control-pill-y": px(spacing.control.pill.paddingY),
	"control-trigger-x": px(spacing.control.trigger.paddingX),
	"control-trigger-y": px(spacing.control.trigger.paddingY),
	"control-badge-x": px(spacing.control.badge.paddingX),
	"control-badge-y": px(spacing.control.badge.paddingY),
	"list-row-y": px(spacing.list.rowPaddingY),
	"list-row-comfortable-y": px(spacing.list.rowPaddingYComfortable),
} as const;

export const tailwindGap = {
	"stack-xs": px(spacing.stack.xs),
	"stack-sm": px(spacing.stack.sm),
	"stack-md": px(spacing.stack.md),
	"stack-lg": px(spacing.stack.lg),
	"stack-xl": px(spacing.stack.xl),
	"stack-2xl": px(spacing.stack["2xl"]),
	"stack-3xl": px(spacing.stack["3xl"]),
	"stack-4xl": px(spacing.stack["4xl"]),
	"control-search": px(spacing.control.search.gap),
	"control-btn-compact": px(spacing.control.buttonCompact.gap),
	"control-action": px(spacing.control.buttonAction.gap),
	"control-cta": px(spacing.control.buttonSecondary.gap),
	"control-trigger": px(spacing.control.trigger.gap),
	"control-chip": px(spacing.control.chip.gap),
	"control-badge": px(spacing.control.badge.gap),
	"control-segmented": px(spacing.control.segmented.gap),
	"list-row": px(spacing.list.rowGap),
	"card-compact": px(spacing.card.compact.gap),
	"card-roomy": px(spacing.card.roomy.gap),
} as const;
