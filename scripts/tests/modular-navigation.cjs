/** Run with: node scripts/tests/modular-navigation.cjs
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
	'/modular.css': path.join(
		root,
		'build/modular-gallery-block/style-index.css'
	),
	'/modular.js': path.join( root, 'build/modular-gallery-block/view.js' ),
	'/modular-premium.js': path.join(
		root,
		'build/modular-gallery-block/premium-view.js'
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
 data-caption="Caption ${ key }" data-lightbox-theme="${ theme }" data-lightbox-counter="true" data-lightbox-zoom="true" width="600" height="400" style="width:100%;height:100%" loading="lazy">
 <button class="pb-image-block-download" data-full-src="/download.svg">Download</button>
 <button class="pb-add-to-cart-icon" data-woo-action="add_to_cart" data-product-id="123">Cart</button>
 </figure></div>`;
const row = ( contents ) =>
	`<div class="pb-image-row wp-block-folioblocks-pb-image-row">${ contents }</div>`;
const stack = ( contents ) =>
	`<div class="pb-image-stack wp-block-folioblocks-pb-image-stack">${ contents }</div>`;
const composition = ( key ) =>
	row(
		image( key + '-a' ) +
			stack(
				image( key + '-b' ) +
					row( image( key + '-c' ) + image( key + '-d' ) )
			)
	) + row( image( key + '-e' ) + image( key + '-f' ) );
const gallery = (
	key,
	protectedPage = false,
	contents = composition( key ),
	classes = 'collapse-on-mobile'
) => `
<div class="wp-block-folioblocks-modular-gallery-block is-loading" data-wp-key="${ key }" data-wp-interactive="folioblocks/modular"
 data-wp-watch="callbacks.initialize" data-disable-right-click="${ protectedPage }" data-disable-drag-to-save="${ protectedPage }"
 style="--pb-gallery-gap-desktop:12px;--pb-gallery-gap-tablet:8px;--pb-gallery-gap-mobile:4px">
 <div class="pb-modular-gallery ${ classes }" data-wp-watch="callbacks.premium">${ contents }</div></div>`;
const pages = {
	'/empty': '',
	'/modular': gallery( 'first', true ),
	'/different': gallery( 'different' ),
	'/multiple': gallery( 'first', true ) + gallery( 'second', true ),
	'/empty-modular': gallery( 'empty', false, '' ),
	'/no-gap': gallery(
		'no-gap',
		false,
		composition( 'no-gap' ),
		'no-gap collapse-on-mobile'
	),
	'/no-collapse': gallery(
		'no-collapse',
		false,
		composition( 'no-collapse' ),
		''
	),
	'/broken': gallery(
		'broken',
		false,
		composition( 'broken' ).replaceAll( picture, '/broken.jpg' )
	),
	'/pending': gallery(
		'pending',
		false,
		row(
			image( 'pending' )
				.replaceAll( picture, '/pending.svg' )
				.replace( 'width="600" height="400"', '' )
		)
	),
	'/hidden': gallery( 'hidden' ).replace(
		'style="--pb-gallery',
		'style="display:none;--pb-gallery'
	),
	'/image': image( 'standalone' ),
};
const html = ( url ) => `<!doctype html><html><head>
<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/modular.css"><script id="wp-importmap" type="importmap">${ JSON.stringify(
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
				'/modular.js',
				'/modular-premium.js',
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
				() => ! document.querySelector( '.is-loading' )
			);
			await page.waitForFunction( () =>
				Array.from(
					document.querySelectorAll(
						'.pb-modular-gallery .wp-block-folioblocks-pb-image-block'
					)
				).every( ( item ) => item.style.opacity === '1' )
			);
		};
		const geometry = async () => {
			await page.waitForFunction(
				() =>
					parseFloat(
						document.querySelector(
							'.pb-modular-gallery > .pb-image-row > div'
						).style.width
					) > 0
			);
			return page
				.locator( '.pb-modular-gallery' )
				.first()
				.evaluate( ( gallery ) => {
					const row = gallery.querySelector( '.pb-image-row' );
					const image = row.children[ 0 ];
					const stack = row.children[ 1 ];
					const nestedRow = stack.querySelector( '.pb-image-row' );
					return {
						width: row.clientWidth,
						imageWidth: parseFloat( image.style.width ),
						imageHeight: parseFloat( image.style.height ),
						stackWidth: parseFloat( stack.style.width ),
						stackHeight: parseFloat( stack.style.height ),
						nestedWidth: parseFloat( nestedRow.style.width ),
						nestedImages: Array.from( nestedRow.children ).map(
							( item ) => parseFloat( item.style.width )
						),
						gap: parseFloat( image.style.marginRight ),
					};
				} );
		};
		const check = ( values ) => {
			assert( Object.values( values ).flat().every( Number.isFinite ) );
			assert(
				Math.abs(
					values.imageWidth +
						values.stackWidth +
						values.gap -
						values.width
				) < 1
			);
			assert( Math.abs( values.imageHeight - values.stackHeight ) < 1 );
			assert(
				Math.abs(
					values.nestedImages.reduce( ( a, b ) => a + b, 0 ) +
						values.gap -
						values.nestedWidth
				) < 1
			);
		};
		await navigate( '/modular' );
		await settled();
		check( await geometry() );
		assert.equal( await contextMenuBlocked(), true );
		await page.setViewportSize( { width: 900, height: 900 } );
		await page.waitForTimeout( 100 );
		let values = await geometry();
		check( values );
		assert.equal( values.gap, 8 );
		await page.setViewportSize( { width: 600, height: 900 } );
		await page.waitForFunction(
			() =>
				document.querySelector( '.pb-image-stack' ).style.height === ''
		);
		assert.equal(
			await page
				.locator( '.pb-image-stack .pb-image-row' )
				.first()
				.evaluate( ( el ) => el.style.height ),
			''
		);
		assert.equal(
			await page
				.locator( '.pb-image-row' )
				.first()
				.evaluate( ( el ) => getComputedStyle( el ).display ),
			'block'
		);
		await page.setViewportSize( { width: 1280, height: 900 } );
		check( await geometry() );
		await page.locator( '.pb-image-block-lightbox' ).first().click();
		await page.waitForSelector( 'dialog[open] .pb-image-lightbox' );
		assert.equal(
			await page.locator( '.lightbox-counter' ).textContent(),
			'1 / 6'
		);
		await page.keyboard.press( 'ArrowRight' );
		assert.equal(
			await page.locator( '.lightbox-counter' ).textContent(),
			'2 / 6'
		);
		await page.keyboard.press( 'Escape' );
		await navigate( '/different' );
		await settled();
		assert.equal( await contextMenuBlocked(), false );
		await navigate( '/multiple' );
		await settled();
		assert.equal( await page.locator( '.pb-modular-gallery' ).count(), 2 );
		await navigate( '/modular' );
		await settled();
		assert.equal( await contextMenuBlocked(), true );
		await navigate( '/no-gap' );
		await settled();
		values = await geometry();
		check( values );
		assert.equal( values.gap, 0 );
		await page.setViewportSize( { width: 600, height: 900 } );
		await navigate( '/no-collapse' );
		await settled();
		check( await geometry() );
		assert.equal(
			await page
				.locator( '.pb-image-row' )
				.first()
				.evaluate( ( el ) => getComputedStyle( el ).display ),
			'flex'
		);
		await page.setViewportSize( { width: 1280, height: 900 } );
		await navigate( '/empty-modular' );
		await settled();
		assert.equal( await contextMenuBlocked(), false );
		await navigate( '/broken' );
		await settled();
		check( await geometry() );
		await navigate( '/hidden' );
		await settled();
		await page
			.locator( '.wp-block-folioblocks-modular-gallery-block' )
			.evaluate( ( el ) => {
				el.style.display = '';
			} );
		check( await geometry() );
		await navigate( '/pending' );
		await settled();
		assert(
			await page
				.locator( '.pb-image-row > div' )
				.evaluate( ( el ) => parseFloat( el.style.width ) > 0 )
		);
		await page.evaluate( () => {
			window.oldItem = document.querySelector( '.pb-image-row > div' );
			window.oldStyle = window.oldItem.getAttribute( 'style' );
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
			await page.evaluate( () => window.oldItem.getAttribute( 'style' ) ),
			await page.evaluate( () => window.oldStyle )
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
			await navigate( '/modular' );
			await settled();
			check( await geometry() );
		}
		assert.equal( await page.evaluate( () => window.documentMarker ), 1 );
		await page.goto( base + '/modular' );
		await settled();
		check( await geometry() );
		assert.deepEqual( errors, [] );
		console.log(
			'PASS: Modular rows/stacks/nested rows, geometry and gaps, mobile collapse and restore, grouped lightbox, protections, multiple/empty/broken/pending/hidden galleries, cleanup, back/repeated navigation and direct loading.'
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
