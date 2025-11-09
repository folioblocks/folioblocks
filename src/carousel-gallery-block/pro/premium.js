/**
 * Carousel Gallery Block
 * Premium JS
 **/

import { __ } from '@wordpress/i18n';
import { PanelColorSettings } from '@wordpress/block-editor';
import {
    ToggleControl,
    SelectControl,
    BaseControl,
    ColorPalette,
    RangeControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { alignLeft, alignCenter, alignRight } from '@wordpress/icons';
import { addFilter } from '@wordpress/hooks';
import { useEffect } from '@wordpress/element';
import { applyThumbnails } from '../../pb-helpers/applyThumbnails';

addFilter(
	'portfolioBlocks.carouselGallery.editorEnhancements',
	'pb-gallery/carousel-gallery-premium-thumbnails',
	(_, { clientId, innerBlocks, isBlockOrChildSelected }) => {
		// This filter injects editor-only enhancements like List View thumbnails
		useEffect(() => {
			if (isBlockOrChildSelected) {
				setTimeout(() => {
					applyThumbnails(clientId);
				}, 200);
			}
		}, [isBlockOrChildSelected]);

		useEffect(() => {
			const hasImages = innerBlocks.length > 0;
			const listViewHasThumbnails = document.querySelector('[data-pb-thumbnail-applied="true"]');

			if (hasImages && !listViewHasThumbnails) {
				setTimeout(() => {
					applyThumbnails(clientId);
				}, 300);
			}
		}, [innerBlocks]);

		return null;
	}
);

addFilter(
    'portfolioBlocks.carouselGallery.randomizeToggle',
    'pb-gallery/carousel-gallery-premium-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        return (
            <ToggleControl
                label={__('Randomize Image Order', 'pb-gallery')}
                checked={!!attributes.randomizeOrder}
                onChange={(value) => setAttributes({ randomizeOrder: value })}
                __nextHasNoMarginBottom
                help={__('Randomize order of images.', 'pb-gallery')}
            />
        );
    }
);

addFilter(
    'portfolioBlocks.carouselGallery.downloadControls',
    'pb-gallery/carousel-gallery-premium-downloads',
    (defaultContent, props) => {
        const { attributes, setAttributes, effectiveEnableWoo } = props;

        if (effectiveEnableWoo && attributes.enableDownload) {
            setAttributes({ enableDownload: false });
        }

        const { enableDownload, downloadOnHover } = attributes;

        return (
            <>
                <ToggleControl
                    label={__('Enable Image Downloads', 'pb-gallery')}
                    checked={!!enableDownload}
                    onChange={(value) => setAttributes({ enableDownload: value })}
                    __nextHasNoMarginBottom
                    help={__('Enable visitors to download images from the gallery.', 'pb-gallery')}
                    disabled={effectiveEnableWoo}
                />

                {enableDownload && (
                    <SelectControl
                        label={__('Display Image Download Icon', 'pb-gallery')}
                        value={downloadOnHover ? 'hover' : 'always'}
                        options={[
                            { label: __('Always', 'pb-gallery'), value: 'always' },
                            { label: __('On Hover', 'pb-gallery'), value: 'hover' }
                        ]}
                        onChange={(value) => setAttributes({ downloadOnHover: value === 'hover' })}
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                        help={__('Set display preference for Image Download icon.', 'pb-gallery')}
                    />
                )}
            </>
        );
    }
);

if (window.portfolioBlocksData?.hasWooCommerce) {
    addFilter(
        'portfolioBlocks.carouselGallery.wooCommerceControls',
        'pb-gallery/carousel-gallery-premium-woocommerce',
        (defaultContent, props) => {
            const { attributes, setAttributes } = props;
            const { enableWooCommerce, wooCartIconDisplay, enableDownload } = attributes;

            return (
                <>
                    <ToggleControl
                        label={__('Enable WooCommerce Integration', 'pb-gallery')}
                        checked={!!enableWooCommerce}
                        onChange={(value) => {
                            setAttributes({ enableWooCommerce: value });

                            // Reset WooCommerce-specific settings when disabled
                            if (!value) {
                                setAttributes({
                                    wooLightboxInfoType: 'caption',
                                    wooProductPriceOnHover: false,
                                    wooCartIconDisplay: 'hover'
                                });
                            }
                        }}
                        __nextHasNoMarginBottom
                        help={__('Link gallery images to WooCommerce products.', 'pb-gallery')}
                        disabled={enableDownload}
                    />

                    {enableWooCommerce && (
                        <SelectControl
                            label={__('Display Add to Cart Icon', 'pb-gallery')}
                            value={wooCartIconDisplay}
                            options={[
                                { label: __('On Hover', 'pb-gallery'), value: 'hover' },
                                { label: __('Always', 'pb-gallery'), value: 'always' }
                            ]}
                            onChange={(value) => setAttributes({ wooCartIconDisplay: value })}
                            __nextHasNoMarginBottom
                            help={__('Choose when to display the Add to Cart icon.', 'pb-gallery')}
                        />
                    )}
                </>
            );
        }
    );
}

addFilter(
    'portfolioBlocks.carouselGallery.disableRightClickToggle',
    'pb-gallery/carousel-gallery-premium-disable-right-click',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Disable Right-Click on Page', 'pb-gallery')}
                help={__('Prevents visitors from right-clicking.', 'pb-gallery')}
                __nextHasNoMarginBottom
                checked={!!attributes.disableRightClick}
                onChange={(value) => setAttributes({ disableRightClick: value })}
            />
        );
    }
);
addFilter(
    'portfolioBlocks.carouselGallery.lazyLoadToggle',
    'pb-gallery/carousel-gallery-premium-lazy-load',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Enable Lazy Load of Images', 'pb-gallery')}
                help={__('Enables lazy loading of gallery images.', 'pb-gallery')}
                __nextHasNoMarginBottom
                checked={!!attributes.lazyLoad}
                onChange={(value) => setAttributes({ lazyLoad: value })}
            />
        );
    }
);
addFilter(
    'portfolioBlocks.carouselGallery.enableAutoplayToggle',
    'pb-gallery/carousel-gallery-premium-controls',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <>
                <ToggleControl
                    label={__('Enable Autoplay', 'pb-gallery')}
                    checked={attributes.autoplay || false}
                    onChange={(value) => setAttributes({ autoplay: value })}
                    __nextHasNoMarginBottom
                    help={__('Automatically advance to the next image in the carousel.', 'pb-gallery')}
                />
                {attributes.autoplay && (
                    <RangeControl
                        label={__('Autoplay Speed (seconds)', 'pb-gallery')}
                        value={attributes.autoplaySpeed || 3}
                        onChange={(value) => setAttributes({ autoplaySpeed: value })}
                        min={1}
                        max={5}
                        step={0.25}
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                        help={__('Time between automatic slide transitions.', 'pb-gallery')}
                    />
                )}
            </>
        );
    }
);
addFilter(
    'portfolioBlocks.carouselGallery.loopSlides',
    'pb-gallery/carousel-gallery-premium-controls',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Loop Carousel Slides', 'pb-gallery')}
                checked={attributes.loopSlides || false}
                onChange={(value) => setAttributes({ loopSlides: value })}
                __nextHasNoMarginBottom
                help={__('Enable the carousel to loop infinitely.', 'pb-gallery')}
            />
        );
    }
);


addFilter(
    'portfolioBlocks.carouselGallery.showControlsToggle',
    'pb-gallery/carousel-gallery-premium-controls',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <>
                <ToggleControl
                    label={__('Enable Carousel Controls', 'pb-gallery')}
                    checked={attributes.showControls}
                    onChange={(value) => setAttributes({ showControls: value })}
                    __nextHasNoMarginBottom
                    help={__('Toggle visibility of navigation arrows.', 'pb-gallery')}
                />
                {attributes.showControls && (
                    <>
                        <ToggleGroupControl
                            label={__('Controls Alignment', 'pb-gallery')}
                            value={attributes.controlsAlignment || 'center'}
                            onChange={(newValue) => setAttributes({ controlsAlignment: newValue })}
                            isBlock
                            help={__('Set the horizontal alignment of carousel controls.', 'pb-gallery')}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        >
                            <ToggleGroupControlOption value="left" icon={alignLeft} label={__('Left', 'pb-gallery')} />
                            <ToggleGroupControlOption value="center" icon={alignCenter} label={__('Center', 'pb-gallery')} />
                            <ToggleGroupControlOption value="right" icon={alignRight} label={__('Right', 'pb-gallery')} />
                        </ToggleGroupControl>
                    </>
                )}
            </>
        );
    }
);
addFilter(
    'portfolioBlocks.carouselGallery.lightboxControls',
    'pb-gallery/carousel-gallery-premium-lightbox',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        const { lightbox, lightboxCaption, enableWooCommerce, wooLightboxInfoType } = attributes;

        return (
            <>
                <ToggleControl
                    label={__('Enable Lightbox', 'pb-gallery')}
                    checked={!!lightbox}
                    onChange={(newLightbox) => setAttributes({ lightbox: newLightbox })}
                    __nextHasNoMarginBottom
                    help={__('Enable image Lightbox on click.', 'pb-gallery')}
                />

                {lightbox && (
                    <>
                        <ToggleControl
                            label={
                                enableWooCommerce
                                    ? __('Show Image Caption or Product Info in Lightbox', 'pb-gallery')
                                    : __('Show Image Caption in Lightbox', 'pb-gallery')
                            }
                            help={
                                enableWooCommerce
                                    ? __('Display image caption or product info inside the Lightbox.', 'pb-gallery')
                                    : __('Display Image Caption inside the lightbox.', 'pb-gallery')
                            }
                            checked={!!lightboxCaption}
                            onChange={(newLightboxCaption) =>
                                setAttributes({ lightboxCaption: newLightboxCaption })
                            }
                            __nextHasNoMarginBottom
                        />

                        {enableWooCommerce && lightboxCaption && (
                            <SelectControl
                                label={__('Lightbox Info', 'pb-gallery')}
                                value={wooLightboxInfoType}
                                options={[
                                    { label: __('Show Image Caption', 'pb-gallery'), value: 'caption' },
                                    { label: __('Show Product Description', 'pb-gallery'), value: 'product' }
                                ]}
                                onChange={(value) => setAttributes({ wooLightboxInfoType: value })}
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                help={__('Choose what appears below images in the lightbox.', 'pb-gallery')}
                            />
                        )}
                    </>
                )}
            </>
        );
    }
);

addFilter(
    'portfolioBlocks.carouselGallery.onHoverTitleToggle',
    'pb-gallery/carousel-gallery-premium-title-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        const { onHoverTitle, enableWooCommerce, wooProductPriceOnHover } = attributes;

        return (
            <>
                <ToggleControl
                    label={
                        enableWooCommerce
                            ? __('Show Overlay on Hover', 'pb-gallery')
                            : __('Show Image Title in Hover Overlay', 'pb-gallery')
                    }
                    help={
                        enableWooCommerce
                            ? __('Display image title or product info when hovering over images.', 'pb-gallery')
                            : __('Display image title when hovering over image.', 'pb-gallery')
                    }
                    __nextHasNoMarginBottom
                    checked={!!attributes.onHoverTitle}
                    onChange={(value) => setAttributes({ onHoverTitle: value })}
                />

                {enableWooCommerce && onHoverTitle && (
                    <SelectControl
                        label={__('Overlay Content', 'pb-gallery')}
                        value={wooProductPriceOnHover ? 'product' : 'title'}
                        options={[
                            { label: __('Show Image Title', 'pb-gallery'), value: 'title' },
                            { label: __('Show Product Name & Price', 'pb-gallery'), value: 'product' }
                        ]}
                        onChange={(val) => {
                            // Ensure hover info is enabled, then switch mode
                            setAttributes({
                                onHoverTitle: true,
                                wooProductPriceOnHover: val === 'product'
                            });
                        }}
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                        help={__('Choose what appears when hovering over images.', 'pb-gallery')}
                    />
                )}
            </>
        );
    }
);
addFilter(
    'portfolioBlocks.carouselGallery.controlStyleSettings',
    'pb-gallery/carousel-gallery-premium-control-styles',
    (defaultContent, { attributes, setAttributes }) => {
        if (!attributes.showControls) {
            return null;
        }

        return (
            <PanelColorSettings
                title={__('Carousel Control Styles', 'pb-gallery')}
                initialOpen={true}
                colorSettings={[
                    {
                        value: attributes.controlsBackgroundColor,
                        onChange: (value) => setAttributes({ controlsBackgroundColor: value }),
                        label: __('Control Background Color', 'pb-gallery'),
                    },
                    {
                        value: attributes.controlsIconColor,
                        onChange: (value) => setAttributes({ controlsIconColor: value }),
                        label: __('Control Icon Color', 'pb-gallery'),
                    },
                ]}
            />
        );
    }
);
addFilter(
    'portfolioBlocks.carouselGallery.borderColorControl',
    'pb-gallery/carousel-gallery-premium-border-color',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        return (
            <BaseControl
                label={__('Border Color', 'pb-gallery')}
                __nextHasNoMarginBottom
            >
                <ColorPalette
                    value={attributes.borderColor}
                    onChange={(value) => setAttributes({ borderColor: value })}
                    clearable={false}
                    help={__('Set border color.', 'pb-gallery')}
                />
            </BaseControl>
        );
    }
);
addFilter(
    'portfolioBlocks.carouselGallery.borderWidthControl',
    'pb-gallery/carousel-gallery-premium-border-width',
    (defaultContent, props) => {
        const { attributes, setAttributes, clientId, updateBlockAttributes } = props;

        return (
            <RangeControl
                label={__('Border Width', 'pb-gallery')}
                value={attributes.borderWidth}
                onChange={(value) => {
                    setAttributes({ borderWidth: value });
                    if (typeof updateBlockAttributes === 'function') {
                        setTimeout(() => {
                            updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
                        }, 50);
                    }
                }}
                min={0}
                max={20}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                help={__('Set border width in pixels.', 'pb-gallery')}
            />
        );
    }
);
addFilter(
    'portfolioBlocks.carouselGallery.borderRadiusControl',
    'pb-gallery/carousel-gallery-premium-border-radius',
    (defaultContent, props) => {
        const { attributes, setAttributes, clientId, updateBlockAttributes } = props;

        return (
            <RangeControl
                label={__('Border Radius', 'pb-gallery')}
                value={attributes.borderRadius}
                onChange={(value) => {
                    setAttributes({ borderRadius: value });
                    if (typeof updateBlockAttributes === 'function') {
                        setTimeout(() => {
                            updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
                        }, 50);
                    }
                }}
                min={0}
                max={100}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                help={__('Set border radius in pixels.', 'pb-gallery')}
            />
        );
    }
);
addFilter(
    'portfolioBlocks.carouselGallery.dropShadowToggle',
    'pb-gallery/carousel-gallery-premium-drop-shadow',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Enable Drop Shadow', 'pb-gallery')}
                checked={!!attributes.dropShadow}
                onChange={(newDropShadow) => setAttributes({ dropShadow: newDropShadow })}
                __nextHasNoMarginBottom
                help={__('Applies a subtle drop shadow to images.', 'pb-gallery')}
            />
        );
    }
);
addFilter(
	'portfolioBlocks.carouselGallery.controlButtons',
	'pb-gallery/carousel-gallery-premium-controls',
	(defaultContent, { attributes, setAttributes, goToPrevSlide, goToNextSlide, isPlaying, setIsPlaying, innerBlocks }) => {
		if (!attributes.showControls || innerBlocks.length === 0) return null;

		return (
			<>
				<div className={`pb-carousel-controls align-${attributes.controlsAlignment || 'center'}`}>
					<button
						onClick={goToPrevSlide}
						className="pb-carousel-chevron prev"
						style={{
							backgroundColor: attributes.controlsBackgroundColor || 'rgba(0, 0, 0, 0.5)',
							color: attributes.controlsIconColor || '#ffffff',
						}}
					>
						<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
							<path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
						</svg>
					</button>

					{attributes.autoplay && (
						<button
							className="pb-carousel-play-button"
							aria-label={isPlaying ? 'Pause' : 'Play'}
							onClick={() => setIsPlaying((prev) => !prev)}
							style={{
								backgroundColor: attributes.controlsBackgroundColor || 'rgba(0, 0, 0, 0.5)',
								color: attributes.controlsIconColor || '#ffffff',
							}}
						>
							{isPlaying ? (
								<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
									<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
								</svg>
							) : (
								<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
									<path d="M8 5v14l11-7z" />
								</svg>
							)}
						</button>
					)}

					<button
						onClick={goToNextSlide}
						className="pb-carousel-chevron next"
						style={{
							backgroundColor: attributes.controlsBackgroundColor || 'rgba(0, 0, 0, 0.5)',
							color: attributes.controlsIconColor || '#ffffff',
						}}
					>
						<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
							<path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z" />
						</svg>
					</button>
				</div>
			</>
		);
	}
);