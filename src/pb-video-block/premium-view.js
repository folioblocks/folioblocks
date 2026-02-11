/**
 * PB Video Block
 * Premium View JS
 */
document.addEventListener( 'DOMContentLoaded', () => {
	const hasWooCommerce = !! document.querySelector( '.woocommerce' );

	// Disable right-click on entire page if any gallery block has it enabled
	const disableRightClick = document.querySelector(
		'[data-disable-right-click="true"]'
	);
	if ( disableRightClick ) {
		document.addEventListener( 'contextmenu', ( e ) => {
			e.preventDefault();
		} );
	}
} );
