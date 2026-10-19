/** Background media follows the Interactivity API element lifecycle. */
import { getElement, store } from '@wordpress/interactivity';

const prefersReducedMotion = () =>
	window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
const isMobileBreakpoint = () =>
	window.matchMedia( '(max-width: 782px)' ).matches;
const shouldAllowAutoplay = ( data ) =>
	! prefersReducedMotion() &&
	! ( data.disableMobile && isMobileBreakpoint() );
const readPercentVar = ( root, name, fallback ) => {
	const value = Number.parseFloat(
		window.getComputedStyle( root ).getPropertyValue( name )
	);
	return Number.isFinite( value )
		? Math.min( 100, Math.max( 0, value ) )
		: fallback;
};

const buildVimeoSrc = ( vimeoId, { autoplay, loop } ) => {
	// Vimeo background mode. Also enable Do Not Track by default.
	const params = new URLSearchParams();
	params.set( 'background', '1' );
	params.set( 'autoplay', autoplay ? '1' : '0' );
	params.set( 'loop', loop ? '1' : '0' );
	// Background videos are always silent.
	params.set( 'muted', '1' );
	params.set( 'title', '0' );
	params.set( 'byline', '0' );
	params.set( 'portrait', '0' );
	params.set( 'dnt', '1' );

	return `https://player.vimeo.com/video/${ vimeoId }?${ params.toString() }`;
};

// One sizing function and one observer per Vimeo instance.
const createVimeoCover = ( rootEl, wrapEl, iframeEl, videoRatio ) => {
	const safeRatio =
		Number.isFinite( videoRatio ) && videoRatio > 0 ? videoRatio : 16 / 9;

	return () => {
		const rect = wrapEl.getBoundingClientRect();
		// Round up container size to avoid fractional rects.
		const cw = Math.ceil( rect.width );
		const ch = Math.ceil( rect.height );
		if ( ! cw || ! ch ) {
			return;
		}

		const containerRatio = cw / ch;
		let width;
		let height;

		// Calculate the ideal cover size.
		if ( containerRatio > safeRatio ) {
			width = cw;
			height = cw / safeRatio;
		} else {
			height = ch;
			width = ch * safeRatio;
		}

		// Pixel-perfect safety:
		// - Round *up* to avoid sub-pixel gaps.
		// - Add a small bleed so the iframe always overcovers the container.
		const bleed = 4; // px
		width = Math.ceil( width ) + bleed;
		height = Math.ceil( height ) + bleed;

		// Clamp focal point to [0..100] to avoid invalid values.
		const fx = readPercentVar( rootEl, '--pb-bgvid-pos-x', 50 );
		const fy = readPercentVar( rootEl, '--pb-bgvid-pos-y', 50 );

		// Compute how much the iframe overflows the container.
		const overflowX = Math.max( 0, width - cw );
		const overflowY = Math.max( 0, height - ch );

		// Pixel-perfect focal point positioning (background-position semantics):
		// 0% -> align left/top, 50% -> center, 100% -> align right/bottom.
		const leftPx = -Math.round( overflowX * ( fx / 100 ) );
		const topPx = -Math.round( overflowY * ( fy / 100 ) );

		iframeEl.style.position = 'absolute';
		iframeEl.style.left = `${ leftPx }px`;
		iframeEl.style.top = `${ topPx }px`;
		iframeEl.style.transform = 'none';
		iframeEl.style.width = `${ width }px`;
		iframeEl.style.height = `${ height }px`;
		iframeEl.style.border = '0';
		iframeEl.style.display = 'block';
	};
};

const mountSelfHosted = ( root, data, signal ) => {
	const video = root.querySelector( '.pb-bgvid__video' );
	if ( ! video || ! data.url ) {
		return;
	}
	let wantsPlayback = shouldAllowAutoplay( data );
	let visible = true;
	let attempt = 0;
	const pause = () => {
		attempt++;
		video.pause();
	};
	const play = async () => {
		if (
			signal.aborted ||
			! wantsPlayback ||
			! visible ||
			! shouldAllowAutoplay( data )
		) {
			return;
		}
		const currentAttempt = ++attempt;
		try {
			await video.play();
			if ( signal.aborted ) {
				video.pause();
				return;
			}
			if ( currentAttempt === attempt && wantsPlayback && visible ) {
				root.classList.add( 'is-playing' );
			}
		} catch {
			if ( ! signal.aborted && currentAttempt === attempt ) {
				root.classList.remove( 'is-playing' );
			}
		}
	};
	video.muted = true;
	video.loop = !! data.loop;
	video.playsInline = true;
	video.preload = 'metadata';
	if ( ! ( data.disableMobile && isMobileBreakpoint() ) ) {
		video.src = data.url;
		video.style.display = 'block';
		play();
	}
	let observer;
	if ( 'IntersectionObserver' in window ) {
		observer = new window.IntersectionObserver(
			( entries ) => {
				visible = entries[ 0 ].isIntersecting;
				if ( visible ) {
					play();
				} else {
					pause();
				}
			},
			{ threshold: 0.15 }
		);
		observer.observe( root );
	}
	if ( data.playOnHover ) {
		root.addEventListener(
			'mouseenter',
			() => {
				wantsPlayback = shouldAllowAutoplay( data );
				play();
			},
			{ signal }
		);
		root.addEventListener(
			'mouseleave',
			() => {
				wantsPlayback = false;
				pause();
				root.classList.remove( 'is-playing' );
			},
			{ signal }
		);
	}
	return () => {
		observer?.disconnect();
		wantsPlayback = false;
		pause();
		video.removeAttribute( 'src' );
		video.load();
		video.style.display = 'none';
		root.classList.remove( 'is-playing' );
	};
};

const mountVimeo = ( root, data, signal ) => {
	const wrap = root.querySelector( '.pb-bgvid__vimeo' );
	const iframe = wrap?.querySelector( 'iframe' );
	if ( ! iframe || ! data.vimeoId || ! shouldAllowAutoplay( data ) ) {
		return;
	}
	let ratio = data.vimeoAspectRatio;
	let frame;
	let framesRemaining = 0;
	const resize = () => {
		if ( ! signal.aborted ) {
			createVimeoCover( root, wrap, iframe, ratio )();
		}
	};
	const settle = () => {
		resize();
		if ( --framesRemaining > 0 && ! signal.aborted ) {
			frame = window.requestAnimationFrame( settle );
		}
	};
	iframe.addEventListener(
		'load',
		() => {
			window.cancelAnimationFrame( frame );
			framesRemaining = 4;
			frame = window.requestAnimationFrame( settle );
		},
		{ signal }
	);
	let observer;
	if ( 'ResizeObserver' in window ) {
		observer = new window.ResizeObserver( resize );
		observer.observe( wrap );
	}
	// Window resize also updates focal points when only the breakpoint changes.
	window.addEventListener( 'resize', resize, { signal } );
	iframe.src = buildVimeoSrc( data.vimeoId, {
		autoplay: true,
		loop: !! data.loop,
	} );
	resize();
	root.classList.add( 'is-playing' );
	if ( ! ( Number.isFinite( ratio ) && ratio > 0 ) ) {
		fetch(
			`https://vimeo.com/api/oembed.json?url=${ encodeURIComponent(
				`https://vimeo.com/${ data.vimeoId }`
			) }`,
			{ signal }
		)
			.then( ( response ) => ( response.ok ? response.json() : null ) )
			.then( ( metadata ) => {
				if ( signal.aborted ) {
					return;
				}
				const nextRatio =
					Number( metadata?.width ) / Number( metadata?.height );
				if ( Number.isFinite( nextRatio ) && nextRatio > 0 ) {
					ratio = nextRatio;
					resize();
				}
			} )
			.catch( () => {} );
	}
	return () => {
		observer?.disconnect();
		window.cancelAnimationFrame( frame );
		iframe.removeAttribute( 'src' );
		root.classList.remove( 'is-playing' );
	};
};

store( 'folioblocks/background-video', {
	callbacks: {
		initialize() {
			const { ref } = getElement();
			const root = ref.closest( '[data-fbks-bgvid]' );
			let data;
			try {
				data = JSON.parse( root.getAttribute( 'data-fbks-bgvid' ) );
			} catch {
				return;
			}
			if ( ! data ) {
				return;
			}
			const controller = new AbortController();
			let cleanup;
			if ( data.provider === 'self' ) {
				cleanup = mountSelfHosted( root, data, controller.signal );
			} else if ( data.provider === 'vimeo' ) {
				cleanup = mountVimeo( root, data, controller.signal );
			}
			return () => {
				controller.abort();
				cleanup?.();
			};
		},
	},
} );
