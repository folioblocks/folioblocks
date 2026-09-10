import {
	getVideoIframeSrc,
	getVideoProviderData,
	getVideoProviderLabel,
	isPremiumVideoProvider,
} from './videoProviders';

describe( 'Livid video provider', () => {
	const videoId = 'IdWikusWSwz3';
	const watchUrl = `https://livid.com/watch/${ videoId }`;

	it( 'recognizes watch and embed URLs for Pro users', () => {
		expect(
			getVideoProviderData( watchUrl, { isPro: true } )
		).toMatchObject( {
			provider: 'livid',
			videoId,
		} );
		expect(
			getVideoProviderData( `https://livid.com/embed/${ videoId }`, {
				isPro: true,
			} )
		).toMatchObject( { provider: 'livid', videoId } );
	} );

	it( 'gates Livid playback to FolioBlocks Pro', () => {
		expect( isPremiumVideoProvider( 'livid' ) ).toBe( true );
		expect(
			getVideoProviderData( watchUrl, { isPro: false } )
		).toMatchObject( {
			provider: 'unsupported',
			unsupportedProvider: 'livid',
		} );
		expect( getVideoProviderLabel( watchUrl, { isPro: false } ) ).toBe(
			'Livid'
		);
		expect( getVideoIframeSrc( watchUrl, { isPro: false } ) ).toBeNull();
	} );

	it( 'builds an autoplay embed URL and preserves Livid parameters', () => {
		const iframeUrl = getVideoIframeSrc(
			`${ watchUrl }?dnt=1&controls=0#t=25`,
			{ autoplay: true, isPro: true }
		);
		const parsedIframeUrl = new URL( iframeUrl );

		expect( parsedIframeUrl.origin ).toBe( 'https://livid.com' );
		expect( parsedIframeUrl.pathname ).toBe( `/embed/${ videoId }` );
		expect( parsedIframeUrl.searchParams.get( 'dnt' ) ).toBe( '1' );
		expect( parsedIframeUrl.searchParams.get( 'controls' ) ).toBe( '0' );
		expect( parsedIframeUrl.searchParams.get( 'autoplay' ) ).toBe( 'true' );
		expect( parsedIframeUrl.hash ).toBe( '#t=25' );
	} );

	it( 'does not match lookalike domains', () => {
		expect(
			getVideoProviderData( `https://not-livid.com/watch/${ videoId }`, {
				isPro: true,
			} ).provider
		).toBe( 'self' );
	} );
} );
