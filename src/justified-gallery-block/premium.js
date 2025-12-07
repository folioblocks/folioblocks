/**
 * Justified Gallery Block
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
    TextControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';
import { useEffect } from '@wordpress/element';
import { applyThumbnails } from '../pb-helpers/applyThumbnails';

addFilter(
    'folioBlocks.justifiedGallery.editorEnhancements',
    'folioblocks/justified-gallery-premium-thumbnails',
    (_, { clientId, innerBlocks, isBlockOrChildSelected }) => {
        // Apply thumbnails when this block or a child is selected
        useEffect(() => {
            if (isBlockOrChildSelected) {
                setTimeout(() => {
                    applyThumbnails(clientId);
                }, 200);
            }
        }, [isBlockOrChildSelected]);

        // Fallback: Apply thumbnails if images are present but thumbnails haven't rendered yet
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
    'folioBlocks.justifiedGallery.editorEnhancements',
    'folioblocks/justified-gallery-randomize',
    (_, { attributes, innerBlocks, clientId, replaceInnerBlocks }) => {

        // Shuffle images if randomizeOrder is enabled
        useEffect(() => {
            if (!attributes || !attributes.randomizeOrder || innerBlocks.length === 0) return;

            // Use a small delay to avoid nested updates inside React render phase
            const timer = setTimeout(() => {
                const shuffled = [...innerBlocks];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }

                if (typeof replaceInnerBlocks === 'function') {
                    replaceInnerBlocks(clientId, shuffled);
                }
            }, 100);

            return () => clearTimeout(timer);
        }, [attributes?.randomizeOrder]);

        return null;
    }
);
addFilter(
    'folioBlocks.justifiedGallery.randomizeToggle',
    'folioblocks/justified-gallery-premium-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes, clientId, updateBlockAttributes } = props;
        return (
            <ToggleControl
                label={__('Randomize Image Order', 'folioblocks')}
                checked={!!attributes.randomizeOrder}
                onChange={(value) => {
                    setAttributes({ randomizeOrder: value });
                    if (typeof updateBlockAttributes === 'function') {
                        setTimeout(() => {
                            updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
                        }, 50);
                    }
                }}
                __nextHasNoMarginBottom={true}
                help={__('Randomize order of images.', 'folioblocks')}
            />
        );
    }
);

addFilter(
    'folioBlocks.justifiedGallery.downloadControls',
    'folioblocks/justified-gallery-premium-downloads',
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
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                        help={__('Set display preference for Image Download icon.', 'folioblocks')}
                    />
                )}
            </>
        );
    }
);

addFilter(
    'folioBlocks.justifiedGallery.wooCommerceControls',
    'folioblocks/justified-gallery-premium-woocommerce',
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
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                        help={__('Choose when to display the Add to Cart icon.', 'folioblocks')}
                    />
                )}
            </>
        );
    }
);

addFilter(
    'folioBlocks.justifiedGallery.disableRightClickToggle',
    'folioblocks/justified-gallery-premium-disable-right-click',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Disable Right-Click on Page', 'folioblocks')}
                help={__('Prevents visitors from right-clicking.', 'folioblocks')}
                __nextHasNoMarginBottom={true}
                checked={!!attributes.disableRightClick}
                onChange={(value) => setAttributes({ disableRightClick: value })}
            />
        );
    }
);
addFilter(
    'folioBlocks.justifiedGallery.lazyLoadToggle',
    'folioblocks/justified-gallery-premium-lazy-load',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Enable Lazy Load of Images', 'folioblocks')}
                help={__('Enables lazy loading of gallery images.', 'folioblocks')}
                __nextHasNoMarginBottom={true}
                checked={!!attributes.lazyLoad}
                onChange={(value) => setAttributes({ lazyLoad: value })}
            />
        );
    }
);
addFilter(
    'folioBlocks.justifiedGallery.lightboxControls',
    'folioblocks/justified-gallery-premium-lightbox',
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
    'folioBlocks.justifiedGallery.onHoverTitleToggle',
    'folioblocks/justified-gallery-premium-title-toggle',
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
                        value={attributes.onHoverStyle || 'blur-overlay'}
                        options={[
                            { label: __('Blur Overlay Centered', 'folioblocks'), value: 'title-hover' },
                            { label: __('Fade Overlay - Centered', 'folioblocks'), value: 'fade-overlay' },
                            { label: __('Gradient Overlay - Slide-up Bottom', 'folioblocks'), value: 'gradient-bottom' },
                            { label: __('Chip Overlay - Top-Left Label', 'folioblocks'), value: 'chip' },
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
    'folioBlocks.justifiedGallery.filterLogic',
    'folioblocks/justified-gallery-filter-logic',
    (_, { attributes, setAttributes, selectedBlock }) => {
        const {
            enableFilter = false,
            filterAlign = 'center',
            filtersInput = '',
            activeFilter = 'All',
        } = attributes;

        // Derive categories from filtersInput
        const filterCategories = filtersInput
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        // Sync derived categories
        useEffect(() => {
            setAttributes({ filterCategories });
        }, [filtersInput]);

        // Reset activeFilter if selected block becomes hidden
        useEffect(() => {
            if (
                selectedBlock &&
                selectedBlock.name === 'folioblocks/pb-image-block'
            ) {
                const selectedCategory = selectedBlock.attributes?.filterCategory || '';
                const isFilteredOut =
                    activeFilter !== 'All' &&
                    selectedCategory.toLowerCase() !== activeFilter.toLowerCase();

                if (isFilteredOut) {
                    setAttributes({ activeFilter: 'All' });
                }
            }
        }, [selectedBlock, activeFilter]);

        // Keep these base filter attributes consistent
        useEffect(() => {
            if (attributes.enableFilter !== enableFilter)
                setAttributes({ enableFilter });
            if (attributes.filterAlign !== filterAlign)
                setAttributes({ filterAlign });
        }, [enableFilter, filterAlign]);

        return null;
    }
);
addFilter(
    'folioBlocks.justifiedGallery.enableFilterToggle',
    'folioblocks/justified-gallery-premium-filter-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        const { enableFilter, filterAlign, filtersInput } = attributes;

        const handleFilterInputChange = (value) => {
            setAttributes({ filtersInput: value });
        };

        const handleFilterInputBlur = () => {
            const parsed = filtersInput
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item.length > 0);
            setAttributes({ filterCategories: parsed });
        };

        return (
            <>
                <ToggleControl
                    label={__('Enable Image Filtering', 'folioblocks')}
                    checked={!!attributes.enableFilter}
                    onChange={(val) => setAttributes({ enableFilter: val })}
                    __nextHasNoMarginBottom={true}
                    help={__('Enable image filtering with categories.', 'folioblocks')}
                />
                {enableFilter && (
                    <>
                        <ToggleGroupControl
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                            value={filterAlign}
                            isBlock
                            label={__('Filter Bar Alignment', 'folioblocks')}
                            help={__('Set alignment of the filter bar.', 'folioblocks')}
                            onChange={(value) => setAttributes({ filterAlign: value })}
                        >
                            <ToggleGroupControlOption
                                label="Left"
                                value="left"
                            />
                            <ToggleGroupControlOption
                                label="Center"
                                value="center"
                            />
                            <ToggleGroupControlOption
                                label="Right"
                                value="right"
                            />
                        </ToggleGroupControl>

                        <TextControl
                            label={__('Filter Categories', 'folioblocks')}
                            value={filtersInput}
                            onChange={handleFilterInputChange}
                            onBlur={handleFilterInputBlur}
                            help={__('Separate categories with commas')}
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize
                        />
                    </>
                )}
            </>
        );
    }
);

addFilter(
    'folioBlocks.justifiedGallery.borderColorControl',
    'folioblocks/justified-gallery-premium-border-color',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        return (
            <BaseControl label={__('Border Color', 'folioblocks')} __nextHasNoMarginBottom={true}>
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
    'folioBlocks.justifiedGallery.borderWidthControl',
    'folioblocks/justified-gallery-premium-border-width',
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
                __next40pxDefaultSize={true}
                __nextHasNoMarginBottom={true}
                help={__('Set border width in pixels.', 'folioblocks')}
            />
        );
    }
);

addFilter(
    'folioBlocks.justifiedGallery.borderRadiusControl',
    'folioblocks/justified-gallery-premium-border-radius',
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
                __next40pxDefaultSize={true}
                __nextHasNoMarginBottom={true}
                help={__('Set border radius in pixels.', 'folioblocks')}
            />
        );
    }
);

addFilter(
    'folioBlocks.justifiedGallery.dropShadowToggle',
    'folioblocks/justified-gallery-premium-drop-shadow',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Enable Drop Shadow', 'folioblocks')}
                checked={!!attributes.dropShadow}
                onChange={(newDropShadow) => setAttributes({ dropShadow: newDropShadow })}
                __nextHasNoMarginBottom={true}
                help={__('Applies a subtle drop shadow to images.', 'folioblocks')}
            />
        );
    }
);

addFilter(
    'folioBlocks.justifiedGallery.filterStyleSettings',
    'folioblocks/justified-gallery-premium-filter-styles',
    (defaultContent, { attributes, setAttributes }) => {
        if (!attributes.enableFilter) {
            return null;
        }

        return (
            <PanelColorSettings
                title="Gallery Filter Bar Styles"
                colorSettings={[
                    {
                        label: 'Active - Text Color',
                        value: attributes.activeFilterTextColor,
                        onChange: (value) =>
                            setAttributes({ activeFilterTextColor: value }),
                    },
                    {
                        label: 'Active - Background Color',
                        value: attributes.activeFilterBgColor,
                        onChange: (value) =>
                            setAttributes({ activeFilterBgColor: value }),
                    },
                    {
                        label: 'Inactive - Text Color',
                        value: attributes.filterTextColor,
                        onChange: (value) =>
                            setAttributes({ filterTextColor: value }),
                    },
                    {
                        label: 'Inactive - Background Color',
                        value: attributes.filterBgColor,
                        onChange: (value) =>
                            setAttributes({ filterBgColor: value }),
                    },
                ]}
            />
        );
    }
);

addFilter(
    'folioBlocks.justifiedGallery.renderFilterBar',
    'folioblocks/justified-gallery-premium-filter-bar',
    (defaultContent, { attributes, setAttributes }) => {
        const {
            enableFilter = false,
            activeFilter = 'All',
            filterCategories = [],
            filterAlign = 'center',
        } = attributes;

        if (!enableFilter || !Array.isArray(filterCategories)) {
            return defaultContent;
        }

        return (
            <div className={`pb-image-gallery-filters align-${filterAlign}`}>
                {['All', ...filterCategories].map((term) => (
                    <button
                        key={term}
                        className={`filter-button${activeFilter === term ? ' is-active' : ''}`}
                        onClick={() => setAttributes({ activeFilter: term })}
                        type="button"
                    >
                        {term}
                    </button>
                ))}
            </div>
        );
    }
);