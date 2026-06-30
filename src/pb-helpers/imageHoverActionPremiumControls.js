import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import {
	SelectControl,
	ToggleControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { CompactTwoColorControl } from './CompactColorControl';
import { OverlayTypographyControls } from './overlayTypographyControls';

const OVERLAY_STYLE_OPTIONS = [
	{ label: __( 'None', 'folioblocks' ), value: 'none' },
	{ label: __( 'Fade Overlay', 'folioblocks' ), value: 'fade-overlay' },
	{
		label: __( 'Bottom Gradient', 'folioblocks' ),
		value: 'gradient-bottom',
	},
	{ label: __( 'Chip', 'folioblocks' ), value: 'chip' },
	{ label: __( 'Blur Overlay', 'folioblocks' ), value: 'blur-overlay' },
	{ label: __( 'Color Overlay', 'folioblocks' ), value: 'color-overlay' },
	{ label: __( 'Gradient Overlay', 'folioblocks' ), value: 'gradient-overlay' },
];

const HOVER_EFFECT_OPTIONS = [
	{ label: __( 'None', 'folioblocks' ), value: 'none' },
	{ label: __( 'Zoom In', 'folioblocks' ), value: 'zoom-in' },
	{ label: __( 'Zoom Out', 'folioblocks' ), value: 'zoom-out' },
	{ label: __( 'Lift', 'folioblocks' ), value: 'lift' },
	{ label: __( 'Tilt', 'folioblocks' ), value: 'tilt' },
	{ label: __( 'Pop', 'folioblocks' ), value: 'pop' },
	{ label: __( 'Glare', 'folioblocks' ), value: 'glare' },
	{ label: __( 'Pan', 'folioblocks' ), value: 'pan' },
	{ label: __( 'Desaturate', 'folioblocks' ), value: 'desaturate' },
];

const OVERLAY_ENTRANCE_OPTIONS = [
	{ label: __( 'Default', 'folioblocks' ), value: 'default' },
	{ label: __( 'Fade', 'folioblocks' ), value: 'fade' },
	{ label: __( 'Slide Up', 'folioblocks' ), value: 'slide-up' },
	{ label: __( 'Slide Down', 'folioblocks' ), value: 'slide-down' },
	{ label: __( 'Slide Left', 'folioblocks' ), value: 'slide-left' },
	{ label: __( 'Slide Right', 'folioblocks' ), value: 'slide-right' },
];

const DEFAULT_OVERLAY_BG_GRADIENT =
	'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(226,232,240,0.82) 100%)';
const getHoverEffect = ( attributes ) => attributes.hoverEffect || 'none';
const getOverlayEntrance = ( attributes ) =>
	attributes.overlayEntrance || 'default';
const supportsOverlayEntrance = ( overlayStyle ) =>
	[ 'blur-overlay', 'fade-overlay', 'color-overlay', 'gradient-overlay' ].includes(
		overlayStyle
	);
const isGradientValue = ( value ) =>
	typeof value === 'string' && value.toLowerCase().includes( 'gradient(' );

const getOverlayStyle = ( attributes ) => {
	const overlayEnabled = !! (
		attributes.onHoverTitle ??
		attributes.showTitleOnHover ??
		attributes.hoverTitle
	);

	if ( ! overlayEnabled ) {
		return 'none';
	}

	return attributes.onHoverStyle || 'blur-overlay';
};

const getOverlayHelp = ( value ) => {
	switch ( value ) {
		case 'fade-overlay':
			return __(
				'Fades in a clean title overlay when hovering over the image.',
				'folioblocks'
			);
		case 'gradient-bottom':
			return __(
				'Displays the overlay content over a subtle gradient at the bottom of the image.',
				'folioblocks'
			);
		case 'chip':
			return __(
				'Displays the overlay content in a compact chip above the image.',
				'folioblocks'
			);
		case 'blur-overlay':
			return __(
				'Adds a soft blur overlay behind the title or product info.',
				'folioblocks'
			);
		case 'color-overlay':
			return __(
				'Displays the overlay content over a solid background color set in Styles panel.',
				'folioblocks'
			);
		case 'gradient-overlay':
			return __(
				'Displays the overlay content over a gradient background set in Styles panel.',
				'folioblocks'
			);
		case 'none':
		default:
			return __(
				'Activate and set your overlay style.',
				'folioblocks'
			);
	}
};

export const registerImageHoverActionPremiumControls = ( {
	hookPrefix,
	namespace,
	stylePanelLabel = __( 'Image Hover Styles', 'folioblocks' ),
} ) => {
	addFilter(
		`${ hookPrefix }.onHoverTitleToggle`,
		`${ namespace }-premium-hover-style-controls`,
		( defaultContent, props ) => {
			const { attributes, setAttributes } = props;
			const overlayStyle = getOverlayStyle( attributes );
			const showProductInfoOption =
				attributes.imageClickAction === 'woocommerce' &&
				!! attributes.enableWooCommerce;
			const overlayContent =
				attributes.overlayContent ||
				( attributes.wooProductPriceOnHover ? 'product' : 'title' );
				const overlayContentOptions = [
					{
						label: __( 'Show Image Title', 'folioblocks' ),
						value: 'title',
					},
					{
						label: __( 'Show Image Caption', 'folioblocks' ),
						value: 'caption',
					},
					{
						label: __( 'Show EXIF Data', 'folioblocks' ),
						value: 'exif',
					},
				];

			if ( showProductInfoOption ) {
				overlayContentOptions.push( {
					label: __( 'Show Product Info', 'folioblocks' ),
					value: 'product',
				} );
			}

			return (
				<>
					<SelectControl
						label={ __( 'Hover Effect', 'folioblocks' ) }
						value={ getHoverEffect( attributes ) }
						options={ HOVER_EFFECT_OPTIONS }
						onChange={ ( hoverEffect ) =>
							setAttributes( { hoverEffect } )
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={ __(
							'Choose how the image itself moves or changes on hover.',
							'folioblocks'
						) }
					/>

					<SelectControl
						label={ __( 'Overlay Style', 'folioblocks' ) }
						value={ overlayStyle }
						options={ OVERLAY_STYLE_OPTIONS }
						onChange={ ( value ) => {
							const enabled = value !== 'none';
							const nextAttributes = {
								onHoverTitle: enabled,
								showTitleOnHover: enabled,
								hoverTitle: enabled,
							};

							if ( enabled ) {
								nextAttributes.onHoverStyle = value;
							}
							if ( value === 'color-overlay' ) {
								nextAttributes.overlayTextColor =
									attributes.overlayTextColor || '#000000';
								nextAttributes.overlayBgColor = isGradientValue(
									attributes.overlayBgColor
								)
									? '#f9f9f9'
									: attributes.overlayBgColor || '#f9f9f9';
							}
							if ( value === 'gradient-overlay' ) {
								nextAttributes.overlayTextColor =
									attributes.overlayTextColor || '#000000';
								nextAttributes.overlayBgGradient =
									attributes.overlayBgGradient ||
									( isGradientValue( attributes.overlayBgColor )
										? attributes.overlayBgColor
										: DEFAULT_OVERLAY_BG_GRADIENT );
							}
							if ( value === 'chip' ) {
								nextAttributes.chipOverlayTextColor =
									attributes.chipOverlayTextColor || '#000000';
								nextAttributes.chipOverlayBgColor =
									attributes.chipOverlayBgColor || '#f9f9f9';
							}

							setAttributes( nextAttributes );
						} }
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={ getOverlayHelp( overlayStyle ) }
					/>

					{ supportsOverlayEntrance( overlayStyle ) && (
						<SelectControl
							label={ __( 'Overlay Entrance', 'folioblocks' ) }
							value={ getOverlayEntrance( attributes ) }
							options={ OVERLAY_ENTRANCE_OPTIONS }
							onChange={ ( overlayEntrance ) =>
								setAttributes( { overlayEntrance } )
							}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							help={ __(
								'Choose how the overlay enters the image.',
								'folioblocks'
							) }
						/>
					) }

					{ overlayStyle !== 'none' && (
						<>
							<SelectControl
								label={ __( 'Overlay Content', 'folioblocks' ) }
								value={
									showProductInfoOption ||
									overlayContent !== 'product'
										? overlayContent
										: 'title'
								}
								options={ overlayContentOptions }
								onChange={ ( value ) =>
									setAttributes( {
										onHoverTitle: true,
										showTitleOnHover: true,
										hoverTitle: true,
										overlayContent: value,
										wooProductPriceOnHover:
											value === 'product',
									} )
								}
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								help={ __(
									'Choose what appears when hovering over images.',
									'folioblocks'
								) }
							/>
							{ overlayContent === 'exif' && (
								<ToggleControl
									label={ __(
										'Hide Unknown EXIF Fields',
										'folioblocks'
									) }
									checked={ !! attributes.hideUnknownExifFields }
									onChange={ ( hideUnknownExifFields ) =>
										setAttributes( { hideUnknownExifFields } )
									}
									__nextHasNoMarginBottom
									help={ __(
										'Hide EXIF fields that do not have a value.',
										'folioblocks'
									) }
								/>
							) }
						</>
					) }
				</>
			);
		}
	);

	addFilter(
		`${ hookPrefix }.hoverOverlayStyleControls`,
		`${ namespace }-premium-hover-overlay-style-controls`,
		( defaultContent, props ) => {
			const { attributes, setAttributes } = props;

			const overlayStyle = getOverlayStyle( attributes );
			if ( overlayStyle === 'none' ) {
				return null;
			}
			const isChip = overlayStyle === 'chip';
			const isGradientOverlay = overlayStyle === 'gradient-overlay';
			const hasColorControls =
				overlayStyle === 'color-overlay' ||
				overlayStyle === 'gradient-overlay' ||
				isChip;
			const textAttribute = isChip
				? 'chipOverlayTextColor'
				: 'overlayTextColor';
			const bgAttribute = isGradientOverlay
				? 'overlayBgGradient'
				: isChip
				? 'chipOverlayBgColor'
				: 'overlayBgColor';

			return (
				<ToolsPanel
					label={ stylePanelLabel }
					resetAll={ () =>
						setAttributes( {
							...( hasColorControls
								? {
										[ bgAttribute ]: '',
										[ textAttribute ]: '',
								  }
								: {} ),
							overlayFontFamily: '',
							overlayFontWeight: '',
							overlayFontStyle: '',
						} )
					}
				>
					{ hasColorControls && (
						<ToolsPanelItem
							label={ __( 'Overlay Colors', 'folioblocks' ) }
							hasValue={ () =>
								!! attributes[ bgAttribute ] ||
								!! attributes[ textAttribute ]
							}
							onDeselect={ () =>
								setAttributes( {
									[ bgAttribute ]: '',
									[ textAttribute ]: '',
								} )
							}
							isShownByDefault
						>
							<CompactTwoColorControl
								label={
									isChip
										? __( 'Chip Overlay', 'folioblocks' )
										: isGradientOverlay
										? __( 'Gradient Overlay', 'folioblocks' )
										: __( 'Color Overlay', 'folioblocks' )
								}
								value={ {
									first:
										attributes[ textAttribute ] ||
										( isChip ? '#000000' : '' ),
									second:
										attributes[ bgAttribute ] ||
										( isGradientOverlay
											? DEFAULT_OVERLAY_BG_GRADIENT
											: isChip
											? '#f9f9f9'
											: '' ),
								} }
								onChange={ ( next ) =>
									setAttributes( {
										[ textAttribute ]: next?.first || '',
										[ bgAttribute ]: next?.second || '',
									} )
								}
								firstLabel={ __( 'Text', 'folioblocks' ) }
								secondLabel={ __( 'Background', 'folioblocks' ) }
								secondSupportsGradient={ isGradientOverlay }
								secondGradientOnly={ isGradientOverlay }
								secondColorLabel={ __( 'Solid', 'folioblocks' ) }
								secondGradientLabel={ __( 'Gradient', 'folioblocks' ) }
							/>
						</ToolsPanelItem>
					) }
					<ToolsPanelItem
						label={ __( 'Overlay Typography', 'folioblocks' ) }
						hasValue={ () =>
							!! attributes.overlayFontFamily ||
							!! attributes.overlayFontWeight ||
							!! attributes.overlayFontStyle
						}
						onDeselect={ () =>
							setAttributes( {
								overlayFontFamily: '',
								overlayFontWeight: '',
								overlayFontStyle: '',
							} )
						}
						isShownByDefault
					>
						<OverlayTypographyControls
							attributes={ attributes }
							setAttributes={ setAttributes }
						/>
					</ToolsPanelItem>
				</ToolsPanel>
			);
		}
	);
};
