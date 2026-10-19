/** Run with: node scripts/tests/proofing-navigation.cjs
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
	'/style.css': path.join( root, 'build/pb-image-block/style-index.css' ),
	'/proofing.css': path.join(
		root,
		'build/proofing-gallery-block/style-index.css'
	),
	'/proofing.js': path.join( root, 'build/proofing-gallery-block/view.js' ),
	'/view.js': path.join( root, 'build/pb-image-block/view.js' ),
	'/premium-view.js': path.join(
		root,
		'build/pb-image-block/premium-view.js'
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
for ( const layout of [ 'grid', 'justified', 'masonry' ] ) {
	for ( const [ suffix, file ] of [
		[ 'css', 'style-index.css' ],
		[ 'js', 'view.js' ],
		[ 'premium.js', 'premium-view.js' ],
	] ) {
		modules[ `/${ layout }.${ suffix }` ] = path.join(
			root,
			`build/${ layout }-gallery-block/${ file }`
		);
	}
}
const pages = JSON.parse(
	fs.readFileSync(
		process.env.FBKS_PROOFING_FIXTURES ||
			'/tmp/folioblocks-proofing-fixtures.json',
		'utf8'
	)
);
const html = ( url ) => `<!doctype html><html><head>
<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/grid.css"><link rel="stylesheet" href="/justified.css"><link rel="stylesheet" href="/masonry.css"><link rel="stylesheet" href="/proofing.css"><script id="wp-importmap" type="importmap">${ JSON.stringify(
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
				'/grid.premium.js',
				'/justified.js',
				'/justified.premium.js',
				'/masonry.js',
				'/masonry.premium.js',
				'/proofing.js',
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
	const presence = [];
	const saves = [];
	let delaySave = false;
	let failSave = false;
	const server = http.createServer( ( req, res ) => {
		if ( modules[ req.url ] ) {
			res.setHeader(
				'Content-Type',
				req.url.endsWith( '.css' ) ? 'text/css' : 'text/javascript'
			);
			res.end( fs.readFileSync( modules[ req.url ] ) );
		} else if ( req.url.startsWith( '/api/proofing/' ) ) {
			let body = '';
			req.on( 'data', ( chunk ) => ( body += chunk ) );
			req.on( 'end', () => {
				const payload = JSON.parse( body );
				res.setHeader( 'Content-Type', 'application/json' );
				if ( req.url.endsWith( '/presence' ) ) {
					presence.push( payload );
					res.end( '{}' );
				} else {
					saves.push( payload );
					const shouldFail = failSave;
					setTimeout(
						() => {
							if ( shouldFail ) {
								res.statusCode = 500;
								res.end( '{}' );
							} else
								res.end(
									JSON.stringify( {
										status: payload.status,
										images: payload.images,
										updatedAt: new Date().toISOString(),
									} )
								);
						},
						delaySave ? 900 : 0
					);
				}
			} );
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
			viewport: { width: 1200, height: 1000 },
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
		await page.addInitScript( () => {
			window.proofingIntervals = new Set();
			const interval = window.setInterval.bind( window );
			const clear = window.clearInterval.bind( window );
			window.setInterval = ( callback, delay, ...args ) => {
				const id = interval(
					callback,
					delay === 45000 ? 200 : delay,
					...args
				);
				if ( delay === 45000 ) window.proofingIntervals.add( id );
				return id;
			};
			window.clearInterval = ( id ) => {
				window.proofingIntervals.delete( id );
				clear( id );
			};
		} );
		const base = `http://127.0.0.1:${ server.address().port }`;
		const navigate = async ( path ) => {
			await page.evaluate(
				( url ) => window.navigate( url ),
				base + path
			);
			await page.waitForTimeout( 200 );
		};
		const ready = () =>
			page.waitForFunction(
				() =>
					window.proofingIntervals.size === 1 &&
					document.querySelector(
						'.fbks-proofing-thumbnail-controls'
					)?.dataset.proofingImageId
			);
		const images = () =>
			page.locator( '.wp-block-folioblocks-pb-image-block' );
		const controls = () =>
			page.locator( '.fbks-proofing-thumbnail-controls' );
		const heart = () =>
			controls()
				.first()
				.locator( '.fbks-proofing-thumbnail-control--heart' );
		const filter = async ( value ) => {
			await page.locator( `[data-proofing-filter="${ value }"]` ).click();
			await page.waitForTimeout( 150 );
		};
		const visibleCount = () =>
			page
				.locator(
					'.wp-block-folioblocks-pb-image-block:not(.is-hidden)'
				)
				.count();
		const galleryState = () =>
			page.evaluate( async () => {
				const { store } = await import( '@wordpress/interactivity' );
				const id = document.querySelector( '.fbks-proofing-gallery' )
					.dataset.proofingGalleryId;
				return JSON.parse(
					JSON.stringify(
						store( 'folioblocks/proofing-gallery' ).state.galleries[
							id
						]
					)
				);
			} );
		const save = () =>
			page.locator( '.fbks-proofing-gallery__action-button--save' );
		const submit = () =>
			page.locator( '.fbks-proofing-gallery__action-button--submit' );
		await page.goto( base + '/empty' );
		await page.waitForFunction(
			() => typeof window.navigate === 'function'
		);
		await page.evaluate( () => ( window.documentMarker = 1 ) );
		await navigate( '/grid' );
		await ready();
		assert.equal(
			await page.evaluate( () => window.proofingIntervals.size ),
			1
		);
		assert.equal( await images().count(), 3 );
		const originalId = await page
			.locator( '.fbks-proofing-gallery' )
			.getAttribute( 'data-proofing-gallery-id' );
		const closedBefore = presence.filter(
			( item ) => item.presence === 'closed'
		).length;
		await heart().click();
		assert.equal( await heart().getAttribute( 'aria-pressed' ), 'true' );
		await controls()
			.nth( 1 )
			.locator( '.fbks-proofing-thumbnail-control--flag' )
			.click();
		await controls()
			.nth( 1 )
			.locator( '[data-proofing-flag-color="red"]' )
			.click();
		assert.equal(
			await images().nth( 1 ).getAttribute( 'data-proofing-flag' ),
			'red'
		);
		await controls()
			.nth( 2 )
			.locator( '.fbks-proofing-thumbnail-control--comment' )
			.click();
		await controls()
			.nth( 2 )
			.locator( 'textarea' )
			.fill( 'Please adjust the crop' );
		await controls().nth( 2 ).locator( '.is-primary' ).click();
		await filter( 'hearted' );
		assert.equal( await visibleCount(), 1 );
		await filter( 'flag-red' );
		assert.equal( await visibleCount(), 1 );
		await filter( 'commented' );
		assert.equal( await visibleCount(), 1 );
		await filter( 'all' );
		assert.equal( await visibleCount(), 3 );
		assert.equal( await page.locator( 'dialog[open]' ).count(), 0 );
		assert.equal(
			presence.filter( ( item ) => item.presence === 'closed' ).length,
			closedBefore
		);
		await page.locator( '.pb-image-block-lightbox' ).first().click();
		await page.waitForSelector( '.pb-image-lightbox' );
		await navigate( '/empty' );
		assert.equal( await page.locator( '.pb-image-lightbox' ).count(), 0 );
		assert.equal(
			await page.evaluate( () => document.body.style.overflow ),
			''
		);
		assert.equal(
			await page.evaluate( () => window.proofingIntervals.size ),
			0
		);
		const afterLeave = presence.length;
		await page.evaluate( () =>
			document.dispatchEvent( new Event( 'visibilitychange' ) )
		);
		await page.waitForTimeout( 500 );
		assert.equal( presence.length, afterLeave );
		await navigate( '/other' );
		await ready();
		assert.notEqual(
			await page
				.locator( '.fbks-proofing-gallery' )
				.getAttribute( 'data-proofing-gallery-id' ),
			originalId
		);
		assert.equal( await heart().getAttribute( 'aria-pressed' ), 'false' );
		await navigate( '/grid' );
		await ready();
		assert.equal( await heart().getAttribute( 'aria-pressed' ), 'true' );
		assert.equal(
			await images().nth( 1 ).getAttribute( 'data-proofing-flag' ),
			'red'
		);
		assert.equal(
			await images().nth( 2 ).getAttribute( 'data-proofing-comment' ),
			'Please adjust the crop'
		);
		await save().click();
		await page.waitForFunction( () =>
			document
				.querySelector( '.fbks-proofing-gallery__status' )
				.textContent.includes( 'You can return later' )
		);
		assert.equal( saves.length, 1 );
		assert.equal( saves[ 0 ].status, 'in_progress' );
		assert.equal( saves[ 0 ].images.length, 3 );
		assert.equal( saves[ 0 ].images[ 0 ].hearted, true );
		assert.equal( saves[ 0 ].images[ 1 ].flag, 'red' );
		assert.equal(
			saves[ 0 ].images[ 2 ].comment,
			'Please adjust the crop'
		);
		await submit().click();
		await page.waitForFunction( () =>
			document
				.querySelector( '.fbks-proofing-gallery__status' )
				.textContent.startsWith( 'Proofing selections submitted (' )
		);
		assert.equal( saves.length, 2 );
		assert.equal( saves[ 1 ].status, 'submitted' );
		assert.equal( saves[ 1 ].emailAdminOnSubmit, false );
		delaySave = true;
		await save().click();
		await page.waitForTimeout( 80 );
		assert.equal( await save().isDisabled(), true );
		assert.equal( await submit().isDisabled(), true );
		await navigate( '/empty' );
		await navigate( '/grid' );
		await ready();
		await heart().click();
		assert.equal( await heart().getAttribute( 'aria-pressed' ), 'false' );
		await page.waitForTimeout( 1000 );
		assert.equal( await heart().getAttribute( 'aria-pressed' ), 'false' );
		assert.equal( await save().isDisabled(), false );
		assert.equal( ( await galleryState() ).notice, '' );
		delaySave = false;
		failSave = true;
		await save().click();
		await page.waitForFunction( () =>
			document
				.querySelector( '.fbks-proofing-gallery__status' )
				.textContent.includes(
					'Your progress was saved in this browser'
				)
		);
		assert.equal( await save().isDisabled(), false );
		failSave = false;
		for ( const layout of [ 'justified', 'masonry' ] ) {
			await navigate( '/' + layout );
			await ready();
			await heart().click();
			await filter( 'hearted' );
			assert.equal( await visibleCount(), 1 );
			const container = page.locator( `.pb-${ layout }-gallery` );
			const filteredHeight = await container.evaluate(
				( el ) => el.getBoundingClientRect().height
			);
			assert.ok(
				filteredHeight > 0,
				layout + ' filtered layout collapsed'
			);
			await filter( 'all' );
			assert.equal( await visibleCount(), 3 );
			const bounds = await images().evaluateAll( ( els ) =>
				els.map( ( el ) => {
					const r = el.getBoundingClientRect();
					return { x: r.x, y: r.y, width: r.width, height: r.height };
				} )
			);
			assert.ok(
				bounds.every( ( r ) => r.width > 0 && r.height > 0 ),
				layout + ' lost dimensions'
			);
			assert.ok(
				bounds[ 1 ].x !== bounds[ 0 ].x ||
					bounds[ 1 ].y !== bounds[ 0 ].y,
				layout + ' overlaps images'
			);
		}
		await navigate( '/saved' );
		await ready();
		assert.equal( await heart().getAttribute( 'aria-pressed' ), 'true' );
		assert.equal(
			await images().first().getAttribute( 'data-proofing-flag' ),
			'green'
		);
		assert.equal(
			await images().first().getAttribute( 'data-proofing-comment' ),
			'Saved on the server'
		);
		await navigate( '/locked' );
		assert.equal( await images().count(), 0 );
		assert.equal(
			await page.locator( '.fbks-proofing-gallery-gate' ).count(),
			1
		);
		assert.equal(
			await page.evaluate( () => window.proofingIntervals.size ),
			0
		);
		await navigate( '/gallery-empty' );
		assert.equal( await images().count(), 0 );
		await save().click();
		await page.waitForFunction( () =>
			document
				.querySelector( '.fbks-proofing-gallery__status' )
				.textContent.includes( '(0 images)' )
		);
		await navigate( '/no-controls' );
		assert.equal( await controls().count(), 0 );
		for ( let i = 0; i < 3; i++ ) {
			await navigate( '/grid' );
			await ready();
			assert.equal(
				await page.evaluate( () => window.proofingIntervals.size ),
				1
			);
			await navigate( '/empty' );
			assert.equal(
				await page.evaluate( () => window.proofingIntervals.size ),
				0
			);
		}
		await page.goBack();
		await ready();
		assert.equal( await heart().getAttribute( 'aria-pressed' ), 'false' );
		assert.equal( await page.evaluate( () => window.documentMarker ), 1 );
		await page.goto( base + '/grid' );
		await ready();
		assert.equal( await heart().getAttribute( 'aria-pressed' ), 'false' );
		assert.equal(
			await images().nth( 1 ).getAttribute( 'data-proofing-flag' ),
			'red'
		);
		assert.equal(
			await images().nth( 2 ).getAttribute( 'data-proofing-comment' ),
			'Please adjust the crop'
		);
		assert.deepEqual( errors, [] );
		console.log(
			'PASS: Proofing hearts/flags/comments, filter reflows in all three layouts, draft isolation/restoration, save/submit and aborted responses, browser fallback, presence cleanup, password gate, repeated/back/direct navigation.'
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
