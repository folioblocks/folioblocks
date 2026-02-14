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
		const container = document.querySelector( '.pb-justified-gallery' );
		if ( ! container ) {
			return;
		}

		const filterBar = document.querySelector( '.pb-image-gallery-filters' );
		const allItems = container.querySelectorAll(
			'.wp-block-folioblocks-pb-image-block'
		);

		if ( ! filterBar ) {
			return;
		}

		filterBar.addEventListener( 'click', ( e ) => {
			if ( ! e.target.matches( '.filter-button' ) ) {
				return;
			}

			const selected =
				e.target.getAttribute( 'data-filter' ) ||
				e.target.textContent.trim();
			const normalizedSelected = selected.trim().toLowerCase();

			document.querySelectorAll( '.filter-button' ).forEach( ( btn ) => {
				btn.classList.toggle( 'is-active', btn === e.target );
			} );

			allItems.forEach( ( item ) => {
				const categories = getBlockCategories( item );
				const matchesFilter =
					normalizedSelected === 'all' ||
					categories.some(
						( category ) =>
							category.toLowerCase() === normalizedSelected
					);
				if ( matchesFilter ) {
					item.classList.remove( 'is-hidden' );
				} else {
					item.classList.add( 'is-hidden' );
				}
			} );

			requestAnimationFrame( () => {
				if ( typeof window.folioBlocksJustifiedLayout === 'function' ) {
					window.folioBlocksJustifiedLayout( container );
				} else {
					// Fallback: let view.js listen for this event
					container.dispatchEvent(
						new CustomEvent( 'pb:justified:reflow', {
							bubbles: true,
						} )
					);
				}
			} );
		} );
	};
	window.addEventListener( 'load', () => {
		if ( typeof setupFilterControls === 'function' ) {
			setupFilterControls();
		}
	} );
} );
