/**
 * Modular Gallery Block
 * Premium JS
 **/
import { __ } from '@wordpress/i18n';
import { ToggleControl, SelectControl, BaseControl, ColorPalette, RangeControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { applyThumbnails } from '../../pb-helpers/applyThumbnails';

addFilter(
    'portfolioBlocks.modularGallery.editorEnhancements',
    'pb-gallery/modular-gallery-premium-thumbnails',
    (_, { clientId, innerBlocks, isBlockOrChildSelected }) => {
        // When the block or a child is selected, applyThumbnails
        useEffect(() => {
            if (isBlockOrChildSelected) {
                setTimeout(() => {
                    applyThumbnails(clientId);
                }, 200);
            }
        }, [isBlockOrChildSelected]);

        // Fallback: if block has images but no thumbnails rendered, applyThumbnails
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
    'portfolioBlocks.modularGallery.downloadControls',
    'pb-gallery/modular-gallery-premium-downloads',
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
        'portfolioBlocks.modularGallery.wooCommerceControls',
        'pb-gallery/modular-gallery-premium-woocommerce',
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
    'portfolioBlocks.modularGallery.disableRightClickToggle',
    'pb-gallery/modular-gallery-premium-disable-right-click',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Disable Right-Click on Page', 'pb-gallery')}
                help={__('Prevents visitors from right-clicking.', 'pb-gallery')}
                __nextHasNoMarginBottom={true}
                checked={!!attributes.disableRightClick}
                onChange={(value) => setAttributes({ disableRightClick: value })}
            />
        );
    }
);
addFilter(
    'portfolioBlocks.modularGallery.lazyLoadToggle',
    'pb-gallery/modular-gallery-premium-lazy-load',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Enable Lazy Load of Images', 'pb-gallery')}
                help={__('Enables lazy loading of gallery images.', 'pb-gallery')}
                __nextHasNoMarginBottom={true}
                checked={!!attributes.lazyLoad}
                onChange={(value) => setAttributes({ lazyLoad: value })}
            />
        );
    }
);
addFilter(
    'portfolioBlocks.modularGallery.lightboxControls',
    'pb-gallery/modular-gallery-premium-lightbox',
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
    'portfolioBlocks.modularGallery.onHoverTitleToggle',
    'pb-gallery/modular-gallery-premium-title-toggle',
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
    'portfolioBlocks.modularGallery.borderColorControl',
    'pb-gallery/modular-gallery-premium-border-color',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        return (
            <BaseControl
                label={__('Border Color', 'pb-gallery')}
                __nextHasNoMarginBottom={true}
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
    'portfolioBlocks.modularGallery.borderWidthControl',
    'pb-gallery/modular-gallery-premium-border-width',
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
                __next40pxDefaultSize={true}
                __nextHasNoMarginBottom={true}
                help={__('Set border width in pixels.', 'pb-gallery')}
            />
        );
    }
);

addFilter(
    'portfolioBlocks.modularGallery.borderRadiusControl',
    'pb-gallery/modular-gallery-premium-border-radius',
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
                __next40pxDefaultSize={true}
                __nextHasNoMarginBottom={true}
                help={__('Set border radius in pixels.', 'pb-gallery')}
            />
        );
    }
);

addFilter(
    'portfolioBlocks.modularGallery.dropShadowToggle',
    'pb-gallery/modular-gallery-premium-drop-shadow',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Enable Drop Shadow', 'pb-gallery')}
                checked={!!attributes.dropShadow}
                onChange={(newDropShadow) => setAttributes({ dropShadow: newDropShadow })}
                __nextHasNoMarginBottom={true}
                help={__('Applies a subtle drop shadow to images.', 'pb-gallery')}
            />
        );
    }
);