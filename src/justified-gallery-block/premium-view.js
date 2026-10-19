/** Gallery controls initialize and clean up with their element. */
import { getElement, store } from '@wordpress/interactivity';
import { mountGalleryControls } from '../pb-helpers/galleryControls';
store( 'folioblocks/justified', {
	callbacks: {
		premium() {
			const { ref: container } = getElement();
			return mountGalleryControls(
				container.closest(
					'.wp-block-folioblocks-justified-gallery-block'
				),
				container,
				'pb:justified:reflow'
			);
		},
	},
} );
