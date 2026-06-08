/**
 * PB Image Block
 * Premium View JS
 */
document.addEventListener( 'DOMContentLoaded', () => {
	// Add Disable -Right-Click
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

const gallerySelectors = [
		'.pb-grid-gallery',
		'.pb-justified-gallery',
		'.pb-masonry-gallery',
		'.pb-carousel-gallery',
	];

	const getRandomizedGallery = ( wrapper ) => {
		if (
			gallerySelectors.some( ( selector ) =>
				wrapper.matches( selector )
			)
		) {
			return wrapper;
		}

		return (
			Array.from( wrapper.children ).find( ( child ) =>
				gallerySelectors.some( ( selector ) => child.matches( selector ) )
			) || wrapper.querySelector( gallerySelectors.join( ',' ) )
		);
	};

	const getGalleryItems = ( gallery ) =>
		Array.from( gallery.children ).filter(
			( child ) =>
				child.matches( '.pb-image-block-wrapper' ) ||
				child.matches( '.wp-block-folioblocks-pb-image-block' ) ||
				child.querySelector( '.pb-image-block-wrapper' )
		);

	const shuffleItems = ( items ) => {
		const shuffled = [ ...items ];
		for ( let i = shuffled.length - 1; i > 0; i-- ) {
			const j = Math.floor( Math.random() * ( i + 1 ) );
			[ shuffled[ i ], shuffled[ j ] ] = [ shuffled[ j ], shuffled[ i ] ];
		}

		const isSameOrder = shuffled.every(
			( item, index ) => item === items[ index ]
		);
		if ( isSameOrder && shuffled.length > 1 ) {
			shuffled.push( shuffled.shift() );
		}

		return shuffled;
	};

	// Add randomizer to galleries
	const galleries = document.querySelectorAll(
		'.pb-randomized, [data-randomize="true"]'
	);
	galleries.forEach( ( wrapper ) => {
		const gallery = getRandomizedGallery( wrapper );
		if ( ! gallery ) {
			return;
		}

		const items = getGalleryItems( gallery );
		if ( items.length < 2 ) {
			return;
		}

		const fragment = document.createDocumentFragment();
		shuffleItems( items ).forEach( ( item ) =>
			fragment.appendChild( item )
		);
		gallery.appendChild( fragment );

		setTimeout( () => {
			document.dispatchEvent( new Event( 'pbGalleryUpdated' ) );
		}, 100 );
	} );

	// Image Download Button Logic
	const downloadButtons = document.querySelectorAll(
		'.pb-image-block-download'
	);
	downloadButtons.forEach( ( button ) => {
		button.addEventListener( 'click', ( event ) => {
			event.stopPropagation();

			const fileUrl = button.getAttribute( 'data-full-src' );
			const fileName = fileUrl.split( '/' ).pop();

			// Create and click the download link
			const link = document.createElement( 'a' );
			link.href = fileUrl;
			link.download = fileName;
			link.click();
		} );
	} );

	// WooCommerce Icon Logic (Add to Cart / View Product)
	document.addEventListener(
		'click',
		( e ) => {
			const cartBtn = e.target.closest(
				'.pb-add-to-cart-icon, .pb-add-to-cart-thumbnail'
			);
			if ( ! cartBtn ) {
				return;
			}

			// Prevent any parent handlers (lightbox, figure click, etc.)
			e.preventDefault();
			e.stopPropagation();

			const action = cartBtn.dataset.wooAction || 'add_to_cart';
			const productId = cartBtn.dataset.productId;
			const productUrl = cartBtn.dataset.productUrl;

			// If the user chose "Open Product Page", navigate to the product URL.
			if ( action === 'product' ) {
				if ( productUrl ) {
					window.location.href = productUrl;
				}
				return;
			}

			// Default: Add to cart.
			if ( ! productId ) {
				return;
			}

			// Try AJAX add-to-cart first for a smoother UX (no page reload).
			// If anything fails (endpoint missing, network error, non-simple product, etc.), fall back to redirect.

			const fallbackRedirect = () => {
				try {
					const url = new URL( window.location.href );
					url.searchParams.set( 'add-to-cart', String( productId ) );
					window.location.href = url.toString();
				} catch ( err ) {
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
				// WooCommerce usually localizes this on pages where add-to-cart scripts run.
				if ( window.wc_add_to_cart_params?.wc_ajax_url ) {
					return window.wc_add_to_cart_params.wc_ajax_url
						.toString()
						.replace( '%%endpoint%%', 'add_to_cart' );
				}

				// Fallback: wc-ajax endpoint at site root.
				// This works on most Woo setups when pretty permalinks are enabled.
				return `${ window.location.origin }/?wc-ajax=add_to_cart`;
			};

			const ajaxUrl = getAjaxUrl();

			const removeInjectedViewCartLinks = () => {
				const wrapper = cartBtn.closest(
					'.pb-image-block, .pb-image-block-wrapper'
				);
				if ( ! wrapper ) {
					return;
				}
				wrapper
					.querySelectorAll( '.added_to_cart, .wc-forward' )
					.forEach( ( link ) => link.remove() );
			};

			const refreshCartViews = ( data = {} ) => {
				if ( window.jQuery ) {
					const $body = window.jQuery( document.body );

					// Do not pass the FolioBlocks icon/thumbnail as the button arg:
					// Woo adds a View Cart link after any button it receives.
					$body.trigger( 'added_to_cart', [
						data?.fragments || {},
						data?.cart_hash || '',
					] );
					$body.trigger( 'wc_fragment_refresh' );
				} else {
					document.body.dispatchEvent(
						new CustomEvent( 'added_to_cart', {
							bubbles: true,
							detail: {
								fragments: data?.fragments || {},
								cart_hash: data?.cart_hash || '',
							},
						} )
					);
				}

				document.body.dispatchEvent(
					new CustomEvent( 'wc-blocks_added_to_cart', {
						bubbles: true,
						detail: {
							preserveCartData: false,
						},
					} )
				);

				setTimeout( removeInjectedViewCartLinks, 0 );
				setTimeout( removeInjectedViewCartLinks, 250 );
			};

			const body = new URLSearchParams();
			body.set( 'product_id', String( productId ) );
			body.set( 'quantity', '1' );

			cartBtn.classList.add( 'is-loading' );
			cartBtn.setAttribute( 'aria-busy', 'true' );

			if ( window.jQuery ) {
				window
					.jQuery( document.body )
					.trigger( 'adding_to_cart', [
						window.jQuery( cartBtn ),
						{ product_id: productId, quantity: 1 },
					] );
			}

			fetch( ajaxUrl, {
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
					// Woo returns an error + product_url for things like variable products.
					if ( data?.error ) {
						if ( data?.product_url ) {
							window.location.href = data.product_url;
							return;
						}
						fallbackRedirect();
						return;
					}

					// Update cart fragments if provided (mini-cart, cart count, etc.).
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

							// Woo's fragments are full HTML strings for the selector.
							// Replace the element with the returned fragment.
							try {
								el.outerHTML = html;
							} catch ( err ) {
								// Ignore fragment update failures.
							}
						} );
					}

					refreshCartViews( data );

					cartBtn.classList.remove( 'is-loading' );
					cartBtn.classList.add( 'is-added' );
					cartBtn.removeAttribute( 'aria-busy' );
				} )
				.catch( () => {
					cartBtn.classList.remove( 'is-loading' );
					cartBtn.removeAttribute( 'aria-busy' );
					// If AJAX doesn't work in this environment, fall back to the reliable redirect.
					fallbackRedirect();
				} );
		},
		{ capture: true }
	);
} );
