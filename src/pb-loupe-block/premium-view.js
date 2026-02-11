document.addEventListener( 'DOMContentLoaded', function () {
	const galleries = document.querySelectorAll(
		'.wp-block-folioblocks-pb-loupe-block'
	);

	// Disable right-click on entire page if any block has it enabled
	const disableRightClick = document.querySelector(
		'[data-disable-right-click="true"]'
	);
	if ( disableRightClick ) {
		document.addEventListener( 'contextmenu', ( e ) => {
			e.preventDefault();
		} );
	}
} );
