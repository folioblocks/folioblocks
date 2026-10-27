/** Run with: node scripts/tests/grid-navigation.cjs
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
	'/grid.css': path.join( root, 'build/grid-gallery-block/style-index.css' ),
	'/grid.js': path.join( root, 'build/grid-gallery-block/view.js' ),
	'/grid-premium.js': path.join(
		root,
		'build/grid-gallery-block/premium-view.js'
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
const picture =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='steelblue'/%3E%3C/svg%3E";
const image = ( key, protectedPage = false, theme = 'dark' ) => `
<div class="wp-block-folioblocks-pb-image-block" data-wp-key="${ key }" data-wp-interactive="folioblocks/image"
 data-filters="${
		key.includes( 'city' ) ? 'City' : 'Forest, Landscape'
 }" data-wp-watch="callbacks.initialize" data-disable-right-click="${ protectedPage }" data-disable-drag-to-save="${ protectedPage }">
 <dialog class="pb-image-lightbox-host" aria-label="Image lightbox"></dialog>
 <figure class="pb-image-block pb-effect-tilt" data-wp-watch="callbacks.premium">
 <img class="pb-image-block-img pb-image-block-lightbox" src="${ picture }" data-src="${ picture }"
 data-caption="Caption ${ key }" data-lightbox-theme="${ theme }" data-lightbox-counter="true" data-lightbox-zoom="true" style="width:300px;height:200px" loading="lazy">
 <button class="pb-image-block-download" data-full-src="/download.svg">Download</button>
 <button class="pb-add-to-cart-icon" data-woo-action="add_to_cart" data-product-id="123">Cart</button>
 </figure></div>`;
const gallery = (
	key,
	protectedPage = false,
	contents = image( key + '-forest' ) + image( key + '-city' )
) => `
<div class="wp-block-folioblocks-grid-gallery-block is-loading" data-wp-key="${ key }" data-wp-interactive="folioblocks/grid"
 data-wp-watch="callbacks.initialize" data-disable-right-click="${ protectedPage }" data-disable-drag-to-save="${ protectedPage }">
 <div class="pb-image-gallery-filters"><button class="filter-button is-active" data-filter="all">All</button><button class="filter-button" data-filter="forest">Forest</button><button class="filter-button" data-filter="CITY">City</button></div>
 <div class="pb-grid-gallery" data-wp-watch="callbacks.premium" style="--grid-cols-desktop:3;--grid-cols-tablet:2;--grid-cols-mobile:1">${ contents }</div></div>`;
const pages = {
	'/empty': '',
	'/grid': gallery( 'first', true ),
	'/different': gallery( 'different' ),
	'/multiple': gallery( 'first', true ) + gallery( 'second', true ),
	'/empty-grid': gallery( 'empty', false, '' ),
	'/broken': gallery(
		'broken',
		false,
		image( 'broken' ).replaceAll( picture, '/broken.jpg' )
	),
	'/pending': gallery(
		'pending',
		false,
		image( 'pending' ).replaceAll( picture, '/pending.svg' )
	),
	'/image': image( 'standalone' ),
};
const html = ( url ) => `<!doctype html><html><head>
<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/grid.css"><script id="wp-importmap" type="importmap">${ JSON.stringify(
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
		? [ '/view.js', '/premium-view.js', '/grid.js', '/grid-premium.js' ]
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

		await page.route( '**/broken.jpg', ( route ) =>
			route.fulfill( { status: 404, body: '' } )
		);
		let pending;
		await page.route( '**/pending.svg', ( route ) => {
			pending = route;
		} );
		await page.goto( base + '/empty' );
		await page.waitForFunction(
			() => typeof window.navigate === 'function'
		);
		await page.evaluate( () => {
			window.documentMarker = 1;
		} );
		const settled = async () => {
			await page.waitForFunction(
				() =>
					! document.querySelector(
						'.wp-block-folioblocks-grid-gallery-block.is-loading'
					)
			);
			await page.waitForFunction( () =>
				Array.from(
					document.querySelectorAll(
						'.pb-grid-gallery > .wp-block-folioblocks-pb-image-block'
					)
				).every( ( el ) => el.classList.contains( 'is-visible' ) )
			);
		};
		await navigate( '/grid' );
		await settled();
		assert.equal( await contextMenuBlocked(), true );
		const figure = page.locator( 'figure.pb-image-block' ).first();
		const desktopWidth = await figure.evaluate( ( el ) =>
			parseFloat( el.style.width )
		);
		assert( desktopWidth > 0 );
		await page.setViewportSize( { width: 600, height: 900 } );
		await page.waitForFunction(
			( oldWidth ) =>
				parseFloat(
					document.querySelector( 'figure.pb-image-block' ).style
						.width
				) > oldWidth,
			desktopWidth
		);
		await page.setViewportSize( { width: 1280, height: 900 } );
		await page.locator( '.filter-button[data-filter="forest"]' ).click();
		assert.equal(
			await page.locator( '.pb-grid-gallery > .is-hidden' ).count(),
			1
		);
		await page.locator( '.filter-button[data-filter="CITY"]' ).click();
		assert.equal(
			await page.locator( '.pb-grid-gallery > .is-hidden' ).count(),
			1
		);
		await page.locator( '.filter-button[data-filter="all"]' ).click();
		assert.equal(
			await page.locator( '.pb-grid-gallery > .is-hidden' ).count(),
			0
		);
		await page.locator( '.pb-image-block-lightbox' ).first().click();
		await page.waitForSelector( 'dialog[open] .pb-image-lightbox' );
		assert.equal(
			await page.locator( '.lightbox-counter' ).textContent(),
			'1 / 2'
		);
		await page.keyboard.press( 'ArrowRight' );
		assert.equal(
			await page.locator( '.lightbox-counter' ).textContent(),
			'2 / 2'
		);
		await page.keyboard.press( 'Escape' );
		await navigate( '/different' );
		await settled();
		assert.equal( await contextMenuBlocked(), false );
		await navigate( '/multiple' );
		await settled();
		await page
			.locator( '.filter-button[data-filter="forest"]' )
			.first()
			.click();
		assert.equal(
			await page
				.locator( '.wp-block-folioblocks-grid-gallery-block' )
				.nth( 1 )
				.locator( '.is-hidden' )
				.count(),
			0
		);
		await navigate( '/grid' );
		await settled();
		assert.equal( await contextMenuBlocked(), true );
		await navigate( '/empty-grid' );
		await settled();
		assert.equal( await contextMenuBlocked(), false );
		await navigate( '/broken' );
		await settled();
		await navigate( '/pending' );
		await page.waitForFunction(
			() => ! document.querySelector( '.is-loading' )
		);
		await page.waitForFunction(
			() => !! document.querySelector( '.pb-grid-gallery img' )
		);
		await page.evaluate( () => {
			window.oldItem = document.querySelector( '.pb-grid-gallery > div' );
		} );
		await navigate( '/image' );
		if ( pending ) {
			await pending
				.fulfill( {
					status: 200,
					contentType: 'image/svg+xml',
					body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"/>',
				} )
				.catch( () => {} );
		}
		await page.waitForTimeout( 200 );
		assert.equal(
			await page.evaluate( () =>
				window.oldItem.classList.contains( 'is-visible' )
			),
			false
		);
		await page.locator( '.pb-image-block-lightbox' ).click();
		await page.waitForSelector( 'dialog[open]' );
		await navigate( '/empty' );
		assert.equal(
			await page.locator( '.pb-image-lightbox, dialog[open]' ).count(),
			0
		);
		await page.goBack();
		await page.waitForSelector( '.pb-image-block-lightbox' );
		for ( let i = 0; i < 3; i++ ) {
			await navigate( '/empty' );
			await navigate( '/grid' );
			await settled();
		}
		assert.equal( await page.evaluate( () => window.documentMarker ), 1 );
		await page.goto( base + '/grid' );
		await settled();
		assert.deepEqual( errors, [] );
		console.log(
			'PASS: Grid modules, layout/reveal, responsive sizing, filters and gallery isolation, grouped lightbox, page protection, empty/broken/pending images, cleanup, back/repeated navigation and direct loading.'
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
