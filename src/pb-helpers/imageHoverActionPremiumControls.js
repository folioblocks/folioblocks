import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import {
	SelectControl,
	ToggleControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { CompactTwoColorControl } from './CompactColorControl';

const OVERLAY_STYLE_OPTIONS = [
	{ label: __( 'None', 'folioblocks' ), value: 'none' },
	{ label: __( 'Fade Overlay', 'folioblocks' ), value: 'fade-overlay' },
	{
		label: __( 'Gradient Bottom', 'folioblocks' ),
		value: 'gradient-bottom',
	},
	{ label: __( 'Chip', 'folioblocks' ), value: 'chip' },
	{ label: __( 'Blur Overlay', 'folioblocks' ), value: 'blur-overlay' },
	{ label: __( 'Color Overlay', 'folioblocks' ), value: 'color-overlay' },
];

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
				'Displays the overlay content over custom overlay colors set in Styles panel.',
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
						label={ __( 'Hover Style', 'folioblocks' ) }
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
									nextAttributes.overlayBgColor =
										attributes.overlayBgColor || '#f9f9f9';
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
				if (
					overlayStyle !== 'color-overlay' &&
					overlayStyle !== 'chip'
				) {
					return null;
				}
				const isChip = overlayStyle === 'chip';
				const textAttribute = isChip
					? 'chipOverlayTextColor'
					: 'overlayTextColor';
				const bgAttribute = isChip
					? 'chipOverlayBgColor'
					: 'overlayBgColor';

				return (
					<ToolsPanel
						label={ stylePanelLabel }
						resetAll={ () =>
							setAttributes( {
								[ bgAttribute ]: '',
								[ textAttribute ]: '',
							} )
						}
					>
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
										: __( 'Color Overlay', 'folioblocks' )
								}
								value={ {
									first:
										attributes[ textAttribute ] ||
										( isChip ? '#000000' : '' ),
									second:
										attributes[ bgAttribute ] ||
										( isChip ? '#f9f9f9' : '' ),
								} }
								onChange={ ( next ) =>
									setAttributes( {
										[ textAttribute ]: next?.first || '',
										[ bgAttribute ]: next?.second || '',
									} )
								}
							firstLabel={ __( 'Text', 'folioblocks' ) }
							secondLabel={ __( 'Background', 'folioblocks' ) }
						/>
					</ToolsPanelItem>
				</ToolsPanel>
			);
		}
	);
};
