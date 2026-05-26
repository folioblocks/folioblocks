/**
 * Filmstrip Gallery Block
 * Premium View JS
 */
document.addEventListener( 'DOMContentLoaded', () => {
	// Disable right-click if enabled by any filmstrip instance.
	document.addEventListener(
		'contextmenu',
		( e ) => {
			const el = e.target.closest( '[data-disable-right-click]' );
			if ( el ) {
				e.preventDefault();
			}
		},
		{ capture: true }
	);

	const galleries = document.querySelectorAll(
		'.wp-block-folioblocks-filmstrip-gallery-block.pb-filmstrip-gallery, .wp-block-folioblocks-filmstrip-gallery-block .pb-filmstrip-gallery'
	);

	if ( ! galleries.length ) {
		return;
	}

	let activeKeyboardGallery = galleries.length === 1 ? galleries[ 0 ] : null;

		const getFullscreenElement = () =>
			document.fullscreenElement || document.webkitFullscreenElement;

		const exifIcons = {
			camera:
				'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 9.2c-2.2 0-3.9 1.8-3.9 4s1.8 4 3.9 4 4-1.8 4-4-1.8-4-4-4zm0 6.5c-1.4 0-2.4-1.1-2.4-2.5s1.1-2.5 2.4-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zM20.2 8c-.1 0-.3 0-.5-.1l-2.5-.8c-.4-.1-.8-.4-1.1-.8l-1-1.5c-.4-.5-1-.9-1.7-.9h-2.9c-.6.1-1.2.4-1.6 1l-1 1.5c-.3.3-.6.6-1.1.7l-2.5.8c-.2.1-.4.1-.6.1-1 .2-1.7.9-1.7 1.9v8.3c0 1 .9 1.9 2 1.9h16c1.1 0 2-.8 2-1.9V9.9c0-1-.7-1.7-1.8-1.9zm.3 10.1c0 .2-.2.4-.5.4H4c-.3 0-.5-.2-.5-.4V9.9c0-.1.2-.3.5-.4.2 0 .5-.1.8-.2l2.5-.8c.7-.2 1.4-.6 1.8-1.3l1-1.5c.1-.1.2-.2.4-.2h2.9c.2 0 .3.1.4.2l1 1.5c.4.7 1.1 1.1 1.9 1.4l2.5.8c.3.1.6.1.8.2.3 0 .4.2.4.4v8.1z"/></svg>',
			aspectRatio:
				'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18.5 5.5h-13c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2zm.5 11c0 .3-.2.5-.5.5h-13c-.3 0-.5-.2-.5-.5v-9c0-.3.2-.5.5-.5h13c.3 0 .5.2.5.5v9zM6.5 12H8v-2h2V8.5H6.5V12zm9.5 2h-2v1.5h3.5V12H16v2z"/></svg>',
			time:
				'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16.5c-4.1 0-7.5-3.4-7.5-7.5S7.9 4.5 12 4.5s7.5 3.4 7.5 7.5-3.4 7.5-7.5 7.5zM12 7l-1 5c0 .3.2.6.4.8l4.2 2.8-2.7-4.1L12 7z"/></svg>',
			aperture:
				'<svg viewBox="-16 -16 495 495" aria-hidden="true" focusable="false"><path fill="currentColor" d="M395.195,67.805C351.47,24.08,293.335,0,231.5,0S111.529,24.08,67.805,67.805S0,169.664,0,231.5S24.08,351.47,67.805,395.195S169.664,463,231.5,463s119.971-24.08,163.695-67.805S463,293.335,463,231.5S438.919,111.529,395.195,67.805z M443.392,186.803c-0.321,0.232-0.631,0.484-0.92,0.772l-79.886,79.886V59.168c7.689,5.873,15.045,12.285,22.002,19.243C414.732,108.555,434.877,146.025,443.392,186.803z M188.262,347.586l-72.848-72.848v-94.2l65.124-65.124h94.2l72.848,72.848v94.201l-65.124,65.124H188.262z M347.586,48.671v118.378L198.094,17.557C209.049,15.871,220.207,15,231.5,15C273.258,15,313.208,26.748,347.586,48.671z M78.411,78.411c28.553-28.552,63.68-48.134,101.964-57.36l79.362,79.362H59.168C65.042,92.725,71.454,85.369,78.411,78.411z M48.67,115.414h110.654L16.613,258.126C15.544,249.358,15,240.471,15,231.5C15,189.741,26.748,149.791,48.67,115.414z M19.607,276.196c0.321-0.232,0.631-0.484,0.92-0.772l79.886-79.886v208.294c-7.688-5.873-15.045-12.285-22.002-19.243C48.268,354.445,28.123,316.974,19.607,276.196z M115.414,414.329V295.951l149.491,149.491C253.951,447.129,242.792,448,231.5,448C189.741,448,149.791,436.252,115.414,414.329z M384.588,384.588c-28.553,28.552-63.68,48.134-101.965,57.36l-79.362-79.362h200.569C397.958,370.275,391.546,377.631,384.588,384.588z M414.329,347.586H303.675l142.712-142.712c1.068,8.767,1.613,17.655,1.613,26.626C448,273.258,436.252,313.208,414.329,347.586z"/></svg>',
			iso: '<span class="pb-filmstrip-gallery-exif-icon__iso">ISO</span>',
		};

		const createExifOverlay = ( image ) => {
			const unknown = 'Unknown';
			const fields = [
				{ icon: 'camera', value: image?.exifCamera || unknown },
				{
					icon: 'aspectRatio',
					value: image?.exifFocalLength || unknown,
				},
				{ icon: 'time', value: image?.exifShutterSpeed || unknown },
				{ icon: 'aperture', value: image?.exifAperture || unknown },
				{ icon: 'iso', value: image?.exifIso || unknown },
			];
			const wrapper = document.createElement( 'div' );
			wrapper.className = 'pb-filmstrip-gallery-exif';

			fields.forEach( ( field ) => {
				const item = document.createElement( 'span' );
				item.className = 'pb-filmstrip-gallery-exif__item';
				const icon = document.createElement( 'span' );
				icon.className = 'pb-filmstrip-gallery-exif__icon';
				icon.innerHTML = exifIcons[ field.icon ] || '';
				const value = document.createElement( 'span' );
				value.className = 'pb-filmstrip-gallery-exif__value';
				value.textContent = String( field.value || unknown );
				item.appendChild( icon );
				item.appendChild( value );
				wrapper.appendChild( item );
			} );

			return wrapper;
		};

	const isEditableElement = ( element ) => {
		if (
			! element ||
			element.nodeType !== 1 ||
			typeof element.closest !== 'function'
		) {
			return false;
		}

		if ( element.isContentEditable ) {
			return true;
		}

		return !! element.closest(
			'input, textarea, select, [contenteditable="true"], [role="textbox"]'
		);
	};

	const shouldIgnoreKeyboardShortcut = ( event ) => {
		if (
			event.defaultPrevented ||
			event.metaKey ||
			event.ctrlKey ||
			event.altKey
		) {
			return true;
		}

		return isEditableElement( event.target );
	};

	const isElementInViewport = ( element ) => {
		if ( ! element ) {
			return false;
		}

		const rect = element.getBoundingClientRect();
		const viewportHeight =
			window.innerHeight || document.documentElement.clientHeight;
		const viewportWidth =
			window.innerWidth || document.documentElement.clientWidth;

		return (
			rect.bottom > 0 &&
			rect.right > 0 &&
			rect.top < viewportHeight &&
			rect.left < viewportWidth
		);
	};

	galleries.forEach( ( galleryRoot, galleryIndex ) => {
		const api = galleryRoot.__pbFilmstrip;
		if ( ! api ) {
			return;
		}
		const fullscreenTarget =
			galleryRoot.closest(
				'.wp-block-folioblocks-filmstrip-gallery-block, .pb-filmstrip-gallery'
			) || galleryRoot;

		const settings = api.getSettings?.() || {};
		const main = galleryRoot.querySelector( '.pb-filmstrip-gallery-main' );
		if ( ! main ) {
			return;
		}
		main.setAttribute( 'tabindex', '-1' );

		const overlayContainer = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-main-overlay-container'
		);
		const overlayNode = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-main-overlay'
		);
		const downloadButton = galleryRoot.querySelector(
			'.pb-image-block-download'
		);
		const cartButton = galleryRoot.querySelector( '.pb-add-to-cart-icon' );
		const linkButton = galleryRoot.querySelector(
			'.pb-image-block-link-icon'
		);
		const autoplayButton = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-autoplay-button'
		);
		const fullscreenButton = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-fullscreen-button'
		);
		const canUseFullscreen =
			!! settings.enableFullscreen && !! fullscreenButton;
		const playIcon = autoplayButton?.querySelector(
			'.pb-filmstrip-icon-play'
		);
		const pauseIcon = autoplayButton?.querySelector(
			'.pb-filmstrip-icon-pause'
		);

		let statusNode = null;
		let instructionsNode = null;
		if ( canUseFullscreen ) {
			statusNode = document.createElement( 'p' );
			statusNode.className = 'pb-filmstrip-gallery-a11y-status';
			statusNode.setAttribute( 'aria-live', 'polite' );
			statusNode.setAttribute( 'aria-atomic', 'true' );

			instructionsNode = document.createElement( 'p' );
			instructionsNode.className =
				'pb-filmstrip-gallery-a11y-instructions';
			instructionsNode.id = `pb-filmstrip-gallery-fs-help-${
				galleryIndex + 1
			}`;
			instructionsNode.textContent =
				'Fullscreen mode active. Use left and right arrow keys to navigate images. Press Escape to exit fullscreen.';
			galleryRoot.appendChild( statusNode );
			galleryRoot.appendChild( instructionsNode );
		}

		const baseMainDescribedBy = String(
			main.getAttribute( 'aria-describedby' ) || ''
		)
			.split( /\s+/ )
			.filter( Boolean );

		let isPlaying = !! settings.autoplay;
		let isMainHovered = false;
		let isGalleryHovered = false;
		let isInViewport = isElementInViewport( galleryRoot );
		let announceTimer = null;
		let autoplayTimer = null;
		let wasFullscreen = false;
		let previouslyFocusedElement = null;
		let viewportObserver = null;
		let handleViewportFallback = null;

		const isGalleryFullscreen = () => {
			const fsElement = getFullscreenElement();
			return !! fsElement && fsElement === fullscreenTarget;
		};

		const announce = ( message ) => {
			if ( ! canUseFullscreen || ! statusNode || ! message ) {
				return;
			}

			statusNode.textContent = '';
			if ( announceTimer ) {
				window.clearTimeout( announceTimer );
			}

			announceTimer = window.setTimeout( () => {
				statusNode.textContent = message;
				announceTimer = null;
			}, 40 );
		};

		const markGalleryInteraction = () => {
			activeKeyboardGallery = galleryRoot;
		};

		const setMainDescribedBy = ( includeInstructions ) => {
			if ( ! canUseFullscreen || ! instructionsNode ) {
				return;
			}

			const describedBy = [ ...baseMainDescribedBy ];
			if ( includeInstructions ) {
				describedBy.push( instructionsNode.id );
			}

			const uniqueIds = Array.from( new Set( describedBy ) );
			if ( uniqueIds.length ) {
				main.setAttribute( 'aria-describedby', uniqueIds.join( ' ' ) );
			} else {
				main.removeAttribute( 'aria-describedby' );
			}
		};

		const getFocusableElements = () =>
			Array.from(
				fullscreenTarget.querySelectorAll(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				)
			).filter( ( element ) => {
				if ( element.hasAttribute( 'disabled' ) ) {
					return false;
				}

				if ( element.getAttribute( 'aria-hidden' ) === 'true' ) {
					return false;
				}

				if (
					element.offsetParent === null &&
					window.getComputedStyle( element ).position !== 'fixed'
				) {
					return false;
				}

				return true;
			} );

		const shouldHandleGalleryShortcuts = () => {
			if ( isGalleryFullscreen() ) {
				return true;
			}

			if ( activeKeyboardGallery === galleryRoot ) {
				return true;
			}

			if ( isGalleryHovered ) {
				return true;
			}

			const activeElement = galleryRoot.ownerDocument.activeElement;
			return galleryRoot.contains( activeElement );
		};

		const syncFullscreenButtonState = () => {
			if ( ! canUseFullscreen || ! fullscreenButton ) {
				return;
			}

			const isFullscreen = isGalleryFullscreen();
			fullscreenButton.setAttribute(
				'aria-label',
				isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'
			);
			fullscreenButton.setAttribute(
				'aria-pressed',
				isFullscreen ? 'true' : 'false'
			);
			fullscreenButton.setAttribute( 'aria-keyshortcuts', 'F' );
		};

		const requestGalleryFullscreen = () => {
			if ( ! canUseFullscreen ) {
				return;
			}

			if ( getFullscreenElement() ) {
				return;
			}

			const activeElement = galleryRoot.ownerDocument.activeElement;
			previouslyFocusedElement =
				activeElement && typeof activeElement.focus === 'function'
					? activeElement
					: null;

			markGalleryInteraction();

			if ( fullscreenTarget.requestFullscreen ) {
				const requestPromise = fullscreenTarget.requestFullscreen();
				if ( requestPromise?.catch ) {
					requestPromise.catch( () => {} );
				}
			} else if ( fullscreenTarget.webkitRequestFullscreen ) {
				fullscreenTarget.webkitRequestFullscreen();
			}
		};

		const exitGalleryFullscreen = () => {
			if ( ! canUseFullscreen || ! isGalleryFullscreen() ) {
				return;
			}

			if ( document.exitFullscreen ) {
				const exitPromise = document.exitFullscreen();
				if ( exitPromise?.catch ) {
					exitPromise.catch( () => {} );
				}
			} else if ( document.webkitExitFullscreen ) {
				document.webkitExitFullscreen();
			}
		};

		const toggleFullscreen = () => {
			if ( ! canUseFullscreen ) {
				return;
			}

			if ( isGalleryFullscreen() ) {
				exitGalleryFullscreen();
			} else {
				requestGalleryFullscreen();
			}
		};

		const trapFullscreenFocus = ( event ) => {
			if (
				! canUseFullscreen ||
				! isGalleryFullscreen() ||
				event.key !== 'Tab'
			) {
				return;
			}

			const focusableElements = getFocusableElements();
			if ( ! focusableElements.length ) {
				event.preventDefault();
				main.focus();
				return;
			}

			const firstElement = focusableElements[ 0 ];
			const lastElement =
				focusableElements[ focusableElements.length - 1 ];
			const activeElement = galleryRoot.ownerDocument.activeElement;

			if ( event.shiftKey ) {
				if (
					activeElement === firstElement ||
					! fullscreenTarget.contains( activeElement )
				) {
					event.preventDefault();
					lastElement.focus();
				}
				return;
			}

			if ( activeElement === lastElement ) {
				event.preventDefault();
				firstElement.focus();
			}
		};

		const syncFullscreenClass = () => {
			if ( ! canUseFullscreen ) {
				return;
			}

			const isFullscreen = isGalleryFullscreen();

			galleryRoot.classList.toggle( 'is-fullscreen', isFullscreen );
			if ( fullscreenTarget !== galleryRoot ) {
				fullscreenTarget.classList.toggle(
					'is-fullscreen',
					isFullscreen
				);
			}

			syncFullscreenButtonState();
			setMainDescribedBy( isFullscreen );

			if ( isFullscreen && ! wasFullscreen ) {
				announce(
					'Entered fullscreen. Use left and right arrow keys to navigate images.'
				);
				markGalleryInteraction();
				window.setTimeout( () => {
					main.focus( { preventScroll: true } );
				}, 0 );
			}

			if ( ! isFullscreen && wasFullscreen ) {
				announce( 'Exited fullscreen.' );
				if ( previouslyFocusedElement?.focus ) {
					previouslyFocusedElement.focus();
				} else if ( fullscreenButton?.focus ) {
					fullscreenButton.focus();
				}
				previouslyFocusedElement = null;
			}

			wasFullscreen = isFullscreen;
		};

		const renderOverlay = ( image ) => {
			if ( ! overlayContainer || ! overlayNode ) {
				return;
			}

			const title = String( image?.title || '' ).trim();
			const caption = String( image?.caption || '' ).trim();
			const hasProduct = Number( image?.wooProductId || 0 ) > 0;
			const overlayContent =
				settings.overlayContent ||
				( settings.wooProductPriceOnHover ? 'product' : 'title' );
				const showOverlay =
					!! settings.onHoverTitle &&
					( hasProduct || title || caption || overlayContent === 'exif' );

			overlayContainer.style.display = showOverlay ? '' : 'none';
			if ( ! showOverlay ) {
				overlayNode.textContent = '';
				return;
			}

			const showProductInfo =
				!! settings.enableWooCommerce &&
				overlayContent === 'product' &&
				hasProduct;

			if ( showProductInfo ) {
				const productName = String(
					image?.wooProductName || ''
				).trim();
				const productPriceHtml = String(
					image?.wooProductPrice || ''
				).trim();

				overlayNode.innerHTML = '';

				if ( productName ) {
					const nameNode = document.createElement( 'div' );
					nameNode.className = 'pb-product-name';
					nameNode.textContent = productName;
					overlayNode.appendChild( nameNode );
				}

				if ( productPriceHtml ) {
					const priceNode = document.createElement( 'div' );
					priceNode.className = 'pb-product-price';
					priceNode.innerHTML = productPriceHtml;
					overlayNode.appendChild( priceNode );
				}

				if ( ! overlayNode.childNodes.length ) {
					overlayNode.textContent = title;
				}
				return;
			}

				if ( overlayContent === 'caption' && caption ) {
					overlayNode.innerHTML = caption;
					return;
				}

				if ( overlayContent === 'exif' ) {
					overlayNode.innerHTML = '';
					overlayNode.appendChild( createExifOverlay( image ) );
					return;
				}

				overlayNode.textContent = title;
			};

		const updateButtons = ( image ) => {
			if ( downloadButton ) {
				downloadButton.setAttribute(
					'data-full-src',
					String( image?.fullSrc || image?.src || '' )
				);
			}

			if ( linkButton ) {
				if ( image?.linkUrl ) {
					linkButton.href = String( image.linkUrl );
					linkButton.hidden = false;
				} else {
					linkButton.removeAttribute( 'href' );
					linkButton.hidden = true;
				}

				if ( image?.linkTarget === '_blank' ) {
					linkButton.target = '_blank';
					linkButton.rel = 'noopener noreferrer';
				} else {
					linkButton.removeAttribute( 'target' );
					linkButton.removeAttribute( 'rel' );
				}
			}

			if ( ! cartButton ) {
				return;
			}

			const hasProduct =
				!! settings.enableWooCommerce &&
				Number( image?.wooProductId || 0 ) > 0;

			cartButton.hidden = ! hasProduct;
			if ( ! hasProduct ) {
				cartButton.removeAttribute( 'data-woo-action' );
				cartButton.removeAttribute( 'data-product-id' );
				cartButton.removeAttribute( 'data-product-url' );
				return;
			}

			const action =
				image?.wooLinkAction === 'product' ? 'product' : 'add_to_cart';
			cartButton.dataset.wooAction = action;
			cartButton.dataset.productId = String( image.wooProductId );

			if ( image?.wooProductUrl ) {
				cartButton.dataset.productUrl = String( image.wooProductUrl );
			} else {
				cartButton.removeAttribute( 'data-product-url' );
			}

			cartButton.setAttribute(
				'aria-label',
				action === 'product' ? 'View Product' : 'Add to Cart'
			);
		};

		const syncAutoplayIcons = () => {
			if ( ! autoplayButton ) {
				return;
			}

			if ( playIcon ) {
				playIcon.style.display = isPlaying ? 'none' : '';
			}
			if ( pauseIcon ) {
				pauseIcon.style.display = isPlaying ? '' : 'none';
			}

			autoplayButton.setAttribute(
				'aria-label',
				isPlaying ? 'Pause autoplay' : 'Play autoplay'
			);
		};

		const restartAutoplay = () => {
			if ( autoplayTimer ) {
				window.clearInterval( autoplayTimer );
				autoplayTimer = null;
			}

			if (
				! settings.autoplay ||
				! isPlaying ||
				api.getImages().length < 2
			) {
				return;
			}

			if ( settings.pauseOnHover && isMainHovered ) {
				return;
			}

			if ( ! isGalleryFullscreen() && ! isInViewport ) {
				return;
			}

			if ( document.visibilityState === 'hidden' ) {
				return;
			}

			const speedSeconds = Number( settings.autoplaySpeed ) || 3;
			const intervalMs = Math.max( 0.25, speedSeconds ) * 1000;

			autoplayTimer = window.setInterval( () => {
				api.setActiveImage( api.getActiveIndex() + 1 );
			}, intervalMs );
		};

		const handleViewportChange = ( nextState ) => {
			const isVisible = !! nextState;
			if ( isInViewport === isVisible ) {
				return;
			}

			isInViewport = isVisible;
			restartAutoplay();
		};

		if ( 'IntersectionObserver' in window ) {
			viewportObserver = new window.IntersectionObserver(
				( entries ) => {
					entries.forEach( ( entry ) => {
						if ( entry.target !== galleryRoot ) {
							return;
						}

						handleViewportChange(
							entry.isIntersecting && entry.intersectionRatio > 0
						);
					} );
				},
				{ threshold: [ 0, 0.01, 0.1 ] }
			);
			viewportObserver.observe( galleryRoot );
			handleViewportChange( isElementInViewport( galleryRoot ) );
		} else {
			handleViewportFallback = () => {
				handleViewportChange( isElementInViewport( galleryRoot ) );
			};

			window.addEventListener( 'scroll', handleViewportFallback, {
				passive: true,
			} );
			window.addEventListener( 'resize', handleViewportFallback );
			handleViewportFallback();
		}

		document.addEventListener( 'visibilitychange', restartAutoplay );

		galleryRoot.addEventListener( 'pb:filmstrip:change', ( event ) => {
			const image = event?.detail?.image;
			if ( ! image ) {
				return;
			}
			renderOverlay( image );
			updateButtons( image );

			const imageLabel = String(
				image?.alt || image?.title || ''
			).trim();
			const imagePosition = api.getActiveIndex() + 1;
			const imageTotal = api.getImages().length;

			main.setAttribute(
				'aria-label',
				imageLabel
					? `Image ${ imagePosition } of ${ imageTotal }: ${ imageLabel }`
					: `Image ${ imagePosition } of ${ imageTotal }`
			);

			if ( isGalleryFullscreen() ) {
				announce(
					imageLabel
						? `Image ${ imagePosition } of ${ imageTotal }: ${ imageLabel }`
						: `Image ${ imagePosition } of ${ imageTotal }`
				);
			}
		} );

		if ( autoplayButton ) {
			autoplayButton.addEventListener( 'click', () => {
				markGalleryInteraction();
				isPlaying = ! isPlaying;
				syncAutoplayIcons();
				restartAutoplay();
			} );
		}

		main.addEventListener( 'mouseenter', () => {
			markGalleryInteraction();
			isMainHovered = true;
			restartAutoplay();
		} );

		main.addEventListener( 'mouseleave', () => {
			isMainHovered = false;
			restartAutoplay();
		} );

		galleryRoot.addEventListener( 'mouseenter', () => {
			markGalleryInteraction();
			isGalleryHovered = true;
		} );

		galleryRoot.addEventListener( 'mouseleave', () => {
			isGalleryHovered = false;
		} );

		galleryRoot.addEventListener( 'focusin', markGalleryInteraction );
		galleryRoot.addEventListener( 'pointerdown', markGalleryInteraction );
		galleryRoot.addEventListener( 'click', markGalleryInteraction );

		const handleKeydown = ( event ) => {
			if ( shouldIgnoreKeyboardShortcut( event ) ) {
				return;
			}

			if ( event.key === 'Tab' ) {
				trapFullscreenFocus( event );
				return;
			}

			if ( ! shouldHandleGalleryShortcuts() ) {
				return;
			}

			if (
				( event.key === 'f' || event.key === 'F' ) &&
				canUseFullscreen
			) {
				event.preventDefault();
				toggleFullscreen();
				return;
			}

			if ( ! canUseFullscreen || ! isGalleryFullscreen() ) {
				return;
			}

			if ( event.key === 'ArrowRight' || event.key === 'ArrowDown' ) {
				event.preventDefault();
				api.setActiveImage( api.getActiveIndex() + 1 );
			} else if ( event.key === 'ArrowLeft' || event.key === 'ArrowUp' ) {
				event.preventDefault();
				api.setActiveImage( api.getActiveIndex() - 1 );
			} else if ( event.key === 'Home' ) {
				event.preventDefault();
				api.setActiveImage( 0 );
			} else if ( event.key === 'End' ) {
				event.preventDefault();
				api.setActiveImage( api.getImages().length - 1 );
			}
		};

		document.addEventListener( 'keydown', handleKeydown );

		if ( canUseFullscreen && fullscreenButton ) {
			fullscreenButton.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				toggleFullscreen();
			} );
		}

		if ( canUseFullscreen ) {
			document.addEventListener(
				'fullscreenchange',
				syncFullscreenClass
			);
			document.addEventListener(
				'webkitfullscreenchange',
				syncFullscreenClass
			);
		}

		// Initialize premium UI state for the current active image.
		const initialImage = api.getImages()[ api.getActiveIndex() ];
		if ( initialImage ) {
			renderOverlay( initialImage );
			updateButtons( initialImage );
			const initialLabel = String(
				initialImage?.alt || initialImage?.title || ''
			).trim();
			main.setAttribute(
				'aria-label',
				initialLabel
					? `Image ${ api.getActiveIndex() + 1 } of ${
							api.getImages().length
					  }: ${ initialLabel }`
					: `Image ${ api.getActiveIndex() + 1 } of ${
							api.getImages().length
					  }`
			);
		}
		syncAutoplayIcons();
		restartAutoplay();
		if ( canUseFullscreen ) {
			syncFullscreenButtonState();
			syncFullscreenClass();
		}

		window.addEventListener( 'pagehide', () => {
			if ( autoplayTimer ) {
				window.clearInterval( autoplayTimer );
				autoplayTimer = null;
			}
			if ( canUseFullscreen ) {
				galleryRoot.classList.remove( 'is-fullscreen' );
				if ( fullscreenTarget !== galleryRoot ) {
					fullscreenTarget.classList.remove( 'is-fullscreen' );
				}
				document.removeEventListener(
					'fullscreenchange',
					syncFullscreenClass
				);
				document.removeEventListener(
					'webkitfullscreenchange',
					syncFullscreenClass
				);
			}
			document.removeEventListener( 'keydown', handleKeydown );
			if ( announceTimer ) {
				window.clearTimeout( announceTimer );
				announceTimer = null;
			}
			if ( statusNode ) {
				statusNode.remove();
			}
			if ( instructionsNode ) {
				instructionsNode.remove();
			}
			document.removeEventListener( 'visibilitychange', restartAutoplay );
			if ( viewportObserver ) {
				viewportObserver.disconnect();
			}
			if ( handleViewportFallback ) {
				window.removeEventListener( 'scroll', handleViewportFallback );
				window.removeEventListener( 'resize', handleViewportFallback );
			}
		} );
	} );
} );
