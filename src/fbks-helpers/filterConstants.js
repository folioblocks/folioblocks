export const FBKS_ALL_FILTER_TOKEN = 'all';
export const FBKS_LEGACY_ALL_FILTER_TOKEN = 'All';

export function fbksIsAllFilterValue( value ) {
	return (
		typeof value === 'string' &&
		value.trim().toLowerCase() === FBKS_ALL_FILTER_TOKEN
	);
}

export function fbksNormalizeActiveFilterValue( value ) {
	if ( fbksIsAllFilterValue( value ) ) {
		return FBKS_ALL_FILTER_TOKEN;
	}

	if ( typeof value !== 'string' ) {
		return FBKS_ALL_FILTER_TOKEN;
	}

	const trimmedValue = value.trim();

	return trimmedValue || FBKS_ALL_FILTER_TOKEN;
}
