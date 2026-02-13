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
		const isPro = !! window.folioBlocksData?.isPro;
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
		const autoplayButton = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-autoplay-button'
		);
		const fullscreenButton = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-fullscreen-button'
		);
		const canUseFullscreen =
			isPro && !! settings.enableFullscreen && !! fullscreenButton;
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
		let announceTimer = null;
		let autoplayTimer = null;
		let wasFullscreen = false;
		let previouslyFocusedElement = null;

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
			const hasProduct = Number( image?.wooProductId || 0 ) > 0;
			const showOverlay =
				!! settings.onHoverTitle && ( hasProduct || title );

			overlayContainer.style.display = showOverlay ? '' : 'none';
			if ( ! showOverlay ) {
				overlayNode.textContent = '';
				return;
			}

			const showProductInfo =
				!! settings.enableWooCommerce &&
				!! settings.wooProductPriceOnHover &&
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

			overlayNode.textContent = title;
		};

		const updateButtons = ( image ) => {
			if ( downloadButton ) {
				downloadButton.setAttribute(
					'data-full-src',
					String( image?.fullSrc || image?.src || '' )
				);
			}

			if ( ! cartButton ) {
				return;
			}

			const hasProduct =
				!! settings.enableWooCommerce &&
				Number( image?.wooProductId || 0 ) > 0;

			cartButton.hidden = ! hasProduct;
			if ( ! hasProduct ) {
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

			const speedSeconds = Number( settings.autoplaySpeed ) || 3;
			const intervalMs = Math.max( 0.25, speedSeconds ) * 1000;

			autoplayTimer = window.setInterval( () => {
				api.setActiveImage( api.getActiveIndex() + 1 );
			}, intervalMs );
		};

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
		} );
	} );
} );
