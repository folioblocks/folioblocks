/**
 * PB Image Block
 * Premium JS
 **/
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { SelectControl, PanelBody, BaseControl, RangeControl, ColorPalette, ToggleControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import ProductSearchControl from '../pb-helpers/ProductSearchControl.js';
import { download } from '@wordpress/icons';
import { wooCartIcon } from '../pb-helpers/wooCartIcon.js';



// Premium: Standalone PB Image Block Download Controls
addFilter(
  'folioBlocks.imageBlock.downloadControls',
  'folioblocks/pb-image-block-premium-downloads',
  (defaultContent, props) => {
    const { attributes, setAttributes, effectiveEnableWoo } = props;

    // If Woo overlays are enabled, force-disable image download to avoid conflicts
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
          help={__('Enable visitors to download this image.', 'folioblocks')}
          disabled={effectiveEnableWoo}
        />

        {enableDownload && (
          <SelectControl
            label={__('Display Image Download Icon', 'folioblocks')}
            value={downloadOnHover ? 'hover' : 'always'}
            options={[
              { label: __('Always', 'folioblocks'), value: 'always' },
              { label: __('On Hover', 'folioblocks'), value: 'hover' },
            ]}
            onChange={(value) => setAttributes({ downloadOnHover: value === 'hover' })}
            __nextHasNoMarginBottom
            __next40pxDefaultSize
            help={__('Set display preference for the download icon.', 'folioblocks')}
          />
        )}
      </>
    );
  }
);

// New premium filter: Lightbox controls for standalone Image Block
addFilter(
  'folioBlocks.imageBlock.lightboxControls',
  'folioblocks/pb-image-block-premium-lightbox',
  (defaultContent, props) => {
    const { attributes, setAttributes } = props;
    const { lightbox, lightboxCaption, enableWooCommerce, wooLightboxInfoType } = attributes;

    return (
      <>
        <ToggleControl
          label={__('Enable Lightbox', 'folioblocks')}
          checked={!!lightbox}
          onChange={(newLightbox) => setAttributes({ lightbox: newLightbox, enableLightbox: newLightbox })}
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
              onChange={(newLightboxCaption) => setAttributes({ lightboxCaption: newLightboxCaption, showCaptionInLightbox: newLightboxCaption })}
              __nextHasNoMarginBottom
            />

            {enableWooCommerce && lightboxCaption && (
              <SelectControl
                label={__('Lightbox Info', 'folioblocks')}
                value={wooLightboxInfoType || 'caption'}
                options={[
                  { label: __('Show Image Caption', 'folioblocks'), value: 'caption' },
                  { label: __('Show Product Description', 'folioblocks'), value: 'product' },
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

// New premium filter: toggle for Show Title on Hover (standalone)
addFilter(
  'folioBlocks.imageBlock.onHoverTitleToggle',
  'folioblocks/image-block-premium-title-toggle',
  (defaultContent, props) => {
    const { attributes, setAttributes } = props;
    const { onHoverTitle, enableWooCommerce, wooProductPriceOnHover } = attributes;
    const showHoverTitle = !!(attributes.onHoverTitle ?? attributes.showTitleOnHover ?? attributes.hoverTitle);

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
          checked={!!(attributes.onHoverTitle ?? attributes.showTitleOnHover ?? attributes.hoverTitle)}
          onChange={(value) => setAttributes({
            onHoverTitle: value,
            showTitleOnHover: value,
            hoverTitle: value,
          })}
        />

        {enableWooCommerce && (attributes.onHoverTitle ?? attributes.showTitleOnHover ?? attributes.hoverTitle) && (
          <SelectControl
            label={__('Overlay Content', 'folioblocks')}
            value={wooProductPriceOnHover ? 'product' : 'title'}
            options={[
              { label: __('Show Image Title', 'folioblocks'), value: 'title' },
              { label: __('Show Product Name & Price', 'folioblocks'), value: 'product' }
            ]}
            onChange={(val) => {
              setAttributes({
                onHoverTitle: true,
                showTitleOnHover: true,
                hoverTitle: true,
                wooProductPriceOnHover: val === 'product',
              });
            }}
            __nextHasNoMarginBottom
            __next40pxDefaultSize
            help={__('Choose what appears when hovering over images.', 'folioblocks')}
          />
        )}
        {showHoverTitle && (
          <SelectControl
            label={__('Hover Style', 'folioblocks')}
            value={attributes.onHoverStyle || 'blur-overlay'}
            options={[
              { label: __('Blur Overlay - Centered', 'folioblocks'), value: 'blur-overlay' },
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
  'folioBlocks.imageBlock.wooCommerceControls',
  'folioblocks/pb-image-block-premium-woocommerce',
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
              // Reset Woo-dependent UI when turning Woo off
              setAttributes({
                wooLightboxInfoType: 'caption',
                wooProductPriceOnHover: false,
                wooCartIconDisplay: 'hover',
              });
            }
          }}
          __nextHasNoMarginBottom
          help={__('Link this image to WooCommerce products.', 'folioblocks')}
          disabled={enableDownload}
        />

        {enableWooCommerce && (
          <SelectControl
            label={__('Display Add to Cart Icon', 'folioblocks')}
            value={wooCartIconDisplay || 'hover'}
            options={[
              { label: __('On Hover', 'folioblocks'), value: 'hover' },
              { label: __('Always', 'folioblocks'), value: 'always' },
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

addFilter(
  'folioBlocks.imageBlock.wooProductLinkControl',
  'folioblocks/pb-image-block-woo',
  (Original, { attributes, setAttributes, effectiveWooActive, isInsideGallery }) => {
    if (!effectiveWooActive) return null;

    return (
      <>
        {isInsideGallery && (
          <hr style={{ border: '0.5px solid #e0e0e0', margin: '12px 0' }} />
        )}
        <ProductSearchControl
          value={
            attributes.wooProductId
              ? {
                id: attributes.wooProductId,
                name: attributes.wooProductName,
                price_html: attributes.wooProductPrice,
                permalink: attributes.wooProductURL,
                image: attributes.wooProductImage || '',
              }
              : null
          }
          onSelect={(product) => {
            if (!product || !product.id) {
              setAttributes({
                wooProductId: 0,
                wooProductName: '',
                wooProductPrice: '',
                wooProductURL: '',
                wooProductDescription: '',
                wooProductImage: '',
              });
              return;
            }
            setAttributes({
              wooProductId: product.id,
              wooProductName: product.name,
              wooProductPrice: product.price_html || product.price || '',
              wooProductURL: product.permalink || '',
              wooProductImage: product.image || product.images?.[0]?.src || '',
            });
          }}
        />
      </>
    );
  }
);

addFilter(
  'folioBlocks.imageBlock.filterCategoryControl',
  'folioblocks/pb-image-block-filter-category',
  (Original, { attributes, setAttributes, filterCategories, context, isInsideGallery }) => {
    const galleryFilterEnabled = !!(context?.['folioBlocks/enableFilter']);
    if (!isInsideGallery || !galleryFilterEnabled || !filterCategories?.length) return null;

    return (
      <>
        <PanelBody title={__('Gallery Filtering Settings', 'folioblocks')} initialOpen={true}>
          <SelectControl
            label={__('Filter Category', 'folioblocks')}
            value={attributes.filterCategory}
            onChange={(val) => setAttributes({ filterCategory: val })}
            options={[
              { label: __('None', 'folioblocks'), value: '' },
              ...filterCategories.map((cat) => ({ label: cat, value: cat })),
            ]}
            help={__('Set image filter category.', 'folioblocks')}
            __nextHasNoMarginBottom
            __next40pxDefaultSize
          />
        </PanelBody>
      </>
    );
  }
);

addFilter(
  'folioBlocks.imageBlock.disableRightClickToggle',
  'folioblocks/pb-image-block-disable-rc',
  (Original, { attributes, setAttributes, isInsideGallery }) => {
    if (isInsideGallery) return null;
    const value = attributes.disableRightClick ?? false;
    return (
      <ToggleControl
        label={__('Disable Right-Click', 'folioblocks')}
        checked={!!value}
        onChange={(v) => setAttributes({ disableRightClick: !!v })}
        __nextHasNoMarginBottom
        help={__('Prevents visitors from right-clicking.', 'folioblocks')}
      />
    );
  }
);

addFilter(
  'folioBlocks.imageBlock.lazyLoadToggle',
  'folioblocks/pb-image-block-lazyload',
  (Original, { attributes, setAttributes, context, isInsideGallery }) => {
    // Parent galleries provide one of these keys; prefer explicit lazyLoad if present
    const parentLazy =
      context?.['folioBlocks/lazyLoad'] ??
      context?.['folioBlocks/enableLazyLoad'] ??
      null;

    // Inside a gallery → no UI; the parent controls it
    if (isInsideGallery) return null;

    // Standalone → show a toggle that writes the block's own attribute
    const value = attributes.lazyLoad ?? true;

    return (
      <ToggleControl
        label={__('Enable Lazy Load of Images', 'folioblocks')}
        checked={!!value}
        onChange={(val) => setAttributes({ lazyLoad: !!val })}
        __nextHasNoMarginBottom
        help={__('Enables lazy loading of image.', 'folioblocks')}
      />
    );
  }
);

addFilter(
  'folioBlocks.imageBlock.styleControls',
  'folioblocks/pb-image-block-style-controls',
  (Original, { attributes, setAttributes, isInsideGallery }) => {
    if (isInsideGallery) return null;

    return (
      <InspectorControls group="styles">
        <PanelBody title={__('Image Styles', 'pb-image-block')} initialOpen={true}>
          <BaseControl label={__('Border Color', 'folioblocks')} __nextHasNoMarginBottom>
            <ColorPalette
              value={attributes.borderColor}
              onChange={(value) => setAttributes({ borderColor: value })}
              help={__('Set border color.')}
            />
          </BaseControl>
          <RangeControl
            label={__('Border Width', 'folioblocks')}
            value={attributes.borderWidth}
            onChange={(value) => setAttributes({ borderWidth: value })}
            min={0}
            max={20}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            help={__('Set border width in pixels.')}
          />
          <RangeControl
            label={__('Border Radius', 'folioblocks')}
            value={attributes.borderRadius}
            onChange={(value) => setAttributes({ borderRadius: value })}
            min={0}
            max={100}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            help={__('Set border radius in pixels.')}
          />
        </PanelBody>
      </InspectorControls>
    );
  }
);
addFilter(
  'folioBlocks.imageBlock.downloadButton',
  'folioblocks/pb-image-block-download-button',
  (
    Original,
    {
      attributes,
      setAttributes,
      effectiveDownloadEnabled,
      effectiveDownloadOnHover,
      sizes,
      src,
      context,
      isInsideGallery,
    }
  ) => {
    if (!effectiveDownloadEnabled || !src) return null;

    const handleDownload = (e) => {
      e.stopPropagation();

      // Prevent actual download inside the block editor
      if (wp?.data?.select('core/editor')?.getCurrentPostId()) {
        return;
      }

      const fileUrl = sizes?.full?.url || src;
      const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'download';
      link.click();
    };

    return (
      <button
        className={`pb-image-block-download ${effectiveDownloadOnHover ? 'hover-only' : ''
          }`}
        onClick={handleDownload}
        aria-label={__('Download Image', 'folioblocks')}
      >
        {download}
      </button>
    );
  }
);
addFilter(
  'folioBlocks.imageBlock.hoverOverlayContent',
  'folioblocks/pb-image-block-hover-overlay-content',
  (Original, { attributes, setAttributes, effectiveWooActive, context, title }) => {
    const showTitle = (attributes.hoverTitle ?? attributes.showTitleOnHover ?? attributes.onHoverTitle ?? false);

    // When Woo overlays are not active, show title only if the toggle is enabled
    if (!effectiveWooActive) {
      return showTitle && title ? <>{title}</> : null;
    }

    // Woo active: use context first, then attribute when used standalone
    const priceOnHover = (context?.['folioBlocks/wooProductPriceOnHover'] ?? attributes.wooProductPriceOnHover ?? false);
    if (!priceOnHover) {
      return showTitle && title ? <>{title}</> : null;
    }

    if (Number(attributes.wooProductId) > 0) {
      return (
        <>
          {attributes.wooProductName && (
            <div className="pb-product-name">{attributes.wooProductName}</div>
          )}
          {attributes.wooProductPrice && (
            <div
              className="pb-product-price"
              dangerouslySetInnerHTML={{ __html: attributes.wooProductPrice }}
            />
          )}
        </>
      );
    }

    return showTitle && title ? <>{title}</> : null;
  }
);
addFilter(
  'folioBlocks.imageBlock.addToCartButton',
  'folioblocks/pb-image-block-add-to-cart-button',
  (
    Original,
    { attributes, setAttributes, effectiveWooActive, context, isInsideGallery }
  ) => {
    if (!effectiveWooActive || Number(attributes.wooProductId) <= 0) return null;
    const cartDisplay = (context?.['folioBlocks/wooCartIconDisplay'] ?? attributes.wooCartIconDisplay ?? 'hover');

    return (
      <button
        className={`pb-add-to-cart-icon ${cartDisplay === 'hover' ? 'hover-only' : ''}`}
        aria-label={__('Add to Cart', 'folioblocks')}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {wooCartIcon}
      </button>
    );
  }
);