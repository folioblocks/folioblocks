/**
 * Initialize each Loupe through the element lifecycle, including router navigation.
 */
import { getElement, store } from '@wordpress/interactivity';

const initializeLoupe = ( block, attributes ) => {
	const container = block.querySelector( '.pb-loupe-container' );
	const image = block.querySelector( '.pb-loupe-image' );
	const lens = block.querySelector( '.pb-loupe-lens' );

	if ( ! container || ! image || ! lens ) {
		return;
	}

	const shape = attributes[ 'data-shape' ] || 'circle';
	const theme = attributes[ 'data-theme' ] || 'light';
	const controller = new AbortController();
	const { signal } = controller;

	// Apply shape + theme classes
	lens.classList.add( `pb-loupe-${ shape }` );
	lens.classList.add( `pb-loupe-${ theme }` );

	let isVisible = false;
	const loupeSize = 150;
	let isTouching = false;

	const updateLens = ( x, y ) => {
		lens.style.width = `${ loupeSize }px`;
		lens.style.height = `${ loupeSize }px`;
		const crect = container.getBoundingClientRect();
		lens.style.left = `${ x - crect.left - loupeSize / 2 }px`;

		if ( isTouching ) {
			// Position loupe ABOVE the finger on touch
			lens.style.top = `${ y - crect.top - loupeSize + 20 }px`;
		} else {
			// Normal centered behaviour for mouse
			lens.style.top = `${ y - crect.top - loupeSize / 2 }px`;
		}

		const rect = container.getBoundingClientRect();
		const relX = ( ( x - rect.left ) / rect.width ) * 100;
		const relY = ( ( y - rect.top ) / rect.height ) * 100;

		const baseZoom = 2000;
		const scale = rect.width / 600;

		lens.style.backgroundImage = `url(${ image.src })`;
		lens.style.backgroundSize = `${ baseZoom * scale }% auto`;
		lens.style.backgroundPosition = `${ relX }% ${ relY }%`;
	};

	const show = () => {
		lens.style.opacity = '1';
		isVisible = true;
	};

	const hide = () => {
		lens.style.opacity = '0';
		isVisible = false;
	};

	hide();

	container.addEventListener(
		'mousemove',
		( e ) => {
			isTouching = false;
			const x = e.clientX;
			const y = e.clientY;
			container.style.cursor = 'none';
			show();
			updateLens( x, y );
		},
		{ signal }
	);

	container.addEventListener(
		'mouseleave',
		() => {
			hide();
			container.style.cursor = 'auto';
		},
		{ signal }
	);

	// Touch support: tap to toggle, drag to move
	let lastTap = 0;

	container.addEventListener(
		'touchstart',
		( e ) => {
			isTouching = true;
			e.preventDefault();
			const now = Date.now();
			const elapsed = now - lastTap;

			const touch = e.touches[ 0 ];
			const x = touch.clientX;
			const y = touch.clientY;

			if ( elapsed < 300 ) {
				hide();
			} else {
				show();
				updateLens( x, y );
			}

			lastTap = now;
		},
		{ passive: false, signal }
	);

	container.addEventListener(
		'touchmove',
		( e ) => {
			isTouching = true;
			if ( ! isVisible ) {
				return;
			}
			e.preventDefault();
			const touch = e.touches[ 0 ];
			updateLens( touch.clientX, touch.clientY );
		},
		{ passive: false, signal }
	);

	return () => {
		controller.abort();
		hide();
		container.style.cursor = '';
		lens.classList.remove( `pb-loupe-${ shape }`, `pb-loupe-${ theme }` );
	};
};

store( 'folioblocks/loupe', {
	callbacks: {
		initialize() {
			const { ref } = getElement();
			const block = ref.closest( '.wp-block-folioblocks-pb-loupe-block' );
			return initializeLoupe( block, {
				'data-shape': block.getAttribute( 'data-shape' ),
				'data-theme': block.getAttribute( 'data-theme' ),
			} );
		},
	},
} );
