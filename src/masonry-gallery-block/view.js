/** Masonry layout follows the mounted gallery's lifetime. */
import { getElement, store } from '@wordpress/interactivity';
import {
	mountGalleryLayout,
	resolveGalleryRoot,
} from '../pb-helpers/galleryLifecycle';
const selector = '.wp-block-folioblocks-masonry-gallery-block';
const instances = new WeakMap();
const parseColumnClass = ( innerGallery, breakpoint, fallback ) => {
	return Math.max(
		parseInt(
			innerGallery.className.match(
				new RegExp( `cols-${ breakpoint }-(\\d+)` )
			)?.[ 1 ] || fallback,
			10
		),
		1
	);
};

const initialize = ( gallery ) => {
	const innerGallery = gallery.querySelector( '.pb-masonry-gallery' );
	if ( ! innerGallery ) {
		gallery.classList.remove( 'is-loading' );
		return;
	}
	const getColumnsForWidth = ( width ) => {
		if ( width <= 600 ) {
			return parseColumnClass( innerGallery, 'm', 2 );
		}
		if ( width <= 1024 ) {
			return parseColumnClass( innerGallery, 't', 4 );
		}
		return parseColumnClass( innerGallery, 'd', 6 );
	};

	const getGapForWidth = ( width ) => {
		if ( gallery.classList.contains( 'no-gap' ) ) {
			return 0;
		}

		const styles = window.getComputedStyle( gallery );
		let property = '--pb-gallery-gap-desktop';
		if ( width <= 600 ) {
			property = '--pb-gallery-gap-mobile';
		} else if ( width <= 1024 ) {
			property = '--pb-gallery-gap-tablet';
		}

		const gap = parseFloat( styles.getPropertyValue( property ) );
		return Number.isFinite( gap ) ? gap : 10;
	};

	const applyCustomMasonryLayout = () => {
		if ( innerGallery.offsetWidth <= 0 ) {
			return;
		}
		const gap = getGapForWidth( innerGallery.offsetWidth );
		const columns = getColumnsForWidth( innerGallery.offsetWidth );
		const columnHeights = Array( columns ).fill( 0 );
		const columnWidth = Math.round(
			( innerGallery.offsetWidth - gap * ( columns - 1 ) ) / columns
		);
		const wrappers = innerGallery.querySelectorAll(
			'.pb-image-block-wrapper'
		);
		const layoutSelector = wrappers.length
			? '.pb-image-block-wrapper'
			: '.wp-block-folioblocks-pb-image-block';

		innerGallery.querySelectorAll( layoutSelector ).forEach( ( item ) => {
			item.style.position = '';
			item.style.top = '';
			item.style.left = '';
			item.style.width = '';

			if ( item.classList.contains( 'pb-image-block-wrapper' ) ) {
				const imageBlock = item.querySelector(
					'.wp-block-folioblocks-pb-image-block'
				);
				item.classList.toggle(
					'is-hidden',
					!! imageBlock?.classList.contains( 'is-hidden' )
				);
			}
		} );

		const items = Array.from(
			innerGallery.querySelectorAll(
				`${ layoutSelector }:not(.is-hidden)`
			)
		).filter( ( item ) => {
			const imageBlock = item.classList.contains(
				'wp-block-folioblocks-pb-image-block'
			)
				? item
				: item.querySelector( '.wp-block-folioblocks-pb-image-block' );

			return ! imageBlock?.classList.contains( 'is-hidden' );
		} );

		items.forEach( ( item ) => {
			const minCol = columnHeights.indexOf(
				Math.min( ...columnHeights )
			);

			item.style.position = 'absolute';
			item.style.width = `${ columnWidth }px`;
			item.style.top = `${ Math.round( columnHeights[ minCol ] ) }px`;
			item.style.left = `${ Math.round(
				( columnWidth + gap ) * minCol
			) }px`;

			const style = window.getComputedStyle( item );
			const marginBottom = parseFloat( style.marginBottom ) || 0;
			columnHeights[ minCol ] += item.offsetHeight + gap + marginBottom;
		} );

		innerGallery.style.height = `${
			items.length ? Math.max( ...columnHeights ) : 0
		}px`;
	};

	const lifecycle = mountGalleryLayout(
		gallery,
		innerGallery,
		applyCustomMasonryLayout,
		'pb:masonry:reflow'
	);
	instances.set( gallery, lifecycle.schedule );
	return () => {
		instances.delete( gallery );
		lifecycle.dispose();
	};
};
window.pbApplyMasonryLayout = ( target ) =>
	instances.get( resolveGalleryRoot( target, selector ) )?.();
store( 'folioblocks/masonry', {
	callbacks: {
		initialize() {
			return initialize( getElement().ref );
		},
	},
} );
