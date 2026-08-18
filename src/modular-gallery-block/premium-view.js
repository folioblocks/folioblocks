/**
 * Modular Gallery Block
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

	// Disable drag-to-save for protected Modular Gallery images.
	const disableDragToSave = document.querySelector(
		'[data-disable-drag-to-save="true"]'
	);
	if ( disableDragToSave ) {
		document.addEventListener(
			'dragstart',
			( e ) => {
				const protectedMedia = e.target.closest(
					'[data-disable-drag-to-save="true"] img, [data-disable-drag-to-save="true"] video, .pb-image-lightbox img'
				);
				if ( protectedMedia ) {
					e.preventDefault();
				}
			},
			{ capture: true }
		);
	}
} );
