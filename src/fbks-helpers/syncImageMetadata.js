import {
	getExifAttributesFromMedia,
	getEmptyExifAttributes,
} from './exifMetadata';
import apiFetch from '@wordpress/api-fetch';

export const getImageMetadataSyncPayload = ( attributes = {} ) => ( {
	alt_text: attributes.alt || '',
	title: attributes.title || '',
	caption: attributes.caption || '',
} );

export const syncImageMetadataToMedia = (
	id,
	attributes = {},
	{ signal } = {}
) =>
	apiFetch( {
		path: `/wp/v2/media/${ id }`,
		method: 'POST',
		signal,
		data: getImageMetadataSyncPayload( attributes ),
	} );

/** Pull current Library values into one block without changing its source or presentation. */
export const getImageMetadataRefreshPayload = ( media ) => {
	const libraryExif = media.folioblocks_media_metadata?.library?.exif;
	const exifMedia = libraryExif
		? {
				media_details: {
					image_meta: {
						camera: libraryExif.camera ?? '',
						focal_length: libraryExif.focalLength ?? '',
						shutter_speed: libraryExif.shutterSpeed ?? '',
						aperture: libraryExif.aperture ?? '',
						iso: libraryExif.iso ?? '',
					},
				},
		  }
		: media;
	return {
		title: media.title?.raw ?? '',
		caption: media.caption?.raw ?? '',
		alt: media.alt_text ?? '',
		...( getExifAttributesFromMedia( exifMedia, '' ) ||
			getEmptyExifAttributes() ),
		exifRefreshedFromMedia: true,
	};
};

export const refreshImageMetadataFromMedia = async ( id, { signal } = {} ) => {
	const media = await apiFetch( {
		path: `/wp/v2/media/${ id }?context=edit&_fbks_refresh=${ Date.now() }`,
		cache: 'no-store',
		signal,
	} );
	if (
		Number( media.id ) !== Number( id ) ||
		typeof media.title?.raw !== 'string' ||
		typeof media.caption?.raw !== 'string'
	) {
		throw new Error( 'Invalid attachment metadata response.' );
	}
	return getImageMetadataRefreshPayload( media );
};
