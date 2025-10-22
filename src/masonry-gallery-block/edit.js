import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    useInnerBlocksProps,
    InspectorControls,
    MediaPlaceholder,
    MediaUpload,
    BlockControls,
    PanelColorSettings,
    store as blockEditorStore
} from '@wordpress/block-editor';
import {
    PanelBody,
    Notice,
    ToggleControl,
    Button,
    SelectControl,
    ToolbarGroup,
    ToolbarButton,
    TextControl,
    RangeControl,
    ColorPalette,
    BaseControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { subscribe, dispatch, select, useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import ResponsiveRangeControl from '../pb-helpers/ResponsiveRangeControl';
import { plus } from '@wordpress/icons';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { decodeEntities } from '@wordpress/html-entities';
import IconMasonryGallery from '../pb-helpers/IconMasonryGallery';
import { applyThumbnails } from '../pb-helpers/applyThumbnails';

import './editor.scss';

const ALLOWED_BLOCKS = ['portfolio-blocks/pb-image-block'];

export default function Edit({ clientId, attributes, setAttributes }) {
    const {
        enableFilter = false,
        filterAlign = 'center',
        filtersInput = '',
        columns,
        tabletColumns,
        mobileColumns,
        enableDownload,
        downloadOnHover,
        preview
    } = attributes;

    // Runtime override: if WooCommerce is not active, force Woo features off without mutating saved attributes
    const hasWooCommerce = window.portfolioBlocksData?.hasWooCommerce ?? false;
    const effectiveEnableWoo = hasWooCommerce ? (attributes.enableWooCommerce || false) : false;
    useEffect(() => {
        const wooActive = window.portfolioBlocksData?.hasWooCommerce ?? false;
        if (wooActive !== attributes.hasWooCommerce) {
            setAttributes({ hasWooCommerce: wooActive });
        }
    }, [window.portfolioBlocksData?.hasWooCommerce]);

    const checkoutUrl = window.portfolioBlocksData?.checkoutUrl || 'https://portfolio-blocks.com/portfolio-blocks-pricing/';

    // Block Preview Image
    if (preview) {
        return (
            <div className="pb-block-preview">
                <IconMasonryGallery />
            </div>
        );
    }

    const handleFilterInputChange = (val) => {
        setAttributes({ filtersInput: val });
    };
    const handleFilterInputBlur = () => {
        const rawFilters = filtersInput.split(',').map((f) => f.trim());
        const cleanFilters = rawFilters.filter(Boolean);
        setAttributes({ filterCategories: cleanFilters });
    };
    const filterCategories = filtersInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    useEffect(() => {
        setAttributes({ filterCategories });
    }, [filtersInput]);

    const activeFilter = attributes.activeFilter || 'All';

    const blockProps = useBlockProps({
        context: {
            'portfolioBlocks/activeFilter': activeFilter,
            'portfolioBlocks/filterCategories': filterCategories,
            'portfolioBlocks/enableWooCommerce': effectiveEnableWoo,
            'portfolioBlocks/hasWooCommerce': hasWooCommerce,
        },
        style: {
            '--pb--filter-text-color': attributes.filterTextColor || '#000',
            '--pb--filter-bg-color': attributes.filterBgColor || 'transparent',
            '--pb--filter-active-text': attributes.activeFilterTextColor || '#fff',
            '--pb--filter-active-bg': attributes.activeFilterBgColor || '#000',
        },
    });

    const galleryRef = useRef(null);
    const { replaceInnerBlocks, updateBlockAttributes } = useDispatch('core/block-editor');

    const innerBlocks = useSelect(
        (select) => select('core/block-editor').getBlocks(clientId),
        [clientId]
    );

    const { children, ...innerBlocksProps } = useInnerBlocksProps(
        { ref: galleryRef, className: `${blockProps.className} pb-masonry-gallery` },
        {
            allowedBlocks: ALLOWED_BLOCKS,
            renderAppender: false,
        }
    );

    // Filter to limit number of images in free version (only if not Pro)
    if (!window.portfolioBlocksData?.isPro) {
        addFilter(
            'portfolioBlocks.masonryGallery.limitImages',
            'portfolio-blocks/masonry-gallery-limit',
            (media, existingCount) => {
                const MAX_IMAGES_FREE = 15;
                const allowed = Math.max(0, MAX_IMAGES_FREE - existingCount);

                if (allowed <= 0) {
                    const message = __('Free version allows up to 15 images. Upgrade to Pro for unlimited.', 'portfolio-blocks');
                    wp.data.dispatch('core/notices').createNotice(
                        'warning',
                        message,
                        { isDismissible: true, id: 'pb-masonry-limit-warning' }
                    );
                    return [];
                }

                if (media.length > allowed) {
                    const message = sprintf(
                        __('Free version allows up to %d images. Only the first %d were added.', 'portfolio-blocks'),
                        MAX_IMAGES_FREE,
                        allowed
                    );
                    wp.data.dispatch('core/notices').createNotice(
                        'warning',
                        message,
                        { isDismissible: true, id: 'pb-masonry-limit-truncate' }
                    );
                }

                return media.slice(0, allowed);
            }
        );
        // Prevent people duplicating blocks to bypass limits in free version
        subscribe(() => {
            const blocks = select('core/block-editor').getBlocksByClientId(clientId)[0]?.innerBlocks || [];
            if (blocks.length > 15) {
                const extras = blocks.slice(15);
                extras.forEach((block) => {
                    dispatch('core/block-editor').removeBlock(block.clientId);
                });

                if (!document.getElementById('pb-gallery-limit-warning')) {
                    dispatch('core/notices').createNotice(
                        'warning',
                        __('Free version allows up to 15 images. Upgrade to Pro for unlimited.', 'portfolio-blocks'),
                        { id: 'pb-gallery-limit-warning', isDismissible: true }
                    );
                }
            }
        });
    }

    // Select Images Handler
    const onSelectImages = async (media) => {
        if (!media || media.length === 0) return;

        // Allow filtering of selected images (for free vs premium limits)
        media = applyFilters(
            'portfolioBlocks.masonryGallery.limitImages',
            media,
            innerBlocks.length
        );

        const currentBlocks = wp.data.select('core/block-editor').getBlocks(clientId);
        const existingImageIds = currentBlocks.map((block) => block.attributes.id);
        const newImageIds = media.filter((image) => !existingImageIds.includes(image.id)).map((image) => image.id);

        // Fetch all media titles in a single API call
        const responses = await wp.apiFetch({
            path: `/wp/v2/media?include=${newImageIds.join(',')}&per_page=100`,
        });

        const titleMap = responses.reduce((acc, item) => {
            acc[item.id] = item.title.rendered || '';
            return acc;
        }, {});

        // Create new blocks
        const newBlocks = media
            .filter((image) => !existingImageIds.includes(image.id))
            .map((image) => {
                const title = decodeEntities(titleMap[image.id] || '');
                return wp.blocks.createBlock('portfolio-blocks/pb-image-block', {
                    id: image.id,
                    src: image.url,
                    alt: image.alt || '',
                    title: title,
                    sizes: image.sizes || {},
                    caption: image.caption || '',
                });
            });

        // Replace inner blocks with the newly created blocks
        replaceInnerBlocks(clientId, [...currentBlocks, ...newBlocks]);
        updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
    };

    useEffect(() => {
        setAttributes({
            images: innerBlocks.map((block) => ({
                id: block.attributes.id,
                src: block.attributes.src,
                alt: block.attributes.alt,
                title: block.attributes.title,
                caption: block.attributes.caption,
            })),
        });
    }, [innerBlocks, attributes.randomizeOrder, setAttributes]);

    const getColumnsForWidth = (width) => {
        if (width <= 600) return attributes.mobileColumns || 2;
        if (width <= 1024) return attributes.tabletColumns || 4;
        return attributes.columns || 6;
    };

    const applyCustomMasonryLayout = () => {
        const gallery = galleryRef.current;
        if (!gallery) return;

        const gap = attributes.noGap ? 0 : 10;
        const columns = getColumnsForWidth(gallery.offsetWidth);
        const columnHeights = Array(columns).fill(0);
        const columnWidth = (gallery.offsetWidth - gap * (columns - 1)) / columns;

        gallery.style.position = 'relative';

        // Reset all layout styles first
        gallery.querySelectorAll('.pb-image-block-wrapper').forEach(item => {
            item.style.position = '';
            item.style.top = '';
            item.style.left = '';
            item.style.width = '';
        });
        const items = gallery.querySelectorAll('.pb-image-block-wrapper:not(.is-hidden)');

        items.forEach((item) => {
            const minCol = columnHeights.indexOf(Math.min(...columnHeights));

            item.style.position = 'absolute';
            item.style.width = `${columnWidth}px`;
            item.style.top = `${columnHeights[minCol]}px`;
            item.style.left = `${(columnWidth + gap) * minCol}px`;

            columnHeights[minCol] += item.offsetHeight + gap;
        });

        gallery.style.height = `${Math.max(...columnHeights)}px`;
    };

    useEffect(() => {
        applyCustomMasonryLayout();
    }, [activeFilter]);

    useEffect(() => {
        const gallery = galleryRef.current;
        if (!gallery || innerBlocks.length === 0) return;

        const images = gallery.querySelectorAll('img');
        let loadedImages = 0;

        const imageLoaded = () => {
            loadedImages += 1;
            if (loadedImages === images.length) {
                applyCustomMasonryLayout();
            }
        };

        images.forEach((img) => {
            if (img.complete && img.naturalHeight !== 0) imageLoaded();
            else img.onload = img.onerror = imageLoaded;
        });

        const fallbackTimeout = setTimeout(applyCustomMasonryLayout, 1000);

        const resizeObserver = new ResizeObserver(() => {
            applyCustomMasonryLayout();
        });

        resizeObserver.observe(gallery);

        window.addEventListener('resize', applyCustomMasonryLayout);

        return () => {
            clearTimeout(fallbackTimeout);
            window.removeEventListener('resize', applyCustomMasonryLayout);
            resizeObserver.disconnect(); // ✅ Cleanup observer on unmount
        };
    }, [innerBlocks, attributes.noGap, attributes.columns, attributes.tabletColumns, attributes.mobileColumns]);


    // Determine if this block or one of its children is selected
    const isBlockOrChildSelected = useSelect(
        (select) => {
            const selectedId = select(blockEditorStore).getSelectedBlockClientId();
            if (!selectedId) return false;

            const selectedBlock = select(blockEditorStore).getBlock(selectedId);
            if (!selectedBlock) return false;

            // Check if this block is selected
            if (selectedBlock.clientId === clientId) return true;

            // Check if selected block is a pb-image-block inside this gallery
            if (
                selectedBlock.name === 'portfolio-blocks/pb-image-block' &&
                select(blockEditorStore).getBlockRootClientId(selectedId) === clientId
            ) {
                return true;
            }

            return false;
        },
        [clientId]
    );
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



    const selectedBlock = useSelect(
        (select) => {
            const { getSelectedBlock } = select(blockEditorStore);
            return getSelectedBlock();
        },
        []
    );
    useEffect(() => {
        if (
            selectedBlock &&
            selectedBlock.name === 'portfolio-blocks/pb-image-block'
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

    useEffect(() => {
        if (!attributes.randomizeOrder || innerBlocks.length === 0) return;

        const shuffled = [...innerBlocks];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        replaceInnerBlocks(clientId, shuffled);
    }, [attributes.randomizeOrder]);

    return (
        <>
            <BlockControls>
                <ToolbarGroup>
                    <ToolbarButton
                        icon={plus}
                        label={__('Add Images', 'portfolio-blocks')}
                        disabled={!window.portfolioBlocksData?.isPro && innerBlocks.length >= 15}
                        onClick={() => {
                            // Trigger the MediaUpload dialog
                            wp.media({
                                title: __('Select Images', 'portfolio-blocks'),
                                multiple: true,
                                library: { type: 'image' },
                                button: { text: __('Add to Gallery', 'portfolio-blocks') },
                            })
                                .on('select', () => {
                                    const selection = wp.media.frame.state().get('selection').toJSON();
                                    onSelectImages(selection);
                                })
                                .open();
                        }}
                    >{__('Add Images', 'portfolio-blocks')}
                    </ToolbarButton>
                </ToolbarGroup>
            </BlockControls>
            <InspectorControls>
                <PanelBody title={__('General Gallery Settings', 'portfolio-blocks')} initialOpen={true}>
                    <SelectControl
                        label={__('Resolution', 'portfolio-blocks')}
                        value={attributes.resolution || 'large'}
                        options={[
                            { label: __('Thumbnail', 'portfolio-blocks'), value: 'thumbnail' },
                            { label: __('Medium', 'portfolio-blocks'), value: 'medium' },
                            { label: __('Large', 'portfolio-blocks'), value: 'large' },
                            { label: __('Full', 'portfolio-blocks'), value: 'full' }
                        ].filter(option => {
                            // Check all images for available sizes
                            const allSizes = innerBlocks.flatMap(block => Object.keys(block.attributes.sizes || {}));
                            return allSizes.includes(option.value) || option.value === 'full';
                        })}
                        onChange={(newResolution) => {
                            setAttributes({ resolution: newResolution });

                            // Apply new resolution to all inner blocks and trigger a re-render
                            innerBlocks.forEach((block) => {
                                const newSrc = block.attributes.sizes?.[newResolution]?.url || block.attributes.src;

                                wp.data.dispatch('core/block-editor').updateBlockAttributes(block.clientId, {
                                    src: newSrc,
                                    imageSize: newResolution,
                                });
                            });

                            updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
                        }}
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                        help={__('Select the size of the source image.')}
                    />
                    <ResponsiveRangeControl
                        label={__('Columns', 'portfolio-blocks')}
                        columns={columns}
                        tabletColumns={tabletColumns}
                        mobileColumns={mobileColumns}
                        onChange={(newValues) => setAttributes(newValues)}
                    />
                    <ToggleControl
                        label={__('Remove Image Gap', 'portfolio-blocks')}
                        checked={attributes.noGap || false}
                        onChange={(noGap) => setAttributes({ noGap })}
                        help={__('Remove gap between images.')}
                        __nextHasNoMarginBottom
                    />
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.randomizeToggle',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Randomize Image Order', 'portfolio-blocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'portfolio-blocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.downloadControls',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Image Downloads', 'portfolio-blocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'portfolio-blocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes, hasWooCommerce, effectiveEnableWoo }
                    )}
                    {window.portfolioBlocksData?.hasWooCommerce && applyFilters(
                        'portfolioBlocks.masonryGallery.wooCommerceControls',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Woo Commerce', 'portfolio-blocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'portfolio-blocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes, hasWooCommerce, effectiveEnableWoo }
                    )}
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.disableRightClickToggle',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Disable Right-Click', 'portfolio-blocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'portfolio-blocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.lazyLoadToggle',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Lazy Load of Images', 'portfolio-blocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'portfolio-blocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                </PanelBody>
                <PanelBody title={__('Gallery Image Settings', 'portfolio-blocks')} initialOpen={true}>
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.lightboxControls',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enalble Lightbox', 'portfolio-blocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'portfolio-blocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.onHoverTitleToggle',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Show Title on Hover', 'portfolio-blocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'portfolio-blocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                </PanelBody>
                <PanelBody title={__('Gallery Filter Settings', 'portfolio-blocks')} initialOpen={true}>
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.enableFilterToggle',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Image Filtering', 'portfolio-blocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'portfolio-blocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                    {enableFilter && (
                        <>
                            <ToggleGroupControl
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                                value={filterAlign}
                                isBlock
                                label={__('Filter Bar Alignment', 'portfolio-blocks')}
                                help={__('Set alignment of the filter bar.', 'portfolio-blocks')}
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
                                label={__('Filter Categories', 'portfolio-blocks')}
                                value={filtersInput}
                                onChange={handleFilterInputChange}
                                onBlur={handleFilterInputBlur}
                                help={__('Separate categories with commas')}
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                            />
                        </>
                    )}
                </PanelBody>
            </InspectorControls >
            <InspectorControls group="styles">
                <PanelBody title={__('Gallery Image Styles', 'portfolio-blocks')} initialOpen={true}>
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.borderColorControl',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Image Border Color', 'portfolio-blocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'portfolio-blocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.borderWidthControl',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Image Border Width', 'portfolio-blocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'portfolio-blocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.borderRadiusControl',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Image Border Radius', 'portfolio-blocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'portfolio-blocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.dropShadowToggle',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Image Drop Shadow', 'portfolio-blocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'portfolio-blocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                </PanelBody>
                {enableFilter && (
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
                )}
            </InspectorControls>

            <div {...blockProps} className={`${blockProps.className} ${attributes.dropShadow ? 'drop-shadow' : ''}`}>
                {innerBlocks.length === 0 ? (
                    <MediaPlaceholder
                        icon={<IconMasonryGallery />}
                        labels={{
                            title: __('Masonry Gallery', 'portfolio-blocks'),
                            instructions: !window.portfolioBlocksData?.isPro
                                ? __('Upload or select up to 15 images to create a Masonry Gallery. Upgrade to Pro for unlimited images.', 'portfolio-blocks')
                                : __('Upload or select images to create a Masonry Gallery.', 'portfolio-blocks'),
                        }}
                        onSelect={onSelectImages}
                        allowedTypes={['image']}
                        multiple
                    />
                ) : (
                    <>
                        {enableFilter && Array.isArray(filterCategories) && (
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
                        )}
                        <div {...innerBlocksProps}>
                            {children}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}