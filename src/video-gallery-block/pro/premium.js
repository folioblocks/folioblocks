/**
 * Video Gallery Block
 * Premium JS
 **/
import { __ } from '@wordpress/i18n';
import { PanelColorSettings } from '@wordpress/block-editor';
import {
    ToggleControl,
    BaseControl,
    ColorPalette,
    RangeControl,
    SelectControl,
    TextControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';

if (window.folioBlocksData?.hasWooCommerce) {
    addFilter(
        'folioBlocks.videoGallery.wooCommerceControls',
        'folioblocks/video-gallery-premium-woocommerce',
        (defaultContent, props) => {
            const { attributes, setAttributes } = props;
            const { enableWooCommerce, wooCartIconDisplay, enableDownload } = attributes;

            return (
                <>
                    <ToggleControl
                        label={__('Enable WooCommerce Integration', 'folioblocks')}
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
                            __next40pxDefaultSize
                            help={__('Choose when to display the Add to Cart icon.', 'folioblocks')}
                        />
                    )}
                </>
            );
        }
    );
}

addFilter(
    'folioBlocks.videoGallery.disableRightClickToggle',
    'folioblocks/video-gallery-premium-disable-right-click',
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
    'folioBlocks.videoGallery.lazyLoadToggle',
    'folioblocks/video-gallery-premium-lazy-load',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Enable Lazy Load of Images', 'folioblocks')}
                help={__('Enables lazy loading of Video Gallery thumbnails.', 'folioblocks')}
                __nextHasNoMarginBottom={true}
                checked={!!attributes.lazyLoad}
                onChange={(value) => setAttributes({ lazyLoad: value })}
            />
        );
    }
);

addFilter(
    'folioBlocks.videoGallery.lightboxLayout',
    'folioblocks/video-gallery-premium-lightbox-layout',
    (defaultContent, props) => {
        const { setAttributes, attributes } = props;
        const { enableWooCommerce } = attributes;

        // Base layout options
        const options = [
            { label: __('Video Only', 'folioblocks'), value: 'video-only' },
            { label: __('Video + Info', 'folioblocks'), value: 'split' },
        ];

        // Add WooCommerce-specific layout option only when WooCommerce is installed and enabled
        if (window.folioBlocksData?.hasWooCommerce && enableWooCommerce) {
            options.push({
                label: __('Video + Product Info', 'folioblocks'),
                value: 'video-product',
            });
        }

        return (
            <SelectControl
                label={__('Lightbox Layout', 'folioblocks')}
                value={attributes.lightboxLayout}
                options={options}
                onChange={(value) => setAttributes({ lightboxLayout: value })}
                __nextHasNoMarginBottom
                __next40pxDefaultSize
            />
        );
    }
);
addFilter(
    'folioBlocks.videoGallery.filterLogic',
    'folioblocks/video-gallery-filter-logic',
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

        // Sync categories whenever filtersInput changes
        useEffect(() => {
            setAttributes({ filterCategories });
        }, [filtersInput]);

        // Reset activeFilter if selected block is filtered out
        useEffect(() => {
            if (
                selectedBlock &&
                selectedBlock.name === 'folioblocks/pb-video-block'
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

        // Keep base toggles in sync
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
    'folioBlocks.videoGallery.enableFilterToggle',
    'folioblocks/video-gallery-premium-filter-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        const { enableFilter, filterAlign, filterCategories } = attributes;

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
                    label={__('Enable Video Filtering', 'folioblocks')}
                    checked={!!attributes.enableFilter}
                    onChange={(val) => setAttributes({ enableFilter: val })}
                    __nextHasNoMarginBottom={true}
                    help={__('Enable video filtering with categories.', 'folioblocks')}
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
                            <ToggleGroupControlOption label="Left" value="left" />
                            <ToggleGroupControlOption label="Center" value="center" />
                            <ToggleGroupControlOption label="Right" value="right" />
                        </ToggleGroupControl>

                        <TextControl
                            label={__('Filter Categories', 'folioblocks')}
                            value={attributes.filtersInput || ''} // directly use attribute
                            onChange={(val) => {
                                setAttributes({ filtersInput: val });
                                if (val.includes(',')) {
                                    const raw = val.split(',').map((f) => f.trim());
                                    const clean = raw.filter(Boolean);
                                    setAttributes({ filterCategories: clean });
                                }
                            }}
                            onBlur={() => {
                                const raw = (attributes.filtersInput || '').split(',').map((f) => f.trim());
                                const clean = raw.filter(Boolean);
                                setAttributes({ filterCategories: clean });
                            }}
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
    'folioBlocks.videoGallery.borderColorControl',
    'folioblocks/video-gallery-premium-border-color',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        return (
            <BaseControl
                label={__('Border Color', 'folioblocks')}
                __nextHasNoMarginBottom={true}
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
    'folioBlocks.videoGallery.borderWidthControl',
    'folioblocks/video-gallery-premium-border-width',
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
    'folioBlocks.videoGallery.borderRadiusControl',
    'folioblocks/video-gallery-premium-border-radius',
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
    'folioBlocks.videoGallery.dropShadowToggle',
    'folioblocks/video-gallery-premium-drop-shadow',
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
    'folioBlocks.videoGallery.filterStylesControls',
    'folioblocks/video-gallery-premium-filter-styles-controls',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        const {
            enableFilter,
            activeFilterTextColor,
            activeFilterBgColor,
            filterTextColor,
            filterBgColor,
        } = attributes;

        if (!enableFilter) {
            return null;
        }

        return (
            <PanelColorSettings
                title={__('Filter Color Settings', 'folioblocks')}
                initialOpen={true}
                __nextHasNoMarginBottom={true}
                colorSettings={[
                    {
                        value: activeFilterTextColor,
                        onChange: (value) => setAttributes({ activeFilterTextColor: value }),
                        label: __('Active Text Color', 'folioblocks'),
                    },
                    {
                        value: activeFilterBgColor,
                        onChange: (value) => setAttributes({ activeFilterBgColor: value }),
                        label: __('Active Background Color', 'folioblocks'),
                    },
                    {
                        value: filterTextColor,
                        onChange: (value) => setAttributes({ filterTextColor: value }),
                        label: __('Inactive Text Color', 'folioblocks'),
                    },
                    {
                        value: filterBgColor,
                        onChange: (value) => setAttributes({ filterBgColor: value }),
                        label: __('Inactive Background Color', 'folioblocks'),
                    },
                ]}
            />
        );
    }
);
addFilter(
    'folioBlocks.videoGallery.renderFilterBar',
    'folioblocks/video-gallery-premium-render-filter-bar',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        const { enableFilter, filterAlign = 'center', filterCategories = [], activeFilter = 'All' } = attributes;

        // Only render filter bar if enabled and categories is an array
        if (!enableFilter || !Array.isArray(filterCategories)) {
            return null;
        }

        return (
            <div className={`pb-video-gallery-filters align-${filterAlign}`}>
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