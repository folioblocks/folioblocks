/**
 * Background Video Block
 * Frontend View JS
 *
 * Responsibilities:
 * - Read `data-fbks-bgvid` JSON payload from render.php.
 * - For self-hosted video: set src, apply playback flags, attempt autoplay with graceful fallback.
 * - For Vimeo: inject an iframe when autoplay is allowed; otherwise leave poster visible.
 * - Respect prefers-reduced-motion.
 */

/**
 * Parse JSON from a DOM attribute.
 *
 * Note:
 * - In View Source you'll see escaped sequences like `\/` and `&quot;`.
 * - In the DOM, `getAttribute()` typically returns a decoded string.
 * @param el
 * @param attrName
 */
const parseJsonAttribute = ( el, attrName ) => {
	const raw = el.getAttribute( attrName );
	if ( ! raw ) {
		return null;
	}

	try {
		return JSON.parse( raw );
	} catch ( err ) {
		// Fallback: decode a few common entities and try again.
		try {
			const decoded = raw
				.replaceAll( '&quot;', '"' )
				.replaceAll( '&#34;', '"' )
				.replaceAll( '&amp;', '&' );
			return JSON.parse( decoded );
		} catch ( err2 ) {
			return null;
		}
	}
};

const prefersReducedMotion = () => {
	return !! (
		window.matchMedia &&
		window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
	);
};

const isMobileBreakpoint = () => {
	// WordPress commonly treats <=782px as "mobile".
	return !! (
		window.matchMedia && window.matchMedia( '(max-width: 782px)' ).matches
	);
};

const attemptPlay = async ( videoEl ) => {
	if ( ! videoEl ) {
		return false;
	}

	try {
		const playPromise = videoEl.play();
		if ( playPromise && typeof playPromise.then === 'function' ) {
			await playPromise;
		}
		return true;
	} catch ( e ) {
		return false;
	}
};

const setupPauseWhenOffscreen = ( rootEl, videoEl ) => {
	if ( ! videoEl ) {
		return;
	}
	if ( ! ( 'IntersectionObserver' in window ) ) {
		return;
	}

	const io = new IntersectionObserver(
		( entries ) => {
			entries.forEach( ( entry ) => {
				if ( entry.isIntersecting ) {
					// Only resume if this block is in a playing state.
					if ( rootEl.classList.contains( 'is-playing' ) ) {
						attemptPlay( videoEl );
					}
				} else {
					try {
						videoEl.pause();
					} catch ( e ) {
						// no-op
					}
				}
			} );
		},
		{ threshold: 0.15 }
	);

	io.observe( rootEl );
};

const shouldAllowAutoplay = ( data ) => {
	// Autoplay is always desired for background video.
	// We only block it when the environment indicates we should.
	if ( prefersReducedMotion() ) {
		return false;
	}
	if ( data.disableMobile && isMobileBreakpoint() ) {
		return false;
	}
	return true;
};

const mountSelfHosted = async ( rootEl, data ) => {
	const videoEl = rootEl.querySelector( '.pb-bgvid__video' );
	if ( ! videoEl ) {
		return;
	}

	const url = data?.url;
	if ( ! url ) {
		return;
	}

	// If disabled on mobile, keep poster-only.
	if ( data?.disableMobile && isMobileBreakpoint() ) {
		rootEl.classList.remove( 'is-playing' );
		videoEl.style.display = 'none';
		return;
	}

	// Apply attributes.
	// Background videos are always silent.
	videoEl.muted = true;
	videoEl.loop = !! data.loop;
	videoEl.playsInline = true;
	videoEl.preload = 'metadata';

	// Set source if needed.
	// NOTE: videoEl.src will resolve to an absolute URL; compare using endsWith as a cheap guard.
	if (
		! videoEl.currentSrc &&
		( ! videoEl.src || ! videoEl.src.endsWith( url.split( '/' ).pop() ) )
	) {
		videoEl.src = url;
	}

	// Ensure the element is visible; the poster will remain on top until we confirm playback.
	videoEl.style.display = 'block';

	if ( shouldAllowAutoplay( data ) ) {
		const ok = await attemptPlay( videoEl );
		if ( ok ) {
			rootEl.classList.add( 'is-playing' );
		} else {
			rootEl.classList.remove( 'is-playing' );
		}
	} else {
		rootEl.classList.remove( 'is-playing' );
	}

	setupPauseWhenOffscreen( rootEl, videoEl );

	// Optional hover behavior.
	if ( data.playOnHover ) {
		rootEl.addEventListener( 'mouseenter', () => {
			if ( prefersReducedMotion() ) {
				return;
			}
			attemptPlay( videoEl ).then( ( ok ) => {
				if ( ok ) {
					rootEl.classList.add( 'is-playing' );
				}
			} );
		} );
		rootEl.addEventListener( 'mouseleave', () => {
			try {
				videoEl.pause();
			} catch ( e ) {}
			rootEl.classList.remove( 'is-playing' );
		} );
	}
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

const fetchVimeoAspectRatio = async ( vimeoId ) => {
	if ( ! vimeoId ) {
		return null;
	}

	try {
		// oEmbed returns the original width/height.
		const url = `https://vimeo.com/api/oembed.json?url=${ encodeURIComponent(
			`https://vimeo.com/${ vimeoId }`
		) }`;
		const res = await fetch( url, { method: 'GET' } );
		if ( ! res.ok ) {
			return null;
		}
		const data = await res.json();
		const w = Number( data?.width );
		const h = Number( data?.height );
		if ( Number.isFinite( w ) && Number.isFinite( h ) && w > 0 && h > 0 ) {
			return w / h;
		}
		return null;
	} catch ( e ) {
		return null;
	}
};

const readPercentVar = ( el, varName, fallback = 50 ) => {
	if ( ! el ) {
		return fallback;
	}
	const raw = getComputedStyle( el ).getPropertyValue( varName ).trim();
	const num = parseFloat( raw );
	return Number.isFinite( num ) ? num : fallback;
};

/**
 * Make a Vimeo iframe behave like background-size: cover.
 *
 * Vimeo's background player keeps the video at its native aspect ratio *inside* the iframe.
 * So even if the iframe is 100% x 100%, you may see letterboxing. To fix that, we oversize
 * the iframe based on container aspect ratio vs the video's aspect ratio, then center it.
 * @param wrapEl
 * @param iframeEl
 * @param videoRatio
 * @param posX
 * @param posY
 */
const applyVimeoCover = (
	wrapEl,
	iframeEl,
	videoRatio,
	posX = 50,
	posY = 50
) => {
	if ( ! wrapEl || ! iframeEl ) {
		return;
	}
	if ( ! ( 'ResizeObserver' in window ) ) {
		// Fallback: still fill the wrapper.
		iframeEl.style.position = 'absolute';
		iframeEl.style.inset = '0';
		iframeEl.style.width = '100%';
		iframeEl.style.height = '100%';
		return;
	}

	const safeRatio =
		Number.isFinite( videoRatio ) && videoRatio > 0 ? videoRatio : 16 / 9;

	const compute = () => {
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
		const fx = Math.min( 100, Math.max( 0, Number( posX ) ) );
		const fy = Math.min( 100, Math.max( 0, Number( posY ) ) );

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

	compute();

	const ro = new ResizeObserver( () => compute() );
	ro.observe( wrapEl );

	// Return cleanup if ever needed.
	return () => ro.disconnect();
};

const mountVimeo = ( rootEl, data ) => {
	const vimeoId = data?.vimeoId;
	if ( ! vimeoId ) {
		return;
	}

	// If disabled on mobile, keep poster-only.
	if ( data?.disableMobile && isMobileBreakpoint() ) {
		rootEl.classList.remove( 'is-playing' );
		return;
	}

	// If autoplay isn't allowed, we keep poster-only for v1.
	if ( ! shouldAllowAutoplay( data ) ) {
		rootEl.classList.remove( 'is-playing' );
		return;
	}

	const mediaLayer = rootEl.querySelector( '.pb-bgvid__media' );
	if ( ! mediaLayer ) {
		return;
	}

	// Avoid double mount.
	if ( mediaLayer.querySelector( '.pb-bgvid__vimeo' ) ) {
		rootEl.classList.add( 'is-playing' );
		return;
	}

	const wrap = document.createElement( 'div' );
	wrap.className = 'pb-bgvid__vimeo';

	const iframe = document.createElement( 'iframe' );
	iframe.src = buildVimeoSrc( vimeoId, {
		autoplay: true,
		loop: !! data.loop,
	} );
	iframe.setAttribute( 'allow', 'autoplay; fullscreen; picture-in-picture' );
	iframe.setAttribute( 'allowfullscreen', '' );
	iframe.setAttribute( 'title', 'Vimeo background video' );

	wrap.appendChild( iframe );

	// Insert Vimeo behind overlay.
	const overlay = mediaLayer.querySelector( '.pb-bgvid__overlay' );
	if ( overlay ) {
		mediaLayer.insertBefore( wrap, overlay );
	} else {
		mediaLayer.appendChild( wrap );
	}

	// Apply true cover sizing (prevents letterboxing inside the iframe) and respect focal point.
	const posX = readPercentVar( rootEl, '--pb-bgvid-pos-x', 50 );
	const posY = readPercentVar( rootEl, '--pb-bgvid-pos-y', 50 );

	let ratio = data?.vimeoAspectRatio;
	if ( ! ( Number.isFinite( ratio ) && ratio > 0 ) ) {
		// Frontend safety: if the saved ratio isn't present, fetch it.
		fetchVimeoAspectRatio( vimeoId ).then( ( r ) => {
			if ( Number.isFinite( r ) && r > 0 ) {
				ratio = r;
				applyVimeoCover( wrap, iframe, ratio, posX, posY );
			}
		} );
	}

	// Initial apply (uses saved ratio or 16:9 fallback).
	applyVimeoCover( wrap, iframe, ratio, posX, posY );

	// Vimeo sometimes updates its internal layout after the iframe loads.
	// Re-run cover sizing on load and for a few frames to eliminate gaps.
	iframe.addEventListener( 'load', () => {
		applyVimeoCover( wrap, iframe, ratio, posX, posY );
		let i = 0;
		const tick = () => {
			applyVimeoCover( wrap, iframe, ratio, posX, posY );
			i += 1;
			if ( i < 4 ) {
				requestAnimationFrame( tick );
			}
		};
		requestAnimationFrame( tick );
	} );

	rootEl.classList.add( 'is-playing' );
};

const init = () => {
	const blocks = document.querySelectorAll( '[data-fbks-bgvid]' );

	blocks.forEach( ( rootEl ) => {
		const data = parseJsonAttribute( rootEl, 'data-fbks-bgvid' );
		if ( ! data || ! data.provider ) {
			return;
		}

		if ( data.provider === 'self' ) {
			mountSelfHosted( rootEl, data );
			return;
		}

		if ( data.provider === 'vimeo' ) {
			mountVimeo( rootEl, data );
		}
	} );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
