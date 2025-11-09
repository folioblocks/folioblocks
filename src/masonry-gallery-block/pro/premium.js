/**
 * Masonry Gallery Block
 * Premium JS
 **/
import { __ } from '@wordpress/i18n';
import { PanelColorSettings, store as blockEditorStore } from '@wordpress/block-editor';
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
import { useEffect, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { applyThumbnails } from '../../pb-helpers/applyThumbnails';

addFilter(
    'portfolioBlocks.masonryGallery.editorEnhancements',
    'pb-gallery/masonry-gallery-premium-thumbnails',
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
    'portfolioBlocks.masonryGallery.editorEnhancements',
    'pb-gallery/masonry-gallery-randomize',
    (_, props) => {
        if (!props) return null;
        const { attributes, innerBlocks, clientId, replaceInnerBlocks, updateBlockAttributes } = props;
        if (!attributes || !innerBlocks || !replaceInnerBlocks) return null;

        const hasShuffledRef = useRef(false);

        useEffect(() => {
            // Only shuffle once when toggle changes to true
            if (attributes.randomizeOrder && !hasShuffledRef.current && innerBlocks.length > 0) {
                const shuffled = [...innerBlocks];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }

                replaceInnerBlocks(clientId, shuffled, false);
                if (typeof updateBlockAttributes === 'function') {
                    setTimeout(() => updateBlockAttributes(clientId, { _forceRefresh: Date.now() }), 50);
                }

                hasShuffledRef.current = true;
            }

            // Reset flag when toggle is turned off
            if (!attributes.randomizeOrder) {
                hasShuffledRef.current = false;
            }
        }, [attributes.randomizeOrder]); // ✅ run only when toggle changes

        return null;
    }
);
addFilter(
    'portfolioBlocks.masonryGallery.randomizeToggle',
    'pb-gallery/masonry-gallery-premium-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        return (
            <ToggleControl
                label={__('Randomize Image Order', 'pb-gallery')}
                checked={!!attributes.randomizeOrder}
                onChange={(value) => setAttributes({ randomizeOrder: value })}
                __nextHasNoMarginBottom={true}
                help={__('Randomize order of images.', 'pb-gallery')}
            />
        );
    }
);

addFilter(
    'portfolioBlocks.masonryGallery.downloadControls',
    'pb-gallery/masonry-gallery-premium-downloads',
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
        'portfolioBlocks.masonryGallery.wooCommerceControls',
        'pb-gallery/masonry-gallery-premium-woocommerce',
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
    'portfolioBlocks.masonryGallery.disableRightClickToggle',
    'pb-gallery/masonry-gallery-premium-disable-right-click',
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
    'portfolioBlocks.masonryGallery.lazyLoadToggle',
    'pb-gallery/masonry-gallery-premium-lazy-load',
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
    'portfolioBlocks.masonryGallery.lightboxControls',
    'pb-gallery/masonry-gallery-premium-lightbox',
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
    'portfolioBlocks.masonryGallery.onHoverTitleToggle',
    'pb-gallery/masonry-gallery-premium-title-toggle',
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
    'portfolioBlocks.masonryGallery.filterLogic',
    'pb-gallery/masonry-gallery-filter-logic',
    (_, { clientId, attributes, setAttributes }) => {
        const {
            enableFilter = false,
            filterAlign = 'center',
            filtersInput = '',
            activeFilter = 'All',
        } = attributes;

        // --- 1. Derive categories from filtersInput ---
        const filterCategories = filtersInput
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        // Sync derived categories with block attributes
        useEffect(() => {
            setAttributes({ filterCategories });
        }, [filtersInput]);

        // --- 2. Selection logic moved from edit.js ---
        // Detect whether this block or one of its children is selected
        const isBlockOrChildSelected = useSelect(
            (select) => {
                const selectedId = select(blockEditorStore).getSelectedBlockClientId();
                if (!selectedId) return false;

                const selectedBlock = select(blockEditorStore).getBlock(selectedId);
                if (!selectedBlock) return false;

                // Check if this gallery block itself is selected
                if (selectedBlock.clientId === clientId) return true;

                // Check if a pb-image-block inside this gallery is selected
                if (
                    selectedBlock.name === 'pb-gallery/pb-image-block' &&
                    select(blockEditorStore).getBlockRootClientId(selectedId) === clientId
                ) {
                    return true;
                }

                return false;
            },
            [clientId]
        );

        // Get the currently selected block (for resetting filters)
        const selectedBlock = useSelect(
            (select) => select(blockEditorStore).getSelectedBlock(),
            []
        );

        // --- 3. Reset activeFilter if selected image is filtered out ---
        useEffect(() => {
            if (
                selectedBlock &&
                selectedBlock.name === 'pb-gallery/pb-image-block'
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

        // --- 4. Keep base filter attributes synced ---
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
    'portfolioBlocks.masonryGallery.enableFilterToggle',
    'pb-gallery/masonry-gallery-premium-filter-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        const { enableFilter, filterAlign, filtersInput } = attributes;

        const handleFilterInputChange = (val) => {
            setAttributes({ filtersInput: val });
        };
        const handleFilterInputBlur = () => {
            const rawFilters = filtersInput.split(',').map((f) => f.trim());
            const cleanFilters = rawFilters.filter(Boolean);
            setAttributes({ filterCategories: cleanFilters });
        };

        return (
            <>
                <ToggleControl
                    label={__('Enable Image Filtering', 'pb-gallery')}
                    checked={!!attributes.enableFilter}
                    onChange={(val) => setAttributes({ enableFilter: val })}
                    __nextHasNoMarginBottom={true}
                    help={__('Enable image filtering with categories.', 'pb-gallery')}
                />
                {enableFilter && (
                    <>
                        <ToggleGroupControl
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                            value={filterAlign}
                            isBlock
                            label={__('Filter Bar Alignment', 'pb-gallery')}
                            help={__('Set alignment of the filter bar.', 'pb-gallery')}
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
                            label={__('Filter Categories', 'pb-gallery')}
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
    'portfolioBlocks.masonryGallery.borderColorControl',
    'pb-gallery/masonry-gallery-premium-border-color',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        return (
            <BaseControl label={__('Border Color', 'pb-gallery')} __nextHasNoMarginBottom={true}>
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
    'portfolioBlocks.masonryGallery.borderWidthControl',
    'pb-gallery/masonry-gallery-premium-border-width',
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
    'portfolioBlocks.masonryGallery.borderRadiusControl',
    'pb-gallery/masonry-gallery-premium-border-radius',
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
    'portfolioBlocks.masonryGallery.dropShadowToggle',
    'pb-gallery/masonry-gallery-premium-drop-shadow',
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
addFilter(
    'portfolioBlocks.masonryGallery.filterStyleSettings',
    'pb-gallery/masonry-gallery-premium-filter-styles',
    (defaultContent, { attributes, setAttributes }) => {
        if (!attributes.enableFilter) {
            return null;
        }

        return (
            <PanelColorSettings
                title="Filter Bar Styles"
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
    'portfolioBlocks.masonryGallery.renderFilterBar',
    'pb-gallery/masonry-gallery-premium-filter-bar',
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