/** Initialize comparisons for both full loads and client-side navigation. */
import { getElement, store } from '@wordpress/interactivity';

store( 'folioblocks/before-after', {
	callbacks: {
		initialize() {
			const { ref: container } = getElement();
			const slider = container.querySelector( '.pb-slider' );
			const beforeWrapper =
				container.querySelector( '.pb-before-wrapper' );
			const afterImage = container.querySelector( '.pb-after-image' );
			const handle = container.querySelector( '.pb-slider-handle' );
			if ( ! slider || ! beforeWrapper || ! afterImage || ! handle ) {
				return;
			}

			const controller = new AbortController();
			const { signal } = controller;
			const isVertical = container.classList.contains( 'is-vertical' );
			const updatePosition = () => {
				const value = Number( slider.value );
				beforeWrapper.style.clipPath = isVertical
					? `inset(0 0 ${ 100 - value }% 0)`
					: `inset(0 ${ 100 - value }% 0 0)`;
				handle.style[ isVertical ? 'top' : 'left' ] = `${ value }%`;
			};
			const updateHeight = () => {
				if ( afterImage.naturalWidth && afterImage.naturalHeight ) {
					container.style.height = `${
						container.offsetWidth *
						( afterImage.naturalHeight / afterImage.naturalWidth )
					}px`;
				}
			};

			updatePosition();
			updateHeight();
			afterImage.addEventListener( 'load', updateHeight, { signal } );
			window.addEventListener( 'resize', updateHeight, { signal } );
			const observer = new window.ResizeObserver( updateHeight );
			observer.observe( container );
			slider.addEventListener( 'input', updatePosition, { signal } );
			slider.addEventListener(
				'wheel',
				( event ) => {
					if ( ! isVertical ) {
						return;
					}
					event.preventDefault();
					slider.value = Math.min(
						100,
						Math.max(
							0,
							Number( slider.value ) +
								( event.deltaY > 0 ? 2 : -2 )
						)
					);
					updatePosition();
				},
				{ passive: false, signal }
			);

			return () => {
				controller.abort();
				observer.disconnect();
			};
		},
	},
} );
