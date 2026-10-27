/** Run with: node scripts/tests/slider-navigation.cjs
 * Uses the local WordPress runtime to exercise actual router navigation.
 */
const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const http = require( 'node:http' );
const path = require( 'node:path' );
const { chromium } = require( 'playwright' );

const root = path.resolve( __dirname, '../..' );
const wpRoot = path.resolve( root, '../../..' );
const runtime = process.env.FBKS_TEST_GUTENBERG
	? 'wp-content/plugins/gutenberg/build/modules'
	: 'wp-includes/js/dist/script-modules';
const filename = process.env.FBKS_TEST_GUTENBERG ? 'index.js' : 'index.min.js';
const modules = {
	'/style.css': path.join( root, 'build/image-block/style-index.css' ),
	'/grid.css': path.join(
		root,
		'build/carousel-gallery-block/style-index.css'
	),
	'/filmstrip.css': path.join(
		root,
		'build/filmstrip-gallery-block/style-index.css'
	),
	'/filmstrip.js': path.join( root, 'build/filmstrip-gallery-block/view.js' ),
	'/filmstrip-premium.js': path.join(
		root,
		'build/filmstrip-gallery-block/premium-view.js'
	),
	'/grid.js': path.join( root, 'build/carousel-gallery-block/view.js' ),
	'/grid-premium.js': path.join(
		root,
		'build/carousel-gallery-block/premium-view.js'
	),
	'/interactivity.js': path.join(
		wpRoot,
		`${ runtime }/interactivity/${ filename }`
	),
	'/router.js': path.join(
		wpRoot,
		`${ runtime }/interactivity-router/${ filename }`
	),
	'/view.js': path.join( root, 'build/image-block/view.js' ),
	'/premium-view.js': path.join(
		root,
		'build/image-block/premium-view.js'
	),
};
const pages = JSON.parse(
	fs.readFileSync(
		process.env.FBKS_SLIDER_FIXTURES ||
			'/tmp/folioblocks-slider-fixtures.json',
		'utf8'
	)
);
const html = ( url ) => `<!doctype html><html><head>
<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/grid.css"><link rel="stylesheet" href="/filmstrip.css"><script id="wp-importmap" type="importmap">${ JSON.stringify(
	{
		imports: {
			'@wordpress/interactivity': '/interactivity.js',
			'@wordpress/interactivity-router': '/router.js',
		},
	}
) }</script></head><body>
<main data-wp-interactive="test" data-wp-router-region="test">${
	pages[ url ] || ''
}</main>
${
	pages[ url ]
		? [
				'/view.js',
				'/premium-view.js',
				'/grid.js',
				'/grid-premium.js',
				'/filmstrip.js',
				'/filmstrip-premium.js',
		  ]
				.map(
					( src ) =>
						`<script type="module" src="${ src }" data-wp-router-options='{"loadOnClientNavigation":true}'></script>`
				)
				.join( '' )
		: ''
}
<script type="module">import { store } from '@wordpress/interactivity';
import '@wordpress/interactivity-router';
window.navigate = ( url ) => store( 'core/router' ).actions.navigate( url );
</script></body></html>`;

( async () => {
	const server = http.createServer( ( req, res ) => {
		if ( modules[ req.url ] ) {
			res.setHeader(
				'Content-Type',
				req.url.endsWith( '.css' ) ? 'text/css' : 'text/javascript'
			);
			res.end( fs.readFileSync( modules[ req.url ] ) );
		} else {
			res.setHeader( 'Content-Type', 'text/html' );
			res.end( html( req.url ) );
		}
	} );
	await new Promise( ( resolve ) =>
		server.listen( 0, '127.0.0.1', resolve )
	);
	let browser;
	try {
		browser = await chromium.launch( {
			headless: true,
			channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
		} );
		const page = await browser.newPage();
		page.setDefaultTimeout( 10000 );
		const errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );
		page.on( 'console', ( message ) => {
			if (
				message.type() === 'warning' &&
				message.text().includes( 'directive' )
			) {
				errors.push( message.text() );
			}
		} );
		const base = `http://127.0.0.1:${ server.address().port }`;
		const navigate = async ( url ) => {
			await page.evaluate(
				( target ) => window.navigate( target ),
				base + url
			);
			await page.waitForTimeout( 100 );
		};
		const contextMenuBlocked = () =>
			page.evaluate( () => {
				const event = new MouseEvent( 'contextmenu', {
					bubbles: true,
					cancelable: true,
				} );
				document.body.dispatchEvent( event );
				return event.defaultPrevented;
			} );

		await page.route( '**/wp-content/uploads/**', ( route ) =>
			route.fulfill( {
				contentType: 'image/svg+xml',
				body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="steelblue"/></svg>',
			} )
		);
		await page.addInitScript( () => {
			Object.defineProperty( navigator, 'clipboard', {
				value: {
					writeText: async ( value ) => {
						window.clipboardCopies =
							( window.clipboardCopies || 0 ) + 1;
						window.copiedValue = value;
					},
				},
			} );
		} );
		await page.goto( base + '/empty' );
		await page.waitForFunction(
			() => typeof window.navigate === 'function'
		);
		await page.evaluate( () => {
			window.documentMarker = 1;
			window.changes = 0;
			document.addEventListener(
				'pb:filmstrip:change',
				() => window.changes++
			);
		} );
		const index = () =>
			page
				.locator( '.pb-carousel-gallery' )
				.first()
				.evaluate( ( el ) => el.__pbCarousel.getCurrentIndex() );
		const filmIndex = () =>
			page
				.locator( '.pb-filmstrip-gallery' )
				.first()
				.evaluate( ( el ) => el.__pbFilmstrip.getActiveIndex() );
		const readyCarousel = () =>
			page.waitForSelector( '.pb-carousel-ready' );
		const readyFilm = () =>
			page.waitForFunction(
				() =>
					!! document.querySelector( '.pb-filmstrip-gallery' )
						?.__pbFilmstrip
			);
		await navigate( '/carousel' );
		await readyCarousel();
		assert.equal(
			await page.locator( '[data-pb-carousel-clone]' ).count(),
			6
		);
		assert.equal(
			await page
				.locator( '[data-pb-carousel-clone] [data-wp-interactive]' )
				.count(),
			0
		);
		assert.equal(
			await page
				.locator( '[data-pb-carousel-clone] .pb-image-block-lightbox' )
				.count(),
			0
		);
		assert.equal( await contextMenuBlocked(), true );
		await page.waitForTimeout( 350 );
		assert.equal( await index(), 0 );
		await page.locator( '.pb-carousel-chevron.next' ).click();
		await page.waitForTimeout( 600 );
		assert.equal( await index(), 1 );
		await page.locator( '.pb-carousel-gallery' ).focus();
		await page.keyboard.press( 'ArrowLeft' );
		await page.waitForTimeout( 600 );
		assert.equal( await index(), 0 );
		await page.locator( '.pb-carousel-chevron.prev' ).click();
		await page.waitForTimeout( 700 );
		assert.equal( await index(), 2 );
		await page.locator( '.pb-carousel-chevron.next' ).click();
		await page.waitForTimeout( 700 );
		assert.equal( await index(), 0 );
		// Rapid commands across both loop boundaries must all settle on the
		// expected original slide, without a delayed reset to an earlier click.
		for ( const direction of [ 'next', 'prev' ] ) {
			await page.locator( '.pb-carousel-gallery' ).evaluate( ( el ) => {
				el.__pbCarousel.scrollToSlide( 0, { smooth: false } );
			} );
			await page.waitForTimeout( 150 );
			for ( let click = 0; click < 7; click++ ) {
				await page
					.locator( `.pb-carousel-chevron.${ direction }` )
					.dispatchEvent( 'click' );
				await page.waitForTimeout( 35 );
			}
			await page.waitForFunction(
				() =>
					! document
						.querySelector( '.pb-carousel-gallery' )
						.__pbCarousel.isMoving()
			);
			const expected = direction === 'next' ? 1 : 2;
			assert.equal( await index(), expected );
			const distance = await page
				.locator( '.pb-carousel-gallery' )
				.evaluate( ( el ) => {
					const api = el.__pbCarousel;
					const slide = api.getSlides()[ api.getCurrentIndex() ];
					return Math.abs(
						el.scrollLeft +
							el.clientWidth / 2 -
							( slide.offsetLeft + slide.clientWidth / 2 )
					);
				} );
			assert.ok( distance < 2, `Loop failed to recenter: ${ distance }` );
			await page.waitForTimeout( 600 );
			assert.equal( await index(), expected );
		}
		await page.locator( '.pb-carousel-gallery' ).evaluate( ( el ) => {
			el.__pbCarousel.scrollToSlide( 0, { smooth: false } );
		} );
		await page.waitForTimeout( 150 );
		await page.locator( '.pb-carousel-play-button' ).click();
		await page.waitForTimeout( 350 );
		assert.notEqual( await index(), 0 );
		await page.locator( '.pb-carousel-play-button' ).click();
		await page.waitForTimeout( 700 );
		const stopped = await index();
		await page.waitForTimeout( 400 );
		assert.equal( await index(), stopped );
		await page
			.locator(
				'.pb-carousel-gallery > :not([data-pb-carousel-clone]) .pb-image-block-lightbox'
			)
			.first()
			.dispatchEvent( 'click' );
		await page.waitForSelector( 'dialog[open]' );
		assert.equal(
			await page.locator( '.lightbox-counter' ).textContent(),
			'1 / 3'
		);
		await navigate( '/empty' );
		assert.equal( await page.locator( 'dialog[open]' ).count(), 0 );
		assert.equal( await contextMenuBlocked(), false );
		await navigate( '/carousel-static' );
		await readyCarousel();
		assert.equal(
			await page.locator( '[data-pb-carousel-clone]' ).count(),
			0
		);
		await page.locator( '.pb-carousel-gallery' ).evaluate( ( el ) => {
			el.__pbCarousel.scrollToSlide( 2, { smooth: false } );
		} );
		assert.equal(
			await page
				.locator( '.pb-carousel-gallery' )
				.evaluate( ( el ) => el.__pbCarousel.next() ),
			false
		);
		await navigate( '/carousel-single' );
		await readyCarousel();
		assert.equal(
			await page.locator( '[data-pb-carousel-clone]' ).count(),
			0
		);
		await navigate( '/carousel-empty' );
		await readyCarousel();
		await navigate( '/carousel-auto' );
		await readyCarousel();
		await page.waitForTimeout( 300 );
		await page.evaluate( () => {
			window.oldCarousel = document.querySelector(
				'.pb-carousel-gallery'
			);
			window.oldCarousel.__pbCarousel.next = () => {
				window.lateTicks = ( window.lateTicks || 0 ) + 1;
				return true;
			};
		} );
		await navigate( '/empty' );
		const ticks = await page.evaluate( () => window.lateTicks || 0 );
		await page.waitForTimeout( 400 );
		assert.equal(
			await page.evaluate( () => window.lateTicks || 0 ),
			ticks
		);
		assert.equal(
			await page.evaluate( () => window.oldCarousel.__pbCarousel ),
			undefined
		);
		await navigate( '/filmstrip' );
		await readyFilm();
		assert.equal( await contextMenuBlocked(), true );
		await page.locator( '.pb-filmstrip-gallery-thumb' ).nth( 1 ).click();
		assert.equal( await filmIndex(), 1 );
		await page.locator( '.pb-filmstrip-gallery-thumb' ).nth( 1 ).focus();
		await page.keyboard.press( 'ArrowRight' );
		assert.equal( await filmIndex(), 2 );
		await page.locator( '.pb-filmstrip-gallery-nav-next' ).click();
		assert.equal( await filmIndex(), 0 );
		await page.locator( '.pb-filmstrip-gallery-main-media' ).click();
		await page.waitForSelector( 'dialog[open] .pb-image-lightbox' );
		assert.equal(
			await page.locator( '.lightbox-counter' ).textContent(),
			'1 / 3'
		);
		await page.keyboard.press( 'Escape' );
		await page.locator( '.pb-filmstrip-gallery-fullscreen-button' ).click();
		await page.waitForFunction( () => !! document.fullscreenElement );
		await page.locator( '.pb-filmstrip-gallery-fullscreen-button' ).click();
		await page.waitForFunction( () => ! document.fullscreenElement );
		await page.locator( '.pb-filmstrip-gallery-main-media' ).click();
		await page.waitForSelector( 'dialog[open]' );
		await navigate( '/empty' );
		assert.equal(
			await page.locator( 'dialog[open],.pb-image-lightbox' ).count(),
			0
		);
		assert.equal(
			await page.evaluate( () =>
				document.body.classList.contains( 'pb-lightbox-open' )
			),
			false
		);
		assert.equal( await contextMenuBlocked(), false );
		await navigate( '/filmstrip-social' );
		await readyFilm();
		await page.locator( '.pb-filmstrip-gallery' ).evaluate( ( el ) => {
			const api = el.__pbFilmstrip;
			api.getSettings().socialSharingSources = [ 'copy' ];
			api.setActiveImage( 0 );
		} );
		await page
			.locator(
				'.pb-filmstrip-gallery-main-media .pb-social-share__link--copy'
			)
			.dispatchEvent( 'click' );
		assert.equal( await page.evaluate( () => window.clipboardCopies ), 1 );
		await navigate( '/filmstrip-download' );
		await readyFilm();
		await page.locator( '.pb-filmstrip-gallery' ).evaluate( ( el ) => {
			const api = el.__pbFilmstrip;
			api.getImages()[ 0 ].fullSrc = '/download.svg';
			api.setActiveImage( 0 );
		} );
		await Promise.all( [
			page.waitForEvent( 'download' ),
			page
				.locator(
					'.pb-filmstrip-gallery-main .pb-image-block-download'
				)
				.dispatchEvent( 'click' ),
		] );
		assert.equal( await page.locator( 'dialog[open]' ).count(), 0 );

		await navigate( '/filmstrip-auto' );
		await readyFilm();
		await page.mouse.move( 1200, 900 );
		await page.waitForTimeout( 350 );
		assert.notEqual( await filmIndex(), 0 );
		await page.locator( '.pb-filmstrip-gallery-autoplay-button' ).click();
		const paused = await filmIndex();
		await page.waitForTimeout( 400 );
		assert.equal( await filmIndex(), paused );
		await page.locator( '.pb-filmstrip-gallery-autoplay-button' ).click();
		await page.evaluate( () => {
			window.oldFilm = document.querySelector( '.pb-filmstrip-gallery' );
			const original = window.oldFilm.__pbFilmstrip.setActiveImage;
			window.oldFilm.__pbFilmstrip.setActiveImage = ( value ) => {
				window.filmTicks = ( window.filmTicks || 0 ) + 1;
				original( value );
			};
		} );
		await navigate( '/empty' );
		const filmTicks = await page.evaluate( () => window.filmTicks || 0 );
		await page.waitForTimeout( 400 );
		assert.equal(
			await page.evaluate( () => window.filmTicks || 0 ),
			filmTicks
		);
		await navigate( '/multiple' );
		await readyFilm();
		await page.locator( '.pb-filmstrip-gallery-thumb' ).nth( 1 ).click();
		assert.equal(
			await page
				.locator( '.pb-filmstrip-gallery' )
				.nth( 1 )
				.evaluate( ( el ) => el.__pbFilmstrip.getActiveIndex() ),
			0
		);
		await navigate( '/filmstrip-single' );
		await readyFilm();
		assert.equal(
			await page
				.locator( '.pb-filmstrip-gallery' )
				.evaluate( ( el ) => el.__pbFilmstrip.getImages().length ),
			1
		);
		await navigate( '/filmstrip-empty' );
		await navigate( '/filmstrip-side' );
		await readyFilm();
		await page.setViewportSize( { width: 600, height: 800 } );
		await page.waitForTimeout( 100 );
		assert(
			( await page
				.locator( '.pb-filmstrip-gallery-main-image' )
				.evaluate( ( el ) => el.getBoundingClientRect().width ) ) > 0
		);
		await navigate( '/empty' );
		await page.goBack();
		await readyFilm();
		for ( let i = 0; i < 3; i++ ) {
			await navigate( '/empty' );
			await navigate( '/filmstrip' );
			await readyFilm();
			assert.equal(
				await page.locator( '[data-filmstrip-lightbox-index]' ).count(),
				3
			);
		}
		assert.equal( await page.evaluate( () => window.documentMarker ), 1 );
		await page.goto( base + '/carousel' );
		await readyCarousel();
		assert.equal(
			await page.locator( '[data-pb-carousel-clone]' ).count(),
			6
		);
		assert.deepEqual( errors, [] );
		console.log(
			'PASS: Carousel loop boundaries, controls/keyboard, autoplay start-stop/cleanup and clone isolation; Filmstrip thumbnails/keyboard/lightbox/fullscreen, autoplay cleanup, gallery isolation, responsive layouts, single/empty galleries and repeated/back/direct navigation.'
		);
	} finally {
		await browser?.close();
		server.closeAllConnections();
		await new Promise( ( resolve ) => server.close( resolve ) );
	}
} )().catch( ( error ) => {
	console.error( error );
	process.exitCode = 1;
} );
