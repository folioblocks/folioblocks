/**
 * Scope protection listeners to each Loupe's lifetime. Multiple protected blocks
 * keep their own listeners, so removing one does not disable the others.
 */
import { getElement, store } from '@wordpress/interactivity';

store( 'folioblocks/loupe', {
	callbacks: {
		protection() {
			const { ref, attributes } = getElement();
			const disableRightClick =
				attributes[ 'data-disable-right-click' ] === 'true';
			const disableDragToSave =
				attributes[ 'data-disable-drag-to-save' ] === 'true';
			const controller = new AbortController();
			const { signal } = controller;

			if ( disableRightClick ) {
				document.addEventListener(
					'contextmenu',
					( event ) => event.preventDefault(),
					{ signal }
				);
			}

			if ( disableDragToSave ) {
				document.addEventListener(
					'dragstart',
					( event ) => {
						if (
							ref.contains( event.target ) &&
							event.target.closest( 'img, video' )
						) {
							event.preventDefault();
						}
					},
					{ capture: true, signal }
				);
			}

			return () => controller.abort();
		},
	},
} );
