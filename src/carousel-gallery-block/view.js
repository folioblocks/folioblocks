// Carousel Gallery Block - View JS
document.addEventListener( 'DOMContentLoaded', () => {
	const blocks = document.querySelectorAll(
		'.wp-block-folioblocks-carousel-gallery-block'
	);

	blocks.forEach( ( block ) => {
		const gallery = block.querySelector( '.pb-carousel-gallery' );
		if ( ! gallery ) {
			return;
		}

		const loopSlides = block.dataset.loop === 'true';
		const verticalOnMobile = block.dataset.verticalOnMobile === 'true';
		let originalSlides = Array.from( gallery.children );
		let trackSlides = originalSlides;
		let currentIndex = 0;
		let isReady = false;
		let isResetting = false;
		let scrollSyncTimeout;
		let boundaryResetTimeout;

		const applyHeight = () => {
			const width = gallery.offsetWidth;
			const isMobile = width <= 768;
			const [ w, h ] = isMobile && verticalOnMobile ? [ 2, 3 ] : [ 3, 2 ];
			const idealHeight = Math.round( width * 0.85 * ( h / w ) );
			gallery.style.setProperty(
				'--pb-carousel-height',
				`${ Math.min( idealHeight, window.innerHeight * 0.85 ) }px`
			);
		};

		const prepareClone = ( slide, position ) => {
			const clone = slide.cloneNode( true );
			clone.dataset.pbCarouselClone = position;
			clone.setAttribute( 'aria-hidden', 'true' );
			clone.setAttribute( 'inert', '' );
			clone.removeAttribute( 'id' );
			clone
				.querySelectorAll( '[id]' )
				.forEach( ( element ) => element.removeAttribute( 'id' ) );
			clone
				.querySelectorAll( '.pb-image-block-lightbox' )
				.forEach( ( element ) =>
					element.classList.remove( 'pb-image-block-lightbox' )
				);
			clone
				.querySelectorAll(
					'a, button, input, select, textarea, [tabindex]'
				)
				.forEach( ( element ) =>
					element.setAttribute( 'tabindex', '-1' )
				);
			return clone;
		};

		const buildLoopTrack = () => {
			if ( ! loopSlides || originalSlides.length < 2 ) {
				trackSlides = originalSlides;
				return;
			}

			const before = originalSlides.map( ( slide ) =>
				prepareClone( slide, 'before' )
			);
			const after = originalSlides.map( ( slide ) =>
				prepareClone( slide, 'after' )
			);
			const fragment = document.createDocumentFragment();
			[ ...before, ...originalSlides, ...after ].forEach( ( slide ) =>
				fragment.appendChild( slide )
			);
			gallery.appendChild( fragment );
			trackSlides = Array.from( gallery.children );
		};

		const rebuildLoopTrack = () => {
			gallery
				.querySelectorAll( '[data-pb-carousel-clone]' )
				.forEach( ( clone ) => clone.remove() );
			originalSlides = Array.from( gallery.children );
			trackSlides = originalSlides;
			currentIndex = 0;
			buildLoopTrack();
			scrollToSlide( 0, { smooth: false } );
		};

		const logicalToTrackIndex = ( index ) =>
			loopSlides && originalSlides.length > 1
				? originalSlides.length + index
				: index;

		const getCenteredLeft = ( slide ) => {
			if ( ! slide ) {
				return 0;
			}
			return Math.max(
				0,
				Math.floor(
					slide.offsetLeft -
						( gallery.clientWidth - slide.clientWidth ) / 2
				)
			);
		};

		const scrollToTrackIndex = ( trackIndex, smooth = true ) => {
			const target = trackSlides[ trackIndex ];
			if ( ! target ) {
				return false;
			}
			const previousScrollBehavior = gallery.style.scrollBehavior;
			if ( ! smooth ) {
				gallery.style.scrollBehavior = 'auto';
			}
			gallery.scrollTo( {
				left: getCenteredLeft( target ),
				behavior: smooth ? 'smooth' : 'auto',
			} );
			if ( ! smooth ) {
				window.requestAnimationFrame( () => {
					gallery.style.scrollBehavior = previousScrollBehavior;
				} );
			}
			return true;
		};

		const normalizeLogicalIndex = ( index ) => {
			if ( ! originalSlides.length ) {
				return -1;
			}
			if ( loopSlides ) {
				return (
					( ( index % originalSlides.length ) +
						originalSlides.length ) %
					originalSlides.length
				);
			}
			return Math.max( 0, Math.min( index, originalSlides.length - 1 ) );
		};

		const scrollToSlide = ( index, opts = { smooth: true } ) => {
			const nextIndex = normalizeLogicalIndex( index );
			if ( nextIndex < 0 ) {
				return false;
			}
			currentIndex = nextIndex;
			return scrollToTrackIndex(
				logicalToTrackIndex( nextIndex ),
				opts.smooth !== false
			);
		};

		const scheduleBoundaryReset = ( logicalIndex ) => {
			isResetting = true;
			window.clearTimeout( boundaryResetTimeout );
			boundaryResetTimeout = window.setTimeout( () => {
				scrollToTrackIndex( logicalToTrackIndex( logicalIndex ), false );
				window.requestAnimationFrame( () => {
					isResetting = false;
				} );
			}, 500 );
		};

		const next = ( opts = { smooth: true } ) => {
			if ( ! loopSlides && currentIndex >= originalSlides.length - 1 ) {
				return false;
			}
			if ( loopSlides && currentIndex === originalSlides.length - 1 ) {
				currentIndex = 0;
				const didScroll = scrollToTrackIndex(
					originalSlides.length * 2,
					opts.smooth !== false
				);
				if ( didScroll ) {
					scheduleBoundaryReset( currentIndex );
				}
				return didScroll;
			}
			return scrollToSlide( currentIndex + 1, opts );
		};

		const previous = ( opts = { smooth: true } ) => {
			if ( ! loopSlides && currentIndex <= 0 ) {
				return false;
			}
			if ( loopSlides && currentIndex === 0 ) {
				currentIndex = originalSlides.length - 1;
				const didScroll = scrollToTrackIndex(
					originalSlides.length - 1,
					opts.smooth !== false
				);
				if ( didScroll ) {
					scheduleBoundaryReset( currentIndex );
				}
				return didScroll;
			}
			return scrollToSlide( currentIndex - 1, opts );
		};

		const syncCurrentIndex = () => {
			if ( ! trackSlides.length || isResetting ) {
				return currentIndex;
			}
			const scrollCenter = gallery.scrollLeft + gallery.clientWidth / 2;
			let nearestTrackIndex = 0;
			let nearestDistance = Infinity;
			trackSlides.forEach( ( slide, index ) => {
				const distance = Math.abs(
					scrollCenter - ( slide.offsetLeft + slide.clientWidth / 2 )
				);
				if ( distance < nearestDistance ) {
					nearestDistance = distance;
					nearestTrackIndex = index;
				}
			} );

			if ( loopSlides && originalSlides.length > 1 ) {
				const count = originalSlides.length;
				currentIndex = ( nearestTrackIndex - count + count ) % count;
				if (
					nearestTrackIndex < count ||
					nearestTrackIndex >= count * 2
				) {
					isResetting = true;
					scrollToTrackIndex(
						logicalToTrackIndex( currentIndex ),
						false
					);
					window.requestAnimationFrame( () => {
						isResetting = false;
					} );
				}
			} else {
				currentIndex = nearestTrackIndex;
			}
			return currentIndex;
		};

		buildLoopTrack();
		gallery.style.setProperty( 'overflow-anchor', 'none' );
		gallery.style.overflowX = 'hidden';
		applyHeight();

		gallery.__pbCarousel = {
			getCurrentIndex: () => currentIndex,
			getSlides: () => originalSlides,
			isLooping: () => loopSlides,
			next,
			previous,
			scrollToSlide,
			syncCurrentIndex,
		};

		block
			.querySelectorAll( '.pb-carousel-chevron' )
			.forEach( ( button ) => {
				button.addEventListener( 'click', () => {
					if ( button.classList.contains( 'prev' ) ) {
						previous();
					} else {
						next();
					}
				} );
			} );

		gallery.addEventListener( 'keydown', ( event ) => {
			if ( event.key === 'ArrowRight' ) {
				event.preventDefault();
				next();
			} else if ( event.key === 'ArrowLeft' ) {
				event.preventDefault();
				previous();
			}
		} );

		gallery.addEventListener( 'scroll', () => {
			if ( ! isReady ) {
				return;
			}
			window.clearTimeout( scrollSyncTimeout );
			scrollSyncTimeout = window.setTimeout( syncCurrentIndex, 100 );
		} );

		const initialize = () => {
			applyHeight();
			scrollToSlide( 0, { smooth: false } );
			window.requestAnimationFrame( () => {
				scrollToSlide( 0, { smooth: false } );
				gallery.style.overflowX = '';
				gallery.setAttribute( 'tabindex', '0' );
				gallery.classList.add( 'pb-carousel-ready' );
				isReady = true;
			} );
		};

		const firstImage = gallery.querySelector( 'img' );
		if ( ! firstImage || firstImage.complete ) {
			window.requestAnimationFrame( initialize );
		} else {
			firstImage.addEventListener( 'load', initialize, { once: true } );
			firstImage.addEventListener( 'error', initialize, { once: true } );
		}

		const resizeObserver = new window.ResizeObserver( () => {
			applyHeight();
			if ( isReady ) {
				scrollToSlide( currentIndex, { smooth: false } );
			}
		} );
		resizeObserver.observe( gallery.parentElement );

		document.addEventListener( 'pbGalleryUpdated', rebuildLoopTrack );
	} );
} );
