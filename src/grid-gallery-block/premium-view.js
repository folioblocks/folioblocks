/**
 * Grid Gallery Block
 * Premium View JS
 */
document.addEventListener( 'DOMContentLoaded', function () {
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

	const galleries = document.querySelectorAll(
		'.wp-block-folioblocks-grid-gallery-block'
	);

	// Disable right-click on entire page if any gallery block has it enabled
	const disableRightClick = document.querySelector(
		'[data-disable-right-click="true"]'
	);
	if ( disableRightClick ) {
		document.addEventListener( 'contextmenu', ( e ) => {
			e.preventDefault();
		} );
	}

	// Gallery filtering logic
	galleries.forEach( ( galleryBlock ) => {
		const filterButtons = galleryBlock.querySelectorAll(
			'.pb-image-gallery-filters .filter-button'
		);
		const imageBlockWrappers = galleryBlock.querySelectorAll(
			'.wp-block-folioblocks-pb-image-block'
		);

		filterButtons.forEach( ( button ) => {
			button.addEventListener( 'click', () => {
				const selected = button.getAttribute( 'data-filter' );
				const normalizedSelected = ( selected || '' )
					.trim()
					.toLowerCase();

				// Toggle active state
				filterButtons.forEach( ( btn ) =>
					btn.classList.remove( 'is-active' )
				);
				button.classList.add( 'is-active' );

				// Show/hide full wrapper blocks based on filter
				imageBlockWrappers.forEach( ( wrapper ) => {
					const blockCategories = getBlockCategories( wrapper );
					const matchesFilter =
						normalizedSelected === 'all' ||
						blockCategories.some(
							( category ) =>
								category.toLowerCase() === normalizedSelected
						);

					if ( matchesFilter ) {
						wrapper.classList.remove( 'is-hidden' );
					} else {
						wrapper.classList.add( 'is-hidden' );
					}
				} );
			} );
		} );
	} );
} );
