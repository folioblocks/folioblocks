export const getImageSizeOptions = ( availableImageSizes = [], __ ) => {
	const fallbackImageSizes = [
		{ name: __( 'Thumbnail', 'folioblocks' ), slug: 'thumbnail' },
		{ name: __( 'Medium', 'folioblocks' ), slug: 'medium' },
		{ name: __( 'Large', 'folioblocks' ), slug: 'large' },
		{ name: __( 'Full', 'folioblocks' ), slug: 'full' },
	];
	const optionMap = new Map();
	const imageSizes = availableImageSizes.length
		? availableImageSizes
		: fallbackImageSizes;

	imageSizes.forEach( ( size ) => {
		const value = size?.slug || size?.value || '';
		if ( ! value ) {
			return;
		}

		optionMap.set( value, {
			label: size?.name || size?.label || value,
			value,
		} );
	} );

	if ( ! optionMap.has( 'full' ) ) {
		optionMap.set( 'full', {
			label: __( 'Full', 'folioblocks' ),
			value: 'full',
		} );
	}

	return [ ...optionMap.values() ].sort( ( a, b ) => {
		const order = [ 'thumbnail', 'medium', 'large', 'full' ];
		const indexA = order.indexOf( a.value );
		const indexB = order.indexOf( b.value );

		if ( indexA === -1 && indexB === -1 ) {
			return a.label.localeCompare( b.label );
		}
		if ( indexA === -1 ) {
			return 1;
		}
		if ( indexB === -1 ) {
			return -1;
		}

		return indexA - indexB;
	} );
};
