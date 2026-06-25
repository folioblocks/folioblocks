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
			iso: '<span class="pb-hover-exif-icon__iso">ISO</span>',
		};

		const createExifOverlay = ( image, hideUnknownFields = false ) => {
			const unknown = 'Unknown';
			const isUnknownValue = ( value ) => {
				const normalizedValue = String( value || '' )
					.trim()
					.toLowerCase();
				return ! normalizedValue || normalizedValue === 'unknown';
			};
			const fields = [
				{ icon: 'camera', value: image?.exifCamera },
				{
					icon: 'aspectRatio',
					value: image?.exifFocalLength,
				},
				{ icon: 'time', value: image?.exifShutterSpeed },
				{ icon: 'aperture', value: image?.exifAperture },
				{ icon: 'iso', value: image?.exifIso },
			];
			const wrapper = document.createElement( 'div' );
			wrapper.className = 'pb-hover-exif';

			fields
				.filter(
					( field ) =>
						! hideUnknownFields || ! isUnknownValue( field.value )
				)
				.forEach( ( field ) => {
				const item = document.createElement( 'span' );
				item.className = 'pb-hover-exif__item';
				const icon = document.createElement( 'span' );
				icon.className = 'pb-hover-exif__icon';
				icon.innerHTML = exifIcons[ field.icon ] || '';
				const value = document.createElement( 'span' );
				value.className = 'pb-hover-exif__value';
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
		const mainMedia = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-main-media'
		);

		const overlayContainer = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-main-media > .pb-image-block-title-container'
		);
		const overlayNode = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-main-media > .pb-image-block-title-container > .pb-image-block-title'
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
		const fullscreenThemeTargets =
			fullscreenTarget === galleryRoot
				? [ galleryRoot ]
				: [ galleryRoot, fullscreenTarget ];
		const syncFullscreenTheme = ( image ) => {
			const clickSettings = image?.overrideGalleryClickSettings
				? image
				: settings;
			const lightboxEnabled =
				clickSettings?.imageClickAction === 'lightbox' ||
				!! clickSettings?.lightbox;
			const effectiveTheme =
				clickSettings?.lightboxTheme === 'inherit'
					? settings.lightboxTheme
					: clickSettings?.lightboxTheme;

			fullscreenThemeTargets.forEach( ( target ) => {
				target.classList.toggle(
					'is-fullscreen-theme-light',
					lightboxEnabled && effectiveTheme === 'light'
				);
				target.classList.toggle(
					'is-fullscreen-theme-dark',
					lightboxEnabled && effectiveTheme !== 'light'
				);
			} );
		};
		const lightboxGroup = `pb-filmstrip-lightbox-${ galleryIndex + 1 }`;
		const escapeLightboxText = ( value ) =>
			String( value || '' )
				.replaceAll( '&', '&amp;' )
				.replaceAll( '<', '&lt;' )
				.replaceAll( '>', '&gt;' )
				.replaceAll( '"', '&quot;' )
				.replaceAll( "'", '&#039;' );
		const createLightboxExif = ( image, hideUnknownFields ) => {
			const isUnknownValue = ( value ) => {
				const normalizedValue = String( value || '' )
					.trim()
					.toLowerCase();
				return ! normalizedValue || normalizedValue === 'unknown';
			};
			const fields = [
				[ 'camera', 'Camera', image.exifCamera ],
				[ 'aspectRatio', 'Focal Length', image.exifFocalLength ],
				[ 'time', 'Shutter Speed', image.exifShutterSpeed ],
				[ 'aperture', 'Aperture', image.exifAperture ],
				[ 'iso', 'ISO', image.exifIso ],
			].filter(
				( field ) =>
					! hideUnknownFields || ! isUnknownValue( field[ 2 ] )
			);
			if ( ! fields.length ) {
				return '';
			}
			return `<div class="pb-lightbox-exif">${ fields
				.map(
					( field ) =>
						`<div class="pb-lightbox-exif__row"><span class="pb-lightbox-exif__icon">${
							exifIcons[ field[ 0 ] ] || ''
						}</span><span class="pb-lightbox-exif__text"><span class="pb-lightbox-exif__label">${ escapeLightboxText(
							field[ 1 ]
						) }</span><span class="pb-lightbox-exif__value">${ escapeLightboxText(
							field[ 2 ] || 'Unknown'
						) }</span></span></div>`
				)
				.join( '' ) }</div>`;
		};
		const lightboxTriggers = api.getImages().map( ( image, index ) => {
			const clickSettings = image.overrideGalleryClickSettings
				? image
				: settings;
			const lightboxEnabled =
				clickSettings.imageClickAction === 'lightbox' ||
				!! clickSettings.lightbox;
			const trigger = document.createElement( 'a' );
			trigger.href = '#';
			trigger.hidden = true;
			trigger.className = 'pb-image-block-lightbox';
			trigger.dataset.lightboxGroup = lightboxGroup;
			trigger.dataset.filmstripLightboxIndex = String( index );
			trigger.dataset.src = String( image.fullSrc || image.src || '' );
			const lightboxTheme =
				clickSettings.lightboxTheme === 'inherit'
					? settings.lightboxTheme
					: clickSettings.lightboxTheme;
			trigger.dataset.lightboxTheme =
				lightboxTheme === 'light' ? 'light' : 'dark';
			if ( ! lightboxEnabled ) {
				trigger.dataset.filmstripLightboxDisabled = 'true';
			}

			const content = clickSettings.lightboxContent || 'none';
			const captionParts = [];
			if (
				content === 'product' &&
				clickSettings.enableWooCommerce &&
				( image.wooProductName || image.wooProductPrice )
			) {
				captionParts.push(
					`<div class="pb-lightbox-product-info">${
						image.wooProductName
							? `<h4 class="pb-product-name">${ escapeLightboxText(
									image.wooProductName
							  ) }</h4>`
							: ''
					}${
						image.wooProductPrice
							? `<p class="pb-product-price">${ image.wooProductPrice }</p>`
							: ''
					}</div>`
				);
			} else {
				if (
					[ 'title', 'title_exif', 'title_caption', 'title_caption_exif' ].includes(
						content
					) &&
					image.title
				) {
					captionParts.push(
						`<div class="pb-lightbox-title">${ escapeLightboxText(
							image.title
						) }</div>`
					);
				}
				if (
					[ 'caption', 'caption_exif', 'title_caption', 'title_caption_exif' ].includes(
						content
					) &&
					image.caption
				) {
					captionParts.push(
						`<div class="pb-lightbox-caption-text">${ image.caption }</div>`
					);
				}
				if (
					[ 'exif', 'title_exif', 'caption_exif', 'title_caption_exif' ].includes(
						content
					)
				) {
					captionParts.push(
						createLightboxExif(
							image,
							!! clickSettings.hideUnknownExifFields
						)
					);
				}
			}
			if ( captionParts.length ) {
				trigger.dataset.caption = captionParts.join( '' );
			}
			galleryRoot.appendChild( trigger );
			return trigger;
		} );
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

		const handleFilmstripLightboxRendered = ( event ) => {
			const { wrapper, trigger } = event.detail || {};
			if (
				! wrapper ||
				trigger?.dataset?.lightboxGroup !== lightboxGroup
			) {
				return;
			}

			const index = Number( trigger.dataset.filmstripLightboxIndex );
			if ( Number.isFinite( index ) ) {
				api.setActiveImage( index );
			}

			window.setTimeout( () => {
				const lightboxFullscreenButton = wrapper.querySelector(
					'.lightbox-fullscreen'
				);
				if ( ! canUseFullscreen ) {
					lightboxFullscreenButton?.remove();
					return;
				}
				if ( ! lightboxFullscreenButton ) {
					return;
				}

				const replacement = lightboxFullscreenButton.cloneNode( true );
				replacement.setAttribute(
					'aria-label',
					'Open Filmstrip fullscreen'
				);
				replacement.setAttribute( 'aria-pressed', 'false' );
				replacement.addEventListener( 'click', () => {
					wrapper.querySelector( '.lightbox-close' )?.click();
					requestGalleryFullscreen();
				} );
				lightboxFullscreenButton.replaceWith( replacement );
			}, 0 );
		};

		document.addEventListener(
			'pbImageLightboxRendered',
			handleFilmstripLightboxRendered
		);

		mainMedia?.addEventListener( 'click', ( event ) => {
			if (
				event.target.closest(
					'.pb-add-to-cart-icon, .pb-image-block-download, .pb-image-block-link-icon'
				)
			) {
				return;
			}
			const image = api.getImages()[ api.getActiveIndex() ];
			const clickSettings = image?.overrideGalleryClickSettings
				? image
				: settings;
			const lightboxEnabled =
				clickSettings?.imageClickAction === 'lightbox' ||
				!! clickSettings?.lightbox;
			if ( ! lightboxEnabled ) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			const trigger = lightboxTriggers[ api.getActiveIndex() ];
			if ( trigger ) {
				delete trigger.dataset.filmstripLightboxDisabled;
				trigger.click();
			}
		} );

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
			const overrideGalleryHoverSettings =
				!! image?.overrideGalleryHoverSettings;
			const hoverSettings = overrideGalleryHoverSettings
				? image
				: settings;
			const hoverEnabled = !! (
				hoverSettings.showTitleOnHover ??
				hoverSettings.hoverTitle ??
				hoverSettings.onHoverTitle
			);
			const hoverWooActive = overrideGalleryHoverSettings
				? !! image.enableWooCommerce &&
				  ( ! image.imageClickAction ||
						image.imageClickAction === 'woocommerce' )
				: !! settings.enableWooCommerce;
			const configuredOverlayContent =
				hoverSettings.overlayContent ||
				( hoverSettings.wooProductPriceOnHover
					? 'product'
					: 'title' );
			const overlayContent =
				configuredOverlayContent === 'product' && ! hoverWooActive
					? 'title'
					: configuredOverlayContent;
			const showOverlay =
				hoverEnabled &&
				( overlayContent === 'product'
					? hoverWooActive && hasProduct
					: overlayContent === 'caption'
					? !! caption
					: overlayContent === 'exif'
					? true
					: !! title );

			overlayContainer.style.display = showOverlay ? '' : 'none';
			if ( ! showOverlay ) {
				overlayNode.textContent = '';
				return;
			}

			const showProductInfo =
				hoverWooActive &&
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

				return;
			}

				if ( overlayContent === 'caption' && caption ) {
					overlayNode.innerHTML = caption;
					return;
				}

				if ( overlayContent === 'exif' ) {
					overlayNode.innerHTML = '';
					overlayNode.appendChild(
						createExifOverlay(
							image,
							!! hoverSettings.hideUnknownExifFields
						)
					);
					return;
				}

				overlayNode.textContent = title;
			};

		const updateHoverPresentation = ( image ) => {
			if ( ! mainMedia ) {
				return;
			}

			const hoverSettings = image?.overrideGalleryHoverSettings
				? image
				: settings;
			const hoverEnabled = !! (
				hoverSettings.showTitleOnHover ??
				hoverSettings.hoverTitle ??
				hoverSettings.onHoverTitle
			);
			const hoverClasses = [
				'pb-hover-blur-overlay',
				'pb-hover-fade-overlay',
				'pb-hover-gradient-bottom',
				'pb-hover-chip',
				'pb-hover-color-overlay',
			];
			mainMedia.classList.remove( ...hoverClasses );
			if ( hoverEnabled ) {
				const hoverClassMap = {
					'blur-overlay': 'pb-hover-blur-overlay',
					'fade-overlay': 'pb-hover-fade-overlay',
					'gradient-bottom': 'pb-hover-gradient-bottom',
					chip: 'pb-hover-chip',
					'color-overlay': 'pb-hover-color-overlay',
				};
				mainMedia.classList.add(
					hoverClassMap[ hoverSettings.onHoverStyle ] ||
						'pb-hover-blur-overlay'
				);
			}

			[
				'--pb-overlay-bg',
				'--pb-overlay-color',
				'--pb-chip-overlay-bg',
				'--pb-chip-overlay-color',
			].forEach( ( property ) => mainMedia.style.removeProperty( property ) );
			if ( hoverSettings.onHoverStyle === 'color-overlay' ) {
				mainMedia.style.setProperty(
					'--pb-overlay-bg',
					hoverSettings.overlayBgColor || '#f9f9f9'
				);
				mainMedia.style.setProperty(
					'--pb-overlay-color',
					hoverSettings.overlayTextColor || '#000000'
				);
			} else if ( hoverSettings.onHoverStyle === 'chip' ) {
				mainMedia.style.setProperty(
					'--pb-chip-overlay-bg',
					hoverSettings.chipOverlayBgColor || '#f9f9f9'
				);
				mainMedia.style.setProperty(
					'--pb-chip-overlay-color',
					hoverSettings.chipOverlayTextColor || '#000000'
				);
			}
		};

		const updateButtons = ( image ) => {
			const clickSettings = image?.overrideGalleryClickSettings
				? image
				: settings;
			let clickAction = clickSettings.imageClickAction || '';
			if ( ! clickAction && clickSettings.enableDownload ) {
				clickAction = 'download';
			} else if ( ! clickAction && clickSettings.enableWooCommerce ) {
				clickAction = 'woocommerce';
			}
			const clickTarget = clickSettings.imageClickTarget || 'icon';
			const setHoverOnly = ( button, display ) => {
				button?.classList.toggle( 'hover-only', display === 'hover' );
			};
			const setIconStyles = ( button, properties ) => {
				if ( ! button ) {
					return;
				}
				properties.forEach( ( [ property, value ] ) => {
					if ( value ) {
						button.style.setProperty( property, value );
					} else {
						button.style.removeProperty( property );
					}
				} );
			};

			if ( downloadButton ) {
				downloadButton.setAttribute(
					'data-full-src',
					String( image?.fullSrc || image?.src || '' )
				);
				downloadButton.hidden = ! (
					clickAction === 'download' &&
					clickTarget === 'icon' &&
					clickSettings.enableDownload
				);
				setHoverOnly(
					downloadButton,
					clickSettings.downloadOnHover === false ? 'always' : 'hover'
				);
				setIconStyles( downloadButton, [
					[ '--pb-download-icon-color', clickSettings.downloadIconColor ],
					[
						'--pb-download-icon-bg',
						clickSettings.downloadIconBgColor,
					],
				] );
			}

			if ( linkButton ) {
				let linkUrl = image?.overrideGalleryClickSettings
					? ''
					: image?.linkUrl || '';
				let linkTarget = image?.overrideGalleryClickSettings
					? ''
					: image?.linkTarget || '';
				if ( image?.overrideGalleryClickSettings ) {
					if ( clickAction === 'custom_url' ) {
						linkUrl = image.customUrl || '';
						linkTarget = image.customUrlOpenInNewTab ? '_blank' : '';
					} else if ( clickAction === 'page_post' ) {
						linkUrl = image.linkedPostUrl || '';
						linkTarget = image.linkedPostOpenInNewTab ? '_blank' : '';
					}
				}
				const showLink =
					[ 'custom_url', 'page_post' ].includes( clickAction ) &&
					clickSettings.linkIconDisplay !== 'none' &&
					!! linkUrl;
				if ( showLink ) {
					linkButton.href = String( linkUrl );
					linkButton.hidden = false;
				} else {
					linkButton.removeAttribute( 'href' );
					linkButton.hidden = true;
				}

				if ( linkTarget === '_blank' ) {
					linkButton.target = '_blank';
					linkButton.rel = 'noopener noreferrer';
				} else {
					linkButton.removeAttribute( 'target' );
					linkButton.removeAttribute( 'rel' );
				}
				setHoverOnly( linkButton, clickSettings.linkIconDisplay || 'hover' );
				setIconStyles( linkButton, [
					[ '--pb-link-icon-color', clickSettings.linkIconColor ],
					[ '--pb-link-icon-bg', clickSettings.linkIconBgColor ],
				] );
			}

			if ( ! cartButton ) {
				return;
			}

			const hasProduct =
				clickAction === 'woocommerce' &&
				!! clickSettings.enableWooCommerce &&
				clickSettings.wooCartIconDisplay !== 'none' &&
				Number( image?.wooProductId || 0 ) > 0;

			cartButton.hidden = ! hasProduct;
			setHoverOnly(
				cartButton,
				clickSettings.wooCartIconDisplay || 'hover'
			);
			setIconStyles( cartButton, [
				[ '--pb-cart-icon-color', clickSettings.cartIconColor ],
				[ '--pb-cart-icon-bg', clickSettings.cartIconBgColor ],
			] );
			if ( ! hasProduct ) {
				cartButton.removeAttribute( 'data-woo-action' );
				cartButton.removeAttribute( 'data-product-id' );
				cartButton.removeAttribute( 'data-product-url' );
				return;
			}

			const configuredAction =
				image?.wooLinkActionRaw && image.wooLinkActionRaw !== 'inherit'
					? image.wooLinkActionRaw
					: clickSettings.wooDefaultLinkAction;
			const action =
				configuredAction === 'product' ? 'product' : 'add_to_cart';
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
			updateHoverPresentation( image );
			renderOverlay( image );
			updateButtons( image );
			syncFullscreenTheme( image );

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
			updateHoverPresentation( initialImage );
			renderOverlay( initialImage );
			updateButtons( initialImage );
			syncFullscreenTheme( initialImage );
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
