/** Render fixtures with render-video-fixtures.php, then run: node scripts/tests/video-navigation.cjs
 * Requires ffmpeg to generate a small local playback fixture.
 * Uses the local WordPress runtime to exercise actual router navigation.
 */
const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const http = require( 'node:http' );
const path = require( 'node:path' );
const { chromium } = require( 'playwright' );
const { execFileSync } = require( 'node:child_process' );
const { tmpdir } = require( 'node:os' );

const root = path.resolve( __dirname, '../..' );
const wpRoot = path.resolve( root, '../../..' );
const runtime = process.env.FBKS_TEST_GUTENBERG
	? 'wp-content/plugins/gutenberg/build/modules'
	: 'wp-includes/js/dist/script-modules';
const filename = process.env.FBKS_TEST_GUTENBERG ? 'index.js' : 'index.min.js';
const modules = {
	'/style.css': path.join( root, 'build/video-block/style-index.css' ),
	'/gallery.css': path.join(
		root,
		'build/video-gallery-block/style-index.css'
	),
	'/view.js': path.join( root, 'build/video-block/view.js' ),
	'/premium-view.js': path.join(
		root,
		'build/video-block/premium-view.js'
	),
	'/gallery.js': path.join( root, 'build/video-gallery-block/view.js' ),
	'/gallery-premium.js': path.join(
		root,
		'build/video-gallery-block/premium-view.js'
	),
	'/interactivity.js': path.join(
		wpRoot,
		`${ runtime }/interactivity/${ filename }`
	),
	'/router.js': path.join(
		wpRoot,
		`${ runtime }/interactivity-router/${ filename }`
	),
};
const pages = JSON.parse(
	fs.readFileSync(
		process.env.FBKS_VIDEO_FIXTURES ||
			'/tmp/folioblocks-video-fixtures.json',
		'utf8'
	)
);
const html = ( url ) => `<!doctype html><html><head>
<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/gallery.css"><script>window.folioBlocksData = {isPro:true};</script><script id="wp-importmap" type="importmap">${ JSON.stringify(
	{
		imports: {
			'@wordpress/interactivity': '/interactivity.js',
			'@wordpress/interactivity-router': '/router.js',
		},
	}
) }</script></head><body>
<div class="cart-count">0</div><main data-wp-interactive="test" data-wp-router-region="test">${
	pages[ url ] || ''
}</main>
${
	pages[ url ]
		? [
				'/view.js',
				'/premium-view.js',
				'/gallery.js',
				'/gallery-premium.js',
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
	const videoFile = path.join(
		tmpdir(),
		`folioblocks-test-video-${ process.pid }.mp4`
	);
	try {
		execFileSync( 'ffmpeg', [
			'-v',
			'error',
			'-f',
			'lavfi',
			'-i',
			'color=c=steelblue:s=320x180:r=10',
			'-t',
			'1',
			'-c:v',
			'libx264',
			'-pix_fmt',
			'yuv420p',
			'-movflags',
			'+faststart',
			'-y',
			videoFile,
		] );
	} catch ( error ) {
		fs.rmSync( videoFile, { force: true } );
		throw error;
	}
	const videoBytes = fs.readFileSync( videoFile );
	fs.rmSync( videoFile );
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
			channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
			headless: true,
		} );
		const page = await browser.newPage( {
			viewport: { width: 1200, height: 900 },
		} );
		page.setDefaultTimeout( 10000 );
		const errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );
		page.on( 'console', ( message ) => {
			if (
				message.type() === 'warning' &&
				message.text().includes( 'directive' )
			)
				errors.push( message.text() );
		} );
		await page.route( '**/wp-content/uploads/**', ( route ) =>
			route.fulfill( {
				contentType: 'image/svg+xml',
				body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="steelblue"/></svg>',
			} )
		);
		await page.route( '**/test-video.mp4', ( route ) =>
			route.fulfill( { contentType: 'video/mp4', body: videoBytes } )
		);
		await page.route(
			/https:\/\/(www\.youtube\.com|player\.vimeo\.com|www\.dailymotion\.com)\//,
			( route ) =>
				route.fulfill( {
					contentType: 'text/html',
					body: '<!doctype html><title>Provider fixture</title>',
				} )
		);
		let cartRequests = 0;
		let delayCart = false;
		await page.route( '**/*wc-ajax=add_to_cart*', async ( route ) => {
			cartRequests++;
			if ( delayCart )
				await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );
			await route
				.fulfill( {
					contentType: 'application/json',
					body: JSON.stringify( {
						fragments: {
							'.cart-count': '<div class="cart-count">1</div>',
						},
						cart_hash: 'test',
					} ),
				} )
				.catch( () => {} );
		} );
		const base = `http://127.0.0.1:${ server.address().port }`;
		const navigate = async ( path ) => {
			await page.evaluate(
				( url ) => window.navigate( url ),
				base + path
			);
			await page.waitForTimeout( 200 );
		};
		const blocked = () =>
			page.evaluate( () => {
				const event = new MouseEvent( 'contextmenu', {
					bubbles: true,
					cancelable: true,
				} );
				document.body.dispatchEvent( event );
				return event.defaultPrevented;
			} );
		const ready = () =>
			page.waitForFunction( () =>
				[ ...document.querySelectorAll( '.pb-video-block' ) ].every(
					( el ) => el.style.opacity === '1'
				)
			);
		const open = async () => {
			await page.locator( '.pb-video-block:visible' ).first().click();
			await page.waitForSelector( '.pb-video-lightbox[open].active' );
		};
		const closed = () =>
			page.waitForFunction(
				() =>
					! document.querySelector( '.pb-video-lightbox[open]' ) &&
					document.body.style.overflow === ''
			);
		await page.goto( base + '/empty' );
		await page.waitForFunction(
			() => typeof window.navigate === 'function'
		);
		await page.evaluate( () => {
			window.documentMarker = 1;
			window.cartEvents = 0;
			document.body.addEventListener(
				'added_to_cart',
				() => window.cartEvents++
			);
		} );
		await navigate( '/video' );
		await ready();
		assert.equal( await blocked(), true );
		await page.locator( '.pb-video-block' ).focus();
		await page.keyboard.press( 'Enter' );
		await page.waitForSelector( 'dialog[open]' );
		assert.match(
			await page.locator( 'dialog[open] iframe' ).getAttribute( 'src' ),
			/youtube\.com\/embed\/aqz-KE-bpKQ/
		);
		assert.equal(
			await page
				.locator( 'dialog[open] .pb-video-lightbox-description' )
				.textContent(),
			'Test description'
		);
		assert.equal(
			await page
				.locator( 'dialog[open]' )
				.evaluate(
					( el ) => !! el.closest( '[data-wp-router-region]' )
				),
			true
		);
		await page.keyboard.press( 'Escape' );
		await closed();
		assert.equal(
			await page
				.locator( '.pb-video-block' )
				.evaluate( ( el ) => el === el.ownerDocument.activeElement ),
			true
		);
		assert.equal(
			await page.locator( 'iframe' ).getAttribute( 'src' ),
			null
		);
		await open();
		await page.locator( '.lightbox-fullscreen' ).click();
		await page.waitForFunction( () => !! document.fullscreenElement );
		await page.evaluate( () => document.exitFullscreen() );
		await page.locator( '.pb-video-lightbox-close' ).click();
		await closed();
		await open();
		await page
			.locator( 'dialog[open]' )
			.click( { position: { x: 5, y: 5 } } );
		await closed();
		await open();
		await page.evaluate( () => {
			window.oldBlock = document.querySelector( '.pb-video-block' );
			window.oldDialog = document.querySelector( 'dialog' );
		} );
		await navigate( '/empty' );
		await closed();
		assert.equal( await blocked(), false );
		assert.equal( await page.locator( '.pb-video-lightbox' ).count(), 0 );
		await page.evaluate( () => window.oldBlock.click() );
		assert.equal(
			await page.evaluate( () => document.body.style.overflow ),
			''
		);
		assert.equal(
			await page.evaluate( () => window.oldDialog.open ),
			false
		);
		await navigate( '/clipped' );
		await ready();
		await open();
		const dialogBounds = await page.locator( 'dialog[open]' ).boundingBox();
		assert.equal( dialogBounds.x, 0 );
		assert.equal( dialogBounds.y, 0 );
		assert.equal( dialogBounds.width, 1200 );
		await page.keyboard.press( 'Escape' );
		await closed();
		await navigate( '/local' );
		await ready();
		await open();
		await page.waitForFunction(
			() =>
				document.querySelector( 'dialog[open] video' )?.videoWidth ===
				320
		);
		await page.waitForFunction(
			() =>
				document.querySelector( 'dialog[open] video' )?.paused === false
		);
		await page.evaluate(
			() =>
				( window.oldVideo =
					document.querySelector( 'dialog[open] video' ) )
		);
		await navigate( '/vimeo' );
		await ready();
		await closed();
		assert.equal(
			await page.evaluate(
				() =>
					window.oldVideo.paused &&
					! window.oldVideo.hasAttribute( 'src' ) &&
					! window.oldVideo.isConnected
			),
			true
		);
		await open();
		assert.match(
			await page.locator( 'dialog[open] iframe' ).getAttribute( 'src' ),
			/player\.vimeo\.com\/video\/123456789/
		);
		assert.equal(
			await page.locator( 'dialog[open].light-mode' ).count(),
			1
		);
		await page.keyboard.press( 'Escape' );
		await closed();
		await navigate( '/premium-provider' );
		await ready();
		await open();
		assert.match(
			await page.locator( 'dialog[open] iframe' ).getAttribute( 'src' ),
			/dailymotion.*x123abc/
		);
		await page.keyboard.press( 'Escape' );
		await closed();
		await navigate( '/gallery' );
		await ready();
		assert.equal(
			await page.locator( 'img' ).first().getAttribute( 'loading' ),
			'lazy'
		);
		assert.equal( await blocked(), true );
		assert.equal(
			await page
				.locator( '.wp-block-folioblocks-pb-video-block.is-hidden' )
				.count(),
			1
		);
		assert.equal(
			await page.locator( '.filter-button.is-active' ).textContent(),
			'City'
		);
		await page.locator( '.filter-button[data-filter="Landscape"]' ).click();
		assert.equal(
			await page
				.locator( '.wp-block-folioblocks-pb-video-block.is-hidden' )
				.count(),
			1
		);
		await page.locator( '.filter-button[data-filter="Forest"]' ).click();
		assert.equal(
			await page
				.locator( '.wp-block-folioblocks-pb-video-block.is-hidden' )
				.count(),
			2
		);
		await page.locator( '.filter-button[data-filter="all"]' ).click();
		assert.equal(
			await page
				.locator( '.wp-block-folioblocks-pb-video-block.is-hidden' )
				.count(),
			0
		);
		await page.setViewportSize( { width: 800, height: 900 } );
		assert.equal(
			await page
				.locator( '.pb-video-gallery' )
				.evaluate(
					( el ) =>
						getComputedStyle( el ).gridTemplateColumns.split( ' ' )
							.length
				),
			2
		);
		await page.setViewportSize( { width: 400, height: 800 } );
		assert.equal(
			await page
				.locator( '.pb-video-gallery' )
				.evaluate(
					( el ) =>
						getComputedStyle( el ).gridTemplateColumns.split( ' ' )
							.length
				),
			1
		);
		await open();
		await navigate( '/gallery-other' );
		await ready();
		await closed();
		assert.equal( await blocked(), false );
		assert.equal(
			await page.locator( '.filter-button.is-active' ).textContent(),
			'Forest'
		);
		await navigate( '/page-on' );
		await ready();
		assert.equal( await blocked(), true );
		assert.equal(
			await page
				.locator( 'img' )
				.first()
				.evaluate(
					( el ) =>
						! el.dispatchEvent(
							new Event( 'dragstart', {
								bubbles: true,
								cancelable: true,
							} )
						)
				),
			true
		);
		assert.equal(
			await page.locator( 'img' ).first().getAttribute( 'loading' ),
			'lazy'
		);
		await open();
		assert.equal(
			await page.locator( 'dialog[open] iframe' ).evaluate(
				( el ) =>
					! el.dispatchEvent(
						new MouseEvent( 'contextmenu', {
							bubbles: true,
							cancelable: true,
						} )
					)
			),
			true
		);
		await navigate( '/page-off' );
		await ready();
		await closed();
		assert.equal( await blocked(), false );
		assert.equal(
			await page
				.locator( 'img' )
				.first()
				.evaluate(
					( el ) =>
						! el.dispatchEvent(
							new Event( 'dragstart', {
								bubbles: true,
								cancelable: true,
							} )
						)
				),
			false
		);
		assert.equal(
			await page.locator( 'img' ).first().getAttribute( 'loading' ),
			'eager'
		);
		await navigate( '/multiple' );
		await ready();
		assert.equal( await page.locator( '.lightbox-fullscreen' ).count(), 6 );
		await page
			.locator( '.wp-block-folioblocks-video-gallery-block' )
			.first()
			.locator( '.filter-button[data-filter="City"]' )
			.click();
		assert.equal(
			await page
				.locator( '.wp-block-folioblocks-video-gallery-block' )
				.first()
				.locator( '.is-hidden' )
				.count(),
			1
		);
		assert.equal(
			await page
				.locator( '.wp-block-folioblocks-video-gallery-block' )
				.nth( 1 )
				.locator( '.is-hidden' )
				.count(),
			0
		);
		await navigate( '/cart' );
		await ready();
		await page.locator( '.pb-video-add-to-cart' ).click();
		await page.waitForFunction(
			() => document.querySelector( '.cart-count' ).textContent === '1'
		);
		assert.equal( cartRequests, 1 );
		assert.equal( await page.evaluate( () => window.cartEvents ), 1 );
		assert.equal( await page.locator( 'dialog[open]' ).count(), 0 );
		await page.evaluate(
			() => ( document.querySelector( '.cart-count' ).textContent = '0' )
		);
		delayCart = true;
		await page.locator( '.pb-video-add-to-cart' ).click();
		await navigate( '/empty' );
		await page.waitForTimeout( 650 );
		assert.equal( await page.locator( '.cart-count' ).textContent(), '0' );
		assert.equal( await page.evaluate( () => window.cartEvents ), 1 );
		await navigate( '/gallery-empty' );
		assert.equal( await page.locator( '.pb-video-block' ).count(), 0 );
		for ( let i = 0; i < 3; i++ ) {
			await navigate( '/video' );
			await ready();
			await open();
			assert.equal(
				await page.locator( 'dialog[open] iframe' ).count(),
				1
			);
			assert.equal(
				await page.locator( '.lightbox-fullscreen' ).count(),
				1
			);
			await navigate( '/empty' );
			await closed();
			assert.equal( await blocked(), false );
		}
		await page.goBack();
		await ready();
		await open();
		await page.keyboard.press( 'Escape' );
		await closed();
		assert.equal( await page.evaluate( () => window.documentMarker ), 1 );
		await page.goto( base + '/gallery' );
		await ready();
		await open();
		await page.keyboard.press( 'Escape' );
		await closed();
		assert.deepEqual( errors, [] );
		console.log(
			'PASS: Video provider/local playback, keyboard/backdrop/fullscreen, cleanup with an open player, gallery filters/layout/isolation, page protection overrides, cart handlers/aborted responses, repeated/back/direct navigation.'
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
