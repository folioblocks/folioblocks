/**
 * Video Provider Helpers
 *
 * Supported iframe providers:
 * - YouTube
 * - Vimeo
 * - Bunny.net Stream (embed/play URLs)
 */

const YOUTUBE_ID_FALLBACK = /^[a-zA-Z0-9_-]+$/;
const VIMEO_ID_FALLBACK = /^\d+$/;

const tryParseUrl = ( rawUrl ) => {
	if ( ! rawUrl || typeof rawUrl !== 'string' ) {
		return null;
	}

	try {
		const parsed = new URL( rawUrl, window.location.origin );
		const protocol = ( parsed.protocol || '' ).toLowerCase();
		if ( protocol !== 'http:' && protocol !== 'https:' ) {
			return null;
		}
		return parsed;
	} catch ( error ) {
		return null;
	}
};

const cleanId = ( id ) => {
	if ( ! id ) {
		return '';
	}
	return String( id ).trim().split( /[?#&]/ )[ 0 ];
};

const getPathParts = ( parsedUrl ) =>
	( parsedUrl?.pathname || '' )
		.split( '/' )
		.map( ( part ) => part.trim() )
		.filter( Boolean );

const getYouTubeId = ( parsedUrl ) => {
	const host = ( parsedUrl.hostname || '' ).toLowerCase();
	const parts = getPathParts( parsedUrl );

	if ( host.includes( 'youtu.be' ) ) {
		return cleanId( parts[ 0 ] );
	}

	const byQuery = cleanId( parsedUrl.searchParams.get( 'v' ) );
	if ( byQuery ) {
		return byQuery;
	}

	const markerIndex = parts.findIndex( ( part ) =>
		[ 'embed', 'shorts', 'live', 'v' ].includes( part )
	);
	if ( markerIndex !== -1 && parts[ markerIndex + 1 ] ) {
		return cleanId( parts[ markerIndex + 1 ] );
	}

	return '';
};

const getVimeoId = ( parsedUrl ) => {
	const parts = getPathParts( parsedUrl );
	const numericPart = [ ...parts ].reverse().find( ( part ) =>
		VIMEO_ID_FALLBACK.test( part )
	);
	return cleanId( numericPart );
};

const getBunnyStreamIds = ( parsedUrl ) => {
	const parts = getPathParts( parsedUrl );
	const markerIndex = parts.findIndex( ( part ) =>
		[ 'embed', 'play' ].includes( part )
	);

	if ( markerIndex === -1 || ! parts[ markerIndex + 1 ] || ! parts[ markerIndex + 2 ] ) {
		return null;
	}

	return {
		libraryId: cleanId( parts[ markerIndex + 1 ] ),
		videoId: cleanId( parts[ markerIndex + 2 ] ),
	};
};

export const getVideoProviderData = ( videoUrl ) => {
	const parsedUrl = tryParseUrl( videoUrl );
	if ( ! parsedUrl ) {
		return { provider: 'self', parsedUrl: null };
	}

	const host = ( parsedUrl.hostname || '' ).toLowerCase();

	if ( host.includes( 'youtube.com' ) || host.includes( 'youtu.be' ) ) {
		const videoId = getYouTubeId( parsedUrl );
		if ( videoId && YOUTUBE_ID_FALLBACK.test( videoId ) ) {
			return { provider: 'youtube', videoId, parsedUrl };
		}
	}

	if ( host.includes( 'vimeo.com' ) ) {
		const videoId = getVimeoId( parsedUrl );
		if ( videoId ) {
			return { provider: 'vimeo', videoId, parsedUrl };
		}
	}

	if ( host.includes( 'mediadelivery.net' ) || host.includes( 'video.bunnycdn.com' ) ) {
		const ids = getBunnyStreamIds( parsedUrl );
		if ( ids?.libraryId && ids?.videoId ) {
			return {
				provider: 'bunny',
				libraryId: ids.libraryId,
				videoId: ids.videoId,
				parsedUrl,
			};
		}
	}

	return { provider: 'self', parsedUrl };
};

export const getVideoProviderLabel = ( videoUrl ) => {
	const { provider } = getVideoProviderData( videoUrl );
	if ( provider === 'youtube' ) {
		return 'YouTube';
	}
	if ( provider === 'vimeo' ) {
		return 'Vimeo';
	}
	if ( provider === 'bunny' ) {
		return 'Bunny Stream';
	}
	return 'Video';
};

export const getVideoIframeSrc = (
	videoUrl,
	{ autoplay = false, preferNoCookie = false } = {}
) => {
	const data = getVideoProviderData( videoUrl );

	if ( data.provider === 'youtube' ) {
		const base = preferNoCookie
			? `https://www.youtube-nocookie.com/embed/${ data.videoId }`
			: `https://www.youtube.com/embed/${ data.videoId }`;
		const params = new URLSearchParams();
		params.set( 'rel', '0' );
		params.set( 'modestbranding', '1' );
		if ( autoplay ) {
			params.set( 'autoplay', '1' );
		}
		if ( ! preferNoCookie ) {
			params.set( 'enablejsapi', '1' );
		}
		return `${ base }?${ params.toString() }`;
	}

	if ( data.provider === 'vimeo' ) {
		const params = new URLSearchParams();
		if ( autoplay ) {
			params.set( 'autoplay', '1' );
		}
		const query = params.toString();
		return `https://player.vimeo.com/video/${ data.videoId }${
			query ? `?${ query }` : ''
		}`;
	}

	if ( data.provider === 'bunny' ) {
		const embedUrl = new URL(
			`https://iframe.mediadelivery.net/embed/${ data.libraryId }/${ data.videoId }`
		);

		if ( data.parsedUrl ) {
			data.parsedUrl.searchParams.forEach( ( value, key ) => {
				embedUrl.searchParams.set( key, value );
			} );
		}

		if ( autoplay ) {
			embedUrl.searchParams.set( 'autoplay', 'true' );
		}

		return embedUrl.toString();
	}

	return null;
};
