/**
 * Background Video Block
 * Premium View JS
 */
document.addEventListener( 'DOMContentLoaded', () => {
	// Disable right-click on entire page if any block has it enabled.
	const disableRightClick = document.querySelector(
		'[data-disable-right-click="true"]'
	);
	if ( disableRightClick ) {
		document.addEventListener( 'contextmenu', ( e ) => e.preventDefault(), {
			passive: false,
		} );
	}
} );
