/**
 * Filmstrip Gallery Block
 * Premium JS
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { useEffect, useRef } from '@wordpress/element';
import {
	PanelBody,
	ToggleControl,
	SelectControl,
	RangeControl,
	ToggleGroupControl,
	ToggleGroupControlOption,
} from '@wordpress/components';
import { CompactTwoColorControl } from '../pb-helpers/CompactColorControl';
import { registerImageClickActionPremiumControls } from '../pb-helpers/imageClickActionPremiumControls';
import { registerListViewThumbnailEnhancements } from '../pb-helpers/listViewThumbnailEnhancements';
import {
	registerDisableRightClickPremiumControl,
	registerLazyLoadPremiumControl,
	registerRandomizeOrderPremiumControl,
} from '../pb-helpers/simplePremiumControls';

const shuffleBlocks = ( blocks ) => {
	const shuffled = [ ...blocks ];

	if ( shuffled.length < 2 ) {
		return shuffled;
	}

	for ( let i = shuffled.length - 1; i > 0; i-- ) {
		const j = Math.floor( Math.random() * ( i + 1 ) );
		[ shuffled[ i ], shuffled[ j ] ] = [ shuffled[ j ], shuffled[ i ] ];
	}

	// Ensure the shuffled result is visually different from the original order.
	const isSameOrder = shuffled.every(
		( block, index ) => block.clientId === blocks[ index ]?.clientId
	);
	if ( isSameOrder ) {
		const first = shuffled.shift();
		if ( first ) {
			shuffled.push( first );
		}
	}

	return shuffled;
};

addFilter(
	'folioBlocks.filmstripGallery.colorModeControl',
	'folioblocks/filmstrip-gallery-premium-color-mode',
	( _, { attributes, setAttributes } ) => {
		const canUseToggleGroup =
			typeof ToggleGroupControl === 'function' &&
			typeof ToggleGroupControlOption === 'function';

		if ( ! canUseToggleGroup ) {
			return (
				<SelectControl
					label={ __( 'Color Mode', 'folioblocks' ) }
					value={ attributes.colorMode || 'light' }
					options={ [
						{ label: __( 'Light', 'folioblocks' ), value: 'light' },
						{ label: __( 'Dark', 'folioblocks' ), value: 'dark' },
					] }
					onChange={ ( value ) =>
						setAttributes( { colorMode: value } )
					}
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					help={ __(
						'Switch between light and dark editor themes.',
						'folioblocks'
					) }
				/>
			);
		}

		return (
			<ToggleGroupControl
				label={ __( 'Color Mode', 'folioblocks' ) }
				value={ attributes.colorMode || 'light' }
				onChange={ ( value ) => {
					if ( value ) {
						setAttributes( { colorMode: value } );
					}
				} }
				isBlock
				__nextHasNoMarginBottom
				help={ __(
					'Switch between light and dark editor themes.',
					'folioblocks'
				) }
			>
				<ToggleGroupControlOption
					value="light"
					label={ __( 'Light', 'folioblocks' ) }
				/>
				<ToggleGroupControlOption
					value="dark"
					label={ __( 'Dark', 'folioblocks' ) }
				/>
			</ToggleGroupControl>
		);
	}
);

registerListViewThumbnailEnhancements( {
	hookPrefix: 'folioBlocks.filmstripGallery',
	namespace: 'folioblocks/filmstrip-gallery',
} );

addFilter(
	'folioBlocks.filmstripGallery.editorEnhancements',
	'folioblocks/filmstrip-gallery-randomize',
	(
		_,
		{
			clientId,
			innerBlocks,
			attributes,
			replaceInnerBlocks,
			setActiveIndex,
		}
	) => {
		const wasRandomizeEnabledRef = useRef(
			!! attributes.randomizeOrder
		);

		// Shuffle actual inner block order once when randomization is enabled.
		useEffect( () => {
			const isRandomizeEnabled = !! attributes.randomizeOrder;
			const wasRandomizeEnabled = wasRandomizeEnabledRef.current;
			wasRandomizeEnabledRef.current = isRandomizeEnabled;

			if (
				! isRandomizeEnabled ||
				wasRandomizeEnabled ||
				innerBlocks.length < 2 ||
				typeof replaceInnerBlocks !== 'function'
			) {
				return;
			}

			const shuffled = shuffleBlocks( innerBlocks );
			const hasOrderChanged = shuffled.some(
				( block, index ) =>
					block.clientId !== innerBlocks[ index ]?.clientId
			);

			if ( ! hasOrderChanged ) {
				return;
			}

			replaceInnerBlocks( clientId, shuffled );
			if ( typeof setActiveIndex === 'function' ) {
				setActiveIndex( 0 );
			}
		}, [
			attributes.randomizeOrder,
			clientId,
			innerBlocks,
			replaceInnerBlocks,
			setActiveIndex,
		] );

		return null;
	}
);
addFilter(
	'folioBlocks.filmstripGallery.enableAutoplayToggle',
	'folioblocks/filmstrip-gallery-premium-controls',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<>
				<ToggleControl
					label={ __( 'Enable Autoplay', 'folioblocks' ) }
					checked={ attributes.autoplay || false }
					onChange={ ( value ) =>
						setAttributes( { autoplay: value } )
					}
					__nextHasNoMarginBottom
					help={ __(
						'Automatically advance to the next image in the gallery.',
						'folioblocks'
					) }
				/>
				{ attributes.autoplay && (
					<>
						<RangeControl
							label={ __(
								'Autoplay Speed (seconds)',
								'folioblocks'
							) }
							value={ attributes.autoplaySpeed || 3 }
							onChange={ ( value ) =>
								setAttributes( { autoplaySpeed: value } )
							}
							min={ 1 }
							max={ 5 }
							step={ 0.25 }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							help={ __(
								'Time between automatic image transitions.',
								'folioblocks'
							) }
						/>
						<ToggleControl
							label={ __( 'Pause on Hover', 'folioblocks' ) }
							checked={ !! attributes.pauseOnHover }
							onChange={ ( value ) =>
								setAttributes( { pauseOnHover: value } )
							}
							__nextHasNoMarginBottom
							help={ __(
								'Pause autoplay while hovering over the main image.',
								'folioblocks'
							) }
						/>
					</>
				) }
			</>
		);
	}
);

addFilter(
	'folioBlocks.filmstripGallery.enableFullscreenToggle',
	'folioblocks/filmstrip-gallery-premium-fullscreen',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={ __( 'Enable Full-Screen Mode', 'folioblocks' ) }
				checked={ !! attributes.enableFullscreen }
				onChange={ ( value ) =>
					setAttributes( { enableFullscreen: value } )
				}
				help={ __(
					'Enable Full-Screen Mode for the gallery on the frontend.',
					'folioblocks'
				) }
				__nextHasNoMarginBottom
			/>
		);
	}
);

addFilter(
	'folioBlocks.filmstripGallery.onHoverTitleToggle',
	'folioblocks/filmstrip-gallery-premium-title-toggle',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;
		const { onHoverTitle, enableWooCommerce, wooProductPriceOnHover } = attributes;
		const overlayContent =
			attributes.overlayContent ||
			( wooProductPriceOnHover ? 'product' : 'title' );
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

		if ( enableWooCommerce ) {
			overlayContentOptions.push( {
				label: __( 'Show Product Info', 'folioblocks' ),
				value: 'product',
			} );
		}

		return (
			<>
				<ToggleControl
					label={ __( 'Show Overlay on Hover', 'folioblocks' ) }
					help={
						enableWooCommerce
							? __(
									'Display image title, image caption, or product info when hovering over images.',
									'folioblocks'
							  )
								: __(
										'Display image title, image caption, or EXIF data when hovering over images.',
										'folioblocks'
								  )
					}
					__nextHasNoMarginBottom
					checked={ !! attributes.onHoverTitle }
					onChange={ ( value ) =>
						setAttributes( { onHoverTitle: value } )
					}
				/>

				{ onHoverTitle && (
					<SelectControl
						label={ __( 'Overlay Content', 'folioblocks' ) }
						value={
							enableWooCommerce || overlayContent !== 'product'
								? overlayContent
								: 'title'
						}
						options={ overlayContentOptions }
						onChange={ ( val ) => {
							// Ensure hover info is enabled, then switch mode
							setAttributes( {
								onHoverTitle: true,
								overlayContent: val,
								wooProductPriceOnHover: val === 'product',
							} );
						} }
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={ __(
							'Choose what appears when hovering over images.',
							'folioblocks'
						) }
					/>
				) }
			</>
		);
	}
);

registerImageClickActionPremiumControls( {
	hookPrefix: 'folioBlocks.filmstripGallery',
	namespace: 'folioblocks/filmstrip-gallery',
	supportsLightbox: false,
} );

registerRandomizeOrderPremiumControl( {
	hookPrefix: 'folioBlocks.filmstripGallery',
	namespace: 'folioblocks/filmstrip-gallery',
	hookName: 'folioBlocks.filmstripGallery.randomizeOrderToggle',
} );

registerDisableRightClickPremiumControl( {
	hookPrefix: 'folioBlocks.filmstripGallery',
	namespace: 'folioblocks/filmstrip-gallery',
} );

registerLazyLoadPremiumControl( {
	hookPrefix: 'folioBlocks.filmstripGallery',
	namespace: 'folioblocks/filmstrip-gallery',
} );




addFilter(
	'folioBlocks.filmstripGallery.iconStyleControls',
	'folioblocks/filmstrip-gallery-icon-style-controls',
	( Original, { attributes, setAttributes } ) => {
		const isIconTarget = ( attributes.imageClickTarget || 'icon' ) === 'icon';
		const enableDownload = !! attributes.enableDownload && isIconTarget;
		const enableWooCommerce = !! attributes.enableWooCommerce && isIconTarget;
		const enableLinkIcon =
			( attributes.imageClickAction === 'custom_url' ||
				attributes.imageClickAction === 'page_post' ) &&
			isIconTarget;

		if ( ! enableDownload && ! enableWooCommerce && ! enableLinkIcon ) {
			return null;
		}

		return (
			<PanelBody
				title={ __( 'Gallery Click Styles', 'folioblocks' ) }
				initialOpen={ true }
			>
				{ enableDownload && (
					<>
						<CompactTwoColorControl
							label={ __( 'Download Icon', 'folioblocks' ) }
							value={ {
								first: attributes.downloadIconColor,
								second: attributes.downloadIconBgColor,
							} }
							onChange={ ( next ) =>
								setAttributes( {
									downloadIconColor: next?.first || '',
									downloadIconBgColor: next?.second || '',
								} )
							}
							firstLabel={ __( 'Icon', 'folioblocks' ) }
							secondLabel={ __( 'Background', 'folioblocks' ) }
						/>
					</>
				) }

				{ enableWooCommerce && (
					<>
						<CompactTwoColorControl
							label={ __( 'Add to Cart Icon', 'folioblocks' ) }
							value={ {
								first: attributes.cartIconColor,
								second: attributes.cartIconBgColor,
							} }
							onChange={ ( next ) =>
								setAttributes( {
									cartIconColor: next?.first || '',
									cartIconBgColor: next?.second || '',
								} )
							}
							firstLabel={ __( 'Icon', 'folioblocks' ) }
							secondLabel={ __( 'Background', 'folioblocks' ) }
						/>
					</>
				) }

				{ enableLinkIcon && (
					<>
						<CompactTwoColorControl
							label={ __( 'Link Target Icon', 'folioblocks' ) }
							value={ {
								first: attributes.linkIconColor,
								second: attributes.linkIconBgColor,
							} }
							onChange={ ( next ) =>
								setAttributes( {
									linkIconColor: next?.first || '',
									linkIconBgColor: next?.second || '',
								} )
							}
							firstLabel={ __( 'Icon', 'folioblocks' ) }
							secondLabel={ __( 'Background', 'folioblocks' ) }
						/>
					</>
				) }
			</PanelBody>
		);
	}
);
