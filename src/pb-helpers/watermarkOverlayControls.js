import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { Notice, SelectControl, ToggleControl } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';

const DISPLAY_NONE = 'none';
const DISPLAY_GALLERY = 'gallery';
const DISPLAY_LIGHTBOX = 'lightbox';
const DISPLAY_BOTH = 'both';
const WATERMARK_DEFAULT = '__default';

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

const getDefaultWatermark = () => {
	const settings = getWatermarkSettings();

	if ( ! settings.defaultWatermarkId ) {
		return null;
	}

	return getSavedWatermarkById( settings.defaultWatermarkId );
};

const getEffectiveWatermarkById = ( watermarkId ) =>
	watermarkId === WATERMARK_DEFAULT
		? getDefaultWatermark()
		: getSavedWatermarkById( watermarkId );

const getDefaultWatermarkAttributes = () => {
	const settings = getWatermarkSettings();

	if ( ! settings.enabledByDefault || ! settings.defaultWatermarkId ) {
		return null;
	}

	const watermark = getDefaultWatermark();
	if ( ! watermark ) {
		return null;
	}

	return {
		enableWatermarking: true,
		watermarkId: WATERMARK_DEFAULT,
		watermarkDisplay: DISPLAY_GALLERY,
	};
};

const shouldApplyDefaultWatermark = ( attributes = {} ) =>
	! attributes.enableWatermarking &&
	! attributes.watermarkId &&
	( ! attributes.watermarkDisplay ||
		attributes.watermarkDisplay === DISPLAY_NONE );

const getWatermarkSizingEdge = ( width, height ) => {
	const shortEdge = Math.min( width, height );
	const longEdge = Math.max( width, height );
	const aspectRatio = shortEdge > 0 ? longEdge / shortEdge : 1;
	const squareAdjustment =
		aspectRatio >= 1.2 ? 1 : 0.78 + ( ( aspectRatio - 1 ) / 0.2 ) * 0.22;

	return shortEdge * Math.min( 1, Math.max( 0.78, squareAdjustment ) );
};

const getWatermarkRenderMetrics = (
	width,
	height,
	sizeRatio,
	insetRatio,
	baseline
) => {
	const sizingEdge = baseline || getWatermarkSizingEdge( width, height );

	return {
		renderSize: ( sizingEdge * sizeRatio ) / 100,
		renderInset: ( sizingEdge * insetRatio ) / 100,
	};
};

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
	const watermark = getEffectiveWatermarkById( watermarkId );

	return {
		enabled: !! enabled,
		watermark,
		display: display || DISPLAY_NONE,
	};
};

export const WatermarkOverlay = ( props = {} ) => {
	const overlayRef = useRef( null );
	const [ renderMetrics, setRenderMetrics ] = useState( null );
	const { enabled, watermark, display } = getEffectiveWatermarkState( props );

	useEffect( () => {
		const overlay = overlayRef.current;
		const imageBlock = overlay?.closest( '.pb-image-block' );
		const image = imageBlock?.querySelector( '.pb-image-block-img' );
		const carouselGallery = imageBlock?.closest( '.pb-carousel-gallery' );

		if ( ! enabled || ! watermark || ! overlay || ! image ) {
			return undefined;
		}

		const syncMetrics = () => {
			const imageRect = image.getBoundingClientRect();
			const sizeRatio = Number( watermark.size ?? 16 );
			const insetRatio = Number( watermark.inset ?? 4 );
			const { renderSize, renderInset } = getWatermarkRenderMetrics(
				imageRect.width,
				imageRect.height,
				Number.isFinite( sizeRatio ) ? sizeRatio : 16,
				Number.isFinite( insetRatio ) ? insetRatio : 4,
				carouselGallery ? imageRect.height : null
			);

			setRenderMetrics( {
				'--pb-watermark-render-size': `${ renderSize }px`,
				'--pb-watermark-inset': `${ renderInset }px`,
			} );
		};
		const scheduleSync = () => window.requestAnimationFrame( syncMetrics );
		const resizeObserver =
			typeof window.ResizeObserver !== 'undefined'
				? new window.ResizeObserver( scheduleSync )
				: null;

		scheduleSync();
		image.addEventListener( 'load', scheduleSync );
		window.addEventListener( 'resize', scheduleSync );
		if ( resizeObserver ) {
			resizeObserver.observe( image );
		}

		return () => {
			image.removeEventListener( 'load', scheduleSync );
			window.removeEventListener( 'resize', scheduleSync );
			if ( resizeObserver ) {
				resizeObserver.disconnect();
			}
		};
	}, [ enabled, watermark ] );

	if (
		! enabled ||
		! watermark ||
		! isWatermarkDisplayOnGalleryImages( display )
	) {
		return null;
	}

	return (
		<span
			ref={ overlayRef }
			className="pb-watermark-overlay"
			style={ {
				...getWatermarkStyleVars( watermark ),
				...( renderMetrics || {} ),
			} }
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
			<WatermarkDefaultAttributes
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
			<ToggleControl
				label={ __( 'Enable Watermarking', 'folioblocks' ) }
				help={ __(
					'Apply one of your saved watermarks to this block.',
					'folioblocks'
				) }
				checked={ enableWatermarking }
				onChange={ ( nextValue ) => {
					if ( nextValue && ! hasSavedWatermarks ) {
						setAttributes( {
							enableWatermarking: false,
							watermarkId: '',
							watermarkDisplay: DISPLAY_NONE,
						} );
						return;
					}

					const defaultAttributes = nextValue
						? getDefaultWatermarkAttributes()
						: null;

					setAttributes( {
						enableWatermarking: nextValue,
						...( nextValue && defaultAttributes
							? {
									watermarkId:
										defaultAttributes.watermarkId,
									watermarkDisplay:
										attributes.watermarkDisplay &&
										attributes.watermarkDisplay !==
											DISPLAY_NONE
											? attributes.watermarkDisplay
											: defaultAttributes.watermarkDisplay,
							  }
							: {} ),
						...( ! nextValue
							? { watermarkDisplay: DISPLAY_NONE }
							: {} ),
					} );
				} }
				__nextHasNoMarginBottom
			/>

			{ ! hasSavedWatermarks && (
				<Notice status="warning" isDismissible={ false }>
					{ __(
						'No saved watermarks are available. Create and save a watermark in FolioBlocks Global Settings before enabling watermarking.',
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
									'Default Watermark',
									'folioblocks'
								),
								value: WATERMARK_DEFAULT,
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

export const WatermarkDefaultAttributes = ( {
	attributes = {},
	setAttributes,
} ) => {
	const didApplyDefault = useRef( false );

	useEffect( () => {
		if (
			didApplyDefault.current ||
			typeof setAttributes !== 'function' ||
			! shouldApplyDefaultWatermark( attributes )
		) {
			return;
		}

		const defaultAttributes = getDefaultWatermarkAttributes();
		if ( ! defaultAttributes ) {
			return;
		}

		didApplyDefault.current = true;
		setAttributes( defaultAttributes );
	}, [
		attributes.enableWatermarking,
		attributes.watermarkDisplay,
		attributes.watermarkId,
		setAttributes,
	] );

	return null;
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

	addFilter(
		`${ hookPrefix }.editorEnhancements`,
		`${ namespace }-default-watermark-attributes`,
		( defaultContent, props = {} ) => (
			<>
				{ defaultContent }
				<WatermarkDefaultAttributes { ...props } />
			</>
		)
	);
};

export const registerImageBlockWatermarkOverlay = () => {
	addFilter(
		'folioBlocks.imageBlock.watermarkOverlay',
		'folioblocks/image-block-watermark-overlay',
		( defaultContent, props = {} ) => <WatermarkOverlay { ...props } />
	);
};
