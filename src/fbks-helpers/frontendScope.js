/** Track resources owned by a mounted frontend feature. */
export const createFrontendScope = () => {
	const controller = new AbortController();
	const listeners = new Set();
	const frames = new Set();
	const timers = new Set();
	const intervals = new Set();
	const scope = {
		signal: controller.signal,
		listen( target, event, handler, options ) {
			if ( ! target ) {
				return;
			}
			target.addEventListener( event, handler, options );
			listeners.add( { target, event, handler, options } );
		},
		unlisten( target, event, handler, options ) {
			target.removeEventListener( event, handler, options );
			listeners.forEach( ( entry ) => {
				if (
					entry.target === target &&
					entry.event === event &&
					entry.handler === handler
				) {
					listeners.delete( entry );
				}
			} );
		},
		frame( callback ) {
			const id = window.requestAnimationFrame( () => {
				frames.delete( id );
				if ( ! controller.signal.aborted ) {
					callback();
				}
			} );
			frames.add( id );
			return id;
		},
		timeout( callback, delay ) {
			const id = window.setTimeout( () => {
				timers.delete( id );
				if ( ! controller.signal.aborted ) {
					callback();
				}
			}, delay );
			timers.add( id );
			return id;
		},
		interval( callback, delay ) {
			const id = window.setInterval( () => {
				if ( ! controller.signal.aborted ) {
					callback();
				}
			}, delay );
			intervals.add( id );
			return id;
		},
		dispose() {
			controller.abort();
			listeners.forEach( ( { target, event, handler, options } ) =>
				target.removeEventListener( event, handler, options )
			);
			listeners.clear();
			frames.forEach( ( id ) => window.cancelAnimationFrame( id ) );
			timers.forEach( ( id ) => window.clearTimeout( id ) );
			intervals.forEach( ( id ) => window.clearInterval( id ) );
			intervals.clear();
			frames.clear();
			timers.clear();
		},
	};
	return scope;
};
