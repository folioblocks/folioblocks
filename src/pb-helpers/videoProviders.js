/**
 * Video Provider Helpers
 *
 * Supported iframe providers:
 * - YouTube
 * - Vimeo
 * - Bunny.net Stream (embed/play URLs)
 * - Wistia
 * - Dailymotion
 * - VideoPress
 * - Loom
 * - Cloudflare Stream
 */
import { isValidHttpUrl } from './urlValidation';

const YOUTUBE_ID_FALLBACK = /^[a-zA-Z0-9_-]+$/;
const VIMEO_ID_FALLBACK = /^\d+$/;
const EMBED_ID_FALLBACK = /^[a-zA-Z0-9_-]+$/;

const tryParseUrl = ( rawUrl ) => {
	if ( ! rawUrl || typeof rawUrl !== 'string' ) {
		return null;
	}

	try {
		if ( ! isValidHttpUrl( rawUrl ) ) {
			return null;
		}
		const parsed = new URL( rawUrl );
		const protocol = ( parsed.protocol || '' ).toLowerCase();
		if ( protocol !== 'http:' && protocol !== 'https:' ) {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
};

const cleanId = ( id ) => {
	if ( ! id ) {
		return '';
	}
	return String( id ).trim().split( /[?#&]/ )[ 0 ];
};

const cleanDailymotionId = ( id ) => cleanId( id ).split( '_' )[ 0 ];

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
	const numericPart = [ ...parts ]
		.reverse()
		.find( ( part ) => VIMEO_ID_FALLBACK.test( part ) );
	return cleanId( numericPart );
};

const getVimeoHash = ( parsedUrl, videoId ) => {
	const byQuery = cleanId( parsedUrl.searchParams.get( 'h' ) );
	if ( byQuery ) {
		return byQuery;
	}

	const parts = getPathParts( parsedUrl );
	const videoIndex = parts.findIndex(
		( part ) => cleanId( part ) === videoId
	);
	const pathHash = cleanId( parts[ videoIndex + 1 ] );

	return pathHash && ! VIMEO_ID_FALLBACK.test( pathHash ) ? pathHash : '';
};

const getBunnyStreamIds = ( parsedUrl ) => {
	const parts = getPathParts( parsedUrl );
	const markerIndex = parts.findIndex( ( part ) =>
		[ 'embed', 'play' ].includes( part )
	);

	if (
		markerIndex === -1 ||
		! parts[ markerIndex + 1 ] ||
		! parts[ markerIndex + 2 ]
	) {
		return null;
	}

	return {
		libraryId: cleanId( parts[ markerIndex + 1 ] ),
		videoId: cleanId( parts[ markerIndex + 2 ] ),
	};
};

const getWistiaId = ( parsedUrl ) => {
	const parts = getPathParts( parsedUrl );
	const markerIndex = parts.findIndex( ( part ) =>
		[ 'medias', 'iframe' ].includes( part )
	);

	if ( markerIndex !== -1 && parts[ markerIndex + 1 ] ) {
		return cleanId( parts[ markerIndex + 1 ] );
	}

	return '';
};

const getDailymotionId = ( parsedUrl ) => {
	const host = ( parsedUrl.hostname || '' ).toLowerCase();
	const parts = getPathParts( parsedUrl );

	if ( host.includes( 'dai.ly' ) ) {
		return cleanDailymotionId( parts[ 0 ] );
	}

	const markerIndex = parts.findIndex( ( part ) =>
		[ 'embed', 'video' ].includes( part )
	);

	if ( markerIndex !== -1 && parts[ markerIndex + 1 ] ) {
		return cleanDailymotionId( parts[ markerIndex + 1 ] );
	}

	return '';
};

const getVideoPressId = ( parsedUrl ) => {
	const parts = getPathParts( parsedUrl );
	const markerIndex = parts.findIndex( ( part ) =>
		[ 'embed', 'v' ].includes( part )
	);

	if ( markerIndex !== -1 && parts[ markerIndex + 1 ] ) {
		return cleanId( parts[ markerIndex + 1 ] );
	}

	return cleanId( parts[ 0 ] );
};

const getLoomId = ( parsedUrl ) => {
	const parts = getPathParts( parsedUrl );
	const markerIndex = parts.findIndex( ( part ) =>
		[ 'embed', 'share' ].includes( part )
	);

	if ( markerIndex !== -1 && parts[ markerIndex + 1 ] ) {
		return cleanId( parts[ markerIndex + 1 ] );
	}

	return '';
};

const getCloudflareStreamId = ( parsedUrl ) => {
	const parts = getPathParts( parsedUrl );
	const host = ( parsedUrl.hostname || '' ).toLowerCase();

	if ( host.includes( 'iframe.videodelivery.net' ) ) {
		return cleanId( parts[ 0 ] );
	}

	const markerIndex = parts.findIndex( ( part ) =>
		[ 'embed', 'iframe', 'watch' ].includes( part )
	);

	if ( markerIndex !== -1 ) {
		return cleanId( parts[ markerIndex + 1 ] || parts[ markerIndex - 1 ] );
	}

	return cleanId( parts[ 0 ] );
};

const copySearchParams = ( sourceUrl, targetUrl ) => {
	if ( ! sourceUrl ) {
		return;
	}

	sourceUrl.searchParams.forEach( ( value, key ) => {
		targetUrl.searchParams.set( key, value );
	} );
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
			return {
				provider: 'vimeo',
				videoId,
				vimeoHash: getVimeoHash( parsedUrl, videoId ),
				parsedUrl,
			};
		}
	}

	if (
		host.includes( 'mediadelivery.net' ) ||
		host.includes( 'video.bunnycdn.com' )
	) {
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

	if ( host.includes( 'wistia.com' ) || host.includes( 'wistia.net' ) ) {
		const videoId = getWistiaId( parsedUrl );
		if ( videoId && EMBED_ID_FALLBACK.test( videoId ) ) {
			return { provider: 'wistia', videoId, parsedUrl };
		}
	}

	if ( host.includes( 'dailymotion.com' ) || host.includes( 'dai.ly' ) ) {
		const videoId = getDailymotionId( parsedUrl );
		if ( videoId && EMBED_ID_FALLBACK.test( videoId ) ) {
			return { provider: 'dailymotion', videoId, parsedUrl };
		}
	}

	if (
		host.includes( 'videopress.com' ) ||
		host.includes( 'video.wordpress.com' )
	) {
		const videoId = getVideoPressId( parsedUrl );
		if ( videoId && EMBED_ID_FALLBACK.test( videoId ) ) {
			return { provider: 'videopress', videoId, parsedUrl };
		}
	}

	if ( host.includes( 'loom.com' ) ) {
		const videoId = getLoomId( parsedUrl );
		if ( videoId && EMBED_ID_FALLBACK.test( videoId ) ) {
			return { provider: 'loom', videoId, parsedUrl };
		}
	}

	if (
		host.includes( 'videodelivery.net' ) ||
		host.includes( 'cloudflarestream.com' )
	) {
		const videoId = getCloudflareStreamId( parsedUrl );
		if ( videoId && EMBED_ID_FALLBACK.test( videoId ) ) {
			return { provider: 'cloudflare', videoId, parsedUrl };
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
	if ( provider === 'wistia' ) {
		return 'Wistia';
	}
	if ( provider === 'dailymotion' ) {
		return 'Dailymotion';
	}
	if ( provider === 'videopress' ) {
		return 'VideoPress';
	}
	if ( provider === 'loom' ) {
		return 'Loom';
	}
	if ( provider === 'cloudflare' ) {
		return 'Cloudflare Stream';
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
		params.set( 'playsinline', '1' );
		if ( autoplay ) {
			params.set( 'autoplay', '1' );
		}
		return `${ base }?${ params.toString() }`;
	}

	if ( data.provider === 'vimeo' ) {
		const params = new URLSearchParams();
		if ( data.parsedUrl ) {
			data.parsedUrl.searchParams.forEach( ( value, key ) => {
				params.set( key, value );
			} );
		}
		if ( data.vimeoHash ) {
			params.set( 'h', data.vimeoHash );
		}
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

		copySearchParams( data.parsedUrl, embedUrl );

		if ( autoplay ) {
			embedUrl.searchParams.set( 'autoplay', 'true' );
		}

		return embedUrl.toString();
	}

	if ( data.provider === 'wistia' ) {
		const embedUrl = new URL(
			`https://fast.wistia.net/embed/iframe/${ data.videoId }`
		);
		copySearchParams( data.parsedUrl, embedUrl );
		if ( autoplay ) {
			embedUrl.searchParams.set( 'autoPlay', 'true' );
		}
		return embedUrl.toString();
	}

	if ( data.provider === 'dailymotion' ) {
		const embedUrl = new URL(
			`https://www.dailymotion.com/embed/video/${ data.videoId }`
		);
		copySearchParams( data.parsedUrl, embedUrl );
		if ( autoplay ) {
			embedUrl.searchParams.set( 'autoplay', '1' );
		}
		return embedUrl.toString();
	}

	if ( data.provider === 'videopress' ) {
		const embedUrl = new URL(
			`https://videopress.com/embed/${ data.videoId }`
		);
		copySearchParams( data.parsedUrl, embedUrl );
		if ( autoplay ) {
			embedUrl.searchParams.set( 'autoplay', '1' );
		}
		return embedUrl.toString();
	}

	if ( data.provider === 'loom' ) {
		const embedUrl = new URL(
			`https://www.loom.com/embed/${ data.videoId }`
		);
		copySearchParams( data.parsedUrl, embedUrl );
		if ( autoplay ) {
			embedUrl.searchParams.set( 'autoplay', '1' );
		}
		return embedUrl.toString();
	}

	if ( data.provider === 'cloudflare' ) {
		const embedUrl = new URL(
			`https://iframe.videodelivery.net/${ data.videoId }`
		);
		copySearchParams( data.parsedUrl, embedUrl );
		if ( autoplay ) {
			embedUrl.searchParams.set( 'autoplay', 'true' );
		}
		return embedUrl.toString();
	}

	return null;
};
