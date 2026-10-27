/** Run with: node scripts/tests/image-navigation.cjs
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
const picture =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='steelblue'/%3E%3C/svg%3E";
const image = ( key, protectedPage = false, theme = 'dark' ) => `
<div class="wp-block-folioblocks-pb-image-block" data-wp-key="${ key }" data-wp-interactive="folioblocks/image"
 data-wp-watch="callbacks.initialize" data-disable-right-click="${ protectedPage }" data-disable-drag-to-save="${ protectedPage }">
 <dialog class="pb-image-lightbox-host" aria-label="Image lightbox"></dialog>
 <figure class="pb-image-block pb-effect-tilt" data-wp-watch="callbacks.premium">
 <img class="pb-image-block-img pb-image-block-lightbox" src="${ picture }" data-src="${ picture }"
 data-caption="Caption ${ key }" data-lightbox-theme="${ theme }" data-lightbox-counter="true" data-lightbox-zoom="true" style="width:300px;height:200px" loading="lazy">
 <button class="pb-image-block-download" data-full-src="/download.svg">Download</button>
 <button class="pb-add-to-cart-icon" data-woo-action="add_to_cart" data-product-id="123">Cart</button>
 </figure></div>`;
const pages = {
	'/empty': '',
	'/image': image( 'first', true ),
	'/different': image( 'different', false, 'light' ),
	'/multiple': image( 'first', true ) + image( 'second', true ),
	'/clipped': `<div style="transform:translateZ(0);overflow:hidden;width:350px;height:250px">${ image(
		'clipped'
	) }</div>`,
};
const html = ( url ) => `<!doctype html><html><head>
<link rel="stylesheet" href="/style.css"><script id="wp-importmap" type="importmap">${ JSON.stringify(
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

		await page.route( '**/?wc-ajax=add_to_cart', ( route ) =>
			route.fulfill( {
				contentType: 'application/json',
				body: JSON.stringify( { fragments: {}, cart_hash: 'test' } ),
			} )
		);
		await page.goto( base + '/empty' );
		await page.waitForFunction(
			() => typeof window.navigate === 'function'
		);
		await page.evaluate( () => {
			window.documentMarker = 1;
			window.cartEvents = 0;
			document.body.addEventListener(
				'wc-blocks_added_to_cart',
				() => window.cartEvents++
			);
		} );
		const open = async () => {
			await page.locator( '.pb-image-block-lightbox' ).first().click();
			await page.waitForSelector( 'dialog[open] .pb-image-lightbox' );
			assert.equal(
				await page.locator( '.pb-image-lightbox' ).count(),
				1
			);
			assert.equal(
				await page.locator( '.lightbox-fullscreen' ).count(),
				1
			);
		};
		const close = async () => {
			await page.keyboard.press( 'Escape' );
			await page.waitForSelector( '.pb-image-lightbox', {
				state: 'detached',
			} );
			assert.equal(
				await page
					.locator( '.pb-focus-sentinel-start, dialog[open]' )
					.count(),
				0
			);
		};
		await navigate( '/image' );
		assert.equal( await contextMenuBlocked(), true );
		assert.equal(
			await page.locator( '.pb-image-block-img' ).evaluate( ( el ) => {
				const event = new Event( 'dragstart', {
					bubbles: true,
					cancelable: true,
				} );
				el.dispatchEvent( event );
				return event.defaultPrevented;
			} ),
			true
		);
		await page
			.locator( '.pb-effect-tilt' )
			.dispatchEvent( 'pointermove', { clientX: 50, clientY: 50 } );
		assert(
			await page
				.locator( '.pb-effect-tilt' )
				.evaluate( ( el ) =>
					el.style.getPropertyValue( '--pb-tilt-x' )
				)
		);
		await open();
		await page.locator( '.lightbox-zoom' ).click();
		assert.equal(
			await page.locator( '.pb-image-lightbox.is-zoomed' ).count(),
			1
		);
		await page.locator( '.lightbox-fullscreen' ).click();
		await page.waitForFunction( () => !! document.fullscreenElement );
		await page.locator( '.lightbox-fullscreen' ).click();
		await page.waitForFunction( () => ! document.fullscreenElement );
		await close();
		await page.locator( '.pb-add-to-cart-icon' ).click();
		await page.waitForFunction( () => window.cartEvents === 1 );
		assert.equal(
			await page.locator( '.pb-add-to-cart-icon.is-added' ).count(),
			1
		);
		await Promise.all( [
			page.waitForEvent( 'download' ),
			page.locator( '.pb-image-block-download' ).dispatchEvent( 'click' ),
		] );
		assert.equal( await page.locator( 'dialog[open]' ).count(), 0 );
		await open();
		await navigate( '/empty' );
		assert.equal(
			await page
				.locator(
					'.pb-image-lightbox, .pb-focus-sentinel-start, dialog[open]'
				)
				.count(),
			0
		);
		assert.equal(
			await page.evaluate( () =>
				document.body.classList.contains( 'pb-lightbox-open' )
			),
			false
		);
		assert.equal( await contextMenuBlocked(), false );
		await navigate( '/different' );
		await open();
		assert.equal(
			await page.locator( '.pb-image-lightbox--light' ).count(),
			1
		);
		await close();
		assert.equal( await contextMenuBlocked(), false );
		await navigate( '/multiple' );
		await open();
		assert.equal(
			await page.locator( '.lightbox-counter' ).textContent(),
			'1 / 2'
		);
		await page.keyboard.press( 'ArrowRight' );
		assert.equal(
			await page.locator( '.lightbox-counter' ).textContent(),
			'2 / 2'
		);
		await close();
		await navigate( '/image' );
		assert.equal( await contextMenuBlocked(), true );
		await navigate( '/clipped' );
		await open();
		const bounds = await page.locator( '.pb-image-lightbox' ).boundingBox();
		assert( bounds.width > 350 && bounds.height > 250 );
		await close();
		await navigate( '/empty' );
		await page.goBack();
		await page.waitForSelector( '.pb-image-block-lightbox' );
		await page.waitForTimeout( 100 );
		await open();
		await close();
		for ( let i = 0; i < 3; i++ ) {
			await navigate( '/empty' );
			await navigate( '/image' );
			await open();
			await close();
		}
		await page.locator( '.pb-add-to-cart-icon' ).click();
		await page.waitForFunction( () => window.cartEvents === 2 );
		assert.equal( await page.evaluate( () => window.cartEvents ), 2 );
		assert.equal( await page.evaluate( () => window.documentMarker ), 1 );
		await page.goto( base + '/image' );
		await page.waitForTimeout( 150 );
		await open();
		await close();
		assert.deepEqual( errors, [] );
		console.log(
			'PASS: Image module loading, lightbox/zoom/themes/groups/keyboard, dialog in clipped container, tilt, protected/unprotected navigation and cleanup, downloads, mocked cart, back/repeated navigation and direct loading.'
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
