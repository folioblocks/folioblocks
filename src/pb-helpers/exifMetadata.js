export const EXIF_ATTRIBUTE_KEYS = [
	'exifCamera',
	'exifFocalLength',
	'exifShutterSpeed',
	'exifAperture',
	'exifIso',
];

export const hasStoredExifAttributes = ( attributes = {} ) =>
	EXIF_ATTRIBUTE_KEYS.every( ( key ) => !! attributes[ key ] );

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

	return {
		exifCamera: getReadableExifValue( imageMeta.camera ) || unknownValue,
		exifFocalLength:
			formatFocalLength( imageMeta.focal_length ) || unknownValue,
		exifShutterSpeed:
			formatShutterSpeed( imageMeta.shutter_speed ) || unknownValue,
		exifAperture: formatAperture( imageMeta.aperture ) || unknownValue,
		exifIso: formatIso( imageMeta.iso ) || unknownValue,
	};
};
