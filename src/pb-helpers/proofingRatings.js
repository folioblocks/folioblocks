export const normalizeClientRating = ( value ) =>
	Number.isInteger( value ) && value >= 1 && value <= 5 ? value : null;

/** Zero at the left edge, then five equal star targets, left to right, independent of the page direction. */
export const getPointerRating = ( clientX, { left, width } ) =>
	width > 0
		? Math.max(
				0,
				Math.min( 5, Math.round( ( ( clientX - left ) / width ) * 5 ) )
		  )
		: null;

/** Undefined means this key is not handled; null means explicitly unrated. */
export const getKeyboardRating = ( key, current ) => {
	const value = normalizeClientRating( current ) || 0;
	if ( key === 'Home' || key === 'Delete' || key === 'Backspace' )
		return null;
	if ( key === 'End' ) return 5;
	if ( key === 'ArrowRight' || key === 'ArrowUp' )
		return Math.min( 5, value + 1 );
	if ( key === 'ArrowLeft' || key === 'ArrowDown' )
		return normalizeClientRating( value - 1 );
	return undefined;
};
