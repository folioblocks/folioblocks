/**
 * PB Video Block
 * Premium View JS
 */
document.addEventListener( 'DOMContentLoaded', () => {
	const getFullscreenElement = () =>
		document.fullscreenElement || document.webkitFullscreenElement;
	const fullscreenIcon =
		'<svg class="lightbox-fullscreen-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 9V5h4v1.5H6.5V9H5zm10-2.5V5h4v4h-1.5V6.5H15zM6.5 15v2.5H9V19H5v-4h1.5zm11 0H19v4h-4v-1.5h2.5z"/></svg>';
	const exitFullscreenIcon =
		'<svg class="lightbox-fullscreen-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5v4H5V7.5h2.5V5H9zm6 0h1.5v2.5H19V9h-4V5zM5 15h4v4H7.5v-2.5H5V15zm10 0h4v1.5h-2.5V19H15v-4z"/></svg>';

	const syncFullscreenButtons = () => {
		const fullscreenElement = getFullscreenElement();

		document
			.querySelectorAll( '.pb-video-lightbox' )
			.forEach( ( lightbox ) => {
				const button = lightbox.querySelector( '.lightbox-fullscreen' );
				if ( ! button ) {
					return;
				}

				const isFullscreen =
					fullscreenElement &&
					( fullscreenElement === lightbox ||
						lightbox.contains( fullscreenElement ) );
				button.innerHTML = isFullscreen
					? exitFullscreenIcon
					: fullscreenIcon;
				button.setAttribute(
					'aria-label',
					isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'
				);
				button.setAttribute(
					'aria-pressed',
					isFullscreen ? 'true' : 'false'
				);
			} );
	};

	document.querySelectorAll( '.pb-video-lightbox' ).forEach( ( lightbox ) => {
		if (
			( ! lightbox.requestFullscreen &&
				! lightbox.webkitRequestFullscreen ) ||
			lightbox.querySelector( '.lightbox-fullscreen' )
		) {
			return;
		}

		const button = document.createElement( 'button' );
		button.className = 'lightbox-fullscreen';
		button.type = 'button';
		button.setAttribute( 'aria-keyshortcuts', 'F' );
		button.addEventListener( 'click', () => {
			const fullscreenElement = getFullscreenElement();
			if (
				fullscreenElement &&
				( fullscreenElement === lightbox ||
					lightbox.contains( fullscreenElement ) )
			) {
				if ( document.exitFullscreen ) {
					const exitPromise = document.exitFullscreen();
					if ( exitPromise?.catch ) {
						exitPromise.catch( () => {} );
					}
				} else if ( document.webkitExitFullscreen ) {
					document.webkitExitFullscreen();
				}
				return;
			}

			const videoContainer = lightbox.querySelector(
				'.pb-video-lightbox-video'
			);
			const fullscreenTarget =
				videoContainer?.querySelector( 'video, iframe' ) ||
				videoContainer;
			if ( ! fullscreenTarget ) {
				return;
			}
			const request =
				fullscreenTarget.requestFullscreen ||
				fullscreenTarget.webkitRequestFullscreen;
			if ( ! request ) {
				return;
			}
			const requestPromise = request.call( fullscreenTarget );
			if ( requestPromise?.catch ) {
				requestPromise.catch( () => {} );
			}
		} );
		lightbox.appendChild( button );
	} );

	syncFullscreenButtons();
	document.addEventListener( 'fullscreenchange', syncFullscreenButtons );
	document.addEventListener(
		'webkitfullscreenchange',
		syncFullscreenButtons
	);

	// Disable right-click on entire page if any gallery block has it enabled
	const disableRightClick = document.querySelector(
		'[data-disable-right-click="true"]'
	);
	if ( disableRightClick ) {
		document.addEventListener( 'contextmenu', ( e ) => {
			e.preventDefault();
		} );
	}

	// Disable drag-to-save for protected FolioBlocks media.
	const disableDragToSave = document.querySelector(
		'[data-disable-drag-to-save="true"]'
	);
	if ( disableDragToSave ) {
		document.addEventListener(
			'dragstart',
			( e ) => {
				const protectedMedia = e.target.closest(
					'[data-disable-drag-to-save="true"] img, [data-disable-drag-to-save="true"] video, .pb-video-lightbox img, .pb-video-lightbox video'
				);
				if ( protectedMedia ) {
					e.preventDefault();
				}
			},
			{ capture: true }
		);
	}

	// WooCommerce Icon Logic (Add to Cart / View Product)
	document.addEventListener(
		'click',
		( e ) => {
			const cartBtn = e.target.closest( '.pb-video-add-to-cart' );
			if ( ! cartBtn ) {
				return;
			}

			// Prevent lightbox open and other parent handlers.
			e.preventDefault();
			e.stopPropagation();

			const action = cartBtn.dataset.wooAction || 'add_to_cart';
			const productId = cartBtn.dataset.productId;
			const productUrl = cartBtn.dataset.productUrl;

			if ( action === 'product' ) {
				if ( productUrl ) {
					window.location.href = productUrl;
				}
				return;
			}

			if ( ! productId ) {
				return;
			}

			const fallbackRedirect = () => {
				try {
					const url = new URL( window.location.href );
					url.searchParams.set( 'add-to-cart', String( productId ) );
					window.location.href = url.toString();
				} catch {
					const sep = window.location.href.includes( '?' )
						? '&'
						: '?';
					window.location.href = `${
						window.location.href
					}${ sep }add-to-cart=${ encodeURIComponent(
						String( productId )
					) }`;
				}
			};

			const getAjaxUrl = () => {
				if ( window.wc_add_to_cart_params?.wc_ajax_url ) {
					return window.wc_add_to_cart_params.wc_ajax_url
						.toString()
						.replace( '%%endpoint%%', 'add_to_cart' );
				}
				return `${ window.location.origin }/?wc-ajax=add_to_cart`;
			};

			const body = new URLSearchParams();
			body.set( 'product_id', String( productId ) );
			body.set( 'quantity', '1' );

			fetch( getAjaxUrl(), {
				method: 'POST',
				headers: {
					'Content-Type':
						'application/x-www-form-urlencoded; charset=UTF-8',
				},
				body: body.toString(),
				credentials: 'same-origin',
			} )
				.then( async ( res ) => {
					if ( ! res.ok ) {
						throw new Error( `Woo AJAX failed (${ res.status })` );
					}
					return res.json();
				} )
				.then( ( data ) => {
					if ( data?.error ) {
						if ( data?.product_url ) {
							window.location.href = data.product_url;
							return;
						}
						fallbackRedirect();
						return;
					}

					if (
						data?.fragments &&
						typeof data.fragments === 'object'
					) {
						Object.keys( data.fragments ).forEach( ( selector ) => {
							const html = data.fragments[ selector ];
							if ( ! html ) {
								return;
							}
							const el = document.querySelector( selector );
							if ( ! el ) {
								return;
							}
							try {
								el.outerHTML = html;
							} catch {
								// Ignore fragment update failures.
							}
						} );
					}

					if ( window.jQuery ) {
						window
							.jQuery( document.body )
							.trigger( 'added_to_cart', [
								data?.fragments || {},
								data?.cart_hash || '',
								window.jQuery( cartBtn ),
							] );
					} else {
						document.body.dispatchEvent(
							new CustomEvent( 'added_to_cart', {
								detail: {
									fragments: data?.fragments || {},
									cart_hash: data?.cart_hash || '',
								},
							} )
						);
					}
				} )
				.catch( () => {
					fallbackRedirect();
				} );
		},
		{ capture: true }
	);
} );
