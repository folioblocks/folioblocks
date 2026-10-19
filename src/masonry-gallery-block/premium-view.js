/** Gallery controls initialize and clean up with their element. */
import { getElement, store } from '@wordpress/interactivity';
import { mountGalleryControls } from '../pb-helpers/galleryControls';
store( 'folioblocks/masonry', {
	callbacks: {
		premium() {
			const { ref: container } = getElement();
			return mountGalleryControls(
				container.closest(
					'.wp-block-folioblocks-masonry-gallery-block'
				),
				container,
				'pb:masonry:reflow'
			);
		},
	},
} );
