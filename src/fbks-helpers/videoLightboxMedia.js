import { getVideoIframeSrc, getVideoProviderData } from './videoProviders';
import { isValidHttpUrl } from './urlValidation';

/** Create only provider-generated embeds or native media; never inject URL-supplied HTML. */
export function createVideoLightboxMedia(
	url,
	{ document: doc = document, title = 'Video' } = {}
) {
	if ( ! isValidHttpUrl( url ) ) return null;
	const provider = getVideoProviderData( url, { isPro: true } );
	const iframeSrc = getVideoIframeSrc( url, { isPro: true, autoplay: true } );
	const media = doc.createElement( iframeSrc ? 'iframe' : 'video' );
	media.className = 'fbks-lightbox-video';
	if ( iframeSrc ) {
		media.title = title;
		media.allow =
			'autoplay; encrypted-media; fullscreen; picture-in-picture';
		media.allowFullscreen = true;
		media.referrerPolicy = 'strict-origin-when-cross-origin';
		media.src = iframeSrc;
	} else if ( provider.provider === 'self' ) {
		media.controls = true;
		media.autoplay = true;
		media.playsInline = true;
		media.preload = 'metadata';
		media.src = url;
		media.addEventListener(
			'error',
			() => {
				const error = doc.createElement( 'p' );
				error.className = 'fbks-lightbox-video-error';
				error.setAttribute( 'role', 'status' );
				error.textContent = 'This video could not be loaded.';
				if (
					media.parentElement &&
					! media.parentElement.querySelector(
						'.fbks-lightbox-video-error'
					)
				)
					media.after( error );
			},
			{ once: true }
		);
		media.setAttribute( 'aria-label', title );
	} else return null;
	return media;
}

export function stopVideoLightboxMedia( container ) {
	container.querySelectorAll( '.fbks-lightbox-video' ).forEach( ( media ) => {
		if ( media.tagName === 'VIDEO' ) {
			media.pause();
			media.removeAttribute( 'src' );
			media.load();
		} else media.removeAttribute( 'src' );
		media.remove();
	} );
}
