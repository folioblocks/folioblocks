/**
 * PB Video Block
 * Premium View JS
 */
document.addEventListener( 'DOMContentLoaded', () => {
	// Disable right-click on entire page if any gallery block has it enabled
	const disableRightClick = document.querySelector(
		'[data-disable-right-click="true"]'
	);
	if ( disableRightClick ) {
		document.addEventListener( 'contextmenu', ( e ) => {
			e.preventDefault();
		} );
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

					if ( data?.fragments && typeof data.fragments === 'object' ) {
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
							} catch ( err ) {
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
