// Masonry Gallery Block - View JS
document.addEventListener( 'DOMContentLoaded', () => {
	const galleries = document.querySelectorAll(
		'.wp-block-folioblocks-masonry-gallery-block'
	);
	const layoutInstances = new WeakMap();

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

	const resolveGalleryWrapper = ( galleryEl ) => {
		if ( ! galleryEl ) {
			return null;
		}

		if (
			galleryEl.classList.contains(
				'wp-block-folioblocks-masonry-gallery-block'
			)
		) {
			return galleryEl;
		}

		return galleryEl.closest(
			'.wp-block-folioblocks-masonry-gallery-block'
		);
	};

	const initGallery = ( gallery ) => {
		const innerGallery = gallery.querySelector( '.pb-masonry-gallery' );
		if ( ! innerGallery ) {
			return;
		}

		gallery.classList.add( 'is-loading' );

		const getColumnsForWidth = ( width ) => {
			if ( width <= 600 ) {
				return parseColumnClass( innerGallery, 'm', 2 );
			}
			if ( width <= 1024 ) {
				return parseColumnClass( innerGallery, 't', 4 );
			}
			return parseColumnClass( innerGallery, 'd', 6 );
		};

		const applyCustomMasonryLayout = () => {
			const gap = gallery.closest( '.no-gap' ) ? 0 : 10;
			const columns = getColumnsForWidth( innerGallery.offsetWidth );
			const columnHeights = Array( columns ).fill( 0 );
			const columnWidth = Math.round(
				( innerGallery.offsetWidth - gap * ( columns - 1 ) ) / columns
			);

			innerGallery
				.querySelectorAll( '.wp-block-folioblocks-pb-image-block' )
				.forEach( ( item ) => {
					item.style.position = '';
					item.style.top = '';
					item.style.left = '';
					item.style.width = '';
				} );

			const items = innerGallery.querySelectorAll(
				'.wp-block-folioblocks-pb-image-block:not(.is-hidden)'
			);

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
				columnHeights[ minCol ] +=
					item.offsetHeight + gap + marginBottom;
			} );

			innerGallery.style.height = `${
				items.length ? Math.max( ...columnHeights ) : 0
			}px`;
		};

		layoutInstances.set( gallery, applyCustomMasonryLayout );

		const images = innerGallery.querySelectorAll( 'img' );
		const fallbackTimeout = setTimeout( applyCustomMasonryLayout, 1000 );

		if ( images.length === 0 ) {
			applyCustomMasonryLayout();
			gallery.classList.remove( 'is-loading' );
		}

		const observer =
			'IntersectionObserver' in window
				? new window.IntersectionObserver(
						( entries ) => {
							let shouldRecalculate = false;
							entries.forEach( ( entry ) => {
								if ( entry.isIntersecting ) {
									shouldRecalculate = true;
									observer.unobserve( entry.target );
								}
							} );
							if ( shouldRecalculate ) {
								applyCustomMasonryLayout();
								gallery.classList.remove( 'is-loading' );
							}
						},
						{
							rootMargin: '200px',
							threshold: 0.1,
						}
				  )
				: null;

		images.forEach( ( img ) => {
			if ( img.complete && img.naturalHeight !== 0 ) {
				applyCustomMasonryLayout();
				gallery.classList.remove( 'is-loading' );
			} else if ( observer ) {
				observer.observe( img );
			} else {
				img.addEventListener( 'load', applyCustomMasonryLayout, {
					once: true,
				} );
				img.addEventListener( 'error', applyCustomMasonryLayout, {
					once: true,
				} );
			}
		} );

		const resizeObserver =
			'ResizeObserver' in window
				? new window.ResizeObserver( () => {
						applyCustomMasonryLayout();
				  } )
				: null;

		if ( resizeObserver ) {
			resizeObserver.observe( gallery );
		}

		window.addEventListener( 'resize', applyCustomMasonryLayout );

		window.addEventListener( 'pagehide', () => {
			clearTimeout( fallbackTimeout );
			window.removeEventListener( 'resize', applyCustomMasonryLayout );
			resizeObserver?.disconnect();
			observer?.disconnect();
		} );

		// Sequential fade-in for masonry gallery images, scoped per gallery.
		innerGallery
			.querySelectorAll( '.wp-block-folioblocks-pb-image-block' )
			.forEach( ( block, index ) => {
				block.style.opacity = 0;
				block.style.transform = 'translateY(20px)';
				block.style.transition =
					'opacity 0.6s ease, transform 0.6s ease';
				setTimeout( () => {
					block.style.opacity = 1;
					block.style.transform = 'translateY(0)';
				}, index * 150 );
			} );
	};

	galleries.forEach( initGallery );

	window.pbApplyMasonryLayout = ( galleryEl ) => {
		const gallery = resolveGalleryWrapper( galleryEl );
		const applyLayout = layoutInstances.get( gallery );

		if ( applyLayout ) {
			applyLayout();
		}
	};
} );
