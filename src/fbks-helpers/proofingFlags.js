import { __ } from '@wordpress/i18n';

export const simpleProofingFlags = () => [
	{ value: 'red', label: __( 'Red', 'folioblocks' ), color: '#dc2626' },
	{ value: 'orange', label: __( 'Orange', 'folioblocks' ), color: '#f97316' },
	{ value: 'green', label: __( 'Green', 'folioblocks' ), color: '#16a34a' },
];

export const getProofingFlags = ( attributes = {} ) =>
	attributes.flagMode === 'advanced' &&
	Array.isArray( attributes.flagPalette?.items )
		? attributes.flagPalette.items
		: simpleProofingFlags();

export const getProofingPaletteOptions = ( snapshot = {} ) => {
	const options = Object.entries(
		window.folioBlocksData?.proofingFlagPalettes || {}
	).map( ( [ value, preset ] ) => ( { value, label: preset.label } ) );
	const selected = getProofingPaletteId( snapshot );
	if (
		snapshot.items &&
		! options.some( ( option ) => option.value === selected )
	) {
		options.unshift( {
			value: selected,
			label: snapshot.name || __( 'Saved palette', 'folioblocks' ),
		} );
	}
	return options;
};

export const getProofingPaletteId = ( snapshot = {} ) =>
	snapshot.preset ||
	Object.entries( window.folioBlocksData?.proofingFlagPalettes || {} ).find(
		( [ , preset ] ) => preset.label === snapshot.name
	)?.[ 0 ] ||
	( snapshot.items
		? 'retained'
		: window.folioBlocksData?.mediaMetadata?.palettePreset || 'custom' );

/** Copy definitions regardless of whether attachment color-class tools are enabled. */
export const captureProofingPalette = ( selected ) => {
	const settings = window.folioBlocksData?.mediaMetadata || {};
	const preset = selected || settings.palettePreset || 'custom';
	const definition = window.folioBlocksData?.proofingFlagPalettes?.[ preset ];
	const items =
		! selected || preset === settings.palettePreset
			? settings.palette
			: definition?.items;
	return {
		preset,
		name: definition?.label || preset,
		items: Object.entries( items || {} )
			.filter( ( [ , item ] ) => item.enabled )
			.map( ( [ value, item ] ) => ( {
				value: `class-${ value }`,
				label: item.label,
				color: item.color,
			} ) ),
	};
};

/** Pale colors need a contrasting edge on the white filter bar. */
export const getProofingFlagOutline = ( color = '' ) => {
	const hex = color.replace( '#', '' );
	const full =
		hex.length === 3
			? hex
					.split( '' )
					.map( ( char ) => char + char )
					.join( '' )
			: hex;
	const rgb = [ 0, 2, 4 ].map( ( offset ) =>
		parseInt( full.slice( offset, offset + 2 ), 16 )
	);
	return rgb[ 0 ] * 0.299 + rgb[ 1 ] * 0.587 + rgb[ 2 ] * 0.114 > 220
		? '#64748b'
		: color;
};
