/** Keep page protection tied to each comparison's lifetime. */
import { getElement, store } from '@wordpress/interactivity';

store( 'folioblocks/before-after', {
	callbacks: {
		protection() {
			const { ref: root } = getElement();
			const controller = new AbortController();
			const { signal } = controller;
			if ( root.getAttribute( 'data-disable-right-click' ) === 'true' ) {
				document.addEventListener(
					'contextmenu',
					( event ) => event.preventDefault(),
					{ signal }
				);
			}
			if ( root.getAttribute( 'data-disable-drag-to-save' ) === 'true' ) {
				root.addEventListener(
					'dragstart',
					( event ) => {
						if ( event.target.closest( 'img, video' ) ) {
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
