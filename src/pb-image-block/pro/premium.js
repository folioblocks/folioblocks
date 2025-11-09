/**
 * PB Image Block
 * Premium JS
 **/
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { SelectControl, PanelBody, BaseControl, RangeControl, ColorPalette } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import ProductSearchControl from '../../pb-helpers/ProductSearchControl';
import { download } from '@wordpress/icons';
import { wooCartIcon } from '../../pb-helpers/wooCartIcon.js';

addFilter(
  'portfolioBlocks.imageBlock.wooProductLinkControl',
  'pb-gallery/pb-image-block-woo',
  (Original, { attributes, setAttributes, effectiveWooActive }) => {
    if (!effectiveWooActive) return null;

    return (
      <>
        <hr style={{ border: '0.5px solid #e0e0e0', margin: '12px 0' }} />
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
  'portfolioBlocks.imageBlock.filterCategoryControl',
  'pb-gallery/pb-image-block-filter-category',
  (Original, { attributes, setAttributes, filterCategories }) => {
    if (!filterCategories?.length) return null;

    return (
      <>
        <hr style={{ border: '0.5px solid #e0e0e0', margin: '12px 0' }} />
        <SelectControl
          label={__('Filter Category', 'pb-gallery')}
          value={attributes.filterCategory}
          onChange={(val) => setAttributes({ filterCategory: val })}
          options={[
            { label: __('None', 'pb-gallery'), value: '' },
            ...filterCategories.map((cat) => ({ label: cat, value: cat })),
          ]}
          help={__('Set image filter category.', 'pb-gallery')}
          __nextHasNoMarginBottom
          __next40pxDefaultSize
        />
      </>
    );
  }
);
addFilter(
  'portfolioBlocks.imageBlock.styleControls',
  'pb-gallery/pb-image-block-style-controls',
  (Original, { attributes, setAttributes, isInsideGallery }) => {
    if (isInsideGallery) return null;

    return (
      <InspectorControls group="styles">
        <PanelBody title={__('Image Styles', 'pb-image-block')} initialOpen={true}>
          <BaseControl label={__('Border Color', 'pb-gallery')} __nextHasNoMarginBottom>
            <ColorPalette
              value={attributes.borderColor}
              onChange={(value) => setAttributes({ borderColor: value })}
              help={__('Set border color.')}
            />
          </BaseControl>
          <RangeControl
            label={__('Border Width', 'pb-gallery')}
            value={attributes.borderWidth}
            onChange={(value) => setAttributes({ borderWidth: value })}
            min={0}
            max={20}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            help={__('Set border width in pixels.')}
          />
          <RangeControl
            label={__('Border Radius', 'pb-gallery')}
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
  'portfolioBlocks.imageBlock.downloadButton',
  'pb-gallery/pb-image-block-download-button',
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

    const topOffset =
      10 +
      Math.max(
        isInsideGallery
          ? context['portfolioBlocks/borderWidth'] || 0
          : attributes.borderWidth || 0,
        (isInsideGallery
          ? context['portfolioBlocks/borderRadius'] || 0
          : attributes.borderRadius || 0) * 0.15
      );

    const rightOffset =
      10 +
      Math.max(
        isInsideGallery
          ? context['portfolioBlocks/borderWidth'] || 0
          : attributes.borderWidth || 0,
        (isInsideGallery
          ? context['portfolioBlocks/borderRadius'] || 0
          : attributes.borderRadius || 0) * 0.3
      );

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
        className={`pb-image-block-download ${
          effectiveDownloadOnHover ? 'hover-only' : ''
        }`}
        style={{ top: `${topOffset}px`, right: `${rightOffset}px` }}
        onClick={handleDownload}
        aria-label={__('Download Image', 'pb-gallery')}
      >
        {download}
      </button>
    );
  }
);
addFilter(
	'portfolioBlocks.imageBlock.hoverOverlayContent',
	'pb-gallery/pb-image-block-hover-overlay-content',
	(Original, { attributes, setAttributes, effectiveWooActive, context, title }) => {
		if (!effectiveWooActive || !context['portfolioBlocks/wooProductPriceOnHover']) {
			return title && <>{title}</>;
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

		return title && <>{title}</>;
	}
);
addFilter(
  'portfolioBlocks.imageBlock.addToCartButton',
  'pb-gallery/pb-image-block-add-to-cart-button',
  (
    Original,
    { attributes, setAttributes, effectiveWooActive, context, isInsideGallery }
  ) => {
    if (!effectiveWooActive || Number(attributes.wooProductId) <= 0) return null;

    const topOffset =
      10 +
      Math.max(
        isInsideGallery
          ? context['portfolioBlocks/borderWidth'] || 0
          : attributes.borderWidth || 0,
        (isInsideGallery
          ? context['portfolioBlocks/borderRadius'] || 0
          : attributes.borderRadius || 0) * 0.3
      );

    const rightOffset =
      10 +
      Math.max(
        isInsideGallery
          ? context['portfolioBlocks/borderWidth'] || 0
          : attributes.borderWidth || 0,
        (isInsideGallery
          ? context['portfolioBlocks/borderRadius'] || 0
          : attributes.borderRadius || 0) * 0.3
      );

    return (
      <button
        className={`pb-add-to-cart-icon ${
          context['portfolioBlocks/wooCartIconDisplay'] === 'hover'
            ? 'hover-only'
            : ''
        }`}
        aria-label={__('Add to Cart', 'pb-gallery')}
        style={{ top: `${topOffset}px`, right: `${rightOffset}px` }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {wooCartIcon}
      </button>
    );
  }
);
