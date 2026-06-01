/**
 * Carousel Gallery Block
 * Premium JS
 */

import { __ } from '@wordpress/i18n';
import {
	ToggleControl,
	SelectControl,
	RangeControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { alignLeft, alignCenter, alignRight } from '@wordpress/icons';
import CompactColorControl, {
	CompactTwoColorControl,
} from '../pb-helpers/CompactColorControl';
import { addFilter } from '@wordpress/hooks';
import { useEffect } from '@wordpress/element';
import { applyThumbnails } from '../pb-helpers/applyThumbnails';
import { registerImageClickActionPremiumControls } from '../pb-helpers/imageClickActionPremiumControls';
import { registerImageHoverActionPremiumControls } from '../pb-helpers/imageHoverActionPremiumControls';

const DEFAULT_CONTROLS_BACKGROUND_COLOR = 'rgba(0, 0, 0, 0.5)';
const DEFAULT_CONTROLS_ICON_COLOR = '#ffffff';

addFilter(
	'folioBlocks.carouselGallery.editorEnhancements',
	'folioblocks/carousel-gallery-premium-thumbnails',
	( _, { clientId, innerBlocks, isBlockOrChildSelected } ) => {
		// This filter injects editor-only enhancements like List View thumbnails
		useEffect( () => {
			if ( isBlockOrChildSelected ) {
				setTimeout( () => {
					applyThumbnails( clientId );
				}, 200 );
			}
		}, [ isBlockOrChildSelected ] );

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
	'folioBlocks.carouselGallery.randomizeToggle',
	'folioblocks/carousel-gallery-premium-toggle',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;
		return (
			<ToggleControl
				label={ __( 'Randomize Image Order', 'folioblocks' ) }
				checked={ !! attributes.randomizeOrder }
				onChange={ ( value ) =>
					setAttributes( { randomizeOrder: value } )
				}
				__nextHasNoMarginBottom
				help={ __( 'Randomize order of images.', 'folioblocks' ) }
			/>
		);
	}
);



addFilter(
	'folioBlocks.carouselGallery.disableRightClickToggle',
	'folioblocks/carousel-gallery-premium-disable-right-click',
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
	'folioBlocks.carouselGallery.lazyLoadToggle',
	'folioblocks/carousel-gallery-premium-lazy-load',
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
addFilter(
	'folioBlocks.carouselGallery.enableAutoplayToggle',
	'folioblocks/carousel-gallery-premium-controls',
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
						'Automatically advance to the next image in the carousel.',
						'folioblocks'
					) }
				/>
				{ attributes.autoplay && (
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
							'Time between automatic slide transitions.',
							'folioblocks'
						) }
					/>
				) }
			</>
		);
	}
);
addFilter(
	'folioBlocks.carouselGallery.loopSlides',
	'folioblocks/carousel-gallery-premium-controls',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={ __( 'Loop Carousel Slides', 'folioblocks' ) }
				checked={ attributes.loopSlides || false }
				onChange={ ( value ) => setAttributes( { loopSlides: value } ) }
				__nextHasNoMarginBottom
				help={ __(
					'Enable the carousel to loop infinitely.',
					'folioblocks'
				) }
			/>
		);
	}
);

addFilter(
	'folioBlocks.carouselGallery.showControlsToggle',
	'folioblocks/carousel-gallery-premium-controls',
	( defaultContent, props ) => {
		const { attributes, setAttributes } = props;

		return (
			<>
				<ToggleControl
					label={ __( 'Enable Carousel Controls', 'folioblocks' ) }
					checked={ attributes.showControls }
					onChange={ ( value ) =>
						setAttributes( { showControls: value } )
					}
					__nextHasNoMarginBottom
					help={ __(
						'Toggle visibility of navigation arrows.',
						'folioblocks'
					) }
				/>
				{ attributes.showControls && (
					<>
						<ToggleGroupControl
							label={ __( 'Controls Alignment', 'folioblocks' ) }
							value={ attributes.controlsAlignment || 'center' }
							onChange={ ( newValue ) =>
								setAttributes( { controlsAlignment: newValue } )
							}
							isBlock
							help={ __(
								'Set the horizontal alignment of carousel controls.',
								'folioblocks'
							) }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						>
							<ToggleGroupControlOption
								value="left"
								icon={ alignLeft }
								label={ __( 'Left', 'folioblocks' ) }
							/>
							<ToggleGroupControlOption
								value="center"
								icon={ alignCenter }
								label={ __( 'Center', 'folioblocks' ) }
							/>
							<ToggleGroupControlOption
								value="right"
								icon={ alignRight }
								label={ __( 'Right', 'folioblocks' ) }
							/>
						</ToggleGroupControl>
					</>
				) }
			</>
		);
	}
);
addFilter(
	'folioBlocks.carouselGallery.lightboxControls',
	'folioblocks/carousel-gallery-premium-lightbox',
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
	hookPrefix: 'folioBlocks.carouselGallery',
	namespace: 'folioblocks/carousel-gallery',
} );

registerImageHoverActionPremiumControls( {
	hookPrefix: 'folioBlocks.carouselGallery',
	namespace: 'folioblocks/carousel-gallery',
	stylePanelLabel: __( 'Gallery Hover Styles', 'folioblocks' ),
} );

addFilter(
	'folioBlocks.carouselGallery.controlStyleSettings',
	'folioblocks/carousel-gallery-premium-control-styles',
	( defaultContent, { attributes, setAttributes } ) => {
		if ( ! attributes.showControls ) {
			return null;
		}

		return (
			<ToolsPanel
				label={ __( 'Carousel Styles', 'folioblocks' ) }
				resetAll={ () =>
					setAttributes( {
						controlsBackgroundColor:
							DEFAULT_CONTROLS_BACKGROUND_COLOR,
						controlsIconColor: DEFAULT_CONTROLS_ICON_COLOR,
					} )
				}
			>
				<ToolsPanelItem
					label={ __( 'Playback Control Colors', 'folioblocks' ) }
					hasValue={ () =>
						( attributes.controlsBackgroundColor ||
							DEFAULT_CONTROLS_BACKGROUND_COLOR ) !==
							DEFAULT_CONTROLS_BACKGROUND_COLOR ||
						( attributes.controlsIconColor ||
							DEFAULT_CONTROLS_ICON_COLOR ) !==
							DEFAULT_CONTROLS_ICON_COLOR
					}
					onDeselect={ () =>
						setAttributes( {
							controlsBackgroundColor:
								DEFAULT_CONTROLS_BACKGROUND_COLOR,
							controlsIconColor: DEFAULT_CONTROLS_ICON_COLOR,
						} )
					}
					isShownByDefault
				>
					<CompactTwoColorControl
						label={ __( 'Playback Control Colors', 'folioblocks' ) }
						value={ {
							first:
								attributes.controlsBackgroundColor ||
								DEFAULT_CONTROLS_BACKGROUND_COLOR,
							second:
								attributes.controlsIconColor ||
								DEFAULT_CONTROLS_ICON_COLOR,
						} }
						onChange={ ( next ) =>
							setAttributes( {
								controlsBackgroundColor:
									next?.first ||
									DEFAULT_CONTROLS_BACKGROUND_COLOR,
								controlsIconColor:
									next?.second || DEFAULT_CONTROLS_ICON_COLOR,
							} )
						}
						firstLabel={ __( 'Background', 'folioblocks' ) }
						secondLabel={ __( 'Icon', 'folioblocks' ) }
						help={ __(
							'Set background and icon colors for the carousel controls.',
							'folioblocks'
						) }
					/>
				</ToolsPanelItem>
			</ToolsPanel>
		);
	}
);

addFilter(
	'folioBlocks.carouselGallery.imageStyles',
	'folioblocks/carousel-gallery-premium-image-styles',
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
	'folioBlocks.carouselGallery.iconStyleControls',
	'folioblocks/carousel-gallery-icon-style-controls',
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

addFilter(
	'folioBlocks.carouselGallery.controlButtons',
	'folioblocks/carousel-gallery-premium-controls',
	(
		defaultContent,
		{
			attributes,
			setAttributes,
			goToPrevSlide,
			goToNextSlide,
			isPlaying,
			setIsPlaying,
			innerBlocks,
		}
	) => {
		if ( ! attributes.showControls || innerBlocks.length === 0 ) {
			return null;
		}

		return (
			<>
				<div
					className={ `pb-carousel-controls align-${
						attributes.controlsAlignment || 'center'
					}` }
				>
					<button
						onClick={ goToPrevSlide }
						className="pb-carousel-chevron prev"
						style={ {
							backgroundColor:
								attributes.controlsBackgroundColor ||
								DEFAULT_CONTROLS_BACKGROUND_COLOR,
							color:
								attributes.controlsIconColor ||
								DEFAULT_CONTROLS_ICON_COLOR,
						} }
					>
						<svg
							viewBox="0 0 24 24"
							width="24"
							height="24"
							fill="currentColor"
							aria-hidden="true"
						>
							<path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
						</svg>
					</button>

					{ attributes.autoplay && (
						<button
							className="pb-carousel-play-button"
							aria-label={ isPlaying ? 'Pause' : 'Play' }
							onClick={ () => setIsPlaying( ( prev ) => ! prev ) }
							style={ {
								backgroundColor:
									attributes.controlsBackgroundColor ||
									DEFAULT_CONTROLS_BACKGROUND_COLOR,
								color:
									attributes.controlsIconColor ||
									DEFAULT_CONTROLS_ICON_COLOR,
							} }
						>
							{ isPlaying ? (
								<svg
									viewBox="0 0 24 24"
									width="20"
									height="20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
								</svg>
							) : (
								<svg
									viewBox="0 0 24 24"
									width="20"
									height="20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path d="M8 5v14l11-7z" />
								</svg>
							) }
						</button>
					) }

					<button
						onClick={ goToNextSlide }
						className="pb-carousel-chevron next"
						style={ {
							backgroundColor:
								attributes.controlsBackgroundColor ||
								DEFAULT_CONTROLS_BACKGROUND_COLOR,
							color:
								attributes.controlsIconColor ||
								DEFAULT_CONTROLS_ICON_COLOR,
						} }
					>
						<svg
							viewBox="0 0 24 24"
							width="24"
							height="24"
							fill="currentColor"
							aria-hidden="true"
						>
							<path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z" />
						</svg>
					</button>
				</div>
			</>
		);
	}
);
