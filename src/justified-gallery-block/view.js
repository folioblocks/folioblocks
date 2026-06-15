// Justified Gallery Block - View JS
import { calculateJustifiedLayout } from '../pb-helpers/justifiedLayout';

document.addEventListener( 'DOMContentLoaded', () => {
	const containers = document.querySelectorAll( '.pb-justified-gallery' );
	const layoutInstances = new WeakMap();

	const initGallery = ( container ) => {
		const wrapper = container.closest(
			'.wp-block-folioblocks-justified-gallery-block'
		);
		if ( wrapper ) {
			wrapper.classList.add( 'is-loading' );
		}

		const desktopRowHeight =
			parseInt( container.dataset.rowHeight, 10 ) || 250;
		const parsedTabletRowHeight = parseInt(
			container.dataset.tabletRowHeight,
			10
		);
		const parsedMobileRowHeight = parseInt(
			container.dataset.mobileRowHeight,
			10
		);
		const tabletRowHeight = Number.isFinite( parsedTabletRowHeight )
			? parsedTabletRowHeight
			: desktopRowHeight;
		const mobileRowHeight = Number.isFinite( parsedMobileRowHeight )
			? parsedMobileRowHeight
			: desktopRowHeight;
		const noGap = container.dataset.noGap === 'true';
		const getRowHeightForWidth = ( width ) => {
			if ( width <= 600 ) {
				return mobileRowHeight;
			}
			if ( width <= 1024 ) {
				return tabletRowHeight;
			}
			return desktopRowHeight;
		};
		const getGapForWidth = ( width ) => {
			if ( noGap ) {
				return 0;
			}

			const styles = window.getComputedStyle( wrapper || container );
			let property = '--pb-gallery-gap-desktop';
			if ( width <= 600 ) {
				property = '--pb-gallery-gap-mobile';
			} else if ( width <= 1024 ) {
				property = '--pb-gallery-gap-tablet';
			}

			const gap = parseFloat( styles.getPropertyValue( property ) );
			return Number.isFinite( gap ) ? gap : 10;
		};

		let resizeTimeout;
		let hasAnimated = false;

		const calculateLayout = () => {
			const containerWidth = container.clientWidth - 1;
			if ( ! containerWidth ) {
				return;
			}
			const targetRowHeight = getRowHeightForWidth(
				container.clientWidth
			);
			const gap = getGapForWidth( container.clientWidth );

			const wrappers = container.querySelectorAll(
				'.wp-block-folioblocks-pb-image-block:not(.is-hidden)'
			);
			const images = Array.from( wrappers ).map( ( imageWrapper ) => {
				const img = imageWrapper.querySelector( 'img' );
				const width = parseInt( img.getAttribute( 'width' ), 10 ) || 1;
				const height =
					parseInt( img.getAttribute( 'height' ), 10 ) || 1;
				return { wrapper: imageWrapper, width, height };
			} );

			const rows = calculateJustifiedLayout( {
				items: images.map( ( img ) => ( {
					...img,
					aspectRatio: img.width / img.height,
				} ) ),
				containerWidth,
				targetRowHeight,
				gap,
			} );

			rows.forEach( ( row ) => {
				row.forEach( ( img, index ) => {
					img.wrapper.style.setProperty(
						'--pb-width',
						`${ img.layoutWidth }px`
					);
					img.wrapper.style.setProperty(
						'--pb-height',
						`${ img.layoutHeight }px`
					);
					const isLastInRow = index === row.length - 1;
					const inlineMarginValue =
						! isLastInRow && gap > 0 ? `${ gap }px` : '0px';
					const blockMarginValue = gap > 0 ? `${ gap }px` : '0px';
					img.wrapper.style.setProperty(
						'--pb-margin-inline',
						inlineMarginValue
					);
					img.wrapper.style.setProperty(
						'--pb-margin-block',
						blockMarginValue
					);
				} );
			} );

			if ( wrapper ) {
				wrapper.classList.remove( 'is-loading' );
			}

			// One-time sequential fade-in for this justified gallery only.
			if ( ! hasAnimated ) {
				hasAnimated = true;
				const gridBlocks = container.querySelectorAll(
					'.wp-block-folioblocks-pb-image-block'
				);
				gridBlocks.forEach( ( block, index ) => {
					block.style.opacity = 0;
					block.style.transform = 'translateY(20px)';
					block.style.transition =
						'opacity 0.6s ease, transform 0.6s ease';
					setTimeout( () => {
						block.style.opacity = 1;
						block.style.transform = 'translateY(0)';
					}, index * 150 );
				} );
			}
		};

		layoutInstances.set( container, calculateLayout );

		// Also listen for an event-based reflow from premium-view.js.
		container.addEventListener( 'pb:justified:reflow', () => {
			window.requestAnimationFrame( calculateLayout );
		} );

		const handleResizeEnd = () => {
			clearTimeout( resizeTimeout );
			resizeTimeout = setTimeout( () => {
				window.requestAnimationFrame( calculateLayout );
			}, 150 );
		};

		window.addEventListener( 'load', () => {
			window.requestAnimationFrame( calculateLayout );
		} );

		window.addEventListener( 'resize', () => {
			window.requestAnimationFrame( calculateLayout );
			handleResizeEnd();
		} );

		setTimeout( () => {
			window.requestAnimationFrame( calculateLayout );
		}, 100 );
	};

	containers.forEach( initGallery );

	// Expose a public reflow helper for premium-view.js. Accepts either the gallery block or the inner .pb-justified-gallery.
	window.folioBlocksJustifiedLayout = ( targetNode ) => {
		let target = targetNode;
		if ( ! target || ! ( target instanceof window.Element ) ) {
			return;
		}

		if ( ! target.classList.contains( 'pb-justified-gallery' ) ) {
			target = target.querySelector?.( '.pb-justified-gallery' );
		}

		const calculateLayout = layoutInstances.get( target );
		if ( ! calculateLayout ) {
			return;
		}

		window.requestAnimationFrame( calculateLayout );
	};
} );
