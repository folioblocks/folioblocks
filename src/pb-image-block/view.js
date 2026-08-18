/**
 * PB Image Block
 * View JS
 */
import { initTiltHoverEffects } from '../pb-helpers/tiltHoverEffect';

document.addEventListener( 'DOMContentLoaded', () => {
	initTiltHoverEffects();
	const zoomInIcon =
		'<svg class="lightbox-zoom-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M10.75 4.5a6.25 6.25 0 0 1 4.96 10.05l3.87 3.87-1.16 1.16-3.87-3.87A6.25 6.25 0 1 1 10.75 4.5zm0 1.5a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5zm.75 2v2h2v1.5h-2v2H10v-2H8V10h2V8h1.5z"/></svg>';
	const zoomOutIcon =
		'<svg class="lightbox-zoom-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M10.75 4.5a6.25 6.25 0 0 1 4.96 10.05l3.87 3.87-1.16 1.16-3.87-3.87A6.25 6.25 0 1 1 10.75 4.5zm0 1.5a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5zM8 10h5.5v1.5H8V10z"/></svg>';

	const getWatermarkSizingEdge = ( width, height ) => {
		const shortEdge = Math.min( width, height );
		const longEdge = Math.max( width, height );
		const aspectRatio = shortEdge > 0 ? longEdge / shortEdge : 1;
		const squareAdjustment =
			aspectRatio >= 1.2
				? 1
				: 0.78 + ( ( aspectRatio - 1 ) / 0.2 ) * 0.22;

		return shortEdge * Math.min( 1, Math.max( 0.78, squareAdjustment ) );
	};

	const getWatermarkRenderMetrics = (
		width,
		height,
		sizeRatio,
		insetRatio,
		baseline
	) => {
		const sizingEdge = baseline || getWatermarkSizingEdge( width, height );

		return {
			renderSize: ( sizingEdge * sizeRatio ) / 100,
			renderInset: ( sizingEdge * insetRatio ) / 100,
		};
	};

	const syncGalleryWatermark = ( watermarkOverlay ) => {
		const imageBlock = watermarkOverlay.closest( '.pb-image-block' );
		const image = imageBlock?.querySelector( '.pb-image-block-img' );
		const carouselGallery = imageBlock?.closest( '.pb-carousel-gallery' );

		if ( ! image ) {
			return;
		}

		const imageRect = image.getBoundingClientRect();
		const sizeRatio = Number.parseFloat(
			watermarkOverlay.getAttribute( 'data-watermark-size' ) || '16'
		);
		const insetRatio = Number.parseFloat(
			watermarkOverlay.getAttribute( 'data-watermark-inset' ) || '4'
		);
		const { renderSize, renderInset } = getWatermarkRenderMetrics(
			imageRect.width,
			imageRect.height,
			sizeRatio,
			insetRatio,
			carouselGallery ? imageRect.height : null
		);

		watermarkOverlay.style.setProperty(
			'--pb-watermark-render-size',
			`${ renderSize }px`
		);
		watermarkOverlay.style.setProperty(
			'--pb-watermark-inset',
			`${ renderInset }px`
		);
	};

	const syncGalleryWatermarks = () => {
		document
			.querySelectorAll( '.pb-image-block .pb-watermark-overlay' )
			.forEach( ( watermarkOverlay ) => {
				if (
					watermarkOverlay.classList.contains(
						'pb-watermark-overlay--lightbox'
					)
				) {
					return;
				}

				syncGalleryWatermark( watermarkOverlay );
			} );
	};

	const scheduleGalleryWatermarkSync = () => {
		window.requestAnimationFrame( syncGalleryWatermarks );
	};

	window.addEventListener( 'resize', scheduleGalleryWatermarkSync );
	document.addEventListener( 'load', scheduleGalleryWatermarkSync, true );
	scheduleGalleryWatermarkSync();

	document.body.addEventListener( 'click', ( event ) => {
		const shareLink = event.target.closest( '.pb-social-share__link' );
		if ( ! shareLink ) {
			return;
		}

		event.stopPropagation();

		const copyUrl = shareLink.getAttribute( 'data-pb-copy-share-url' );
		if ( ! copyUrl ) {
			return;
		}

		event.preventDefault();

		if ( window.navigator.clipboard?.writeText ) {
			window.navigator.clipboard.writeText( copyUrl );
			return;
		}

		const textarea = document.createElement( 'textarea' );
		textarea.value = copyUrl;
		textarea.setAttribute( 'readonly', 'readonly' );
		textarea.style.position = 'fixed';
		textarea.style.top = '-9999px';
		document.body.appendChild( textarea );
		textarea.select();
		document.execCommand( 'copy' );
		textarea.remove();
	} );

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
		const isSocialShare = event.target.closest( '.pb-social-share__link' );
		if ( isAddToCart || isDownload || isSocialShare ) {
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

		const getImplicitLightboxScope = ( element ) =>
			element.closest(
				[
					'.wp-block-folioblocks-grid-gallery-block',
					'.wp-block-folioblocks-justified-gallery-block',
					'.wp-block-folioblocks-masonry-gallery-block',
					'.wp-block-folioblocks-carousel-gallery-block',
					'.wp-block-folioblocks-modular-gallery-block',
					'.wp-block-folioblocks-proofing-gallery-block',
					'.pb-grid-gallery',
					'.pb-justified-gallery',
					'.pb-masonry-gallery',
					'.pb-carousel-gallery',
					'.pb-modular-gallery',
					'.fbks-proofing-gallery',
				].join( ',' )
			);

		const lightboxGroup = trigger.getAttribute( 'data-lightbox-group' );
		const implicitScope = lightboxGroup
			? null
			: getImplicitLightboxScope( trigger );
		const lightboxRoot =
			lightboxGroup || ! implicitScope ? document : implicitScope;
		const allImages = Array.from(
			lightboxRoot.querySelectorAll( '.pb-image-block-lightbox' )
		).filter( ( image ) => {
			if ( image.hasAttribute( 'data-filmstrip-lightbox-disabled' ) ) {
				return false;
			}

			if ( lightboxGroup ) {
				return (
					image.getAttribute( 'data-lightbox-group' ) ===
					lightboxGroup
				);
			}

			if ( implicitScope ) {
				return ! image.getAttribute( 'data-lightbox-group' );
			}

			return (
				! image.getAttribute( 'data-lightbox-group' ) &&
				! getImplicitLightboxScope( image )
			);
		} );
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
		let isLightboxZoomed = false;
		let lightboxZoomScale = 1;
		let lightboxPanX = 0;
		let lightboxPanY = 0;
		let lightboxPanTargetX = 0;
		let lightboxPanTargetY = 0;
		let lightboxPanAnimationFrame = null;
		let lightboxPanStartX = 0;
		let lightboxPanStartY = 0;
		let lightboxPanStartOffsetX = 0;
		let lightboxPanStartOffsetY = 0;
		let lightboxPanPointerId = null;
		let lightboxDidPan = false;

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
				const availableWidth = Math.max(
					1,
					activeImageWrapper.clientWidth
				);
				const availableHeight = Math.max(
					1,
					wrapper.clientHeight * 0.94 - captionHeight
				);
				const naturalWidth = activeImage.naturalWidth || 0;
				const naturalHeight = activeImage.naturalHeight || 0;

				if ( naturalWidth > 0 && naturalHeight > 0 ) {
					const aspectRatio = naturalWidth / naturalHeight;
					const availableRatio = availableWidth / availableHeight;
					const imageHeight =
						availableRatio > aspectRatio
							? availableHeight
							: availableWidth / aspectRatio;
					const imageWidth = imageHeight * aspectRatio;

					activeImage.style.width = `${ Math.round(
						imageWidth
					) }px`;
					activeImage.style.height = `${ Math.round(
						imageHeight
					) }px`;
				}
				clampLightboxPan();
				applyLightboxZoom();

				const wrapperRect = wrapper.getBoundingClientRect();
				const imageRect = activeImage.getBoundingClientRect();
				const watermarkOverlay = activeImageWrapper.querySelector(
					'.pb-watermark-overlay--lightbox'
				);
				wrapper.style.setProperty(
					'--pb-lightbox-image-center',
					`${
						imageRect.top + imageRect.height / 2 - wrapperRect.top
					}px`
				);
				if ( watermarkOverlay ) {
					const imageLayoutWidth = activeImage.offsetWidth;
					const imageLayoutHeight = activeImage.offsetHeight;
					const insetRatio = Number.parseFloat(
						watermarkOverlay.getAttribute(
							'data-watermark-inset-ratio'
						) || '0'
					);
					const sizeRatio = Number.parseFloat(
						watermarkOverlay.getAttribute(
							'data-watermark-size-ratio'
						) || '16'
					);
					const { renderSize, renderInset } =
						getWatermarkRenderMetrics(
							imageLayoutWidth,
							imageLayoutHeight,
							sizeRatio,
							insetRatio
						);
					watermarkOverlay.style.setProperty(
						'--pb-watermark-lightbox-left',
						`${ activeImage.offsetLeft }px`
					);
					watermarkOverlay.style.setProperty(
						'--pb-watermark-lightbox-top',
						`${ activeImage.offsetTop }px`
					);
					watermarkOverlay.style.setProperty(
						'--pb-watermark-lightbox-width',
						`${ imageLayoutWidth }px`
					);
					watermarkOverlay.style.setProperty(
						'--pb-watermark-lightbox-height',
						`${ imageLayoutHeight }px`
					);
					watermarkOverlay.style.setProperty(
						'--pb-watermark-inset',
						`${ renderInset }px`
					);
					watermarkOverlay.style.setProperty(
						'--pb-watermark-render-size',
						`${ renderSize }px`
					);
				}
			}

			activeImageWrapper.style.setProperty(
				'--pb-lightbox-caption-space',
				`${ captionHeight }px`
			);
		}

		function scheduleLightboxSync( frames = 3 ) {
			let remainingFrames = Math.max( 1, frames );

			const syncFrame = () => {
				syncLightboxImageHeight();
				remainingFrames -= 1;

				if ( remainingFrames > 0 ) {
					window.requestAnimationFrame( syncFrame );
				}
			};

			syncFrame();
		}

		function handleViewportResize() {
			scheduleLightboxSync( 4 );
		}

		function handleLightboxSyncRequest( syncEvent ) {
			scheduleLightboxSync( syncEvent.detail?.frames || 4 );
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
					'.lightbox-close, .lightbox-prev, .lightbox-next, .lightbox-fullscreen, .lightbox-zoom'
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
			scheduleLightboxSync( 3 );
		}

		function showPreviousImage() {
			setLightboxZoomed( false );
			currentIndex =
				( currentIndex - 1 + allImages.length ) % allImages.length;
			renderLightbox( currentIndex );
		}

		function showNextImage() {
			setLightboxZoomed( false );
			currentIndex = ( currentIndex + 1 ) % allImages.length;
			renderLightbox( currentIndex );
		}

		function getLightboxPanBounds() {
			const activeImage = wrapper.querySelector( '.lightbox-image img' );
			if ( ! activeImage || lightboxZoomScale <= 1 ) {
				return { x: 0, y: 0 };
			}

			const scaledWidth = activeImage.offsetWidth * lightboxZoomScale;
			const scaledHeight = activeImage.offsetHeight * lightboxZoomScale;

			return {
				x: Math.max( 0, ( scaledWidth - wrapper.clientWidth ) / 2 ),
				y: Math.max( 0, ( scaledHeight - wrapper.clientHeight ) / 2 ),
			};
		}

		function clampLightboxPan() {
			const bounds = getLightboxPanBounds();
			lightboxPanX = Math.min(
				bounds.x,
				Math.max( -bounds.x, lightboxPanX )
			);
			lightboxPanY = Math.min(
				bounds.y,
				Math.max( -bounds.y, lightboxPanY )
			);
			lightboxPanTargetX = Math.min(
				bounds.x,
				Math.max( -bounds.x, lightboxPanTargetX )
			);
			lightboxPanTargetY = Math.min(
				bounds.y,
				Math.max( -bounds.y, lightboxPanTargetY )
			);
		}

		function applyLightboxZoom() {
			wrapper.style.setProperty(
				'--pb-lightbox-zoom-scale',
				String( lightboxZoomScale )
			);
			wrapper.style.setProperty(
				'--pb-lightbox-pan-x',
				`${ lightboxPanX }px`
			);
			wrapper.style.setProperty(
				'--pb-lightbox-pan-y',
				`${ lightboxPanY }px`
			);
		}

		function animateLightboxPan() {
			lightboxPanAnimationFrame = null;
			if ( ! isLightboxZoomed ) {
				return;
			}

			const remainingX = lightboxPanTargetX - lightboxPanX;
			const remainingY = lightboxPanTargetY - lightboxPanY;
			const isSettled =
				Math.abs( remainingX ) < 0.2 &&
				Math.abs( remainingY ) < 0.2;

			if ( isSettled ) {
				lightboxPanX = lightboxPanTargetX;
				lightboxPanY = lightboxPanTargetY;
			} else {
				lightboxPanX += remainingX * 0.28;
				lightboxPanY += remainingY * 0.28;
			}

			clampLightboxPan();
			applyLightboxZoom();

			if ( ! isSettled ) {
				lightboxPanAnimationFrame =
					window.requestAnimationFrame( animateLightboxPan );
			}
		}

		function scheduleLightboxPan() {
			if ( lightboxPanAnimationFrame === null ) {
				lightboxPanAnimationFrame =
					window.requestAnimationFrame( animateLightboxPan );
			}
		}

		function getSecondaryLightboxZoomScale() {
			const activeImage = wrapper.querySelector( '.lightbox-image img' );
			if ( ! activeImage ) {
				return 2;
			}

			const naturalScale = Math.max(
				activeImage.naturalWidth / Math.max( 1, activeImage.offsetWidth ),
				activeImage.naturalHeight / Math.max( 1, activeImage.offsetHeight )
			);

			return Math.min( 3, Math.max( 1.8, naturalScale || 2 ) );
		}

		function setLightboxZoomed( isZoomed, zoomPoint = null ) {
			isLightboxZoomed = isZoomed;
			wrapper.classList.toggle( 'is-zoomed', isZoomed );
			const zoomButton = wrapper.querySelector( '.lightbox-zoom' );

			if ( isZoomed ) {
				lightboxZoomScale = getSecondaryLightboxZoomScale();
				if ( zoomPoint ) {
					lightboxPanX =
						( wrapper.clientWidth / 2 - zoomPoint.clientX ) *
						( lightboxZoomScale - 1 );
					lightboxPanY =
						( wrapper.clientHeight / 2 - zoomPoint.clientY ) *
						( lightboxZoomScale - 1 );
				} else {
					lightboxPanX = 0;
					lightboxPanY = 0;
				}
				lightboxPanTargetX = lightboxPanX;
				lightboxPanTargetY = lightboxPanY;
			} else {
				lightboxZoomScale = 1;
				lightboxPanX = 0;
				lightboxPanY = 0;
				lightboxPanTargetX = 0;
				lightboxPanTargetY = 0;
				lightboxPanPointerId = null;
				if ( lightboxPanAnimationFrame !== null ) {
					window.cancelAnimationFrame( lightboxPanAnimationFrame );
					lightboxPanAnimationFrame = null;
				}
				wrapper.classList.remove( 'is-interacting' );
				wrapper.classList.remove( 'is-panning' );
			}
			clampLightboxPan();
			applyLightboxZoom();
			if ( zoomButton ) {
				zoomButton.setAttribute(
					'aria-label',
					isZoomed ? 'Zoom out' : 'Zoom in'
				);
				zoomButton.setAttribute( 'aria-pressed', isZoomed ? 'true' : 'false' );
				zoomButton.innerHTML = isZoomed ? zoomOutIcon : zoomInIcon;
			}
			scheduleLightboxSync( 3 );
		}

		function startLightboxPan( panEvent ) {
			if (
				! isLightboxZoomed ||
				panEvent.pointerType !== 'touch' ||
				panEvent.button > 0
			) {
				return;
			}
			if (
				panEvent.target.closest(
					'.lightbox-close, .lightbox-prev, .lightbox-next, .lightbox-fullscreen, .lightbox-zoom, .lightbox-counter, .lightbox-caption'
				)
			) {
				return;
			}

			panEvent.preventDefault();
			panEvent.stopPropagation();
			lightboxPanPointerId = panEvent.pointerId;
			lightboxPanStartX = panEvent.clientX;
			lightboxPanStartY = panEvent.clientY;
			lightboxPanStartOffsetX = lightboxPanX;
			lightboxPanStartOffsetY = lightboxPanY;
			lightboxPanTargetX = lightboxPanX;
			lightboxPanTargetY = lightboxPanY;
			lightboxDidPan = false;
			wrapper.classList.add( 'is-interacting' );
			wrapper.classList.add( 'is-panning' );
			panEvent.currentTarget.setPointerCapture?.( panEvent.pointerId );
		}

		function moveLightboxWithCursor( panEvent ) {
			if (
				! isLightboxZoomed ||
				lightboxPanPointerId !== null
			) {
				return;
			}

			const bounds = getLightboxPanBounds();
			const wrapperRect = wrapper.getBoundingClientRect();
			const pointerX = Math.min(
				1,
				Math.max(
					0,
					( panEvent.clientX - wrapperRect.left ) /
						Math.max( 1, wrapperRect.width )
				)
			);
			const pointerY = Math.min(
				1,
				Math.max(
					0,
					( panEvent.clientY - wrapperRect.top ) /
						Math.max( 1, wrapperRect.height )
				)
			);

			// Move the image opposite the cursor to reveal the area beneath it.
			lightboxPanTargetX = bounds.x * ( 1 - pointerX * 2 );
			lightboxPanTargetY = bounds.y * ( 1 - pointerY * 2 );
			wrapper.classList.add( 'is-interacting' );
			scheduleLightboxPan();
		}

		function moveLightboxWithTrackpad( wheelEvent ) {
			if ( ! isLightboxZoomed ) {
				return;
			}

			wheelEvent.preventDefault();
			wheelEvent.stopPropagation();
			const bounds = getLightboxPanBounds();
			let deltaX = wheelEvent.deltaX;
			let deltaY = wheelEvent.deltaY;

			if ( bounds.x > 0 && bounds.y === 0 ) {
				deltaX += deltaY;
				deltaY = 0;
			} else if ( bounds.y > 0 && bounds.x === 0 ) {
				deltaY += deltaX;
				deltaX = 0;
			}

			lightboxPanTargetX -= deltaX;
			lightboxPanTargetY -= deltaY;
			clampLightboxPan();
			wrapper.classList.add( 'is-interacting' );
			scheduleLightboxPan();
		}

		function moveLightboxPan( panEvent ) {
			if ( panEvent.pointerType !== 'touch' ) {
				return;
			}

			if (
				! isLightboxZoomed ||
				lightboxPanPointerId !== panEvent.pointerId
			) {
				return;
			}

			panEvent.preventDefault();
			lightboxPanX =
				lightboxPanStartOffsetX + panEvent.clientX - lightboxPanStartX;
			lightboxPanY =
				lightboxPanStartOffsetY + panEvent.clientY - lightboxPanStartY;
			lightboxPanTargetX = lightboxPanX;
			lightboxPanTargetY = lightboxPanY;
			lightboxDidPan =
				Math.abs( panEvent.clientX - lightboxPanStartX ) > 3 ||
				Math.abs( panEvent.clientY - lightboxPanStartY ) > 3;
			clampLightboxPan();
			applyLightboxZoom();
		}

		function endLightboxPan( panEvent ) {
			if ( lightboxPanPointerId !== panEvent.pointerId ) {
				return;
			}

			lightboxPanPointerId = null;
			wrapper.classList.remove( 'is-panning' );
			panEvent.currentTarget.releasePointerCapture?.( panEvent.pointerId );
			if ( lightboxDidPan ) {
				suppressImageClick = true;
				window.setTimeout( () => {
					suppressImageClick = false;
				}, 80 );
			}
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
			document.removeEventListener(
				'mousemove',
				moveLightboxWithCursor
			);
			document.removeEventListener( 'wheel', moveLightboxWithTrackpad );
			if ( lightboxPanAnimationFrame !== null ) {
				window.cancelAnimationFrame( lightboxPanAnimationFrame );
			}
			window.removeEventListener( 'resize', handleViewportResize );
			document.removeEventListener(
				'fullscreenchange',
				handleViewportResize
			);
			document.removeEventListener(
				'webkitfullscreenchange',
				handleViewportResize
			);
			wrapper.removeEventListener(
				'pbImageLightboxSync',
				handleLightboxSyncRequest
			);
			if (
				previouslyFocused &&
				typeof previouslyFocused.focus === 'function'
			) {
				previouslyFocused.focus();
			}
		}

		window.addEventListener( 'resize', handleViewportResize );
		document.addEventListener( 'fullscreenchange', handleViewportResize );
		document.addEventListener(
			'webkitfullscreenchange',
			handleViewportResize
		);
		wrapper.addEventListener(
			'pbImageLightboxSync',
			handleLightboxSyncRequest
		);
		document.addEventListener( 'mousemove', moveLightboxWithCursor );
		document.addEventListener( 'wheel', moveLightboxWithTrackpad, {
			passive: false,
		} );
		wrapper.addEventListener( 'pointerdown', startLightboxPan );
		wrapper.addEventListener( 'pointermove', moveLightboxPan );
		wrapper.addEventListener( 'pointerup', endLightboxPan );
		wrapper.addEventListener( 'pointercancel', endLightboxPan );

		// Close when clicking outside the actual image, caption, and controls.
		wrapper.addEventListener( 'click', ( e ) => {
			if ( suppressImageClick ) {
				return;
			}
			const interactiveTarget = e.target.closest(
				'.lightbox-image img, .lightbox-caption, .lightbox-close, .lightbox-prev, .lightbox-next, .lightbox-fullscreen, .lightbox-zoom, .lightbox-counter'
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

			setLightboxZoomed( false );
			const src = imageData.getAttribute( 'data-src' );
			const caption = imageData.getAttribute( 'data-caption' );
			const showCounter =
				imageData.getAttribute( 'data-lightbox-counter' ) === 'true' &&
				allImages.length > 1;
			const zoomEnabled =
				imageData.getAttribute( 'data-lightbox-zoom' ) === 'true';
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
					'.lightbox-close, .lightbox-prev, .lightbox-next, .lightbox-counter, .lightbox-zoom'
				)
				.forEach( ( control ) => control.remove() );

			const close = document.createElement( 'button' );
			close.className = 'lightbox-close';
			close.innerHTML = '&times;';
			close.setAttribute( 'aria-label', 'Close lightbox' );
			close.addEventListener( 'click', closeLightbox );

			if ( showCounter ) {
				const counter = document.createElement( 'div' );
				counter.className = 'lightbox-counter';
				counter.textContent = `${ index + 1 } / ${ allImages.length }`;
				wrapper.appendChild( counter );
			}

			const imageWrapper = document.createElement( 'div' );
			imageWrapper.className = 'lightbox-image';

			const img = document.createElement( 'img' );
			img.alt = '';
			img.draggable = false;
			img.tabIndex = 0;
			img.setAttribute( 'role', 'button' );
			img.setAttribute( 'aria-label', 'Hide lightbox controls' );
			img.setAttribute( 'aria-pressed', 'false' );
			img.addEventListener( 'dragstart', ( dragEvent ) => {
				dragEvent.preventDefault();
			} );
			img.addEventListener( 'load', syncLightboxImageHeight, {
				once: true,
			} );
			img.addEventListener( 'click', () => {
				if ( suppressImageClick ) {
					return;
				}
				if ( isLightboxZoomed ) {
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
			if ( zoomEnabled ) {
				img.addEventListener( 'dblclick', ( dblClickEvent ) => {
					dblClickEvent.preventDefault();
					setLightboxZoomed(
						! isLightboxZoomed,
						isLightboxZoomed ? null : dblClickEvent
					);
				} );
			}
			img.src = src;

			imageWrapper.appendChild( img );

			const watermarkImage = imageData.getAttribute(
				'data-watermark-image'
			);
			if ( watermarkImage ) {
				const escapedWatermarkImage = watermarkImage.replace(
					/["\\]/g,
					'\\$&'
				);
				const watermarkOverlay = document.createElement( 'span' );
				watermarkOverlay.className =
					'pb-watermark-overlay pb-watermark-overlay--lightbox';
				watermarkOverlay.setAttribute( 'aria-hidden', 'true' );
				watermarkOverlay.setAttribute(
					'data-watermark-inset-ratio',
					imageData.getAttribute( 'data-watermark-inset' ) || '4'
				);
				watermarkOverlay.setAttribute(
					'data-watermark-size-ratio',
					imageData.getAttribute( 'data-watermark-size' ) || '16'
				);
				watermarkOverlay.style.setProperty(
					'--pb-watermark-image',
					`url("${ escapedWatermarkImage }")`
				);
				watermarkOverlay.style.setProperty(
					'--pb-watermark-opacity',
					imageData.getAttribute( 'data-watermark-opacity' ) || '0.28'
				);
				watermarkOverlay.style.setProperty(
					'--pb-watermark-size',
					imageData.getAttribute( 'data-watermark-size' ) || '16'
				);
				watermarkOverlay.style.setProperty(
					'--pb-watermark-inset',
					'0px'
				);
				watermarkOverlay.style.setProperty(
					'--pb-watermark-position',
					imageData.getAttribute( 'data-watermark-position' ) ||
						'bottom right'
				);
				watermarkOverlay.style.setProperty(
					'--pb-watermark-repeat',
					imageData.getAttribute( 'data-watermark-repeat' ) ||
						'no-repeat'
				);
				imageWrapper.appendChild( watermarkOverlay );
			}

			if ( caption ) {
				const captionEl = document.createElement( 'div' );
				captionEl.className = 'lightbox-caption';
				captionEl.innerHTML = caption;
				imageWrapper.appendChild( captionEl );
			}

			wrapper.appendChild( close );
			inner.appendChild( imageWrapper );
			scheduleLightboxSync( 3 );
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
			if ( zoomEnabled ) {
				const zoom = document.createElement( 'button' );
				zoom.className = 'lightbox-zoom';
				zoom.type = 'button';
				zoom.innerHTML = zoomInIcon;
				zoom.setAttribute( 'aria-label', 'Zoom in' );
				zoom.setAttribute( 'aria-pressed', 'false' );
				zoom.addEventListener( 'click', ( zoomEvent ) => {
					zoomEvent.preventDefault();
					zoomEvent.stopPropagation();
					setLightboxZoomed( ! isLightboxZoomed );
				} );
				wrapper.appendChild( zoom );
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
				if ( isLightboxZoomed ) {
					return;
				}
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
				if ( isLightboxZoomed ) {
					return;
				}
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
			if ( isLightboxZoomed ) {
				touchStartedOnImage = false;
				return;
			}
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
