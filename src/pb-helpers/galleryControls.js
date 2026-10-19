/** Filters and page protection owned by one gallery instance. */
import { createFrontendScope } from './frontendScope';

const categoriesFor = ( item ) => {
	const categories = ( item.getAttribute( 'data-filters' ) || '' )
		.split( ',' )
		.map( ( value ) => value.trim().toLowerCase() )
		.filter( Boolean );
	return categories.length
		? categories
		: [ ( item.getAttribute( 'data-filter' ) || '' ).trim().toLowerCase() ];
};

export const mountGalleryControls = ( root, container, reflowEvent ) => {
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
	const items = container.querySelectorAll(
		'.wp-block-folioblocks-pb-image-block'
	);
	const filter = ( selected ) => {
		const value = ( selected || 'all' ).trim().toLowerCase();
		root.setAttribute( 'data-active-filter', value );
		buttons.forEach( ( button ) =>
			button.classList.toggle(
				'is-active',
				( button.getAttribute( 'data-filter' ) || button.textContent )
					.trim()
					.toLowerCase() === value
			)
		);
		items.forEach( ( item ) =>
			item.classList.toggle(
				'is-hidden',
				value !== 'all' && ! categoriesFor( item ).includes( value )
			)
		);
		container.dispatchEvent( new Event( reflowEvent ) );
	};
	buttons.forEach( ( button ) =>
		scope.listen( button, 'click', () =>
			filter( button.getAttribute( 'data-filter' ) || button.textContent )
		)
	);
	if ( buttons.length ) {
		filter( root.getAttribute( 'data-active-filter' ) );
	}
	return () => scope.dispose();
};
