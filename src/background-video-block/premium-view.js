/** Keep page-wide protection tied to the background block's lifetime. */
import { getElement, store } from '@wordpress/interactivity';

store( 'folioblocks/background-video', {
	callbacks: {
		protection() {
			const { ref } = getElement();
			if ( ref.getAttribute( 'data-disable-right-click' ) !== 'true' ) {
				return;
			}
			const controller = new AbortController();
			document.addEventListener(
				'contextmenu',
				( event ) => event.preventDefault(),
				{ signal: controller.signal }
			);
			return () => controller.abort();
		},
	},
} );
