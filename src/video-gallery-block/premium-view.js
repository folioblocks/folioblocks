/** Filters and protection belong to the mounted Video Gallery. */
import { getElement, store } from '@wordpress/interactivity';
import { createFrontendScope } from '../fbks-helpers/frontendScope';
import { mountGalleryControls } from '../fbks-helpers/galleryControls';

store( 'folioblocks/video-gallery', {
	callbacks: {
		premium() {
			const root = getElement().ref.closest(
				'.wp-block-folioblocks-video-gallery-block'
			);
			const scope = createFrontendScope();
			const unprotect = mountGalleryControls(
				root,
				root,
				'pb:video-gallery:reflow'
			);
			const buttons = root.querySelectorAll(
				'.pb-video-gallery-filters .filter-button'
			);
			const items = root.querySelectorAll(
				'.wp-block-folioblocks-pb-video-block'
			);
			const filter = ( selected ) => {
				const value = ( selected || 'all' ).trim().toLowerCase();
				root.setAttribute( 'data-active-filter', value );
				buttons.forEach( ( button ) =>
					button.classList.toggle(
						'is-active',
						( button.dataset.filter || '' ).trim().toLowerCase() ===
							value
					)
				);
				items.forEach( ( item ) => {
					const video = item.querySelector( '.pb-video-block' );
					const categories = (
						video?.dataset.filters ||
						video?.dataset.filter ||
						''
					)
						.split( ',' )
						.map( ( category ) => category.trim().toLowerCase() );
					item.classList.toggle(
						'is-hidden',
						value !== 'all' && ! categories.includes( value )
					);
				} );
			};
			buttons.forEach( ( button ) =>
				scope.listen( button, 'click', () =>
					filter( button.dataset.filter )
				)
			);
			if ( buttons.length ) {
				filter( root.getAttribute( 'data-active-filter' ) );
			}
			return () => {
				scope.dispose();
				unprotect();
			};
		},
	},
} );
