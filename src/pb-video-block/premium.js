/**
 * PB Video Block
 * Premium JS
 **/
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import { wooCartIcon } from '../pb-helpers/wooCartIcon.js';
import ProductSearchControl from '../pb-helpers/ProductSearchControl.js';

addFilter(
	'folioBlocks.pbVideoBlock.inspectorControls',
	'folioblocks/pb-video-filter-category',
	(output, { attributes, setAttributes, context }) => {
		const filterCategories = context?.['folioBlocks/filterCategories'] || [];

		if (filterCategories.length === 0) {
			return output;
		}

		return (
			<>
				{output}
				<SelectControl
					label={__('Filter Category', 'folioblocks')}
					value={attributes.filterCategory}
					onChange={(val) => setAttributes({ filterCategory: val })}
					options={[
						{ label: __('None', 'folioblocks'), value: '' },
						...filterCategories.map((cat) => ({
							label: cat,
							value: cat,
						})),
					]}
					help={__('Set video filter category.', 'folioblocks')}
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				/>
			</>
		);
	}
);
addFilter(
	'folioBlocks.pbVideoBlock.inspectorControls',
	'folioblocks/pb-video-woo-product-search',
	(output, { attributes, setAttributes, hasWooCommerce, enableWooCommerce }) => {
		if (!hasWooCommerce || !enableWooCommerce) {
			return output;
		}

		return (
			<>
				{output}
				<hr style={{ border: '0.5px solid #e0e0e0', margin: '12px 0' }} />
				<ProductSearchControl
					value={
						attributes.wooProductId
							? {
									id: attributes.wooProductId,
									name: attributes.wooProductName,
									price_html: attributes.wooProductPrice,
									permalink: attributes.wooProductURL,
									image:
										attributes.wooProductImage || '',
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
							wooProductDescription: product.description || '',
						});
					}}
				/>
			</>
		);
	}
);
addFilter(
	'folioBlocks.pbVideoBlock.renderAddToCart',
	'folioblocks/pb-video-add-to-cart',
	(_, { attributes, context, isInVideoGallery }) => {
		const hasWooCommerce = window.folioBlocksData?.hasWooCommerce || false;
		const enableWooCommerce = context?.['folioBlocks/enableWooCommerce'] || false;
		const wooCartIconDisplay = context?.['folioBlocks/wooCartIconDisplay'] || 'hover';

		// Only render for premium users with WooCommerce active
		if (
			!hasWooCommerce ||
			!enableWooCommerce ||
			!attributes.wooProductId
		) {
			return null;
		}

		const borderWidth = isInVideoGallery
			? context?.['folioBlocks/borderWidth'] || 0
			: attributes.borderWidth || 0;
		const borderRadius = isInVideoGallery
			? context?.['folioBlocks/borderRadius'] || 0
			: attributes.borderRadius || 0;

		const top = 10 + Math.max(borderWidth, borderRadius * 0.1);
		const right = 10 + Math.max(borderWidth, borderRadius * 0.3);

		return (
			<a
				href={`?add-to-cart=${attributes.wooProductId}`}
				className={`pb-video-add-to-cart ${wooCartIconDisplay === 'hover' ? 'hover-only' : 'always'}`}
				data-product_id={attributes.wooProductId}
				style={{
					top: `${top}px`,
					right: `${right}px`,
				}}
			>
				{wooCartIcon}
			</a>
		);
	}
);
addFilter(
	'folioBlocks.pbVideoBlock.renderLightbox',
	'folioblocks/pb-video-lightbox-product',
	(
		originalContent,
		{
			attributes,
			videoUrl,
			isInVideoGallery,
			lightboxLayout,
			enableWooCommerce,
			getVideoEmbedMarkup,
			title,
			description,
			__,
		}
	) => {
		// Only apply if WooCommerce layout is selected and Woo is enabled
		if (lightboxLayout !== 'video-product' || !enableWooCommerce) {
			return originalContent;
		}

		// Product data
		const {
			wooProductId,
			wooProductName,
			wooProductPrice,
			wooProductDescription,
			wooProductURL,
		} = attributes;

		// If a product is linked
		if (wooProductId > 0) {
			return (
				<>
					<div className="pb-video-lightbox-video" style={{ flex: '0 0 70%' }}>
						{getVideoEmbedMarkup(videoUrl, isInVideoGallery ? { controls: false } : undefined)}
					</div>
					<div className="pb-video-lightbox-info" style={{ flex: '0 0 30%' }}>
						{wooProductName && (
							<h2 className="pb-video-lightbox-product-title">{wooProductName}</h2>
						)}
						{wooProductPrice && (
							<div
								className="pb-video-lightbox-product-price"
								dangerouslySetInnerHTML={{ __html: wooProductPrice }}
							/>
						)}
						{wooProductDescription && (
							<div
								className="pb-video-lightbox-product-description"
								dangerouslySetInnerHTML={{ __html: wooProductDescription }}
							/>
						)}
						{wooProductURL && (
							<a
								href={wooProductURL}
								className="pb-view-product-button"
								target="_blank"
								rel="noopener noreferrer"
							>
								{__('View Product', 'folioblocks')}
							</a>
						)}
					</div>
				</>
			);
		}

		// Fallback: split layout if no product linked
		return (
			<>
				<div className="pb-video-lightbox-video" style={{ flex: '0 0 70%' }}>
					{getVideoEmbedMarkup(videoUrl, isInVideoGallery ? { controls: false } : undefined)}
				</div>
				<div className="pb-video-lightbox-info" style={{ flex: '0 0 30%' }}>
					{title && <h2 className="lightbox-title">{title}</h2>}
					{description && <p className="lightbox-description">{description}</p>}
				</div>
			</>
		);
	}
);