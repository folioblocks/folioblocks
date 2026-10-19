/** Run with: node scripts/tests/background-video-navigation.cjs
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
	'/view.js': path.join( root, 'build/background-video-block/view.js' ),
	'/premium-view.js': path.join(
		root,
		'build/background-video-block/premium-view.js'
	),
};
const background = (
	key,
	provider = 'self',
	protectedPage = false,
	options = {}
) => `
<div class="pb-bgvid" data-wp-key="${ key }" data-wp-interactive="folioblocks/background-video"
 data-wp-watch="callbacks.protection" data-disable-right-click="${ protectedPage }"
 data-fbks-bgvid='${ JSON.stringify( {
		provider,
		url: '/sample.mp4',
		vimeoId: '123',
		loop: true,
		...options,
 } ) }'>
 <div class="pb-bgvid__media" data-wp-watch="callbacks.initialize" style="position:relative;width:600px;height:400px">
 ${
		provider === 'vimeo'
			? '<div class="pb-bgvid__vimeo" style="position:absolute;inset:0"><iframe title="Vimeo background video"></iframe></div>'
			: '<video class="pb-bgvid__video"></video>'
 }
 </div></div>`;
const pages = {
	'/empty': '',
	'/self': background( 'self', 'self', true ),
	'/hover': background( 'hover', 'self', false, { playOnHover: true } ),
	'/mobile': background( 'mobile', 'self', false, { disableMobile: true } ),
	'/vimeo': background( 'vimeo', 'vimeo' ),
	'/vimeo-mobile': background( 'vimeo-mobile', 'vimeo', false, {
		disableMobile: true,
	} ),
	'/multiple': background( 'one' ) + background( 'two', 'vimeo', true ),
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

		await page.addInitScript( () => {
			window.mediaCalls = { play: 0, pause: 0, load: 0 };
			HTMLMediaElement.prototype.play = function () {
				window.mediaCalls.play++;
				if ( window.rejectPlay ) {
					return Promise.reject( new Error( 'Blocked' ) );
				}
				if ( window.delayPlay ) {
					return new Promise( ( resolve ) => {
						window.resolvePlay = resolve;
					} );
				}
				return Promise.resolve();
			};
			HTMLMediaElement.prototype.pause = function () {
				window.mediaCalls.pause++;
			};
			HTMLMediaElement.prototype.load = function () {
				window.mediaCalls.load++;
			};
		} );
		await page.route( '**/sample.mp4', ( route ) =>
			route.fulfill( { status: 200, contentType: 'video/mp4', body: '' } )
		);
		await page.route( 'https://player.vimeo.com/**', ( route ) =>
			route.fulfill( { contentType: 'text/html', body: '<html></html>' } )
		);
		await page.route(
			'https://vimeo.com/api/oembed.json**',
			async ( route ) => {
				await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );
				await route
					.fulfill( {
						contentType: 'application/json',
						body: JSON.stringify( { width: 1920, height: 1080 } ),
					} )
					.catch( () => {} );
			}
		);
		await page.goto( base + '/empty' );
		await page.waitForFunction(
			() => typeof window.navigate === 'function'
		);
		await page.evaluate( () => {
			window.documentMarker = 1;
		} );
		await navigate( '/self' );
		await page.waitForSelector( '.pb-bgvid.is-playing' );
		assert.equal( await contextMenuBlocked(), true );
		assert.equal(
			await page
				.locator( 'video' )
				.evaluate( ( el ) => el.muted && el.loop && el.playsInline ),
			true
		);
		await page.evaluate( () => {
			window.oldVideo = document.querySelector( 'video' );
		} );
		await navigate( '/empty' );
		assert.equal( await contextMenuBlocked(), false );
		assert.equal(
			await page.evaluate( () => window.oldVideo.hasAttribute( 'src' ) ),
			false
		);
		assert(
			await page.evaluate(
				() => window.mediaCalls.pause > 0 && window.mediaCalls.load > 0
			)
		);
		await page.evaluate( () => {
			window.delayPlay = true;
		} );
		await navigate( '/self' );
		await page.evaluate( () => {
			window.oldRoot = document.querySelector( '.pb-bgvid' );
		} );
		await navigate( '/empty' );
		await page.evaluate( () => {
			window.delayPlay = false;
			window.resolvePlay();
		} );
		assert.equal(
			await page.evaluate( () =>
				window.oldRoot.classList.contains( 'is-playing' )
			),
			false
		);
		await page.evaluate( () => {
			window.rejectPlay = true;
		} );
		await navigate( '/self' );
		assert.equal( await page.locator( '.is-playing' ).count(), 0 );
		await page.evaluate( () => {
			window.rejectPlay = false;
		} );
		await navigate( '/hover' );
		await page.locator( '.pb-bgvid' ).dispatchEvent( 'mouseleave' );
		assert.equal( await page.locator( '.is-playing' ).count(), 0 );
		await page.locator( '.pb-bgvid' ).dispatchEvent( 'mouseenter' );
		await page.waitForSelector( '.pb-bgvid.is-playing' );
		await navigate( '/vimeo' );
		assert.equal( await page.locator( 'iframe[src]' ).count(), 1 );
		await page.waitForFunction(
			() =>
				parseFloat( document.querySelector( 'iframe' ).style.width ) >=
				600
		);
		await page.evaluate( () => {
			window.oldFrame = document.querySelector( 'iframe' );
		} );
		await navigate( '/empty' );
		assert.equal(
			await page.evaluate( () => window.oldFrame.hasAttribute( 'src' ) ),
			false
		);
		await page.emulateMedia( { reducedMotion: 'reduce' } );
		await navigate( '/self' );
		assert.equal( await page.locator( '.is-playing' ).count(), 0 );
		await navigate( '/vimeo' );
		assert.equal( await page.locator( 'iframe[src]' ).count(), 0 );
		await page.emulateMedia( { reducedMotion: 'no-preference' } );
		await page.setViewportSize( { width: 600, height: 800 } );
		await navigate( '/mobile' );
		assert.equal( await page.locator( 'video[src]' ).count(), 0 );
		await navigate( '/vimeo-mobile' );
		assert.equal( await page.locator( 'iframe[src]' ).count(), 0 );
		await page.setViewportSize( { width: 1200, height: 800 } );
		await navigate( '/multiple' );
		assert.equal( await page.locator( '.is-playing' ).count(), 2 );
		await navigate( '/empty' );
		assert.equal( await contextMenuBlocked(), false );
		await page.goBack();
		await page.waitForSelector( '.pb-bgvid.is-playing' );
		for ( let i = 0; i < 3; i++ ) {
			await navigate( '/empty' );
			await navigate( '/vimeo' );
			assert.equal( await page.locator( 'iframe[src]' ).count(), 1 );
		}
		assert.equal( await page.evaluate( () => window.documentMarker ), 1 );
		await page.goto( base + '/self' );
		await page.waitForSelector( '.pb-bgvid.is-playing' );
		assert.deepEqual( errors, [] );
		console.log(
			'PASS: navigation/module loading, self-hosted playback and cleanup, pending/rejected playback, hover, Vimeo sizing/cleanup, reduced motion, disabled mobile, multiple blocks, protection, back/repeated navigation and direct loading. Playback/Vimeo responses simulated.'
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
