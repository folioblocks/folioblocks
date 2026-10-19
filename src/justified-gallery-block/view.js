/** Justified layout follows the mounted gallery's lifetime. */
import { getElement, store } from '@wordpress/interactivity';
import { calculateJustifiedLayout } from '../pb-helpers/justifiedLayout';
import {
	mountGalleryLayout,
	resolveGalleryRoot,
} from '../pb-helpers/galleryLifecycle';

const selector = '.wp-block-folioblocks-justified-gallery-block';
const instances = new WeakMap();
const initialize = ( wrapper ) => {
	const container = wrapper.querySelector( '.pb-justified-gallery' );
	if ( ! container ) {
		wrapper.classList.remove( 'is-loading' );
		return;
	}
	const desktopRowHeight = parseInt( container.dataset.rowHeight, 10 ) || 250;
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

	const calculateLayout = () => {
		const containerWidth = container.clientWidth - 1;
		if ( containerWidth <= 0 ) {
			return;
		}
		const targetRowHeight = getRowHeightForWidth( container.clientWidth );
		const gap = getGapForWidth( container.clientWidth );

		const wrappers = container.querySelectorAll(
			'.wp-block-folioblocks-pb-image-block:not(.is-hidden)'
		);
		const images = Array.from( wrappers )
			.filter( ( item ) =>
				item.querySelector( 'figure.pb-image-block img' )
			)
			.map( ( imageWrapper ) => {
				const img = imageWrapper.querySelector(
					'figure.pb-image-block img'
				);
				const width =
					parseInt( img.getAttribute( 'width' ), 10 ) ||
					img.naturalWidth ||
					1;
				const height =
					parseInt( img.getAttribute( 'height' ), 10 ) ||
					img.naturalHeight ||
					1;
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
	};
	const lifecycle = mountGalleryLayout(
		wrapper,
		container,
		calculateLayout,
		'pb:justified:reflow'
	);
	instances.set( wrapper, lifecycle.schedule );
	return () => {
		instances.delete( wrapper );
		lifecycle.dispose();
	};
};
window.folioBlocksJustifiedLayout = ( target ) =>
	instances.get( resolveGalleryRoot( target, selector ) )?.();
store( 'folioblocks/justified', {
	callbacks: {
		initialize() {
			return initialize( getElement().ref );
		},
	},
} );
