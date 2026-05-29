/**
 * Modular Gallery Block
 * Premium JS
 */
import { __ } from '@wordpress/i18n';
import {
	ToggleControl,
	SelectControl,
	RangeControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { applyThumbnails } from '../pb-helpers/applyThumbnails';
import CompactColorControl, {
	CompactTwoColorControl,
} from '../pb-helpers/CompactColorControl';
import { registerImageClickActionPremiumControls } from '../pb-helpers/imageClickActionPremiumControls';
import { registerImageHoverActionPremiumControls } from '../pb-helpers/imageHoverActionPremiumControls';

addFilter(
	'folioBlocks.modularGallery.editorEnhancements',
	'folioblocks/modular-gallery-premium-thumbnails',
	( _, { clientId, innerBlocks, isBlockOrChildSelected } ) => {
		// When the block or a child is selected, applyThumbnails
		useEffect( () => {
			if ( isBlockOrChildSelected ) {
				setTimeout( () => {
					applyThumbnails( clientId );
				}, 200 );
			}
		}, [ isBlockOrChildSelected ] );

		// Fallback: if block has images but no thumbnails rendered, applyThumbnails
		useEffect( () => {
			const hasImages = innerBlocks.length > 0;
			const listViewHasThumbnails = document.querySelector(
				'[data-pb-thumbnail-applied="true"]'
			);

			if ( hasImages && ! listViewHasThumbnails ) {
				setTimeout( () => {
					applyThumbnails( clientId );
				}, 300 );
			}
		}, [ innerBlocks ] );
		return null;
	}
);



addFilter(
	'folioBlocks.modularGallery.disableRightClickToggle',
	'folioblocks/modular-gallery-premium-disable-right-click',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={ __( 'Disable Right-Click on Page', 'folioblocks' ) }
				help={ __(
					'Prevents visitors from right-clicking.',
					'folioblocks'
				) }
				__nextHasNoMarginBottom={ true }
				checked={ !! attributes.disableRightClick }
				onChange={ ( value ) =>
					setAttributes( { disableRightClick: value } )
				}
			/>
		);
	}
);
addFilter(
	'folioBlocks.modularGallery.lazyLoadToggle',
	'folioblocks/modular-gallery-premium-lazy-load',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={ __( 'Enable Lazy Load of Images', 'folioblocks' ) }
				help={ __(
					'Enables lazy loading of gallery images.',
					'folioblocks'
				) }
				__nextHasNoMarginBottom={ true }
				checked={ !! attributes.lazyLoad }
				onChange={ ( value ) => setAttributes( { lazyLoad: value } ) }
			/>
		);
	}
);
addFilter(
	'folioBlocks.modularGallery.lightboxControls',
	'folioblocks/modular-gallery-premium-lightbox',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;
		const {
			lightbox,
			lightboxCaption,
			enableWooCommerce,
			wooLightboxInfoType,
		} = attributes;

		return (
			<>
				<ToggleControl
					label={ __( 'Enable Lightbox', 'folioblocks' ) }
					checked={ !! lightbox }
					onChange={ ( newLightbox ) =>
						setAttributes( { lightbox: newLightbox } )
					}
					__nextHasNoMarginBottom
					help={ __(
						'Enable image Lightbox on click.',
						'folioblocks'
					) }
				/>

				{ lightbox && (
					<>
						<ToggleControl
							label={
								enableWooCommerce
									? __(
											'Show Image Caption or Product Info in Lightbox',
											'folioblocks'
									  )
									: __(
											'Show Image Caption in Lightbox',
											'folioblocks'
									  )
							}
							help={
								enableWooCommerce
									? __(
											'Display Image Caption or Product Info inside the Lightbox.',
											'folioblocks'
									  )
									: __(
											'Display Image Caption inside the lightbox.',
											'folioblocks'
									  )
							}
							checked={ !! lightboxCaption }
							onChange={ ( newLightboxCaption ) =>
								setAttributes( {
									lightboxCaption: newLightboxCaption,
								} )
							}
							__nextHasNoMarginBottom
						/>

						{ enableWooCommerce && lightboxCaption && (
							<SelectControl
								label={ __( 'Lightbox Info', 'folioblocks' ) }
								value={ wooLightboxInfoType }
								options={ [
									{
										label: __(
											'Show Image Caption',
											'folioblocks'
										),
										value: 'caption',
									},
									{
										label: __(
											'Show Product Info',
											'folioblocks'
										),
										value: 'product',
									},
								] }
								onChange={ ( value ) =>
									setAttributes( {
										wooLightboxInfoType: value,
									} )
								}
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								help={ __(
									'Choose what appears below images in the lightbox.',
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

registerImageClickActionPremiumControls( {
	hookPrefix: 'folioBlocks.modularGallery',
	namespace: 'folioblocks/modular-gallery',
} );

registerImageHoverActionPremiumControls( {
	hookPrefix: 'folioBlocks.modularGallery',
	namespace: 'folioblocks/modular-gallery',
	stylePanelLabel: __( 'Gallery Hover Styles', 'folioblocks' ),
} );


addFilter(
	'folioBlocks.modularGallery.imageStyles',
	'folioblocks/modular-gallery-premium-image-styles',
	( defaultContent, props ) => {
		const { attributes, setAttributes, clientId, updateBlockAttributes } =
			props;

		const forceRefresh = () => {
			if ( typeof updateBlockAttributes === 'function' ) {
				setTimeout( () => {
					updateBlockAttributes( clientId, {
						_forceRefresh: Date.now(),
					} );
				}, 50 );
			}
		};

		return (
			<>
				<CompactColorControl
					label={ __( 'Border Color', 'folioblocks' ) }
					value={ attributes.borderColor }
					onChange={ ( borderColor ) => {
						setAttributes( { borderColor } );
						forceRefresh();
					} }
					help={ __( 'Set Image border color.', 'folioblocks' ) }
				/>

				<RangeControl
					label={ __( 'Border Width', 'folioblocks' ) }
					value={ attributes.borderWidth }
					onChange={ ( value ) => {
						setAttributes( { borderWidth: value } );
						forceRefresh();
					} }
					min={ 0 }
					max={ 15 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					help={ __( 'Set Image border width.', 'folioblocks' ) }
				/>

				<RangeControl
					label={ __( 'Border Radius', 'folioblocks' ) }
					value={ attributes.borderRadius }
					onChange={ ( value ) => {
						setAttributes( { borderRadius: value } );
						forceRefresh();
					} }
					min={ 0 }
					max={ 50 }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					help={ __( 'Set Image border radius.', 'folioblocks' ) }
				/>

				<ToggleControl
					label={ __( 'Enable Drop Shadow', 'folioblocks' ) }
					checked={ !! attributes.dropShadow }
					onChange={ ( newDropShadow ) =>
						setAttributes( { dropShadow: newDropShadow } )
					}
					__nextHasNoMarginBottom
					help={ __(
						'Applies a subtle drop shadow to images.',
						'folioblocks'
					) }
				/>
			</>
		);
	}
);

addFilter(
	'folioBlocks.modularGallery.iconStyleControls',
	'folioblocks/modular-gallery-icon-style-controls',
	( Original, { attributes, setAttributes } ) => {
		const enableDownload = !! attributes.enableDownload;
		const enableWooCommerce = !! attributes.enableWooCommerce;
		const enableLinkIcon =
			( attributes.imageClickAction === 'custom_url' ||
				attributes.imageClickAction === 'page_post' ) &&
			( attributes.imageClickTarget || 'icon' ) === 'icon';

		if ( ! enableDownload && ! enableWooCommerce && ! enableLinkIcon ) {
			return null;
		}

		return (
			<ToolsPanel
				label={ __( 'Gallery Click Styles', 'folioblocks' ) }
				resetAll={ () =>
					setAttributes( {
						downloadIconColor: '',
						downloadIconBgColor: '',
						cartIconColor: '',
						cartIconBgColor: '',
						linkIconColor: '',
						linkIconBgColor: '',
					} )
				}
			>
				{ enableDownload && (
					<ToolsPanelItem
						label={ __( 'Download Icon Colors', 'folioblocks' ) }
						hasValue={ () =>
							!! attributes.downloadIconColor ||
							!! attributes.downloadIconBgColor
						}
						onDeselect={ () =>
							setAttributes( {
								downloadIconColor: '',
								downloadIconBgColor: '',
							} )
						}
						isShownByDefault
					>
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
					</ToolsPanelItem>
				) }

				{ enableWooCommerce && (
					<ToolsPanelItem
						label={ __( 'Add to Cart Icon Colors', 'folioblocks' ) }
						hasValue={ () =>
							!! attributes.cartIconColor ||
							!! attributes.cartIconBgColor
						}
						onDeselect={ () =>
							setAttributes( {
								cartIconColor: '',
								cartIconBgColor: '',
							} )
						}
						isShownByDefault
					>
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
					</ToolsPanelItem>
				) }

				{ enableLinkIcon && (
					<ToolsPanelItem
						label={ __( 'Link Target Icon Colors', 'folioblocks' ) }
						hasValue={ () =>
							!! attributes.linkIconColor ||
							!! attributes.linkIconBgColor
						}
						onDeselect={ () =>
							setAttributes( {
								linkIconColor: '',
								linkIconBgColor: '',
							} )
						}
						isShownByDefault
					>
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
					</ToolsPanelItem>
				) }
			</ToolsPanel>
		);
	}
);
