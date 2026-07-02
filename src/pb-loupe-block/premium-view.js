document.addEventListener( 'DOMContentLoaded', function () {
	// Disable right-click on entire page if any block has it enabled
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
					'[data-disable-drag-to-save="true"] img, [data-disable-drag-to-save="true"] video'
				);
				if ( protectedMedia ) {
					e.preventDefault();
				}
			},
			{ capture: true }
		);
	}
} );
