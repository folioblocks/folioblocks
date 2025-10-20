import { __ } from '@wordpress/i18n';
import { ToggleControl, SelectControl, BaseControl, ColorPalette, RangeControl } from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';

addFilter(
    'portfolioBlocks.masonryGallery.randomizeToggle',
    'portfolio-blocks/masonry-gallery-premium-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        return (
            <ToggleControl
                label={__('Randomize Image Order', 'portfolio-blocks')}
                checked={!!attributes.randomizeOrder}
                onChange={(value) => setAttributes({ randomizeOrder: value })}
                __nextHasNoMarginBottom={true}
                help={__('Randomize order of images.', 'portfolio-blocks')}
            />
        );
    }
);

addFilter(
    'portfolioBlocks.masonryGallery.downloadControls',
    'portfolio-blocks/masonry-gallery-premium-downloads',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        const { enableDownload, downloadOnHover, enableWooCommerce } = attributes;

        return (
            <>
                <ToggleControl
                    label={__('Enable Image Downloads', 'portfolio-blocks')}
                    checked={!!enableDownload}
                    onChange={(value) => setAttributes({ enableDownload: value })}
                    __nextHasNoMarginBottom
                    help={__('Enable visitors to download images from the gallery.', 'portfolio-blocks')}
                    disabled={enableWooCommerce}
                />

                {enableDownload && (
                    <SelectControl
                        label={__('Display Image Download Icon', 'portfolio-blocks')}
                        value={downloadOnHover ? 'hover' : 'always'}
                        options={[
                            { label: __('Always', 'portfolio-blocks'), value: 'always' },
                            { label: __('On Hover', 'portfolio-blocks'), value: 'hover' }
                        ]}
                        onChange={(value) => setAttributes({ downloadOnHover: value === 'hover' })}
                        __nextHasNoMarginBottom
                        help={__('Set display preference for Image Download icon.', 'portfolio-blocks')}
                    />
                )}
            </>
        );
    }
);

addFilter(
	'portfolioBlocks.masonryGallery.wooCommerceControls',
	'portfolio-blocks/masonry-gallery-premium-woocommerce',
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;
		const { enableWooCommerce, wooCartIconDisplay, enableDownload } = attributes;

		return (
			<>
				<ToggleControl
					label={__('Enable WooCommerce Integration', 'portfolio-blocks')}
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
					help={__('Link gallery images to WooCommerce products.', 'portfolio-blocks')}
					disabled={enableDownload}
				/>

				{enableWooCommerce && (
					<SelectControl
						label={__('Display Add to Cart Icon', 'portfolio-blocks')}
						value={wooCartIconDisplay}
						options={[
							{ label: __('On Hover', 'portfolio-blocks'), value: 'hover' },
							{ label: __('Always', 'portfolio-blocks'), value: 'always' }
						]}
						onChange={(value) => setAttributes({ wooCartIconDisplay: value })}
						__nextHasNoMarginBottom
						help={__('Choose when to display the Add to Cart icon.', 'portfolio-blocks')}
					/>
				)}
			</>
		);
	}
);

addFilter(
    'portfolioBlocks.masonryGallery.disableRightClickToggle',
    'portfolio-blocks/masonry-gallery-premium-disable-right-click',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Disable Right-Click on Page', 'portfolio-blocks')}
                help={__('Prevents visitors from right-clicking.', 'portfolio-blocks')}
                __nextHasNoMarginBottom={true}
                checked={!!attributes.disableRightClick}
                onChange={(value) => setAttributes({ disableRightClick: value })}
            />
        );
    }
);
addFilter(
    'portfolioBlocks.masonryGallery.lazyLoadToggle',
    'portfolio-blocks/masonry-gallery-premium-lazy-load',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Enable Lazy Load of Images', 'portfolio-blocks')}
                help={__('Enables lazy loading of gallery images.', 'portfolio-blocks')}
                __nextHasNoMarginBottom={true}
                checked={!!attributes.lazyLoad}
                onChange={(value) => setAttributes({ lazyLoad: value })}
            />
        );
    }
);

addFilter(
    'portfolioBlocks.masonryGallery.lightboxControls',
    'portfolio-blocks/masonry-gallery-premium-lightbox',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        const { lightbox, lightboxCaption, enableWooCommerce, wooLightboxInfoType } = attributes;

        return (
            <>
                <ToggleControl
                    label={__('Enable Lightbox', 'portfolio-blocks')}
                    checked={!!lightbox}
                    onChange={(newLightbox) => setAttributes({ lightbox: newLightbox })}
                    __nextHasNoMarginBottom
                    help={__('Enable image Lightbox on click.', 'portfolio-blocks')}
                />

                {lightbox && (
                    <>
                        <ToggleControl
                            label={
                                enableWooCommerce
                                    ? __('Show Image Caption or Product Info in Lightbox', 'portfolio-blocks')
                                    : __('Show Image Caption in Lightbox', 'portfolio-blocks')
                            }
                            help={
                                enableWooCommerce
                                    ? __('Display image caption or product info inside the Lightbox.', 'portfolio-blocks')
                                    : __('Display Image Caption inside the lightbox.', 'portfolio-blocks')
                            }
                            checked={!!lightboxCaption}
                            onChange={(newLightboxCaption) =>
                                setAttributes({ lightboxCaption: newLightboxCaption })
                            }
                            __nextHasNoMarginBottom
                        />

                        {enableWooCommerce && lightboxCaption && (
                            <SelectControl
                                label={__('Lightbox Info', 'portfolio-blocks')}
                                value={wooLightboxInfoType}
                                options={[
                                    { label: __('Show Image Caption', 'portfolio-blocks'), value: 'caption' },
                                    { label: __('Show Product Description', 'portfolio-blocks'), value: 'product' }
                                ]}
                                onChange={(value) => setAttributes({ wooLightboxInfoType: value })}
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                help={__('Choose what appears below images in the lightbox.', 'portfolio-blocks')}
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
    'portfolio-blocks/masonry-gallery-premium-title-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        const { onHoverTitle, enableWooCommerce, wooProductPriceOnHover } = attributes;

        return (
            <>
                <ToggleControl
                    label={
                        enableWooCommerce
                            ? __('Show Overlay on Hover', 'portfolio-blocks')
                            : __('Show Image Title in Hover Overlay', 'portfolio-blocks')
                    }
                    help={
                        enableWooCommerce
                            ? __('Display image title or product info when hovering over images.', 'portfolio-blocks')
                            : __('Display image title when hovering over image.', 'portfolio-blocks')
                    }
                    __nextHasNoMarginBottom
                    checked={!!attributes.onHoverTitle}
                    onChange={(value) => setAttributes({ onHoverTitle: value })}
                />

                {enableWooCommerce && onHoverTitle && (
                    <SelectControl
                        label={__('Overlay Content', 'portfolio-blocks')}
                        value={wooProductPriceOnHover ? 'product' : 'title'}
                        options={[
                            { label: __('Show Image Title', 'portfolio-blocks'), value: 'title' },
                            { label: __('Show Product Name & Price', 'portfolio-blocks'), value: 'product' }
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
                        help={__('Choose what appears when hovering over images.', 'portfolio-blocks')}
                    />
                )}
            </>
        );
    }
);

addFilter(
    'portfolioBlocks.masonryGallery.enableFilterToggle',
    'portfolio-blocks/masonry-gallery-premium-filter-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Enable Image Filtering', 'portfolio-blocks')}
                checked={!!attributes.enableFilter}
                onChange={(val) => setAttributes({ enableFilter: val })}
                __nextHasNoMarginBottom={true}
                help={__('Enable image filtering with categories.', 'portfolio-blocks')}
            />
        );
    }
);

addFilter(
    'portfolioBlocks.masonryGallery.borderColorControl',
    'portfolio-blocks/masonry-gallery-premium-border-color',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        return (
            <BaseControl label={__('Border Color', 'portfolio-blocks')} __nextHasNoMarginBottom={true}>
                <ColorPalette
                    value={attributes.borderColor}
                    onChange={(value) => setAttributes({ borderColor: value })}
                    clearable={false}
                    help={__('Set border color.', 'portfolio-blocks')}
                />
            </BaseControl>
        );
    }
);

addFilter(
    'portfolioBlocks.masonryGallery.borderWidthControl',
    'portfolio-blocks/masonry-gallery-premium-border-width',
    (defaultContent, props) => {
        const { attributes, setAttributes, clientId, updateBlockAttributes } = props;

        return (
            <RangeControl
                label={__('Border Width', 'portfolio-blocks')}
                value={attributes.borderWidth}
                onChange={(value) => {
                    setAttributes({ borderWidth: value });
                    setTimeout(() => {
                        updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
                    }, 50);
                }}
                min={0}
                max={20}
                __next40pxDefaultSize={true}
                __nextHasNoMarginBottom={true}
                help={__('Set border width in pixels.', 'portfolio-blocks')}
            />
        );
    }
);

addFilter(
    'portfolioBlocks.masonryGallery.borderRadiusControl',
    'portfolio-blocks/masonry-gallery-premium-border-radius',
    (defaultContent, props) => {
        const { attributes, setAttributes, clientId, updateBlockAttributes } = props;

        return (
            <RangeControl
                label={__('Border Radius', 'portfolio-blocks')}
                value={attributes.borderRadius}
                onChange={(value) => {
                    setAttributes({ borderRadius: value });
                    setTimeout(() => {
                        updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
                    }, 50);
                }}
                min={0}
                max={100}
                __next40pxDefaultSize={true}
                __nextHasNoMarginBottom={true}
                help={__('Set border radius in pixels.', 'portfolio-blocks')}
            />
        );
    }
);

addFilter(
    'portfolioBlocks.masonryGallery.dropShadowToggle',
    'portfolio-blocks/masonry-gallery-premium-drop-shadow',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Enable Drop Shadow', 'portfolio-blocks')}
                checked={!!attributes.dropShadow}
                onChange={(newDropShadow) => setAttributes({ dropShadow: newDropShadow })}
                __nextHasNoMarginBottom={true}
                help={__('Applies a subtle drop shadow to images.', 'portfolio-blocks')}
            />
        );
    }
);