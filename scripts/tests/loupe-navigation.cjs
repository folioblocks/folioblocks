/** Run with: node scripts/tests/loupe-navigation.cjs
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
	'/view.js': path.join( root, 'build/loupe-block/view.js' ),
	'/premium-view.js': path.join(
		root,
		'build/loupe-block/premium-view.js'
	),
};
const loupe = ( key, protectedImage = false, shape = 'circle' ) => `
<figure data-wp-key="${ key }" data-wp-interactive="folioblocks/loupe"
 class="wp-block-folioblocks-pb-loupe-block" data-wp-watch="callbacks.protection"
 data-shape="${ shape }" data-theme="light" data-disable-right-click="${ protectedImage }">
 <div class="pb-loupe-container" data-wp-watch="callbacks.initialize" style="position:relative;width:600px;height:400px">
 <img class="pb-loupe-image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'/%3E">
 <div class="pb-loupe-lens"></div></div></figure>`;
const pages = {
	'/empty': '',
	'/loupe': loupe( 'first', true ),
	'/different': loupe( 'second', false, 'square' ),
	'/multiple': loupe( 'first', true ) + loupe( 'third', true ),
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
		const moveLens = async () => {
			await page
				.locator( '.pb-loupe-container' )
				.first()
				.dispatchEvent( 'mousemove', { clientX: 100, clientY: 100 } );
			assert.equal(
				await page
					.locator( '.pb-loupe-lens' )
					.first()
					.evaluate( ( el ) => el.style.opacity ),
				'1'
			);
		};
		await page.goto( base + '/empty' );
		await page.waitForFunction(
			() => typeof window.navigate === 'function'
		);
		await page.evaluate( () => {
			window.documentMarker = 'preserved';
		} );
		await navigate( '/loupe' );
		await moveLens();
		assert.equal( await contextMenuBlocked(), true );
		await navigate( '/different' );
		await moveLens();
		assert.equal(
			await page
				.locator( '.pb-loupe-lens' )
				.evaluate( ( el ) =>
					el.classList.contains( 'pb-loupe-square' )
				),
			true
		);
		assert.equal( await contextMenuBlocked(), false );
		await navigate( '/multiple' );
		assert.equal(
			await page.locator( '.pb-loupe-lens.pb-loupe-circle' ).count(),
			2
		);
		await navigate( '/loupe' );
		assert.equal( await contextMenuBlocked(), true );
		await navigate( '/empty' );
		assert.equal( await contextMenuBlocked(), false );
		await page.goBack();
		await page.waitForSelector( '.pb-loupe-container' );
		await page.waitForTimeout( 100 );
		await moveLens();
		for ( let i = 0; i < 3; i++ ) {
			await navigate( '/empty' );
			await navigate( '/loupe' );
			await moveLens();
		}
		await page.locator( '.pb-loupe-container' ).evaluate( ( element ) => {
			const event = new Event( 'touchstart', {
				bubbles: true,
				cancelable: true,
			} );
			Object.defineProperty( event, 'touches', {
				value: [ { clientX: 150, clientY: 150 } ],
			} );
			element.dispatchEvent( event );
		} );
		assert.equal(
			await page
				.locator( '.pb-loupe-lens' )
				.evaluate( ( el ) => el.style.opacity ),
			'1'
		);
		assert.equal(
			await page.evaluate( () => window.documentMarker ),
			'preserved'
		);
		await page.goto( base + '/loupe' );
		await page.waitForSelector( '.pb-loupe-circle', { state: 'attached' } );
		await moveLens();
		assert.deepEqual( errors, [] );
		console.log(
			'PASS: module loading, mouse/touch, changed settings, multiple blocks, protection cleanup, back navigation, repeated navigation, direct loading; no page reloads or JS errors.'
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
