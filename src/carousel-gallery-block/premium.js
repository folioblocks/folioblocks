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
import { applyThumbnails } from '../pb-helpers/applyThumbnails';

addFilter(
    'folioBlocks.carouselGallery.editorEnhancements',
    'folioblocks/carousel-gallery-premium-thumbnails',
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
    'folioBlocks.carouselGallery.randomizeToggle',
    'folioblocks/carousel-gallery-premium-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        return (
            <ToggleControl
                label={__('Randomize Image Order', 'folioblocks')}
                checked={!!attributes.randomizeOrder}
                onChange={(value) => setAttributes({ randomizeOrder: value })}
                __nextHasNoMarginBottom
                help={__('Randomize order of images.', 'folioblocks')}
            />
        );
    }
);

addFilter(
    'folioBlocks.carouselGallery.downloadControls',
    'folioblocks/carousel-gallery-premium-downloads',
    (defaultContent, props) => {
        const { attributes, setAttributes, effectiveEnableWoo } = props;

        if (effectiveEnableWoo && attributes.enableDownload) {
            setAttributes({ enableDownload: false });
        }

        const { enableDownload, downloadOnHover } = attributes;

        return (
            <>
                <ToggleControl
                    label={__('Enable Image Downloads', 'folioblocks')}
                    checked={!!enableDownload}
                    onChange={(value) => setAttributes({ enableDownload: value })}
                    __nextHasNoMarginBottom
                    help={__('Enable visitors to download images from the gallery.', 'folioblocks')}
                    disabled={effectiveEnableWoo}
                />

                {enableDownload && (
                    <SelectControl
                        label={__('Display Image Download Icon', 'folioblocks')}
                        value={downloadOnHover ? 'hover' : 'always'}
                        options={[
                            { label: __('Always', 'folioblocks'), value: 'always' },
                            { label: __('On Hover', 'folioblocks'), value: 'hover' }
                        ]}
                        onChange={(value) => setAttributes({ downloadOnHover: value === 'hover' })}
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                        help={__('Set display preference for Image Download icon.', 'folioblocks')}
                    />
                )}
            </>
        );
    }
);

addFilter(
    'folioBlocks.carouselGallery.wooCommerceControls',
    'folioblocks/carousel-gallery-premium-woocommerce',
    (defaultContent, props) => {
        const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
        if (!wooActive) return null;

        const { attributes, setAttributes } = props;
        const { enableWooCommerce, wooCartIconDisplay, enableDownload } = attributes;

        return (
            <>
                <ToggleControl
                    label={__('Enable WooCommerce Integration', 'folioblocks')}
                    checked={!!enableWooCommerce}
                    onChange={(value) => {
                        setAttributes({ enableWooCommerce: value });

                        if (!value) {
                            setAttributes({
                                wooLightboxInfoType: 'caption',
                                wooProductPriceOnHover: false,
                                wooCartIconDisplay: 'hover'
                            });
                        }
                    }}
                    __nextHasNoMarginBottom
                    help={__('Link gallery images to WooCommerce products.', 'folioblocks')}
                    disabled={enableDownload}
                />

                {enableWooCommerce && (
                    <SelectControl
                        label={__('Display Add to Cart Icon', 'folioblocks')}
                        value={wooCartIconDisplay}
                        options={[
                            { label: __('On Hover', 'folioblocks'), value: 'hover' },
                            { label: __('Always', 'folioblocks'), value: 'always' }
                        ]}
                        onChange={(value) => setAttributes({ wooCartIconDisplay: value })}
                        __nextHasNoMarginBottom
                        help={__('Choose when to display the Add to Cart icon.', 'folioblocks')}
                    />
                )}
            </>
        );
    }
);

addFilter(
    'folioBlocks.carouselGallery.disableRightClickToggle',
    'folioblocks/carousel-gallery-premium-disable-right-click',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Disable Right-Click on Page', 'folioblocks')}
                help={__('Prevents visitors from right-clicking.', 'folioblocks')}
                __nextHasNoMarginBottom
                checked={!!attributes.disableRightClick}
                onChange={(value) => setAttributes({ disableRightClick: value })}
            />
        );
    }
);
addFilter(
    'folioBlocks.carouselGallery.lazyLoadToggle',
    'folioblocks/carousel-gallery-premium-lazy-load',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Enable Lazy Load of Images', 'folioblocks')}
                help={__('Enables lazy loading of gallery images.', 'folioblocks')}
                __nextHasNoMarginBottom
                checked={!!attributes.lazyLoad}
                onChange={(value) => setAttributes({ lazyLoad: value })}
            />
        );
    }
);
addFilter(
    'folioBlocks.carouselGallery.enableAutoplayToggle',
    'folioblocks/carousel-gallery-premium-controls',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <>
                <ToggleControl
                    label={__('Enable Autoplay', 'folioblocks')}
                    checked={attributes.autoplay || false}
                    onChange={(value) => setAttributes({ autoplay: value })}
                    __nextHasNoMarginBottom
                    help={__('Automatically advance to the next image in the carousel.', 'folioblocks')}
                />
                {attributes.autoplay && (
                    <RangeControl
                        label={__('Autoplay Speed (seconds)', 'folioblocks')}
                        value={attributes.autoplaySpeed || 3}
                        onChange={(value) => setAttributes({ autoplaySpeed: value })}
                        min={1}
                        max={5}
                        step={0.25}
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                        help={__('Time between automatic slide transitions.', 'folioblocks')}
                    />
                )}
            </>
        );
    }
);
addFilter(
    'folioBlocks.carouselGallery.loopSlides',
    'folioblocks/carousel-gallery-premium-controls',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Loop Carousel Slides', 'folioblocks')}
                checked={attributes.loopSlides || false}
                onChange={(value) => setAttributes({ loopSlides: value })}
                __nextHasNoMarginBottom
                help={__('Enable the carousel to loop infinitely.', 'folioblocks')}
            />
        );
    }
);


addFilter(
    'folioBlocks.carouselGallery.showControlsToggle',
    'folioblocks/carousel-gallery-premium-controls',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <>
                <ToggleControl
                    label={__('Enable Carousel Controls', 'folioblocks')}
                    checked={attributes.showControls}
                    onChange={(value) => setAttributes({ showControls: value })}
                    __nextHasNoMarginBottom
                    help={__('Toggle visibility of navigation arrows.', 'folioblocks')}
                />
                {attributes.showControls && (
                    <>
                        <ToggleGroupControl
                            label={__('Controls Alignment', 'folioblocks')}
                            value={attributes.controlsAlignment || 'center'}
                            onChange={(newValue) => setAttributes({ controlsAlignment: newValue })}
                            isBlock
                            help={__('Set the horizontal alignment of carousel controls.', 'folioblocks')}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        >
                            <ToggleGroupControlOption value="left" icon={alignLeft} label={__('Left', 'folioblocks')} />
                            <ToggleGroupControlOption value="center" icon={alignCenter} label={__('Center', 'folioblocks')} />
                            <ToggleGroupControlOption value="right" icon={alignRight} label={__('Right', 'folioblocks')} />
                        </ToggleGroupControl>
                    </>
                )}
            </>
        );
    }
);
addFilter(
    'folioBlocks.carouselGallery.lightboxControls',
    'folioblocks/carousel-gallery-premium-lightbox',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        const { lightbox, lightboxCaption, enableWooCommerce, wooLightboxInfoType } = attributes;

        return (
            <>
                <ToggleControl
                    label={__('Enable Lightbox', 'folioblocks')}
                    checked={!!lightbox}
                    onChange={(newLightbox) => setAttributes({ lightbox: newLightbox })}
                    __nextHasNoMarginBottom
                    help={__('Enable image Lightbox on click.', 'folioblocks')}
                />

                {lightbox && (
                    <>
                        <ToggleControl
                            label={
                                enableWooCommerce
                                    ? __('Show Image Caption or Product Info in Lightbox', 'folioblocks')
                                    : __('Show Image Caption in Lightbox', 'folioblocks')
                            }
                            help={
                                enableWooCommerce
                                    ? __('Display image caption or product info inside the Lightbox.', 'folioblocks')
                                    : __('Display Image Caption inside the lightbox.', 'folioblocks')
                            }
                            checked={!!lightboxCaption}
                            onChange={(newLightboxCaption) =>
                                setAttributes({ lightboxCaption: newLightboxCaption })
                            }
                            __nextHasNoMarginBottom
                        />

                        {enableWooCommerce && lightboxCaption && (
                            <SelectControl
                                label={__('Lightbox Info', 'folioblocks')}
                                value={wooLightboxInfoType}
                                options={[
                                    { label: __('Show Image Caption', 'folioblocks'), value: 'caption' },
                                    { label: __('Show Product Description', 'folioblocks'), value: 'product' }
                                ]}
                                onChange={(value) => setAttributes({ wooLightboxInfoType: value })}
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                help={__('Choose what appears below images in the lightbox.', 'folioblocks')}
                            />
                        )}
                    </>
                )}
            </>
        );
    }
);

addFilter(
    'folioBlocks.carouselGallery.onHoverTitleToggle',
    'folioblocks/carousel-gallery-premium-title-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        const { onHoverTitle, enableWooCommerce, wooProductPriceOnHover } = attributes;

        return (
            <>
                <ToggleControl
                    label={
                        enableWooCommerce
                            ? __('Show Overlay on Hover', 'folioblocks')
                            : __('Show Image Title in Hover Overlay', 'folioblocks')
                    }
                    help={
                        enableWooCommerce
                            ? __('Display image title or product info when hovering over images.', 'folioblocks')
                            : __('Display image title when hovering over image.', 'folioblocks')
                    }
                    __nextHasNoMarginBottom
                    checked={!!attributes.onHoverTitle}
                    onChange={(value) => setAttributes({ onHoverTitle: value })}
                />

                {enableWooCommerce && onHoverTitle && (
                    <SelectControl
                        label={__('Overlay Content', 'folioblocks')}
                        value={wooProductPriceOnHover ? 'product' : 'title'}
                        options={[
                            { label: __('Show Image Title', 'folioblocks'), value: 'title' },
                            { label: __('Show Product Name & Price', 'folioblocks'), value: 'product' }
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
                        help={__('Choose what appears when hovering over images.', 'folioblocks')}
                    />
                )}
                {onHoverTitle && (
                    <SelectControl
                        label={__('Hover Style', 'folioblocks')}
                        value={attributes.onHoverStyle || 'fade-overlay'}
                        options={[
                            { label: __('Blur Overlay (centered)', 'folioblocks'), value: 'blur-overlay' },
                            { label: __('Fade Overlay (centered)', 'folioblocks'), value: 'fade-overlay' },
                            { label: __('Gradient Bottom (slide-up)', 'folioblocks'), value: 'gradient-bottom' },
                            { label: __('Chip (top-left label)', 'folioblocks'), value: 'chip' },
                        ]}
                        onChange={(v) => setAttributes({ onHoverStyle: v })}
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                    />
                )}
            </>
        );
    }
);
addFilter(
    'folioBlocks.carouselGallery.controlStyleSettings',
    'folioblocks/carousel-gallery-premium-control-styles',
    (defaultContent, { attributes, setAttributes }) => {
        if (!attributes.showControls) {
            return null;
        }

        return (
            <PanelColorSettings
                title={__('Carousel Control Styles', 'folioblocks')}
                initialOpen={true}
                colorSettings={[
                    {
                        value: attributes.controlsBackgroundColor,
                        onChange: (value) => setAttributes({ controlsBackgroundColor: value }),
                        label: __('Control Background Color', 'folioblocks'),
                    },
                    {
                        value: attributes.controlsIconColor,
                        onChange: (value) => setAttributes({ controlsIconColor: value }),
                        label: __('Control Icon Color', 'folioblocks'),
                    },
                ]}
            />
        );
    }
);
addFilter(
    'folioBlocks.carouselGallery.borderColorControl',
    'folioblocks/carousel-gallery-premium-border-color',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        return (
            <BaseControl
                label={__('Border Color', 'folioblocks')}
                __nextHasNoMarginBottom
            >
                <ColorPalette
                    value={attributes.borderColor}
                    onChange={(value) => setAttributes({ borderColor: value })}
                    clearable={false}
                    help={__('Set border color.', 'folioblocks')}
                />
            </BaseControl>
        );
    }
);
addFilter(
    'folioBlocks.carouselGallery.borderWidthControl',
    'folioblocks/carousel-gallery-premium-border-width',
    (defaultContent, props) => {
        const { attributes, setAttributes, clientId, updateBlockAttributes } = props;

        return (
            <RangeControl
                label={__('Border Width', 'folioblocks')}
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
                help={__('Set border width in pixels.', 'folioblocks')}
            />
        );
    }
);
addFilter(
    'folioBlocks.carouselGallery.borderRadiusControl',
    'folioblocks/carousel-gallery-premium-border-radius',
    (defaultContent, props) => {
        const { attributes, setAttributes, clientId, updateBlockAttributes } = props;

        return (
            <RangeControl
                label={__('Border Radius', 'folioblocks')}
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
                help={__('Set border radius in pixels.', 'folioblocks')}
            />
        );
    }
);
addFilter(
    'folioBlocks.carouselGallery.dropShadowToggle',
    'folioblocks/carousel-gallery-premium-drop-shadow',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Enable Drop Shadow', 'folioblocks')}
                checked={!!attributes.dropShadow}
                onChange={(newDropShadow) => setAttributes({ dropShadow: newDropShadow })}
                __nextHasNoMarginBottom
                help={__('Applies a subtle drop shadow to images.', 'folioblocks')}
            />
        );
    }
);
addFilter(
    'folioBlocks.carouselGallery.controlButtons',
    'folioblocks/carousel-gallery-premium-controls',
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