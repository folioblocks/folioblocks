/**
 * Video Gallery Block
 * Premium View JS
 */
document.addEventListener( 'DOMContentLoaded', () => {
	const getBlockCategories = ( figure ) => {
		const categoriesAttr = figure?.getAttribute( 'data-filters' ) || '';
		const categories = categoriesAttr
			.split( ',' )
			.map( ( category ) => category.trim() )
			.filter( Boolean );

		if ( categories.length > 0 ) {
			return categories;
		}

		const legacyCategory = figure?.getAttribute( 'data-filter' ) || '';
		return legacyCategory.trim() ? [ legacyCategory.trim() ] : [];
	};

	const galleries = document.querySelectorAll(
		'.wp-block-folioblocks-video-gallery-block'
	);

	galleries.forEach( ( galleryBlock ) => {
		const filterButtons = galleryBlock.querySelectorAll(
			'.pb-video-gallery-filters .filter-button'
		);
		const videoBlockWrappers = galleryBlock.querySelectorAll(
			'.wp-block-folioblocks-pb-video-block'
		);

		// Filter functionality
		filterButtons.forEach( ( button ) => {
			button.addEventListener( 'click', () => {
				const selected = button.getAttribute( 'data-filter' );
				const normalizedSelected = ( selected || '' )
					.trim()
					.toLowerCase();

				filterButtons.forEach( ( btn ) =>
					btn.classList.remove( 'is-active' )
				);
				button.classList.add( 'is-active' );

				videoBlockWrappers.forEach( ( wrapper ) => {
					const figure = wrapper.querySelector( '.pb-video-block' );
					const blockCategories = getBlockCategories( figure );
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

	// Disable right-click on entire page if any gallery block has it enabled
	const disableRightClick = document.querySelector(
		'[data-disable-right-click="true"]'
	);
	if ( disableRightClick ) {
		document.addEventListener( 'contextmenu', ( e ) => {
			e.preventDefault();
		} );
	}
} );
