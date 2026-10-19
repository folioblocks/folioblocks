/** Grid filters and page protection are scoped to each gallery. */
import { getElement, store } from '@wordpress/interactivity';
import { createFrontendScope } from '../pb-helpers/frontendScope';

const categoriesFor = ( item ) => {
	const categories = ( item.getAttribute( 'data-filters' ) || '' )
		.split( ',' )
		.map( ( value ) => value.trim().toLowerCase() )
		.filter( Boolean );
	if ( categories.length ) {
		return categories;
	}
	return [
		( item.getAttribute( 'data-filter' ) || '' ).trim().toLowerCase(),
	];
};

store( 'folioblocks/grid', {
	callbacks: {
		premium() {
			const root = getElement().ref.closest(
				'.wp-block-folioblocks-grid-gallery-block'
			);
			const scope = createFrontendScope();
			if ( root.getAttribute( 'data-disable-right-click' ) === 'true' ) {
				scope.listen( document, 'contextmenu', ( event ) =>
					event.preventDefault()
				);
			}
			if ( root.getAttribute( 'data-disable-drag-to-save' ) === 'true' ) {
				scope.listen(
					root,
					'dragstart',
					( event ) => {
						if ( event.target.closest( 'img, video' ) ) {
							event.preventDefault();
						}
					},
					{ capture: true }
				);
			}
			const buttons = root.querySelectorAll(
				'.pb-image-gallery-filters .filter-button'
			);
			const items = root.querySelectorAll(
				'.pb-grid-gallery > .wp-block-folioblocks-pb-image-block'
			);
			const filter = ( selected ) => {
				const value = ( selected || 'all' ).trim().toLowerCase();
				root.setAttribute( 'data-active-filter', value );
				buttons.forEach( ( button ) =>
					button.classList.toggle(
						'is-active',
						( button.getAttribute( 'data-filter' ) || '' )
							.trim()
							.toLowerCase() === value
					)
				);
				items.forEach( ( item ) =>
					item.classList.toggle(
						'is-hidden',
						value !== 'all' &&
							! categoriesFor( item ).includes( value )
					)
				);
				root.dispatchEvent( new Event( 'pbGridUpdated' ) );
			};
			buttons.forEach( ( button ) =>
				scope.listen( button, 'click', () =>
					filter( button.getAttribute( 'data-filter' ) )
				)
			);
			filter( root.getAttribute( 'data-active-filter' ) );
			return () => scope.dispose();
		},
	},
} );
