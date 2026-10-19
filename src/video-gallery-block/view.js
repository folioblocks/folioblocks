/** Reveal each Video Gallery when its router region mounts. */
import { getElement, store } from '@wordpress/interactivity';

store( 'folioblocks/video-gallery', {
	callbacks: {
		initialize() {
			getElement().ref.classList.remove( 'is-loading' );
		},
	},
} );
