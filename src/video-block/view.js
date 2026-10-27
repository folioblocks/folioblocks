/**
 * PB Video Block
 * View JS – Optimized Lightbox (fast provider playback)
 */

import { getElement, store } from '@wordpress/interactivity';
import { createFrontendScope } from '../fbks-helpers/frontendScope';
import {
	getVideoIframeSrc,
	getVideoProviderData,
} from '../fbks-helpers/videoProviders';
import { initTiltHoverEffects } from '../fbks-helpers/tiltHoverEffect';

let activeLightbox;

const initializeVideo = ( root ) => {
	const block = root.querySelector( '.pb-video-block' );
	if ( ! block ) {
		return;
	}
	const scope = createFrontendScope();
	initTiltHoverEffects( root, { signal: scope.signal } );
	const gallery = root.closest( '.pb-video-gallery' );
	const index = gallery ? Array.from( gallery.children ).indexOf( root ) : 0;
	block.style.opacity = 0;
	block.style.transform = 'translateY(20px)';
	block.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
	scope.timeout(
		() => {
			block.style.opacity = 1;
			block.style.transform = 'translateY(0)';
		},
		Math.max( 0, index ) * 150
	);

	const lightbox = root.querySelector( '.pb-video-lightbox' );
	const videoContainer = lightbox
		? lightbox.querySelector( '.pb-video-lightbox-video' )
		: null;
	if ( ! lightbox || ! videoContainer ) {
		return () => scope.dispose();
	}

	const closeButton = lightbox.querySelector( '.pb-video-lightbox-close' );
	let lastFocusedElement = null;
	let previousOverflow;
	let mediaScope;

	/**
	 * ----------------------------------------------------------------
	 *  Create one reusable iframe for provider playback
	 *  ----------------------------------------------------------------
	 */
	const iframe = document.createElement( 'iframe' );
	iframe.setAttribute( 'frameborder', '0' );
	iframe.setAttribute(
		'allow',
		'autoplay; encrypted-media; fullscreen; picture-in-picture'
	);
	iframe.setAttribute( 'referrerpolicy', 'strict-origin-when-cross-origin' );
	iframe.setAttribute( 'allowfullscreen', '' );
	iframe.style.display = 'none';
	iframe.style.opacity = '0';
	iframe.style.transition = 'opacity 0.3s ease';
	videoContainer.appendChild( iframe );

	scope.listen( iframe, 'load', () => {
		iframe.classList.add( 'loaded' );
		iframe.style.opacity = '1';
	} );

	/**
	 * ----------------------------------------------------------------
	 *  Helper: Build correct embed markup or local video
	 *  ----------------------------------------------------------------
	 * @param {string} videoUrl Video URL to embed.
	 */
	function setVideoSource( videoUrl ) {
		mediaScope?.dispose();
		mediaScope = createFrontendScope();
		videoContainer.classList.remove( 'has-local-video' );
		const { provider } = getVideoProviderData( videoUrl );
		iframe.setAttribute(
			'allow',
			provider === 'dailymotion'
				? 'autoplay; encrypted-media; fullscreen; picture-in-picture; web-share'
				: 'autoplay; encrypted-media; fullscreen; picture-in-picture'
		);
		const iframeSrc = getVideoIframeSrc( videoUrl, {
			autoplay: provider !== 'dailymotion',
		} );

		if ( iframeSrc ) {
			iframe.src = iframeSrc;
			iframe.style.display = 'block';
			return;
		}

		// Self-hosted video: use its intrinsic dimensions for the lightbox.
		iframe.style.display = 'none';
		iframe.removeAttribute( 'src' );
		videoContainer.classList.add( 'has-local-video' );
		videoContainer.innerHTML = '';
		const video = document.createElement( 'video' );
		video.src = videoUrl;
		video.controls = true;
		video.autoplay = true;
		mediaScope.listen( video, 'loadedmetadata', () => {
			if ( video.videoWidth > 0 && video.videoHeight > 0 ) {
				lightbox.style.setProperty(
					'--pb-video-lightbox-ratio',
					String( video.videoWidth / video.videoHeight )
				);
			}
		} );
		videoContainer.appendChild( video );
	}

	function getFocusableElements( container ) {
		const selectors = [
			'a[href]',
			'button:not([disabled])',
			'input:not([disabled])',
			'select:not([disabled])',
			'textarea:not([disabled])',
			'[tabindex]:not([tabindex="-1"])',
		];
		return Array.from(
			container.querySelectorAll( selectors.join( ',' ) )
		).filter( ( el ) => {
			if ( el.hasAttribute( 'disabled' ) ) {
				return false;
			}
			return el.getAttribute( 'aria-hidden' ) !== 'true';
		} );
	}

	function requestFullscreen( element ) {
		if ( ! element ) {
			return;
		}
		const request =
			element.requestFullscreen ||
			element.webkitRequestFullscreen ||
			element.mozRequestFullScreen ||
			element.msRequestFullscreen;
		if ( ! request ) {
			return;
		}
		const result = request.call( element );
		if ( result && typeof result.catch === 'function' ) {
			result.catch( () => {} );
		}
	}

	function exitFullscreen() {
		const exit =
			document.exitFullscreen ||
			document.webkitExitFullscreen ||
			document.mozCancelFullScreen ||
			document.msExitFullscreen;
		if ( exit ) {
			const result = exit.call( document );
			result?.catch?.( () => {} );
		}
	}

	function toggleFullscreen() {
		const fsElement =
			document.fullscreenElement ||
			document.webkitFullscreenElement ||
			document.mozFullScreenElement ||
			document.msFullscreenElement;
		if ( fsElement ) {
			exitFullscreen();
			return;
		}
		const activeMedia = videoContainer.querySelector( 'video, iframe' );
		requestFullscreen( activeMedia || videoContainer );
	}

	function openLightbox() {
		const videoUrl = block.dataset.videoUrl;
		if ( ! videoUrl || lightbox.open ) {
			return;
		}

		activeLightbox?.();
		activeLightbox = closeLightbox;
		lastFocusedElement = root.ownerDocument.activeElement;
		previousOverflow = document.body.style.overflow;
		videoContainer.innerHTML = ''; // clear old local video
		videoContainer.appendChild( iframe ); // ensure iframe still present

		setVideoSource( videoUrl );

		lightbox.setAttribute( 'aria-hidden', 'false' );
		lightbox.classList.add( 'active' );
		lightbox.showModal();
		block.setAttribute( 'aria-expanded', 'true' );
		document.body.style.overflow = 'hidden';
		if ( closeButton ) {
			closeButton.focus();
		} else {
			lightbox.focus();
		}
	}

	/**
	 * ----------------------------------------------------------------
	 *  Close lightbox and stop playback
	 *  ----------------------------------------------------------------
	 */
	/**
	 * Stop playback and release the modal.
	 * @param {boolean} restoreFocus Return focus to the trigger when closing.
	 */
	function closeLightbox( restoreFocus = true ) {
		if ( ! lightbox.classList.contains( 'active' ) ) {
			return;
		}
		const fullscreenElement =
			document.fullscreenElement ||
			document.webkitFullscreenElement ||
			document.mozFullScreenElement ||
			document.msFullscreenElement;
		if (
			fullscreenElement &&
			( fullscreenElement === lightbox ||
				lightbox.contains( fullscreenElement ) )
		) {
			exitFullscreen();
		}
		lightbox.classList.remove( 'active' );
		lightbox.setAttribute( 'aria-hidden', 'true' );
		block.setAttribute( 'aria-expanded', 'false' );
		document.body.style.overflow = previousOverflow;
		if ( activeLightbox === closeLightbox ) {
			activeLightbox = null;
		}
		if ( lightbox.open ) {
			lightbox.close();
		}
		mediaScope?.dispose();
		mediaScope = null;
		const video = videoContainer.querySelector( 'video' );
		if ( video ) {
			video.pause();
			video.removeAttribute( 'src' );
			video.load();
		}
		iframe.style.display = 'none';
		iframe.style.opacity = '0';
		iframe.removeAttribute( 'src' );
		videoContainer.innerHTML = '';
		videoContainer.appendChild( iframe );
		if ( ! restoreFocus ) {
			lastFocusedElement = null;
			return;
		}
		if (
			lastFocusedElement?.isConnected &&
			typeof lastFocusedElement.focus === 'function'
		) {
			lastFocusedElement.focus();
		} else {
			block.focus();
		}
		lastFocusedElement = null;
	}

	/**
	 * ----------------------------------------------------------------
	 *  Open lightbox and play video
	 *  ----------------------------------------------------------------
	 */
	scope.listen( block, 'click', ( e ) => {
		if ( e.target.closest( '.pb-video-add-to-cart' ) ) {
			return;
		}
		e.preventDefault();
		openLightbox();
	} );

	scope.listen( block, 'keydown', ( e ) => {
		if ( e.target.closest( '.pb-video-add-to-cart' ) ) {
			return;
		}
		if ( e.key === 'Enter' || e.key === ' ' ) {
			e.preventDefault();
			openLightbox();
		}
	} );

	scope.listen( closeButton, 'click', () => closeLightbox() );
	scope.listen( lightbox, 'cancel', ( event ) => {
		event.preventDefault();
		closeLightbox();
	} );
	scope.listen( lightbox, 'close', () => closeLightbox() );

	// Match the image lightbox: close when the backdrop is clicked.
	scope.listen( lightbox, 'click', ( e ) => {
		const lightboxContent = e.target.closest(
			'.pb-video-lightbox-video, .pb-video-lightbox-info, .pb-video-lightbox-close, .lightbox-fullscreen'
		);

		if ( lightboxContent ) {
			return;
		}

		closeLightbox();
	} );

	scope.listen( lightbox, 'keydown', ( e ) => {
		if ( ! lightbox.classList.contains( 'active' ) ) {
			return;
		}
		if ( e.key === 'Escape' ) {
			closeLightbox();
			return;
		}
		if ( e.key && e.key.toLowerCase() === 'f' ) {
			const isEditable =
				e.target &&
				( e.target.isContentEditable ||
					/^(INPUT|TEXTAREA|SELECT)$/.test( e.target.tagName ) );
			if ( ! isEditable ) {
				e.preventDefault();
				toggleFullscreen();
			}
			return;
		}
		if ( e.key === 'Tab' ) {
			const focusable = getFocusableElements( lightbox );
			if ( ! focusable.length ) {
				e.preventDefault();
				lightbox.focus();
				return;
			}
			const first = focusable[ 0 ];
			const last = focusable[ focusable.length - 1 ];
			if ( e.shiftKey && root.ownerDocument.activeElement === first ) {
				e.preventDefault();
				last.focus();
			} else if (
				! e.shiftKey &&
				root.ownerDocument.activeElement === last
			) {
				e.preventDefault();
				first.focus();
			}
		}
	} );
	return () => {
		closeLightbox( false );
		scope.dispose();
		iframe.removeAttribute( 'src' );
		iframe.remove();
	};
};

store( 'folioblocks/video', {
	callbacks: {
		initialize() {
			return initializeVideo( getElement().ref );
		},
	},
} );
