const MAX_ROTATE_X = 4;
const MAX_ROTATE_Y = 8;

export const updateTiltHoverVars = ( element, event ) => {
	if ( ! element || ! event ) {
		return;
	}

	const rect = element.getBoundingClientRect();
	if ( ! rect.width || ! rect.height ) {
		return;
	}

	const x = ( ( event.clientX - rect.left ) / rect.width - 0.5 ) * 2;
	const y = ( ( event.clientY - rect.top ) / rect.height - 0.5 ) * 2;

	element.style.setProperty(
		'--pb-tilt-x',
		`${ ( -y * MAX_ROTATE_X ).toFixed( 2 ) }deg`
	);
	element.style.setProperty(
		'--pb-tilt-y',
		`${ ( x * MAX_ROTATE_Y ).toFixed( 2 ) }deg`
	);
};

export const resetTiltHoverVars = ( element ) => {
	if ( ! element ) {
		return;
	}

	element.style.setProperty( '--pb-tilt-x', '0deg' );
	element.style.setProperty( '--pb-tilt-y', '0deg' );
};

export const getTiltHoverHandlers = () => ( {
	onPointerMove: ( event ) =>
		updateTiltHoverVars( event.currentTarget, event ),
	onPointerLeave: ( event ) => resetTiltHoverVars( event.currentTarget ),
} );

export const initTiltHoverEffects = ( root = document ) => {
	if (
		typeof window !== 'undefined' &&
		window.matchMedia?.( '(hover: none)' ).matches
	) {
		return;
	}

	root.querySelectorAll( '.pb-effect-tilt' ).forEach( ( element ) => {
		if ( element.dataset.pbTiltHoverReady === 'true' ) {
			return;
		}

		element.dataset.pbTiltHoverReady = 'true';
		element.addEventListener( 'pointermove', ( event ) =>
			updateTiltHoverVars( element, event )
		);
		element.addEventListener( 'pointerleave', () =>
			resetTiltHoverVars( element )
		);
	} );
};
