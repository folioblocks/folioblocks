/**
 * PB Video Block
 * View JS – Optimized Lightbox (fast provider playback)
 */

import { getVideoIframeSrc } from '../pb-helpers/videoProviders';

let userUsedKeyboard = false;
window.addEventListener( 'keydown', ( e ) => {
	if ( e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' ) {
		userUsedKeyboard = true;
	}
} );
window.addEventListener( 'mousedown', () => ( userUsedKeyboard = false ) );
window.addEventListener( 'touchstart', () => ( userUsedKeyboard = false ) );

const hasWooCommerce = !! document.querySelector( '.woocommerce' );

document.addEventListener( 'DOMContentLoaded', () => {
	const blocks = document.querySelectorAll( '.pb-video-block' );

	/**
	 * ----------------------------------------------------------------
	 *  Sequential fade-in animation for grid items
	 *  ----------------------------------------------------------------
	 */
	blocks.forEach( ( block, index ) => {
		block.style.opacity = 0;
		block.style.transform = 'translateY(20px)';
		block.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
		setTimeout( () => {
			block.style.opacity = 1;
			block.style.transform = 'translateY(0)';
		}, index * 150 );
	} );

	blocks.forEach( ( block ) => {
		const lbxId = block.getAttribute( 'data-lbx' );
		const lightbox = lbxId
			? document.querySelector(
					`.pb-video-lightbox[data-lbx="${ lbxId }"]`
			  )
			: null;
		const videoContainer = lightbox
			? lightbox.querySelector( '.pb-video-lightbox-video' )
			: null;
		if ( ! lightbox || ! videoContainer ) {
			return;
		}
			const closeButton = lightbox.querySelector(
				'.pb-video-lightbox-close'
			);
			let lastFocusedElement = null;

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
			iframe.setAttribute( 'allowfullscreen', '' );
			iframe.style.display = 'none';
			iframe.style.opacity = '0';
			iframe.style.transition = 'opacity 0.3s ease';
			videoContainer.appendChild( iframe );

			iframe.addEventListener( 'load', () => {
				iframe.classList.add( 'loaded' );
				iframe.style.opacity = '1';
			} );

			/**
			 * ----------------------------------------------------------------
			 *  Helper: Build correct embed markup or local video
			 *  ----------------------------------------------------------------
			 * @param videoUrl
			 */
			function setVideoSource( videoUrl ) {
				videoContainer.classList.remove( 'has-local-video' );
				const iframeSrc = getVideoIframeSrc( videoUrl, {
					autoplay: true,
				} );

				if ( iframeSrc ) {
					iframe.src = iframeSrc;
					iframe.style.display = 'block';
					return;
				}

				// Self-hosted video
				iframe.style.display = 'none';
				iframe.src = '';
				videoContainer.classList.add( 'has-local-video' );
				videoContainer.innerHTML = `<video src="${ videoUrl }" controls autoplay></video>`;
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
				exit.call( document );
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
			if ( ! videoUrl ) {
				return;
			}

			lastFocusedElement = document.activeElement;
			videoContainer.innerHTML = ''; // clear old local video
			videoContainer.appendChild( iframe ); // ensure iframe still present

			setVideoSource( videoUrl );

			lightbox.classList.add( 'active' );
			lightbox.setAttribute( 'aria-hidden', 'false' );
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
		function closeLightbox() {
			if ( ! lightbox.classList.contains( 'active' ) ) {
				return;
			}
			lightbox.classList.remove( 'active' );
			lightbox.setAttribute( 'aria-hidden', 'true' );
			block.setAttribute( 'aria-expanded', 'false' );
			document.body.style.overflow = '';
			iframe.style.display = 'none';
			iframe.style.opacity = '0';
			iframe.src = '';
			videoContainer.innerHTML = '';
			videoContainer.appendChild( iframe );
			if (
				lastFocusedElement &&
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
		block.addEventListener( 'click', ( e ) => {
			if ( e.target.closest( '.pb-video-add-to-cart' ) ) {
				return;
			}
			e.preventDefault();
			openLightbox();
		} );

		block.addEventListener( 'keydown', ( e ) => {
			if ( e.target.closest( '.pb-video-add-to-cart' ) ) {
				return;
			}
			if ( e.key === 'Enter' || e.key === ' ' ) {
				e.preventDefault();
				openLightbox();
			}
		} );

		document.addEventListener( 'click', ( e ) => {
			if (
				e.target.closest( '.pb-video-lightbox-close' ) &&
				lightbox.classList.contains( 'active' )
			) {
				closeLightbox();
			}
		} );

		document.addEventListener( 'keydown', ( e ) => {
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
				if ( e.shiftKey && document.activeElement === first ) {
					e.preventDefault();
					last.focus();
				} else if ( ! e.shiftKey && document.activeElement === last ) {
					e.preventDefault();
					first.focus();
				}
			}
		} );
	} );
} );
