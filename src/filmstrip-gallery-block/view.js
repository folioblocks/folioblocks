/**
 * Filmstrip Gallery Block
 * View JS (Free/Core)
 */
document.addEventListener( 'DOMContentLoaded', () => {
	const galleries = document.querySelectorAll(
		'.wp-block-folioblocks-filmstrip-gallery-block.pb-filmstrip-gallery, .wp-block-folioblocks-filmstrip-gallery-block .pb-filmstrip-gallery'
	);

	if ( ! galleries.length ) {
		return;
	}

	let galleryInstance = 0;

	galleries.forEach( ( galleryRoot ) => {
		galleryInstance += 1;

		const dataNode = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-data'
		);
		if ( ! dataNode ) {
			return;
		}

		let payload;
		try {
			payload = JSON.parse( dataNode.textContent || '{}' );
		} catch ( err ) {
			payload = {};
		}

		const settings = payload?.settings || {};
		const images = Array.isArray( payload?.images ) ? payload.images : [];
		if ( ! images.length ) {
			return;
		}

		const mainImage = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-main-image'
		);
		if ( ! mainImage ) {
			return;
		}
		const mainPanel = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-main'
		);
		const mainMedia = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-main-media'
		);
		const syncMainMediaRatio = () => {
			if (
				mainMedia &&
				mainImage.naturalWidth > 0 &&
				mainImage.naturalHeight > 0
			) {
				mainMedia.style.setProperty(
					'--pb-filmstrip-image-ratio',
					String( mainImage.naturalWidth / mainImage.naturalHeight )
				);
			}
		};
		mainImage.addEventListener( 'load', syncMainMediaRatio );
		const mainImageLink = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-main-link'
		);
		if ( mainPanel ) {
			mainPanel.setAttribute( 'role', 'tabpanel' );
			if ( ! mainPanel.id ) {
				mainPanel.id = `pb-filmstrip-gallery-panel-${ galleryInstance }`;
			}
		}

		const thumbButtons = Array.from(
			galleryRoot.querySelectorAll( '.pb-filmstrip-gallery-thumb' )
		);
		const thumbnailsTrack = galleryRoot.querySelector(
			'.pb-filmstrip-gallery-thumbnails'
		);
		const prevButtons = Array.from(
			galleryRoot.querySelectorAll(
				'.pb-filmstrip-gallery-nav-prev, .pb-filmstrip-gallery-strip-nav[data-direction="prev"]'
			)
		);
		const nextButtons = Array.from(
			galleryRoot.querySelectorAll(
				'.pb-filmstrip-gallery-nav-next, .pb-filmstrip-gallery-strip-nav[data-direction="next"]'
			)
		);

		let activeIndex = 0;

		const normalizeIndex = ( index ) => {
			const length = images.length;
			if ( ! length ) {
				return 0;
			}
			return ( ( index % length ) + length ) % length;
		};

		const keepThumbVisibleInTrack = ( thumbButton ) => {
			if ( ! thumbButton || ! thumbnailsTrack ) {
				return;
			}

			const trackRect = thumbnailsTrack.getBoundingClientRect();
			const thumbRect = thumbButton.getBoundingClientRect();
			const edgePadding = 8;

			if ( thumbRect.left < trackRect.left ) {
				thumbnailsTrack.scrollLeft +=
					thumbRect.left - trackRect.left - edgePadding;
			} else if ( thumbRect.right > trackRect.right ) {
				thumbnailsTrack.scrollLeft +=
					thumbRect.right - trackRect.right + edgePadding;
			}

			if ( thumbRect.top < trackRect.top ) {
				thumbnailsTrack.scrollTop +=
					thumbRect.top - trackRect.top - edgePadding;
			} else if ( thumbRect.bottom > trackRect.bottom ) {
				thumbnailsTrack.scrollTop +=
					thumbRect.bottom - trackRect.bottom + edgePadding;
			}
		};

		const syncThumbState = () => {
			thumbButtons.forEach( ( button, index ) => {
				const isActive = index === activeIndex;
				button.classList.toggle( 'is-active', isActive );
				button.setAttribute(
					'aria-selected',
					isActive ? 'true' : 'false'
				);
				button.setAttribute( 'tabindex', isActive ? '0' : '-1' );

				if ( mainPanel?.id ) {
					button.setAttribute( 'aria-controls', mainPanel.id );
					if ( ! button.id ) {
						button.id = `${ mainPanel.id }-tab-${ index }`;
					}
				}

				if ( isActive && mainPanel && button.id ) {
					mainPanel.setAttribute( 'aria-labelledby', button.id );
				}
			} );

			const activeThumb = thumbButtons[ activeIndex ];
			if ( activeThumb ) {
				keepThumbVisibleInTrack( activeThumb );
			}
		};

		const emitImageChange = ( image ) => {
			galleryRoot.dispatchEvent(
				new CustomEvent( 'pb:filmstrip:change', {
					detail: {
						activeIndex,
						image,
						images,
						settings,
					},
				} )
			);
		};

		const setActiveImage = ( nextIndex ) => {
			activeIndex = normalizeIndex( nextIndex );
			const image = images[ activeIndex ];
			if ( ! image ) {
				return;
			}

			if ( image.src ) {
				mainImage.src = image.src;
			}
			if ( image.srcSet ) {
				mainImage.setAttribute( 'srcset', image.srcSet );
			} else {
				mainImage.removeAttribute( 'srcset' );
			}
			if ( image.sizes ) {
				mainImage.setAttribute( 'sizes', image.sizes );
			} else {
				mainImage.removeAttribute( 'sizes' );
			}
			mainImage.className = `pb-filmstrip-gallery-main-image pb-image-block-img${
				image.imgClass ? ` ${ image.imgClass }` : ''
			}`;
			mainImage.setAttribute(
				'data-image-id',
				String( Number( image.id || 0 ) )
			);
			if ( mainMedia ) {
				const width = Number( image.width || 0 );
				const height = Number( image.height || 0 );
				mainMedia.style.setProperty(
					'--pb-filmstrip-image-ratio',
					String( width > 0 && height > 0 ? width / height : 1 )
				);
			}

			mainImage.alt =
				image.alt || image.title || 'Selected gallery image';
			mainImage.loading = settings.lazyLoad ? 'lazy' : 'eager';
			if ( mainImageLink ) {
				const clickSettings = image.overrideGalleryClickSettings
					? image
					: settings;
				let imageClickAction = clickSettings.imageClickAction || '';
				if ( ! imageClickAction && clickSettings.enableDownload ) {
					imageClickAction = 'download';
				} else if (
					! imageClickAction &&
					clickSettings.enableWooCommerce
				) {
					imageClickAction = 'woocommerce';
				}
				const imageClickTarget =
					clickSettings.imageClickTarget || 'icon';
				let linkUrl = image.overrideGalleryClickSettings
					? ''
					: image.linkUrl || '';
				let linkTarget = image.overrideGalleryClickSettings
					? ''
					: image.linkTarget || '';
				let linkClass = 'pb-filmstrip-gallery-main-link';
				let linkDownload = false;

				if ( image.overrideGalleryClickSettings ) {
					if ( imageClickAction === 'media_file' ) {
						linkUrl = image.fullSrc || image.src || '';
					} else if ( imageClickAction === 'custom_url' ) {
						linkUrl = image.customUrl || '';
						linkTarget = image.customUrlOpenInNewTab
							? '_blank'
							: '';
					} else if ( imageClickAction === 'page_post' ) {
						linkUrl = image.linkedPostUrl || '';
						linkTarget = image.linkedPostOpenInNewTab
							? '_blank'
							: '';
					}
				}
				if (
					! (
						imageClickAction === 'media_file' ||
						( imageClickTarget === 'thumbnail' &&
							[ 'custom_url', 'page_post' ].includes(
								imageClickAction
							) )
					)
				) {
					linkUrl = '';
					linkTarget = '';
				}

				if (
					imageClickAction === 'download' &&
					imageClickTarget === 'thumbnail'
				) {
					linkUrl = image.fullSrc || image.src || '';
					linkDownload = true;
				} else if (
					imageClickAction === 'woocommerce' &&
					imageClickTarget === 'thumbnail' &&
					clickSettings.enableWooCommerce &&
					Number( image.wooProductId || 0 ) > 0
				) {
					const configuredAction =
						image.wooLinkActionRaw &&
						image.wooLinkActionRaw !== 'inherit'
							? image.wooLinkActionRaw
							: clickSettings.wooDefaultLinkAction;
					const action =
						configuredAction === 'product'
							? 'product'
							: 'add_to_cart';
					if ( action === 'product' && image.wooProductUrl ) {
						linkUrl = image.wooProductUrl;
					} else {
						linkUrl = image.wooProductUrl || '#';
						linkClass += ' pb-add-to-cart-thumbnail';
						mainImageLink.dataset.wooAction = 'add_to_cart';
						mainImageLink.dataset.productId = String(
							image.wooProductId
						);
						if ( image.wooProductUrl ) {
							mainImageLink.dataset.productUrl = String(
								image.wooProductUrl
							);
						} else {
							delete mainImageLink.dataset.productUrl;
						}
					}
				}

				mainImageLink.className = linkClass;

				if ( linkUrl ) {
					mainImageLink.href = linkUrl;
				} else {
					mainImageLink.removeAttribute( 'href' );
				}

				if ( linkTarget === '_blank' ) {
					mainImageLink.target = '_blank';
					mainImageLink.rel = 'noopener noreferrer';
				} else {
					mainImageLink.removeAttribute( 'target' );
					mainImageLink.removeAttribute( 'rel' );
				}

				if ( linkDownload ) {
					mainImageLink.setAttribute( 'download', '' );
				} else {
					mainImageLink.removeAttribute( 'download' );
				}

					if (
						! (
						imageClickAction === 'woocommerce' &&
						imageClickTarget === 'thumbnail' &&
						clickSettings.enableWooCommerce &&
						Number( image.wooProductId || 0 ) > 0
					)
				) {
					delete mainImageLink.dataset.wooAction;
					delete mainImageLink.dataset.productId;
					delete mainImageLink.dataset.productUrl;
				}
			}

			syncThumbState();
			emitImageChange( image );
		};

		thumbButtons.forEach( ( button ) => {
			button.addEventListener( 'click', () => {
				const index = Number( button.dataset.index || 0 );
				setActiveImage( index );
			} );

			button.addEventListener( 'keydown', ( event ) => {
				const index = Number( button.dataset.index || 0 );
				let nextIndex = null;

				if ( event.key === 'ArrowRight' || event.key === 'ArrowDown' ) {
					nextIndex = index + 1;
				} else if (
					event.key === 'ArrowLeft' ||
					event.key === 'ArrowUp'
				) {
					nextIndex = index - 1;
				} else if ( event.key === 'Home' ) {
					nextIndex = 0;
				} else if ( event.key === 'End' ) {
					nextIndex = images.length - 1;
				} else if ( event.key === 'Enter' || event.key === ' ' ) {
					event.preventDefault();
					setActiveImage( index );
					return;
				}

				if ( null === nextIndex ) {
					return;
				}

				event.preventDefault();
				setActiveImage( nextIndex );

				const nextThumb = thumbButtons[ normalizeIndex( nextIndex ) ];
				if ( nextThumb ) {
					nextThumb.focus();
				}
			} );
		} );

		prevButtons.forEach( ( button ) => {
			button.addEventListener( 'click', () => {
				setActiveImage( activeIndex - 1 );
			} );
		} );

		nextButtons.forEach( ( button ) => {
			button.addEventListener( 'click', () => {
				setActiveImage( activeIndex + 1 );
			} );
		} );

		galleryRoot.__pbFilmstrip = {
			getSettings: () => settings,
			getImages: () => images,
			getActiveIndex: () => activeIndex,
			setActiveImage,
		};

		setActiveImage( 0 );
	} );
} );
