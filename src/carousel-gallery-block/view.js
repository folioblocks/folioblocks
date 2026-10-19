import { getElement, store } from '@wordpress/interactivity';
import { createFrontendScope } from '../pb-helpers/frontendScope';
const initializeCarousel = ( block ) => {
	const gallery = block.querySelector( '.pb-carousel-gallery' );
	if ( ! gallery ) {
		return;
	}

	const scope = createFrontendScope();
	const loopSlides = block.dataset.loop === 'true';
	const verticalOnMobile = block.dataset.verticalOnMobile === 'true';
	const originalSlides = Array.from( gallery.children ).filter(
		( slide ) => ! slide.hasAttribute( 'data-pb-carousel-clone' )
	);
	let trackSlides = originalSlides;
	let currentIndex = 0;
	let isReady = false;
	let isResetting = false;
	let scrollSyncTimeout;
	let moving = false;
	const pendingSteps = [];

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

	const buildLoopTrack = () => {
		trackSlides = Array.from( gallery.children );
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
		gallery.scrollTo( {
			left: getCenteredLeft( target ),
			behavior: smooth ? 'smooth' : 'instant',
		} );
		return true;
	};

	const normalizeLogicalIndex = ( index ) => {
		if ( ! originalSlides.length ) {
			return -1;
		}
		if ( loopSlides ) {
			return (
				( ( index % originalSlides.length ) + originalSlides.length ) %
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
		pendingSteps.length = 0;
		moving = false;
		window.clearTimeout( scrollSyncTimeout );
		currentIndex = nextIndex;
		return scrollToTrackIndex(
			logicalToTrackIndex( nextIndex ),
			opts.smooth !== false
		);
	};

	// Complete each movement before crossing back from a decorative loop copy.
	// Retargeting a native smooth scroll during that jump can expose an empty track.
	const step = ( direction, opts = { smooth: true } ) => {
		if ( ! originalSlides.length ) {
			return false;
		}
		if ( moving ) {
			pendingSteps.push( { direction, opts } );
			return true;
		}
		const nextIndex = currentIndex + direction;
		if (
			! loopSlides &&
			( nextIndex < 0 || nextIndex >= originalSlides.length )
		) {
			return false;
		}
		const targetIndex = logicalToTrackIndex( currentIndex ) + direction;
		currentIndex = normalizeLogicalIndex( nextIndex );
		moving = true;
		window.clearTimeout( scrollSyncTimeout );
		scrollToTrackIndex(
			originalSlides.length === 1 ? 0 : targetIndex,
			opts.smooth !== false
		);
		// Also settles a no-op movement (for example a one-image gallery).
		scrollSyncTimeout = scope.timeout( finishMovement, 100 );
		return true;
	};
	const next = ( opts ) => step( 1, opts );
	const previous = ( opts ) => step( -1, opts );

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
			if ( nearestTrackIndex < count || nearestTrackIndex >= count * 2 ) {
				isResetting = true;
				scrollToTrackIndex(
					logicalToTrackIndex( currentIndex ),
					false
				);
				scope.frame( () => {
					isResetting = false;
				} );
			}
		} else {
			currentIndex = nearestTrackIndex;
		}
		return currentIndex;
	};

	const finishMovement = () => {
		syncCurrentIndex();
		moving = false;
		// Let the instant loop reset paint before starting another smooth scroll.
		scope.frame( () => {
			if ( moving ) {
				return;
			}
			while ( pendingSteps.length ) {
				const pending = pendingSteps.shift();
				if ( step( pending.direction, pending.opts ) ) {
					break;
				}
			}
		} );
	};

	buildLoopTrack();
	gallery.style.setProperty( 'overflow-anchor', 'none' );
	gallery.style.overflowX = 'hidden';
	applyHeight();

	gallery.__pbCarousel = {
		getCurrentIndex: () => currentIndex,
		isMoving: () => moving || pendingSteps.length > 0,
		getSlides: () => originalSlides,
		isLooping: () => loopSlides,
		next,
		previous,
		scrollToSlide,
		syncCurrentIndex,
	};

	block.querySelectorAll( '.pb-carousel-chevron' ).forEach( ( button ) => {
		scope.listen( button, 'click', () => {
			if ( button.classList.contains( 'prev' ) ) {
				previous();
			} else {
				next();
			}
		} );
	} );

	scope.listen( gallery, 'keydown', ( event ) => {
		if ( event.key === 'ArrowRight' ) {
			event.preventDefault();
			next();
		} else if ( event.key === 'ArrowLeft' ) {
			event.preventDefault();
			previous();
		}
	} );

	scope.listen( gallery, 'scroll', () => {
		if ( ! isReady ) {
			return;
		}
		window.clearTimeout( scrollSyncTimeout );
		scrollSyncTimeout = scope.timeout( finishMovement, 100 );
	} );

	const initialize = () => {
		applyHeight();
		scrollToSlide( 0, { smooth: false } );
		scope.frame( () => {
			scrollToSlide( 0, { smooth: false } );
			gallery.style.overflowX = '';
			gallery.setAttribute( 'tabindex', '0' );
			gallery.classList.add( 'pb-carousel-ready' );
			block.classList.remove( 'is-loading' );
			block.classList.add( 'pb-carousel-loaded' );
			isReady = true;
			gallery.dispatchEvent( new Event( 'pb:carousel:ready' ) );
		} );
	};

	scope.frame( initialize );

	const handleResize = () => {
		applyHeight();
		if ( isReady ) {
			scrollToSlide( currentIndex, { smooth: false } );
		}
	};
	originalSlides.forEach( ( slide ) => {
		const image = slide.querySelector( 'img' );
		if ( image && ! image.complete ) {
			scope.listen( image, 'load', handleResize, { once: true } );
			scope.listen( image, 'error', handleResize, { once: true } );
		}
	} );

	const resizeObserver = new window.ResizeObserver( handleResize );
	resizeObserver.observe( gallery.parentElement );
	scope.listen( window, 'resize', handleResize );

	gallery.dispatchEvent( new Event( 'pb:carousel:initialized' ) );
	return () => {
		scope.dispose();
		resizeObserver.disconnect();
		delete gallery.__pbCarousel;
	};
};
store( 'folioblocks/carousel', {
	callbacks: {
		initialize() {
			return initializeCarousel( getElement().ref );
		},
	},
} );
