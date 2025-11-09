/**
 * Masonry Gallery Block
 * Edit JS
 **/
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    useInnerBlocksProps,
    InspectorControls,
    MediaPlaceholder,
    BlockControls,
} from '@wordpress/block-editor';
import {
    PanelBody,
    Notice,
    ToggleControl,
    SelectControl,
    ToolbarGroup,
    ToolbarButton,
} from '@wordpress/components';
import { subscribe, dispatch, select, useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import ResponsiveRangeControl from '../pb-helpers/ResponsiveRangeControl';
import { plus } from '@wordpress/icons';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { decodeEntities } from '@wordpress/html-entities';
import IconMasonryGallery from '../pb-helpers/IconMasonryGallery';

import './editor.scss';

const ALLOWED_BLOCKS = ['pb-gallery/pb-image-block'];

export default function Edit({ clientId, attributes, setAttributes }) {
    const {
        columns,
        tabletColumns,
        mobileColumns,
        lightbox,
        lightboxCaption,
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

    const activeFilter = attributes.activeFilter || 'All';

    const blockProps = useBlockProps({
        context: {
            'portfolioBlocks/activeFilter': attributes.activeFilter,
            'portfolioBlocks/filterCategories': attributes.filterCategories,
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
            'pb-gallery/masonry-gallery-limit',
            (media, existingCount) => {
                const MAX_IMAGES_FREE = 15;
                const allowed = Math.max(0, MAX_IMAGES_FREE - existingCount);

                if (allowed <= 0) {
                    const message = __('Free version allows up to 15 images. Upgrade to Pro for unlimited.', 'pb-gallery');
                    wp.data.dispatch('core/notices').createNotice(
                        'warning',
                        message,
                        { isDismissible: true, id: 'pb-masonry-limit-warning' }
                    );
                    return [];
                }

                if (media.length > allowed) {
                    const message = sprintf(
                        __('Free version allows up to %d images. Only the first %d were added.', 'pb-gallery'),
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
                        __('Free version allows up to 15 images. Upgrade to Pro for unlimited.', 'pb-gallery'),
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
                return wp.blocks.createBlock('pb-gallery/pb-image-block', {
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
 
    applyFilters('portfolioBlocks.masonryGallery.filterLogic', null, { clientId, attributes, setAttributes    });
    applyFilters('portfolioBlocks.masonryGallery.editorEnhancements', null, { attributes, clientId, innerBlocks, replaceInnerBlocks, updateBlockAttributes });

    return (
        <>
            <BlockControls>
                <ToolbarGroup>
                    <ToolbarButton
                        icon={plus}
                        label={__('Add Images', 'pb-gallery')}
                        disabled={!window.portfolioBlocksData?.isPro && innerBlocks.length >= 15}
                        onClick={() => {
                            // Trigger the MediaUpload dialog
                            wp.media({
                                title: __('Select Images', 'pb-gallery'),
                                multiple: true,
                                library: { type: 'image' },
                                button: { text: __('Add to Gallery', 'pb-gallery') },
                            })
                                .on('select', () => {
                                    const selection = wp.media.frame.state().get('selection').toJSON();
                                    onSelectImages(selection);
                                })
                                .open();
                        }}
                    >{__('Add Images', 'pb-gallery')}
                    </ToolbarButton>
                </ToolbarGroup>
            </BlockControls>
            <InspectorControls>
                <PanelBody title={__('General Gallery Settings', 'pb-gallery')} initialOpen={true}>
                    <SelectControl
                        label={__('Resolution', 'pb-gallery')}
                        value={attributes.resolution || 'large'}
                        options={[
                            { label: __('Thumbnail', 'pb-gallery'), value: 'thumbnail' },
                            { label: __('Medium', 'pb-gallery'), value: 'medium' },
                            { label: __('Large', 'pb-gallery'), value: 'large' },
                            { label: __('Full', 'pb-gallery'), value: 'full' }
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
                        label={__('Columns', 'pb-gallery')}
                        columns={columns}
                        tabletColumns={tabletColumns}
                        mobileColumns={mobileColumns}
                        onChange={(newValues) => setAttributes(newValues)}
                    />
                    <ToggleControl
                        label={__('Remove Image Gap', 'pb-gallery')}
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
                                    <strong>{__('Randomize Image Order', 'pb-gallery')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'pb-gallery')}
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
                                    <strong>{__('Enable Image Downloads', 'pb-gallery')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'pb-gallery')}
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
                                    <strong>{__('Enable Woo Commerce', 'pb-gallery')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'pb-gallery')}
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
                                    <strong>{__('Disable Right-Click', 'pb-gallery')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'pb-gallery')}
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
                                    <strong>{__('Enable Lazy Load of Images', 'pb-gallery')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'pb-gallery')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                </PanelBody>
                <PanelBody title={__('Gallery Image Settings', 'pb-gallery')} initialOpen={true}>
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.lightboxControls',
                        (
                            <>
                                <ToggleControl
                                    label={__('Enable Lightbox', 'pb-gallery')}
                                    checked={!!lightbox}
                                    onChange={(newLightbox) => setAttributes({ lightbox: newLightbox })}
                                    __nextHasNoMarginBottom
                                    help={__('Open images in a lightbox when clicked.', 'pb-gallery')}
                                />

                                {lightbox && (
                                    <ToggleControl
                                        label={__('Show Image Caption in Lightbox', 'pb-gallery')}
                                        checked={!!lightboxCaption}
                                        onChange={(newLightboxCaption) =>
                                            setAttributes({ lightboxCaption: newLightboxCaption })
                                        }
                                        __nextHasNoMarginBottom
                                        help={__('Display image captions inside the lightbox.', 'pb-gallery')}
                                    />
                                )}
                            </>
                        ),
                        { attributes, setAttributes }
                    )}
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.onHoverTitleToggle',
                        (
                            <>
                                <ToggleControl
                                    label={__('Show Image Title on Hover', 'pb-gallery')}
                                    help={__('Display the image title when hovering over images.', 'pb-gallery')}
                                    __nextHasNoMarginBottom
                                    checked={!!attributes.onHoverTitle}
                                    onChange={(value) => setAttributes({ onHoverTitle: value })}
                                />
                            </>
                        ),
                        { attributes, setAttributes }
                    )}
                </PanelBody>
                <PanelBody title={__('Gallery Filter Settings', 'pb-gallery')} initialOpen={true}>
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.enableFilterToggle',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Image Filtering', 'pb-gallery')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'pb-gallery')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                </PanelBody>
            </InspectorControls >
            <InspectorControls group="styles">
                <PanelBody title={__('Gallery Image Styles', 'pb-gallery')} initialOpen={true}>
                    {applyFilters(
                        'portfolioBlocks.masonryGallery.borderColorControl',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Image Border Color', 'pb-gallery')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'pb-gallery')}
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
                                    <strong>{__('Enable Image Border Width', 'pb-gallery')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'pb-gallery')}
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
                                    <strong>{__('Enable Image Border Radius', 'pb-gallery')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'pb-gallery')}
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
                                    <strong>{__('Enable Image Drop Shadow', 'pb-gallery')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'pb-gallery')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                </PanelBody>
                {applyFilters(
                    'portfolioBlocks.masonryGallery.filterStyleSettings',
                    (
                        <div style={{ marginBottom: '8px' }}>
                            <Notice status="info" isDismissible={false}>
                                <strong>{__('Filter Bar Styles', 'pb-gallery')}</strong><br />
                                {__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
                                <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                    {__('Upgrade to Pro', 'pb-gallery')}
                                </a>
                            </Notice>
                        </div>
                    ),
                    { attributes, setAttributes }
                )}
            </InspectorControls>

            <div {...blockProps} className={`${blockProps.className} ${attributes.dropShadow ? 'drop-shadow' : ''}`}>
                {innerBlocks.length === 0 ? (
                    <MediaPlaceholder
                        icon={<IconMasonryGallery />}
                        labels={{
                            title: __('Masonry Gallery', 'pb-gallery'),
                            instructions: !window.portfolioBlocksData?.isPro
                                ? __('Upload or select up to 15 images to create a Masonry Gallery. Upgrade to Pro for unlimited images.', 'pb-gallery')
                                : __('Upload or select images to create a Masonry Gallery.', 'pb-gallery'),
                        }}
                        onSelect={onSelectImages}
                        allowedTypes={['image']}
                        multiple
                    />
                ) : (
                    <>
                        {applyFilters(
                            'portfolioBlocks.masonryGallery.renderFilterBar',
                            null,
                            { attributes, setAttributes }
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