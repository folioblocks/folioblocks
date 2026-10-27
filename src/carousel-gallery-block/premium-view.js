/** Carousel autoplay and protection follow their mounted gallery. */
import { getElement, store } from '@wordpress/interactivity';
import { createFrontendScope } from '../fbks-helpers/frontendScope';
import { mountGalleryControls } from '../fbks-helpers/galleryControls';

store( 'folioblocks/carousel', {
	callbacks: {
		premium() {
			const { ref: gallery } = getElement();
			const block = gallery.closest(
				'.wp-block-folioblocks-carousel-gallery-block'
			);
			const scope = createFrontendScope();
			const unprotect = mountGalleryControls(
				block,
				gallery,
				'pb:carousel:reflow'
			);
			const playButton = block.querySelector(
				'.pb-carousel-play-button'
			);
			const pauseButton = block.querySelector(
				'.pb-carousel-pause-button'
			);
			const hasControls =
				block.dataset.showControls === 'true' ||
				!! block.querySelector(
					'.pb-carousel-controls, .pb-carousel-play-button'
				);
			const enabled = block.dataset.autoplay === 'true';
			let playing = enabled && ! hasControls;
			let timer;
			const icons = () => {
				const playIcon = playButton?.querySelector( '.play-icon' );
				const pauseIcon = playButton?.querySelector( '.pause-icon' );
				if ( playIcon ) {
					playIcon.style.display = playing ? 'none' : 'inline';
				}
				if ( pauseIcon ) {
					pauseIcon.style.display = playing ? 'inline' : 'none';
				}
				playButton?.setAttribute( 'aria-pressed', String( playing ) );
				pauseButton?.setAttribute(
					'aria-pressed',
					String( ! playing )
				);
			};
			const schedule = () => {
				window.clearTimeout( timer );
				if (
					! playing ||
					! gallery.classList.contains( 'pb-carousel-ready' )
				) {
					return;
				}
				timer = scope.timeout(
					() => {
						if ( gallery.__pbCarousel?.isMoving() ) {
							schedule();
							return;
						}
						if ( ! gallery.__pbCarousel?.next() ) {
							playing = false;
							icons();
							return;
						}
						schedule();
					},
					Math.max(
						0.25,
						Number( block.dataset.autoplaySpeed ) || 3
					) * 1000
				);
			};
			scope.listen( gallery, 'pb:carousel:ready', schedule );
			if ( enabled && playButton ) {
				scope.listen( playButton, 'click', ( event ) => {
					event.preventDefault();
					event.stopPropagation();
					playing = pauseButton ? true : ! playing;
					icons();
					schedule();
				} );
			}
			if ( enabled && pauseButton ) {
				scope.listen( pauseButton, 'click', ( event ) => {
					event.preventDefault();
					event.stopPropagation();
					playing = false;
					icons();
					schedule();
				} );
			}
			icons();
			schedule();
			return () => {
				scope.dispose();
				unprotect();
			};
		},
	},
} );
