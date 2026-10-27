/** Grid layout and reveals follow the gallery element's lifetime. */
import { getElement, store } from '@wordpress/interactivity';
import { createFrontendScope } from '../fbks-helpers/frontendScope';

const initializeGrid = ( root ) => {
	const scope = createFrontendScope();
	const grid = root.querySelector( '.pb-grid-gallery' ) || root;
	const items = grid.querySelectorAll(
		'.wp-block-folioblocks-pb-image-block'
	);
	/**
	 * Determine the number of columns currently in use.
	 * We primarily rely on the resolved CSS grid-template-columns value,
	 * which already respects the current breakpoint.
	 */
	const getColumns = () => {
		// Primary: derive tracks from grid-template-columns.
		// Some browsers return expanded tracks ("1fr 1fr ..."), while others may keep repeat().
		const template = window.getComputedStyle( grid ).gridTemplateColumns;
		if ( template && template !== 'none' ) {
			// Handle repeat(N, ...) form
			const repeatMatch = template.match( /repeat\((\d+)\s*,/i );
			if ( repeatMatch && repeatMatch[ 1 ] ) {
				const n = parseInt( repeatMatch[ 1 ], 10 );
				if ( ! isNaN( n ) && n > 0 ) {
					return n;
				}
			}

			// Otherwise count expanded tracks
			const parts = template
				.split( ' ' )
				.filter( ( p ) => p && p.trim() !== '' );
			const count = parts.length;
			if ( count > 0 ) {
				return count;
			}
		}

		// Fallback: try custom vars, then data attribute
		const style = window.getComputedStyle( grid );
		const desktopVar = parseInt(
			style.getPropertyValue( '--grid-cols-desktop' ),
			10
		);
		const tabletVar = parseInt(
			style.getPropertyValue( '--grid-cols-tablet' ),
			10
		);
		const mobileVar = parseInt(
			style.getPropertyValue( '--grid-cols-mobile' ),
			10
		);
		const candidates = [ desktopVar, tabletVar, mobileVar ].filter(
			( v ) => ! isNaN( v ) && v > 0
		);
		if ( candidates.length ) {
			// Use the first valid one as a reasonable fallback
			return candidates[ 0 ];
		}

		const attrColumns = parseInt( grid.getAttribute( 'data-columns' ), 10 );
		if ( ! isNaN( attrColumns ) && attrColumns > 0 ) {
			return attrColumns;
		}

		return 3; // safe default
	};

	/**
	 * Apply layout to each figure using the same logic as the editor:
	 * - Determine grid cell size from gallery width and current column count.
	 * - Use the image's natural dimensions to compute a uniform scale so that
	 *   it fits inside 80% of the cell size on both sides.
	 * - Always set explicit width/height on the figure (no `auto`).
	 */
	const applyLayout = () => {
		const rect = grid.getBoundingClientRect();
		const galleryWidth = rect.width || 0;
		if ( ! galleryWidth ) {
			return;
		}

		const columns = getColumns();
		if ( ! columns ) {
			return;
		}

		// Cell size = usable width per column (account for padding + column gaps).
		const style = window.getComputedStyle( grid );
		const paddingLeft = parseFloat( style.paddingLeft ) || 0;
		const paddingRight = parseFloat( style.paddingRight ) || 0;
		const columnGap = parseFloat( style.columnGap ) || 0;

		const usableWidth =
			galleryWidth -
			paddingLeft -
			paddingRight -
			columnGap * ( columns - 1 );
		if ( ! isFinite( usableWidth ) || usableWidth <= 0 ) {
			return;
		}

		const cellSize = usableWidth / columns;
		const figureMaxSize = cellSize * 0.75;

		// Expose the cell size as a CSS variable (optional but mirrors editor)
		grid.style.setProperty( '--pb-grid-cell-size', `${ cellSize }px` );

		// Target each image block inside the grid
		const blocks = grid.querySelectorAll(
			'.wp-block-folioblocks-pb-image-block'
		);

		blocks.forEach( ( block ) => {
			// Skip items that are hidden by filtering (Pro feature)
			if ( block.classList.contains( 'is-hidden' ) ) {
				return;
			}

			const figure = block.querySelector( 'figure.pb-image-block' );
			const img = figure ? figure.querySelector( 'img' ) : null;
			if ( ! figure || ! img ) {
				return;
			}

			// Reset existing sizing
			figure.style.width = '';
			figure.style.height = '';
			img.style.width = '';
			img.style.height = '';

			const naturalWidth = img.naturalWidth;
			const naturalHeight = img.naturalHeight;

			// If we don't yet know the image's intrinsic size, bail for this one.
			if ( ! naturalWidth || ! naturalHeight ) {
				return;
			}

			// Compute a uniform scale so the image fits within figureMaxSize
			// on both sides while preserving aspect ratio.
			const maxSize = figureMaxSize;
			const scaleX = maxSize / naturalWidth;
			const scaleY = maxSize / naturalHeight;
			const scale = Math.min( scaleX, scaleY );

			// Fallback guard in case of invalid dimensions
			if ( ! isFinite( scale ) || scale <= 0 ) {
				return;
			}

			const targetWidth = naturalWidth * scale;
			const targetHeight = naturalHeight * scale;

			// Always set explicit width and height on the figure
			figure.style.width = `${ targetWidth }px`;
			figure.style.height = `${ targetHeight }px`;

			// Ensure the image fills the figure box explicitly
			img.style.width = '100%';
			img.style.height = '100%';
		} );
	};

	let scheduled = false;
	const scheduleLayout = () => {
		if ( scheduled ) {
			return;
		}
		scheduled = true;
		scope.frame( () => {
			scheduled = false;
			applyLayout();
			// Lazy/offscreen images must not keep the entire gallery hidden.
			root.classList.remove( 'is-loading' );
		} );
	};
	items.forEach( ( item, index ) => {
		const image = item.querySelector( 'figure.pb-image-block img' );
		let settled = false;
		const reveal = () => {
			if ( settled ) {
				return;
			}
			settled = true;
			if ( image ) {
				scope.unlisten( image, 'load', reveal );
				scope.unlisten( image, 'error', reveal );
			}
			scheduleLayout();
			scope.timeout(
				() => item.classList.add( 'is-visible' ),
				index * 120
			);
		};
		if ( ! image || image.complete ) {
			reveal();
		} else {
			scope.listen( image, 'load', reveal );
			scope.listen( image, 'error', reveal );
		}
	} );
	scope.listen( window, 'resize', scheduleLayout );
	scope.listen( root, 'pbGridUpdated', scheduleLayout );
	const observer = new window.ResizeObserver( scheduleLayout );
	observer.observe( grid );
	scheduleLayout();
	return () => {
		observer.disconnect();
		scope.dispose();
	};
};

store( 'folioblocks/grid', {
	callbacks: {
		initialize() {
			return initializeGrid( getElement().ref );
		},
	},
} );
