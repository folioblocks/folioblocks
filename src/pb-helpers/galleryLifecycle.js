/** Own a gallery's scheduled layouts, image listeners and reveal timers. */
import { createFrontendScope } from './frontendScope';

export const mountGalleryLayout = (
	root,
	container,
	layout,
	reflowEvent,
	revealDelay = ( index ) => index * 150
) => {
	const scope = createFrontendScope();
	let scheduled = false;
	const schedule = () => {
		if ( scheduled ) {
			return;
		}
		scheduled = true;
		scope.frame( () => {
			scheduled = false;
			layout();
			root.classList.remove( 'is-loading' );
		} );
	};
	const observer = new window.ResizeObserver( schedule );
	observer.observe( container );
	container
		.querySelectorAll( '.wp-block-folioblocks-pb-image-block' )
		.forEach( ( item, index ) => {
			observer.observe( item );
			const image = item.querySelector( 'figure.pb-image-block img' );
			if ( image ) {
				scope.listen( image, 'load', schedule );
				scope.listen( image, 'error', schedule );
			}
			scope.timeout( () => {
				item.style.opacity = '1';
				item.style.transform = 'translateY(0)';
			}, revealDelay( index ) );
		} );
	scope.listen( container, reflowEvent, schedule );
	scope.listen( window, 'resize', schedule );
	scope.listen( window, 'folioblocks:proofing-filter-change', schedule );
	schedule();
	return {
		schedule,
		dispose() {
			observer.disconnect();
			scope.dispose();
		},
	};
};

export const resolveGalleryRoot = ( target, selector ) => {
	if ( ! ( target instanceof window.Element ) ) {
		return null;
	}
	return target.closest( selector ) || target.querySelector( selector );
};
