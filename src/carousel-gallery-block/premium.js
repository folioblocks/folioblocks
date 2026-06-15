/**
 * Carousel Gallery Block
 * Premium JS
 */

import { __ } from '@wordpress/i18n';
import {
	ToggleControl,
	RangeControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { alignLeft, alignCenter, alignRight } from '@wordpress/icons';
import { CompactTwoColorControl } from '../pb-helpers/CompactColorControl';
import ImageStyleControl from '../pb-helpers/ImageStyleControl';
import { addFilter } from '@wordpress/hooks';
import { registerImageClickActionPremiumControls } from '../pb-helpers/imageClickActionPremiumControls';
import { registerImageClickStylePremiumControls } from '../pb-helpers/imageClickStylePremiumControls';
import { registerImageHoverActionPremiumControls } from '../pb-helpers/imageHoverActionPremiumControls';
import { registerListViewThumbnailEnhancements } from '../pb-helpers/listViewThumbnailEnhancements';
import { enableGalleryTransforms } from '../pb-helpers/galleryTransforms';
import {
	registerDisableRightClickPremiumControl,
	registerLazyLoadPremiumControl,
	registerRandomizeOrderPremiumControl,
} from '../pb-helpers/simplePremiumControls';

enableGalleryTransforms( 'folioblocks/carousel-gallery-block' );

const DEFAULT_CONTROLS_BACKGROUND_COLOR = 'rgba(0, 0, 0, 0.5)';
const DEFAULT_CONTROLS_ICON_COLOR = '#ffffff';

registerListViewThumbnailEnhancements( {
	hookPrefix: 'folioBlocks.carouselGallery',
	namespace: 'folioblocks/carousel-gallery',
} );

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
				<ToggleControl
					label={ __( 'Loop Carousel Slides', 'folioblocks' ) }
					checked={ attributes.loopSlides || false }
					onChange={ ( value ) =>
						setAttributes( { loopSlides: value } )
					}
					__nextHasNoMarginBottom
					help={ __(
						'Return to the first slide after reaching the end.',
						'folioblocks'
					) }
				/>
			</>
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
registerImageClickActionPremiumControls( {
	hookPrefix: 'folioBlocks.carouselGallery',
	namespace: 'folioblocks/carousel-gallery',
} );

registerImageClickStylePremiumControls( {
	hookPrefix: 'folioBlocks.carouselGallery',
	namespace: 'folioblocks/carousel-gallery',
} );

registerRandomizeOrderPremiumControl( {
	hookPrefix: 'folioBlocks.carouselGallery',
	namespace: 'folioblocks/carousel-gallery',
} );

registerDisableRightClickPremiumControl( {
	hookPrefix: 'folioBlocks.carouselGallery',
	namespace: 'folioblocks/carousel-gallery',
} );

registerLazyLoadPremiumControl( {
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
			<ImageStyleControl
				attributes={ attributes }
				setAttributes={ setAttributes }
				onChange={ forceRefresh }
			/>
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
