import primitiveColors from "./primitive-colors.json";

export type Hsl = readonly [number, number, number];

export const colorPrimitives = {
	blue: primitiveColors.blue as unknown as Record<number, Hsl>,
} as const;
