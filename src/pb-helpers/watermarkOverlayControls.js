import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { Notice, SelectControl, ToggleControl } from '@wordpress/components';

const DISPLAY_NONE = 'none';
const DISPLAY_GALLERY = 'gallery';
const DISPLAY_LIGHTBOX = 'lightbox';
const DISPLAY_BOTH = 'both';

const getWatermarkSettings = () =>
	typeof window !== 'undefined'
		? window.folioBlocksData?.watermarks || { items: [] }
		: { items: [] };

export const getSavedWatermarks = () => {
	const items = getWatermarkSettings().items;
	return Array.isArray( items ) ? items.filter( ( item ) => item?.id ) : [];
};

export const getSavedWatermarkById = ( watermarkId ) =>
	getSavedWatermarks().find( ( item ) => item.id === watermarkId ) || null;

export const isWatermarkDisplayOnGalleryImages = ( display ) =>
	[ DISPLAY_GALLERY, DISPLAY_BOTH ].includes( display );

export const isWatermarkDisplayInLightbox = ( display ) =>
	[ DISPLAY_LIGHTBOX, DISPLAY_BOTH ].includes( display );

export const hasLightboxEnabled = ( attributes = {}, context = {} ) => {
	const clickAction =
		attributes.imageClickAction ||
		context?.[ 'folioBlocks/imageClickAction' ];
	return Boolean(
		attributes.lightbox ||
			context?.[ 'folioBlocks/lightbox' ] ||
			clickAction === 'lightbox'
	);
};

export const getWatermarkStyleVars = ( watermark = {} ) => {
	if ( ! watermark?.assetUrl ) {
		return {};
	}
	const escapedAssetUrl = watermark.assetUrl.replace( /["\\]/g, '\\$&' );

	const positionMap = {
		center: 'center',
		'top-left': 'top left',
		'top-right': 'top right',
		'bottom-left': 'bottom left',
		'bottom-right': 'bottom right',
	};

	const size = Number( watermark.size ?? 16 );
	const renderSize = Number.isFinite( size ) ? size : 16;

	return {
		'--pb-watermark-image': `url("${ escapedAssetUrl }")`,
		'--pb-watermark-opacity': watermark.opacity ?? 0.28,
		'--pb-watermark-size': `${ renderSize }%`,
		'--pb-watermark-render-size': `${ renderSize }%`,
		'--pb-watermark-inset': `${ watermark.inset ?? 4 }cqw`,
		'--pb-watermark-position':
			positionMap[ watermark.position ] || positionMap[ 'bottom-right' ],
		'--pb-watermark-repeat': watermark.repeat || 'no-repeat',
	};
};

export const getEffectiveWatermarkState = ( {
	attributes = {},
	context = {},
	isInsideGallery = false,
} = {} ) => {
	const enabled = isInsideGallery
		? context?.[ 'folioBlocks/enableWatermarking' ]
		: attributes.enableWatermarking;
	const watermarkId = isInsideGallery
		? context?.[ 'folioBlocks/watermarkId' ]
		: attributes.watermarkId;
	const display = isInsideGallery
		? context?.[ 'folioBlocks/watermarkDisplay' ]
		: attributes.watermarkDisplay;
	const watermark = getSavedWatermarkById( watermarkId );

	return {
		enabled: !! enabled,
		watermark,
		display: display || DISPLAY_NONE,
	};
};

export const WatermarkOverlay = ( props = {} ) => {
	const { enabled, watermark, display } = getEffectiveWatermarkState( props );

	if (
		! enabled ||
		! watermark ||
		! isWatermarkDisplayOnGalleryImages( display )
	) {
		return null;
	}

	return (
		<span
			className="pb-watermark-overlay"
			style={ getWatermarkStyleVars( watermark ) }
			aria-hidden="true"
		/>
	);
};

export const WatermarkControls = ( {
	attributes = {},
	setAttributes,
	context = {},
} ) => {
	const savedWatermarks = getSavedWatermarks();
	const hasSavedWatermarks = savedWatermarks.length > 0;
	const lightboxEnabled = hasLightboxEnabled( attributes, context );
	const enableWatermarking = !! attributes.enableWatermarking;
	const displayOptions = [
		{
			label: __( 'None', 'folioblocks' ),
			value: DISPLAY_NONE,
		},
		{
			label: __( 'Gallery Images', 'folioblocks' ),
			value: DISPLAY_GALLERY,
		},
	];

	if ( lightboxEnabled ) {
		displayOptions.push(
			{
				label: __( 'Lightbox', 'folioblocks' ),
				value: DISPLAY_LIGHTBOX,
			},
			{
				label: __( 'Gallery Images & Lightbox', 'folioblocks' ),
				value: DISPLAY_BOTH,
			}
		);
	}

	return (
		<>
			<ToggleControl
				label={ __( 'Enable Watermarking', 'folioblocks' ) }
				help={ __(
					'Apply one of your saved watermarks to this block.',
					'folioblocks'
				) }
				checked={ enableWatermarking }
				onChange={ ( nextValue ) => {
					setAttributes( {
						enableWatermarking: nextValue,
						...( ! nextValue
							? { watermarkDisplay: DISPLAY_NONE }
							: {} ),
					} );
				} }
				__nextHasNoMarginBottom
			/>

			{ enableWatermarking && ! hasSavedWatermarks && (
				<Notice status="warning" isDismissible={ false }>
					{ __(
						'Create and save a watermark in FolioBlocks Global Settings before enabling watermarking.',
						'folioblocks'
					) }
				</Notice>
			) }

			{ enableWatermarking && hasSavedWatermarks && (
				<>
					<SelectControl
						label={ __( 'Watermark', 'folioblocks' ) }
						value={ attributes.watermarkId || '' }
						options={ [
							{
								label: __(
									'Select a watermark',
									'folioblocks'
								),
								value: '',
							},
							...savedWatermarks.map( ( watermark ) => ( {
								label: watermark.name,
								value: watermark.id,
							} ) ),
						] }
						onChange={ ( watermarkId ) =>
							setAttributes( { watermarkId } )
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<SelectControl
						label={ __( 'Display Watermark On', 'folioblocks' ) }
						value={ attributes.watermarkDisplay || DISPLAY_NONE }
						options={ displayOptions }
						onChange={ ( watermarkDisplay ) =>
							setAttributes( { watermarkDisplay } )
						}
						help={
							lightboxEnabled
								? __(
										'Choose where this watermark should appear.',
										'folioblocks'
								  )
								: __(
										'Enable the lightbox to watermark enlarged lightbox images.',
										'folioblocks'
								  )
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
				</>
			) }
		</>
	);
};

export const registerWatermarkOverlayControls = ( {
	hookPrefix,
	namespace,
} ) => {
	addFilter(
		`${ hookPrefix }.watermarkControls`,
		`${ namespace }-watermark-controls`,
		( defaultContent, props = {} ) => <WatermarkControls { ...props } />
	);
};

export const registerImageBlockWatermarkOverlay = () => {
	addFilter(
		'folioBlocks.imageBlock.watermarkOverlay',
		'folioblocks/image-block-watermark-overlay',
		( defaultContent, props = {} ) => <WatermarkOverlay { ...props } />
	);
};
