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
import { applyThumbnails } from '../pb-helpers/applyThumbnails';
import { CompactTwoColorControl } from '../pb-helpers/CompactColorControl';
import { registerImageClickActionPremiumControls } from '../pb-helpers/imageClickActionPremiumControls';

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

addFilter(
	'folioBlocks.filmstripGallery.editorEnhancements',
	'folioblocks/filmstrip-gallery-premium-thumbnails',
	(
		_,
		{
			clientId,
			innerBlocks,
			isBlockOrChildSelected,
			attributes,
			replaceInnerBlocks,
			setActiveIndex,
		}
	) => {
		const wasRandomizeEnabledRef = useRef( false );

		// Apply thumbnails when this block or a child image is selected.
		useEffect( () => {
			if ( isBlockOrChildSelected ) {
				setTimeout( () => {
					applyThumbnails( clientId );
				}, 200 );
			}
		}, [ clientId, isBlockOrChildSelected ] );

		// Fallback if list view thumbnails are missing after images change.
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
		}, [ clientId, innerBlocks ] );

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
	'folioBlocks.filmstripGallery.randomizeOrderToggle',
	'folioblocks/filmstrip-gallery-premium-randomize-order',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={ __( 'Randomize Image Order', 'folioblocks' ) }
				checked={ !! attributes.randomizeOrder }
				onChange={ ( value ) =>
					setAttributes( { randomizeOrder: value } )
				}
				help={ __( 'Randomize order of images.', 'folioblocks' ) }
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
				title={ __( 'Image Click Styles', 'folioblocks' ) }
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

addFilter(
	'folioBlocks.filmstripGallery.disableRightClickToggle',
	'folioblocks/filmstrip-gallery-premium-disable-right-click',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={ __( 'Disable Right-Click on Page', 'folioblocks' ) }
				help={ __(
					'Prevents visitors from right-clicking.',
					'folioblocks'
				) }
				__nextHasNoMarginBottom
				checked={ !! attributes.disableRightClick }
				onChange={ ( value ) =>
					setAttributes( { disableRightClick: value } )
				}
			/>
		);
	}
);
addFilter(
	'folioBlocks.filmstripGallery.lazyLoadToggle',
	'folioblocks/filmstrip-gallery-premium-lazy-load',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={ __( 'Enable Lazy Load of Images', 'folioblocks' ) }
				help={ __(
					'Enables lazy loading of gallery images.',
					'folioblocks'
				) }
				__nextHasNoMarginBottom
				checked={ !! attributes.lazyLoad }
				onChange={ ( value ) => setAttributes( { lazyLoad: value } ) }
			/>
		);
	}
);
