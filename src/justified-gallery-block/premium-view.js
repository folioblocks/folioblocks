/**
 * Justified Gallery Block
 * Premium View JS
 */
document.addEventListener( 'DOMContentLoaded', () => {
	const getBlockCategories = ( wrapper ) => {
		const categoriesAttr = wrapper?.getAttribute( 'data-filters' ) || '';
		const categories = categoriesAttr
			.split( ',' )
			.map( ( category ) => category.trim() )
			.filter( Boolean );

		if ( categories.length > 0 ) {
			return categories;
		}

		const legacyCategory = wrapper?.getAttribute( 'data-filter' ) || '';
		return legacyCategory.trim() ? [ legacyCategory.trim() ] : [];
	};

	// Disable right-click on entire page if any gallery block has it enabled
	const disableRightClick = document.querySelector(
		'[data-disable-right-click="true"]'
	);
	if ( disableRightClick ) {
		document.addEventListener( 'contextmenu', ( e ) => {
			e.preventDefault();
		} );
	}

	// Filter Controls Setup
	const setupFilterControls = () => {
		document
			.querySelectorAll( '.pb-justified-gallery' )
			.forEach( ( container ) => {
				const wrapper =
					container.closest(
						'.wp-block-folioblocks-justified-gallery-block, [data-active-filter]'
					) || container.parentElement;
				const filterBar = wrapper
					? wrapper.querySelector( '.pb-image-gallery-filters' )
					: null;

				if ( ! filterBar ) {
					return;
				}

				const allItems = container.querySelectorAll(
					'.wp-block-folioblocks-pb-image-block'
				);

				filterBar.addEventListener( 'click', ( e ) => {
					const button = e.target.closest( '.filter-button' );
					if ( ! button ) {
						return;
					}

					const selected =
						button.getAttribute( 'data-filter' ) ||
						button.textContent.trim();
					const normalizedSelected = selected.trim().toLowerCase();

					filterBar
						.querySelectorAll( '.filter-button' )
						.forEach( ( btn ) => {
							btn.classList.toggle( 'is-active', btn === button );
						} );

					allItems.forEach( ( item ) => {
						const categories = getBlockCategories( item );
						const matchesFilter =
							normalizedSelected === 'all' ||
							categories.some(
								( category ) =>
									category.toLowerCase() ===
									normalizedSelected
							);
						if ( matchesFilter ) {
							item.classList.remove( 'is-hidden' );
						} else {
							item.classList.add( 'is-hidden' );
						}
					} );

					window.requestAnimationFrame( () => {
						if (
							typeof window.folioBlocksJustifiedLayout ===
							'function'
						) {
							window.folioBlocksJustifiedLayout( container );
						} else {
							// Fallback: let view.js listen for this event.
							container.dispatchEvent(
								new CustomEvent( 'pb:justified:reflow', {
									bubbles: true,
								} )
							);
						}
					} );
				} );
			} );
	};
	window.addEventListener( 'load', () => {
		if ( typeof setupFilterControls === 'function' ) {
			setupFilterControls();
		}
	} );
} );
