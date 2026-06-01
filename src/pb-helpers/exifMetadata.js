export const EXIF_ATTRIBUTE_KEYS = [
	'exifCamera',
	'exifFocalLength',
	'exifShutterSpeed',
	'exifAperture',
	'exifIso',
];

const isStoredExifValue = ( value, unknownValue ) => {
	if ( ! value ) {
		return false;
	}

	const normalizedValue = String( value ).trim().toLowerCase();
	const normalizedUnknownValue = String( unknownValue || 'unknown' )
		.trim()
		.toLowerCase();

	return (
		normalizedValue !== 'unknown' &&
		normalizedValue !== normalizedUnknownValue
	);
};

export const hasStoredExifAttributes = (
	attributes = {},
	unknownValue = 'Unknown'
) =>
	EXIF_ATTRIBUTE_KEYS.every( ( key ) =>
		isStoredExifValue( attributes[ key ], unknownValue )
	);

export const getEmptyExifAttributes = () => ( {
	exifCamera: '',
	exifFocalLength: '',
	exifShutterSpeed: '',
	exifAperture: '',
	exifIso: '',
} );

export const getReadableExifValue = ( value ) => {
	if (
		value === undefined ||
		value === null ||
		value === '' ||
		value === 0 ||
		value === '0'
	) {
		return '';
	}

	return String( value ).trim();
};

export const getImageMetaFromMedia = ( media ) =>
	media?.media_details?.image_meta ||
	media?.mediaDetails?.imageMeta ||
	media?.image_meta ||
	media?.imageMeta ||
	media?.meta?.image_meta ||
	null;

export const getFolioBlocksImageMetaFromMedia = ( media ) =>
	media?.folioblocks_image_meta || media?.folioBlocksImageMeta || null;

export const formatAperture = ( value ) => {
	const aperture = getReadableExifValue( value );

	if ( ! aperture ) {
		return '';
	}

	return aperture.toLowerCase().startsWith( 'f/' )
		? aperture
		: `f/${ aperture }`;
};

export const formatFocalLength = ( value ) => {
	const focalLength = getReadableExifValue( value );

	if ( ! focalLength ) {
		return '';
	}

	return /mm$/i.test( focalLength ) ? focalLength : `${ focalLength } mm`;
};

export const formatIso = ( value ) => {
	const iso = getReadableExifValue( value );

	if ( ! iso ) {
		return '';
	}

	return /^iso\b/i.test( iso ) ? iso : `ISO ${ iso }`;
};

export const formatShutterSpeed = ( value ) => {
	const shutterSpeed = getReadableExifValue( value );

	if ( ! shutterSpeed ) {
		return '';
	}

	if ( shutterSpeed.includes( '/' ) ) {
		return `${ shutterSpeed } sec`;
	}

	const numericValue = Number( shutterSpeed );

	if ( ! Number.isFinite( numericValue ) || numericValue <= 0 ) {
		return shutterSpeed;
	}

	if ( numericValue < 1 ) {
		return `1/${ Math.round( 1 / numericValue ) } sec`;
	}

	return `${ numericValue } sec`;
};

export const getExifAttributesFromMedia = (
	media,
	unknownValue = 'Unknown'
) => {
	const imageMeta = getImageMetaFromMedia( media );

	if ( ! imageMeta ) {
		return null;
	}

	const folioBlocksImageMeta = getFolioBlocksImageMetaFromMedia( media );
	const shutterSpeed =
		getReadableExifValue( imageMeta.shutter_speed ) ||
		getReadableExifValue( folioBlocksImageMeta?.shutter_speed );

	return {
		exifCamera: getReadableExifValue( imageMeta.camera ) || unknownValue,
		exifFocalLength:
			formatFocalLength( imageMeta.focal_length ) || unknownValue,
		exifShutterSpeed: formatShutterSpeed( shutterSpeed ) || unknownValue,
		exifAperture: formatAperture( imageMeta.aperture ) || unknownValue,
		exifIso: formatIso( imageMeta.iso ) || unknownValue,
	};
};
