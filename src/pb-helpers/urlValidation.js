export const isValidHttpUrl = ( value, { allowRelative = false } = {} ) => {
	if ( typeof value !== 'string' || value.trim() === '' ) {
		return false;
	}

	const trimmedValue = value.trim();
	if (
		allowRelative &&
		( trimmedValue.startsWith( '/' ) ||
			trimmedValue.startsWith( './' ) ||
			trimmedValue.startsWith( '../' ) )
	) {
		return ! /\s/.test( trimmedValue );
	}

	try {
		const parsedUrl = new URL( trimmedValue );
		return (
			( parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:' ) &&
			!! parsedUrl.hostname
		);
	} catch ( error ) {
		return false;
	}
};

export const isValidVimeoUrl = ( value ) => {
	if ( ! isValidHttpUrl( value ) ) {
		return false;
	}

	const parsedUrl = new URL( value.trim() );
	const hostname = parsedUrl.hostname.toLowerCase();
	return hostname === 'vimeo.com' || hostname.endsWith( '.vimeo.com' );
};
