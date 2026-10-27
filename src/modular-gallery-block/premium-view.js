/** Protection belongs to the mounted Modular gallery. */
import { getElement, store } from '@wordpress/interactivity';
import { mountGalleryControls } from '../fbks-helpers/galleryControls';
store( 'folioblocks/modular', {
	callbacks: {
		premium() {
			const { ref: container } = getElement();
			return mountGalleryControls(
				container.closest(
					'.wp-block-folioblocks-modular-gallery-block'
				),
				container,
				'pb:modular:reflow'
			);
		},
	},
} );
