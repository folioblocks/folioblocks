import apiFetch from '@wordpress/api-fetch';

export const getImageMetadataSyncPayload = ( attributes = {} ) => ( {
	alt_text: attributes.alt || '',
	title: attributes.title || '',
	caption: attributes.caption || '',
} );

export const syncImageMetadataToMedia = ( id, attributes = {} ) =>
	apiFetch( {
		path: `/wp/v2/media/${ id }`,
		method: 'POST',
		data: getImageMetadataSyncPayload( attributes ),
	} );
