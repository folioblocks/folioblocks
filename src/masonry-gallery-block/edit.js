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
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import ResponsiveRangeControl from '../pb-helpers/ResponsiveRangeControl';
import { plus } from '@wordpress/icons';
import { applyFilters } from '@wordpress/hooks';
import { decodeEntities } from '@wordpress/html-entities';
import IconMasonryGallery from '../pb-helpers/IconMasonryGallery';
import IconPBSpinner from '../pb-helpers/IconPBSpinner';
import './editor.scss';

const ALLOWED_BLOCKS = ['folioblocks/pb-image-block'];

export default function Edit({ clientId, attributes, setAttributes }) {
    const {
        columns,
        tabletColumns,
        mobileColumns,
        lightbox,
        preview
    } = attributes;

    // Runtime override: if WooCommerce is not active, force Woo features off without mutating saved attributes
    const hasWooCommerce = window.folioBlocksData?.hasWooCommerce ?? false;
    const effectiveEnableWoo = hasWooCommerce ? (attributes.enableWooCommerce || false) : false;
    useEffect(() => {
        const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
        if (wooActive !== attributes.hasWooCommerce) {
            setAttributes({ hasWooCommerce: wooActive });
        }
    }, [window.folioBlocksData?.hasWooCommerce]);

    const [isLoading, setIsLoading] = useState(false);
    const checkoutUrl = window.folioBlocksData?.checkoutUrl || 'https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks&utm_medium=masonry-gallery-block&utm_campaign=upgrade';

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
            'folioBlocks/activeFilter': attributes.activeFilter,
            'folioBlocks/filterCategories': attributes.filterCategories,
            'folioBlocks/enableWooCommerce': effectiveEnableWoo,
            'folioBlocks/hasWooCommerce': hasWooCommerce,
        },
        style: {
            '--pb--filter-text-color': attributes.filterTextColor || '#000',
            '--pb--filter-bg-color': attributes.filterBgColor || 'transparent',
            '--pb--filter-active-text': attributes.activeFilterTextColor || '#fff',
            '--pb--filter-active-bg': attributes.activeFilterBgColor || '#000',
        },
    });

    const galleryRef = useRef(null);
    const layoutRafRef = useRef(null);
    const itemResizeObserverRef = useRef(null);
    const { replaceInnerBlocks, updateBlockAttributes } = useDispatch('core/block-editor');

    const innerBlocks = useSelect(
        (select) => select('core/block-editor').getBlocks(clientId),
        [clientId]
    );

    const { children, ...innerBlocksProps } = useInnerBlocksProps(
        { ref: galleryRef, className: `${blockProps.className} pb-masonry-gallery` },
        {
            allowedBlocks: ALLOWED_BLOCKS,
            orientation: 'horizontal',
            renderAppender: false,
        }
    );
    const isBlockOrChildSelected = useSelect(
        (select) => {
            const blockEditor = select('core/block-editor');
            const selectedId = blockEditor.getSelectedBlockClientId();
            if (!selectedId) return false;

            // Gallery itself selected
            if (selectedId === clientId) {
                return true;
            }

            // A child pb-image-block inside this gallery selected
            const selectedBlock = blockEditor.getBlock(selectedId);
            if (!selectedBlock) return false;

            if (
                selectedBlock.name === 'folioblocks/pb-image-block' &&
                blockEditor.getBlockRootClientId(selectedId) === clientId
            ) {
                return true;
            }

            return false;
        },
        [clientId]
    );

    // Select Images Handler
    const onSelectImages = async (media) => {
        if (!media || media.length === 0) return;

        setIsLoading(true); // <-- start spinner

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
                return wp.blocks.createBlock('folioblocks/pb-image-block', {
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
        setIsLoading(false); // <-- stop spinner
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

        // Use rounded column width like front-end
        const columnWidth = Math.round((gallery.offsetWidth - gap * (columns - 1)) / columns);

        gallery.style.position = 'relative';

        // Reset styles
        // NOTE: Filtering logic may apply `.is-hidden` to the inner block element.
        // We normalize that state by mirroring `.is-hidden` on the OUTER wrapper so
        // the masonry layout can reliably exclude hidden items.
        gallery.querySelectorAll('.pb-image-block-wrapper').forEach((item) => {
            item.style.position = '';
            item.style.top = '';
            item.style.left = '';
            item.style.width = '';

            // If the inner pb-image-block is hidden, also hide the wrapper.
            const inner = item.querySelector('.wp-block-folioblocks-pb-image-block');
            const shouldBeHidden = !!inner?.classList.contains('is-hidden');
            item.classList.toggle('is-hidden', shouldBeHidden);
        });

        const items = gallery.querySelectorAll(
            '.pb-image-block-wrapper:not(.is-hidden):not(:has(.wp-block-folioblocks-pb-image-block.is-hidden))'
        );
        items.forEach((item) => {
            const minCol = columnHeights.indexOf(Math.min(...columnHeights));

            // Position with rounding like front-end
            item.style.position = 'absolute';
            item.style.width = `${columnWidth}px`;
            item.style.top = `${Math.round(columnHeights[minCol])}px`;
            item.style.left = `${Math.round((columnWidth + gap) * minCol)}px`;

            // Include computed margin-bottom like front-end
            const style = window.getComputedStyle(item);
            const marginBottom = parseFloat(style.marginBottom) || 0;

            columnHeights[minCol] += item.offsetHeight + gap + marginBottom;
        });

        gallery.style.height = `${Math.max(...columnHeights)}px`;
    };

    useEffect(() => {
        applyCustomMasonryLayout();
    }, [activeFilter]);

    useEffect(() => {
        const gallery = galleryRef.current;
        if (!gallery || innerBlocks.length === 0) return;

        const scheduleLayout = () => {
            if (layoutRafRef.current) cancelAnimationFrame(layoutRafRef.current);
            layoutRafRef.current = requestAnimationFrame(() => {
                applyCustomMasonryLayout();
            });
        };

        const images = gallery.querySelectorAll('img');
        let loadedImages = 0;

        const imageLoaded = () => {
            loadedImages += 1;
            if (loadedImages === images.length) {
                scheduleLayout();
            }
        };

        images.forEach((img) => {
            if (img.complete && img.naturalHeight !== 0) imageLoaded();
            else img.onload = img.onerror = imageLoaded;
        });

        const fallbackTimeout = setTimeout(scheduleLayout, 1000);

        const resizeObserver = new ResizeObserver(() => {
            scheduleLayout();
        });

        // Observe individual items so border/shadow/style changes reflow the masonry
        const itemObserver = new ResizeObserver(() => {
            scheduleLayout();
        });
        itemResizeObserverRef.current = itemObserver;
        const itemsForObserver = gallery.querySelectorAll('.wp-block-folioblocks-pb-image-block');
        itemsForObserver.forEach((el) => itemObserver.observe(el));

        resizeObserver.observe(gallery);

        window.addEventListener('resize', scheduleLayout);

        return () => {
            clearTimeout(fallbackTimeout);
            if (layoutRafRef.current) {
                cancelAnimationFrame(layoutRafRef.current);
                layoutRafRef.current = null;
            }
            if (itemResizeObserverRef.current) {
                itemResizeObserverRef.current.disconnect();
                itemResizeObserverRef.current = null;
            }
            window.removeEventListener('resize', scheduleLayout);
            resizeObserver.disconnect(); // ✅ Cleanup observer on unmount
        };
    }, [innerBlocks, attributes.noGap, attributes.columns, attributes.tabletColumns, attributes.mobileColumns]);

    applyFilters('folioBlocks.masonryGallery.filterLogic', null, { clientId, attributes, setAttributes });
    applyFilters('folioBlocks.masonryGallery.editorEnhancements', null, { attributes, clientId, innerBlocks, replaceInnerBlocks, isBlockOrChildSelected, updateBlockAttributes });

    return (
        <>
            <BlockControls>
                <ToolbarGroup>
                    <ToolbarButton
                        icon={plus}
                        label={__('Add Images', 'folioblocks')}
                        onClick={() => {
                            // Trigger the MediaUpload dialog
                            wp.media({
                                title: __('Select Images', 'folioblocks'),
                                multiple: true,
                                library: { type: 'image' },
                                button: { text: __('Add to Gallery', 'folioblocks') },
                            })
                                .on('select', () => {
                                    const selection = wp.media.frame.state().get('selection').toJSON();
                                    onSelectImages(selection);
                                })
                                .open();
                        }}
                    >{__('Add Images', 'folioblocks')}
                    </ToolbarButton>
                </ToolbarGroup>
            </BlockControls>
            <InspectorControls>
                <PanelBody title={__('Masonry Gallery Settings', 'folioblocks')} initialOpen={true}>
                    <SelectControl
                        label={__('Resolution', 'folioblocks')}
                        value={attributes.resolution || 'large'}
                        options={[
                            { label: __('Thumbnail', 'folioblocks'), value: 'thumbnail' },
                            { label: __('Medium', 'folioblocks'), value: 'medium' },
                            { label: __('Large', 'folioblocks'), value: 'large' },
                            { label: __('Full', 'folioblocks'), value: 'full' }
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
                        label={__('Columns', 'folioblocks')}
                        columns={columns}
                        tabletColumns={tabletColumns}
                        mobileColumns={mobileColumns}
                        onChange={(newValues) => setAttributes(newValues)}
                    />
                    <ToggleControl
                        label={__('Remove Image Gap', 'folioblocks')}
                        checked={attributes.noGap || false}
                        onChange={(noGap) => setAttributes({ noGap })}
                        help={__('Remove gap between images.')}
                        __nextHasNoMarginBottom
                    />
                    {applyFilters(
                        'folioBlocks.masonryGallery.randomizeToggle',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Randomize Image Order', 'folioblocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'folioblocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'folioblocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                </PanelBody>
                <PanelBody title={__('Lightbox & Hover Settings', 'folioblocks')} initialOpen={true}>
                    {applyFilters(
                        'folioBlocks.masonryGallery.lightboxControls',
                        (
                            <>
                                <ToggleControl
                                    label={__('Enable Lightbox', 'folioblocks')}
                                    checked={!!lightbox}
                                    onChange={(newLightbox) => setAttributes({ lightbox: newLightbox })}
                                    __nextHasNoMarginBottom
                                    help={__('Open images in a lightbox when clicked.', 'folioblocks')}
                                />
                            </>
                        ),
                        { attributes, setAttributes }
                    )}
                    {applyFilters(
                        'folioBlocks.masonryGallery.onHoverTitleToggle',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Show Image Title on Hover', 'folioblocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'folioblocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'folioblocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                </PanelBody>
                <PanelBody title={__('Gallery Filtering Settings', 'folioblocks')} initialOpen={true}>
                    {applyFilters(
                        'folioBlocks.masonryGallery.enableFilterToggle',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Image Filtering', 'folioblocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'folioblocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'folioblocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                </PanelBody>
                <PanelBody title={__('E-Commerce Settings', 'folioblocks')} initialOpen={true}>
                    {applyFilters(
                        'folioBlocks.masonryGallery.downloadControls',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Image Downloads', 'folioblocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'folioblocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'folioblocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes, hasWooCommerce, effectiveEnableWoo }
                    )}
                    {window.folioBlocksData?.hasWooCommerce && applyFilters(
                        'folioBlocks.masonryGallery.wooCommerceControls',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Woo Commerce', 'folioblocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'folioblocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'folioblocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes, hasWooCommerce, effectiveEnableWoo }
                    )}
                </PanelBody>
            </InspectorControls >
            <InspectorControls group="advanced">
                {applyFilters(
                    'folioBlocks.masonryGallery.disableRightClickToggle',
                    (
                        <div style={{ marginBottom: '8px' }}>
                            <Notice status="info" isDismissible={false}>
                                <strong>{__('Disable Right-Click', 'folioblocks')}</strong><br />
                                {__('This is a premium feature. Unlock all features: ', 'folioblocks')}
                                <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                    {__('Upgrade to Pro', 'folioblocks')}
                                </a>
                            </Notice>
                        </div>
                    ),
                    { attributes, setAttributes }
                )}
                {applyFilters(
                    'folioBlocks.masonryGallery.lazyLoadToggle',
                    (
                        <div style={{ marginBottom: '8px' }}>
                            <Notice status="info" isDismissible={false}>
                                <strong>{__('Enable Lazy Load of Images', 'folioblocks')}</strong><br />
                                {__('This is a premium feature. Unlock all features: ', 'folioblocks')}
                                <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                    {__('Upgrade to Pro', 'folioblocks')}
                                </a>
                            </Notice>
                        </div>
                    ),
                    { attributes, setAttributes }
                )}
            </InspectorControls>
            <InspectorControls group="styles">
                <PanelBody title={__('Gallery Image Styles', 'folioblocks')} initialOpen={true}>
                    {applyFilters(
                        'folioBlocks.masonryGallery.borderColorControl',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Image Border Color', 'folioblocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'folioblocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'folioblocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                    {applyFilters(
                        'folioBlocks.masonryGallery.borderWidthControl',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Image Border Width', 'folioblocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'folioblocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'folioblocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                    {applyFilters(
                        'folioBlocks.masonryGallery.borderRadiusControl',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Image Border Radius', 'folioblocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'folioblocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'folioblocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                    {applyFilters(
                        'folioBlocks.masonryGallery.dropShadowToggle',
                        (
                            <div style={{ marginBottom: '8px' }}>
                                <Notice status="info" isDismissible={false}>
                                    <strong>{__('Enable Image Drop Shadow', 'folioblocks')}</strong><br />
                                    {__('This is a premium feature. Unlock all features: ', 'folioblocks')}
                                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                        {__('Upgrade to Pro', 'folioblocks')}
                                    </a>
                                </Notice>
                            </div>
                        ),
                        { attributes, setAttributes }
                    )}
                </PanelBody>
                {applyFilters(
                    'folioBlocks.masonryGallery.filterStyleSettings',
                    (
                        <div style={{ marginBottom: '8px' }}>
                            <Notice status="info" isDismissible={false}>
                                <strong>{__('Filter Bar Styles', 'folioblocks')}</strong><br />
                                {__('This is a premium feature. Unlock all features: ', 'folioblocks')}
                                <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                                    {__('Upgrade to Pro', 'folioblocks')}
                                </a>
                            </Notice>
                        </div>
                    ),
                    { attributes, setAttributes }
                )}
            </InspectorControls>

            <div {...blockProps} className={`${blockProps.className} ${attributes.dropShadow ? 'drop-shadow' : ''}`}>
                {isLoading && (
                    <div className="pb-spinner-wrapper">
                        <IconPBSpinner />
                    </div>
                )}
                {!isLoading && innerBlocks.length === 0 ? (
                    <MediaPlaceholder
                        icon={<IconMasonryGallery />}
                        labels={{
                            title: __('Masonry Gallery', 'folioblocks'),
                            instructions: __('Upload or select images to create a Masonry Gallery.', 'folioblocks'),
                        }}
                        onSelect={onSelectImages}
                        allowedTypes={['image']}
                        multiple
                    />
                ) : (
                    <>
                        {applyFilters(
                            'folioBlocks.masonryGallery.renderFilterBar',
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