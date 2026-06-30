/**
 * PB Image Block
 * View JS
 */
import { initTiltHoverEffects } from '../pb-helpers/tiltHoverEffect';

document.addEventListener( 'DOMContentLoaded', () => {
	initTiltHoverEffects();

	// Track input method for focus visibility control
	let userUsedKeyboard = false;
	window.addEventListener( 'keydown', ( e ) => {
		if ( e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' ) {
			userUsedKeyboard = true;
		}
	} );
	window.addEventListener( 'mousedown', () => {
		userUsedKeyboard = false;
	} );
	window.addEventListener( 'touchstart', () => {
		userUsedKeyboard = false;
	} );

	// Add lightbox functionality to image blocks
	document.body.addEventListener( 'click', ( event ) => {
		const isAddToCart = event.target.closest( '.pb-add-to-cart-icon' );
		const isDownload = event.target.closest( '.pb-image-block-download' );
		if ( isAddToCart || isDownload ) {
			return;
		}

		const trigger = event.target.closest( '.pb-image-block-lightbox' );
		if ( ! trigger ) {
			return;
		}
		const userAgent = window.navigator.userAgent;
		const isSafari =
			/^((?!chrome|android).)*safari/i.test( userAgent ) &&
			! /crios|fxios|edgios/i.test( userAgent );
		const carouselBlock = trigger.closest(
			'.wp-block-folioblocks-carousel-gallery-block'
		);
		const useSafariBlurFallback = isSafari && carouselBlock;
		let safariBlurTargets = [];

		event.preventDefault();
		event.stopPropagation();

		const lightboxGroup = trigger.getAttribute( 'data-lightbox-group' );
		const allImages = Array.from(
			document.querySelectorAll( '.pb-image-block-lightbox' )
		).filter(
			( image ) =>
				! image.hasAttribute( 'data-filmstrip-lightbox-disabled' ) &&
				( ! lightboxGroup ||
					image.getAttribute( 'data-lightbox-group' ) ===
						lightboxGroup )
		);
		let currentIndex = allImages.indexOf( trigger );

		const existing = document.querySelector( '.pb-image-lightbox' );
		if ( existing ) {
			existing.remove();
		}

		const wrapper = document.createElement( 'div' );
		wrapper.className = 'pb-image-lightbox';

		const previouslyFocused = document.body.ownerDocument.activeElement;

		const inner = document.createElement( 'div' );
		inner.className = 'lightbox-inner';

		wrapper.appendChild( inner );
		document.body.appendChild( wrapper );

		if ( useSafariBlurFallback ) {
			wrapper.classList.add( 'pb-image-lightbox--safari-filter' );
			safariBlurTargets = Array.from( document.body.children ).filter(
				( element ) =>
					element !== wrapper &&
					! element.classList.contains( 'pb-focus-sentinel-start' ) &&
					! element.classList.contains( 'pb-focus-sentinel-end' )
			);
			safariBlurTargets.forEach( ( element ) =>
				element.classList.add( 'pb-safari-lightbox-blur-source' )
			);
		}

		document.body.classList.add( 'pb-lightbox-open' );
		let suppressImageClick = false;
		let touchStartX = 0;
		let touchStartY = 0;
		let touchCurrentX = 0;
		let touchCurrentY = 0;
		let touchStartedOnImage = false;

		const focusStart = document.createElement( 'span' );
		focusStart.tabIndex = 0;
		focusStart.className = 'pb-focus-sentinel-start';

		const focusEnd = document.createElement( 'span' );
		focusEnd.tabIndex = 0;
		focusEnd.className = 'pb-focus-sentinel-end';

		document.body.insertBefore( focusStart, wrapper );
		document.body.insertBefore( focusEnd, wrapper.nextSibling );

		focusStart.addEventListener( 'focus', () => {
			const focusable = wrapper.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			if ( focusable.length ) {
				focusable[ focusable.length - 1 ].focus();
			}
		} );
		focusEnd.addEventListener( 'focus', () => {
			const focusable = wrapper.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			if ( focusable.length ) {
				focusable[ 0 ].focus();
			}
		} );

		function syncLightboxImageHeight() {
			const activeImageWrapper =
				wrapper.querySelector( '.lightbox-image' );
			if ( ! activeImageWrapper ) {
				return;
			}
			const captionEl =
				activeImageWrapper.querySelector( '.lightbox-caption' );
			const captionHeight = captionEl
				? Math.ceil( captionEl.getBoundingClientRect().height )
				: 0;
			const activeImage = activeImageWrapper.querySelector( 'img' );
			if ( activeImage ) {
				const wrapperRect = wrapper.getBoundingClientRect();
				const imageRect = activeImage.getBoundingClientRect();
				wrapper.style.setProperty(
					'--pb-lightbox-image-center',
					`${
						imageRect.top + imageRect.height / 2 - wrapperRect.top
					}px`
				);
			}

			activeImageWrapper.style.setProperty(
				'--pb-lightbox-caption-space',
				`${ captionHeight }px`
			);
		}

		function handleViewportResize() {
			window.requestAnimationFrame( syncLightboxImageHeight );
		}

		function setChromeHidden( isHidden ) {
			wrapper.classList.toggle( 'is-chrome-hidden', isHidden );
			const activeImage = wrapper.querySelector( '.lightbox-image img' );
			if ( activeImage ) {
				activeImage.setAttribute(
					'aria-label',
					isHidden
						? 'Show lightbox controls'
						: 'Hide lightbox controls'
				);
				activeImage.setAttribute(
					'aria-pressed',
					isHidden ? 'true' : 'false'
				);
			}
			const caption = wrapper.querySelector( '.lightbox-caption' );
			if ( caption ) {
				if ( isHidden ) {
					caption.setAttribute( 'aria-hidden', 'true' );
				} else {
					caption.removeAttribute( 'aria-hidden' );
				}
			}
			wrapper
				.querySelectorAll(
					'.lightbox-close, .lightbox-prev, .lightbox-next, .lightbox-fullscreen'
				)
				.forEach( ( control ) => {
					if ( isHidden ) {
						control.setAttribute( 'tabindex', '-1' );
						control.setAttribute( 'aria-hidden', 'true' );
					} else {
						control.removeAttribute( 'tabindex' );
						control.removeAttribute( 'aria-hidden' );
					}
				} );
			window.requestAnimationFrame( syncLightboxImageHeight );
		}

		function showPreviousImage() {
			currentIndex =
				( currentIndex - 1 + allImages.length ) % allImages.length;
			renderLightbox( currentIndex );
		}

		function showNextImage() {
			currentIndex = ( currentIndex + 1 ) % allImages.length;
			renderLightbox( currentIndex );
		}

		function closeLightbox() {
			document.dispatchEvent(
				new CustomEvent( 'pbImageLightboxClosing', {
					detail: { wrapper },
				} )
			);
			wrapper.remove();
			safariBlurTargets.forEach( ( element ) =>
				element.classList.remove( 'pb-safari-lightbox-blur-source' )
			);
			document.body.classList.remove( 'pb-lightbox-open' );
			focusStart.remove();
			focusEnd.remove();
			document.removeEventListener( 'keydown', keyHandler );
			window.removeEventListener( 'resize', handleViewportResize );
			if (
				previouslyFocused &&
				typeof previouslyFocused.focus === 'function'
			) {
				previouslyFocused.focus();
			}
		}

		window.addEventListener( 'resize', handleViewportResize );

		// Close when clicking outside the actual image, caption, and controls.
		wrapper.addEventListener( 'click', ( e ) => {
			const interactiveTarget = e.target.closest(
				'.lightbox-image img, .lightbox-caption, .lightbox-close, .lightbox-prev, .lightbox-next, .lightbox-fullscreen'
			);

			if ( interactiveTarget ) {
				return;
			}

			closeLightbox();
		} );

		function renderLightbox( index ) {
			const imageData = allImages[ index ];
			if ( ! imageData ) {
				return;
			}

			const src = imageData.getAttribute( 'data-src' );
			const caption = imageData.getAttribute( 'data-caption' );
			const lightboxTheme =
				imageData.getAttribute( 'data-lightbox-theme' ) === 'light'
					? 'light'
					: 'dark';
			wrapper.classList.toggle(
				'pb-image-lightbox--light',
				lightboxTheme === 'light'
			);

			inner.innerHTML = '';
			wrapper
				.querySelectorAll(
					'.lightbox-close, .lightbox-prev, .lightbox-next'
				)
				.forEach( ( control ) => control.remove() );

			const close = document.createElement( 'button' );
			close.className = 'lightbox-close';
			close.innerHTML = '&times;';
			close.setAttribute( 'aria-label', 'Close lightbox' );
			close.addEventListener( 'click', closeLightbox );

			const imageWrapper = document.createElement( 'div' );
			imageWrapper.className = 'lightbox-image';

			const img = document.createElement( 'img' );
			img.alt = '';
			img.tabIndex = 0;
			img.setAttribute( 'role', 'button' );
			img.setAttribute( 'aria-label', 'Hide lightbox controls' );
			img.setAttribute( 'aria-pressed', 'false' );
			img.addEventListener( 'load', syncLightboxImageHeight, {
				once: true,
			} );
			img.addEventListener( 'click', () => {
				if ( suppressImageClick ) {
					return;
				}
				setChromeHidden(
					! wrapper.classList.contains( 'is-chrome-hidden' )
				);
			} );
			img.addEventListener( 'keydown', ( keyEvent ) => {
				if ( keyEvent.key !== 'Enter' && keyEvent.key !== ' ' ) {
					return;
				}
				keyEvent.preventDefault();
				setChromeHidden(
					! wrapper.classList.contains( 'is-chrome-hidden' )
				);
			} );
			img.src = src;

			imageWrapper.appendChild( img );

			if ( caption ) {
				const captionEl = document.createElement( 'div' );
				captionEl.className = 'lightbox-caption';
				captionEl.innerHTML = caption;
				imageWrapper.appendChild( captionEl );
			}

			wrapper.appendChild( close );
			inner.appendChild( imageWrapper );
			window.requestAnimationFrame( syncLightboxImageHeight );
			if ( img.complete ) {
				syncLightboxImageHeight();
			}

			if ( allImages.length > 1 ) {
				const prev = document.createElement( 'button' );
				prev.className = 'lightbox-prev';
				prev.innerHTML = '&#10094;';
				prev.setAttribute( 'aria-label', 'Previous image' );
				prev.addEventListener( 'click', showPreviousImage );

				const next = document.createElement( 'button' );
				next.className = 'lightbox-next';
				next.innerHTML = '&#10095;';
				next.setAttribute( 'aria-label', 'Next image' );
				next.addEventListener( 'click', showNextImage );

				// Append outside of .lightbox-inner so they’re overlaying the entire wrapper
				wrapper.appendChild( prev );
				wrapper.appendChild( next );
			}
			setChromeHidden( wrapper.classList.contains( 'is-chrome-hidden' ) );
			const closeBtn = wrapper.querySelector( '.lightbox-close' );
			if (
				closeBtn &&
				userUsedKeyboard &&
				! wrapper.classList.contains( 'is-chrome-hidden' )
			) {
				closeBtn.focus();
			}
			document.dispatchEvent(
				new CustomEvent( 'pbImageLightboxRendered', {
					detail: { wrapper, inner, trigger: imageData },
				} )
			);
			setChromeHidden( wrapper.classList.contains( 'is-chrome-hidden' ) );
		}

		function keyHandler( e ) {
			if ( e.key === 'Escape' ) {
				closeLightbox();
			} else if ( e.key === 'ArrowRight' ) {
				showNextImage();
			} else if ( e.key === 'ArrowLeft' ) {
				showPreviousImage();
			}
		}

		document.addEventListener( 'keydown', keyHandler );
		renderLightbox( currentIndex );

		wrapper.addEventListener(
			'touchstart',
			( touchEvent ) => {
				const touch = touchEvent.touches[ 0 ];
				touchStartedOnImage = Boolean(
					touchEvent.target.closest( '.lightbox-image img' )
				);
				if ( ! touch || ! touchStartedOnImage ) {
					return;
				}
				touchStartX = touch.clientX;
				touchStartY = touch.clientY;
				touchCurrentX = touchStartX;
				touchCurrentY = touchStartY;
			},
			{ passive: true }
		);

		wrapper.addEventListener(
			'touchmove',
			( touchEvent ) => {
				const touch = touchEvent.touches[ 0 ];
				if ( ! touch || ! touchStartedOnImage ) {
					return;
				}
				touchCurrentX = touch.clientX;
				touchCurrentY = touch.clientY;
			},
			{ passive: true }
		);

		wrapper.addEventListener( 'touchend', () => {
			if ( ! touchStartedOnImage || allImages.length < 2 ) {
				touchStartedOnImage = false;
				return;
			}

			const deltaX = touchCurrentX - touchStartX;
			const deltaY = touchCurrentY - touchStartY;
			const swipeThreshold = Math.max( 50, window.innerWidth * 0.12 );
			const isHorizontalSwipe =
				Math.abs( deltaX ) >= swipeThreshold &&
				Math.abs( deltaX ) > Math.abs( deltaY ) * 1.25;

			touchStartedOnImage = false;
			if ( ! isHorizontalSwipe ) {
				return;
			}

			suppressImageClick = true;
			if ( deltaX < 0 ) {
				showNextImage();
			} else {
				showPreviousImage();
			}
			window.setTimeout( () => {
				suppressImageClick = false;
			}, 400 );
		} );
		wrapper.addEventListener( 'touchcancel', () => {
			touchStartedOnImage = false;
		} );

		// Handle Tab and Shift+Tab navigation inside the lightbox (explicit control)
		wrapper.addEventListener( 'keydown', ( e ) => {
			if ( e.key !== 'Tab' ) {
				return;
			}

			const focusable = Array.from(
				wrapper.querySelectorAll(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				)
			).filter( ( el ) => ! el.disabled && el.offsetParent !== null );

			if ( ! focusable.length ) {
				return;
			}

			const focusIndex = focusable.indexOf(
				wrapper.ownerDocument.activeElement
			);
			let nextIndex = e.shiftKey ? focusIndex - 1 : focusIndex + 1;

			// Loop focus when reaching start or end
			if ( nextIndex >= focusable.length ) {
				nextIndex = 0;
			}
			if ( nextIndex < 0 ) {
				nextIndex = focusable.length - 1;
			}

			e.preventDefault();
			focusable[ nextIndex ].focus();
		} );
	} );
} );
