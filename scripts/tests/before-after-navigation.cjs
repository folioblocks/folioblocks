/** Run with: node scripts/tests/before-after-navigation.cjs
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
	'/interactivity.js': path.join(
		wpRoot,
		`${ runtime }/interactivity/${ filename }`
	),
	'/router.js': path.join(
		wpRoot,
		`${ runtime }/interactivity-router/${ filename }`
	),
	'/view.js': path.join( root, 'build/before-after-block/view.js' ),
	'/premium-view.js': path.join(
		root,
		'build/before-after-block/premium-view.js'
	),
};
const image =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'/%3E";
const comparison = (
	key,
	protectedImage = false,
	vertical = false,
	initial = 50
) => `
<div data-wp-key="${ key }" data-wp-interactive="folioblocks/before-after"
 data-wp-watch="callbacks.protection" data-disable-right-click="${ protectedImage }"
 data-disable-drag-to-save="${ protectedImage }">
 <div class="pb-before-after-container ${
		vertical ? 'is-vertical' : ''
 }" data-wp-watch="callbacks.initialize" style="width:600px">
 <img class="pb-after-image" src="${ image }" loading="lazy">
 <div class="pb-before-wrapper"><img src="${ image }"></div>
 <input class="pb-slider" type="range" min="0" max="100" value="${ initial }">
 <div class="pb-slider-handle"></div></div></div>`;
const pages = {
	'/empty': '',
	'/horizontal': comparison( 'horizontal', true, false, 0 ),
	'/vertical': comparison( 'vertical', false, true, 25 ),
	'/multiple':
		comparison( 'horizontal', true ) + comparison( 'other', true, true ),
};
const html = ( url ) => `<!doctype html><html><head>
<script id="wp-importmap" type="importmap">${ JSON.stringify( {
	imports: {
		'@wordpress/interactivity': '/interactivity.js',
		'@wordpress/interactivity-router': '/router.js',
	},
} ) }</script></head><body>
<main data-wp-interactive="test" data-wp-router-region="test">${
	pages[ url ] || ''
}</main>
${
	pages[ url ]
		? [ '/view.js', '/premium-view.js' ]
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
			res.setHeader( 'Content-Type', 'text/javascript' );
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

		const checkPosition = async ( value, vertical = false ) => {
			const slider = page.locator( '.pb-slider' ).first();
			await slider.fill( String( value ) );
			const handle = page.locator( '.pb-slider-handle' ).first();
			assert.equal(
				await handle.evaluate(
					( el, axis ) => el.style[ axis ],
					vertical ? 'top' : 'left'
				),
				`${ value }%`
			);
		};
		await page.goto( base + '/empty' );
		await page.waitForFunction(
			() => typeof window.navigate === 'function'
		);
		await page.evaluate( () => {
			window.documentMarker = 'preserved';
		} );
		await navigate( '/horizontal' );
		assert.equal(
			await page
				.locator( '.pb-slider-handle' )
				.evaluate( ( el ) => el.style.left ),
			'0%'
		);
		await checkPosition( 75 );
		assert.equal( await contextMenuBlocked(), true );
		assert.equal(
			await page
				.locator( 'img' )
				.first()
				.evaluate( ( el ) => {
					const event = new Event( 'dragstart', {
						bubbles: true,
						cancelable: true,
					} );
					el.dispatchEvent( event );
					return event.defaultPrevented;
				} ),
			true
		);
		await page.waitForFunction(
			() =>
				document.querySelector( '.pb-before-after-container' ).style
					.height === '400px'
		);
		await page.locator( '.pb-before-after-container' ).evaluate( ( el ) => {
			el.style.width = '300px';
		} );
		await page.waitForFunction(
			() =>
				document.querySelector( '.pb-before-after-container' ).style
					.height === '200px'
		);
		await navigate( '/vertical' );
		await checkPosition( 25, true );
		await page
			.locator( '.pb-slider' )
			.dispatchEvent( 'wheel', { deltaY: 10 } );
		assert.equal( await page.locator( '.pb-slider' ).inputValue(), '27' );
		assert.equal( await contextMenuBlocked(), false );
		await navigate( '/multiple' );
		assert.equal( await page.locator( '.pb-slider' ).count(), 2 );
		await navigate( '/horizontal' );
		assert.equal( await contextMenuBlocked(), true );
		await navigate( '/empty' );
		assert.equal( await contextMenuBlocked(), false );
		await page.goBack();
		await page.waitForSelector( '.pb-slider' );
		await page.waitForTimeout( 100 );
		await checkPosition( 60 );
		for ( let i = 0; i < 3; i++ ) {
			await navigate( '/empty' );
			await navigate( '/vertical' );
			await checkPosition( 50, true );
			await page
				.locator( '.pb-slider' )
				.dispatchEvent( 'wheel', { deltaY: 10 } );
			assert.equal(
				await page.locator( '.pb-slider' ).inputValue(),
				'52'
			);
		}
		assert.equal(
			await page.evaluate( () => window.documentMarker ),
			'preserved'
		);
		await page.goto( base + '/horizontal' );
		await page.waitForFunction(
			() =>
				document.querySelector( '.pb-slider-handle' )?.style.left ===
				'0%'
		);
		await checkPosition( 100 );
		assert.deepEqual( errors, [] );
		console.log(
			'PASS: module loading, zero starting position, horizontal/vertical sliders, wheel increments, image sizing, resize, protection cleanup, multiple blocks, back/repeated navigation and direct loading.'
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
