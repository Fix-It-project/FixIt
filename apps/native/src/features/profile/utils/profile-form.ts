type StringFields = Record<string, string>;

export function getChangedFields<T extends StringFields>(
	currentValues: T,
	originalValues: T,
): Partial<T> {
	return Object.fromEntries(
		Object.entries(currentValues).filter(
			([key, value]) => value !== originalValues[key],
		),
	) as Partial<T>;
}

export function hasChangedFields<T extends StringFields>(
	currentValues: T,
	originalValues: T,
) {
	return (
		Object.keys(getChangedFields(currentValues, originalValues)).length > 0
	);
}
