/**
 * PB Video Block
 * Premium JS
 */
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	CheckboxControl,
	SelectControl,
	ToggleControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { wooCartIcon } from '../pb-helpers/icons.js';
import ProductSearchControl from '../pb-helpers/ProductSearchControl.js';
import CompactColorControl, {
	CompactTwoColorControl,
} from '../pb-helpers/CompactColorControl.js';

const sanitizeExternalUrl = (url) => {
	if (typeof url !== 'string' || url.trim() === '') {
		return '';
	}
	try {
		const parsedUrl = new URL(url, window.location.origin);
		return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
			? parsedUrl.href
			: '';
	} catch {
		return '';
	}
};

const getAssignedFilterCategories = (attributes = {}) => {
	const assignedCategories = Array.isArray(attributes.filterCategories)
		? attributes.filterCategories
			.map((category) =>
				typeof category === 'string' ? category.trim() : ''
			)
			.filter(Boolean)
		: [];

	if (assignedCategories.length > 0) {
		return [...new Set(assignedCategories)];
	}

	const legacyCategory =
		typeof attributes.filterCategory === 'string'
			? attributes.filterCategory.trim()
			: '';
	return legacyCategory ? [legacyCategory] : [];
};

addFilter(
	'folioBlocks.videoBlock.lightboxLayout',
	'folioblocks/video-block-premium-lightbox-layout',
	(defaultContent, props) => {
		const { attributes, setAttributes, isInsideGallery } = props;
		const { enableWooCommerce } = attributes;

		// In galleries, the parent controls layout via context
		if (isInsideGallery) {
			return null;
		}

		const options = [
			{ label: __('Video Only', 'folioblocks'), value: 'video-only' },
			{ label: __('Video + Info', 'folioblocks'), value: 'split' },
		];

		// Only show Woo layout when Woo is installed + explicitly enabled on this block
		if (window.folioBlocksData?.hasWooCommerce && enableWooCommerce) {
			options.push({
				label: __('Video + Product Info', 'folioblocks'),
				value: 'video-product',
			});
		}

		return (
			<SelectControl
				label={__('Lightbox Layout', 'folioblocks')}
				value={attributes.lightboxLayout || 'video-only'}
				options={options}
				onChange={(value) =>
					setAttributes({ lightboxLayout: value })
				}
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			/>
		);
	}
);

addFilter(
	'folioBlocks.videoBlock.customOverlayControls',
	'folioblocks/video-block-premium-custom-overlay',
	(defaultContent, props) => {
		const { attributes, setAttributes, combinedVisibility } = props;

		if (combinedVisibility !== 'onHover') {
			return null;
		}

		return (
			<>
				<SelectControl
					label={__('Overlay Style', 'folioblocks')}
					value={attributes.overlayStyle || 'default'}
					onChange={(value) =>
						setAttributes({ overlayStyle: value })
					}
					options={[
						{
							label: __('Default Overlay', 'folioblocks'),
							value: 'default',
						},
						{
							label: __('Blur Overlay', 'folioblocks'),
							value: 'blur',
						},
						{
							label: __('Color Overlay', 'folioblocks'),
							value: 'color',
						},
					]}
					help={__(
						'Choose the hover overlay style.',
						'folioblocks'
					)}
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				/>
				{(attributes.overlayStyle || 'default') === 'color' && (
					<CompactTwoColorControl
						label={__('Overlay Colors', 'folioblocks')}
						value={{
							first: attributes.overlayBgColor,
							second: attributes.overlayTextColor,
						}}
						onChange={(next) =>
							setAttributes({
								overlayBgColor: next?.first || '',
								overlayTextColor: next?.second || '',
							})
						}
						firstLabel={__('Background', 'folioblocks')}
						secondLabel={__('Text', 'folioblocks')}
					/>
				)}
			</>
		);
	}
);

addFilter(
	'folioBlocks.pbVideoBlock.filterCategories',
	'folioblocks/pb-video-filter-category',
	(output, { attributes, setAttributes, context }) => {
		const filterCategories =
			context?.['folioBlocks/filterCategories'] || [];
		const assignedCategories = getAssignedFilterCategories(attributes);

		if (filterCategories.length === 0) {
			return output;
		}

		const availableCategories = [
			...new Set([...filterCategories, ...assignedCategories]),
		];

		const updateAssignedCategories = (nextCategories) => {
			const cleanedCategories = [
				...new Set(
					nextCategories
						.map((category) =>
							typeof category === 'string'
								? category.trim()
								: ''
						)
						.filter(Boolean)
				),
			];

			setAttributes({
				filterCategories: cleanedCategories,
				// Keep legacy attribute in sync for backward compatibility.
				filterCategory: cleanedCategories[0] || '',
			});
		};

		return (
			<>
				{output}
				<PanelBody
					title={__('Gallery Filtering Settings', 'folioblocks')}
					initialOpen={true}
				>
					<p
						style={{
							fontSize: '11px',
							fontWeight: 500,
							lineHeight: 1.4,
							textTransform: 'uppercase',
						}}
					>
						{__('Filter Categories', 'folioblocks')}
					</p>
					{availableCategories.map((category) => (
						<CheckboxControl
							key={category}
							label={category}
							checked={assignedCategories.includes(category)}
							onChange={(isChecked) => {
								const nextCategories = isChecked
									? [...assignedCategories, category]
									: assignedCategories.filter(
										(assignedCategory) =>
											assignedCategory !== category
									);
								updateAssignedCategories(nextCategories);
							}}
							__nextHasNoMarginBottom
						/>
					))}
					<p
						style={{
							fontSize: '12px',
							fontStyle: 'normal',
							color: 'rgb(117, 117, 117)',
						}}
					>
						{__(
							'Select one or more categories for this video.',
							'folioblocks'
						)}
					</p>
				</PanelBody>
			</>
		);
	}
);
addFilter(
	'folioBlocks.videoBlock.wooCommerceControls',
	'folioblocks/pb-video-block-premium-woocommerce',
	(defaultContent, props) => {
		const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
		if (!wooActive) {
			return null;
		}

		const { attributes, setAttributes, isInsideGallery } = props;
		if (isInsideGallery) {
			return null;
		} // parent galleries control Woo via context

		const { enableWooCommerce, wooCartIconDisplay, lightboxLayout } =
			attributes;

		return (
			<>
				<ToggleControl
					label={__(
						'Enable WooCommerce Integration',
						'folioblocks'
					)}
					checked={!!enableWooCommerce}
					onChange={(value) => {
						setAttributes({ enableWooCommerce: !!value });

						// When disabling Woo, revert product-specific lightbox layout + icon display
						if (!value) {
							const next = { wooCartIconDisplay: 'hover' };
							if (lightboxLayout === 'video-product') {
								next.lightboxLayout = 'split';
							}
							setAttributes(next);
						}
					}}
					__nextHasNoMarginBottom
					help={__(
						'Link this video to a WooCommerce product.',
						'folioblocks'
					)}
				/>

				{enableWooCommerce && (
					<SelectControl
						label={__(
							'Display Add to Cart Icon',
							'folioblocks'
						)}
						value={wooCartIconDisplay || 'hover'}
						options={[
							{
								label: __('On Hover', 'folioblocks'),
								value: 'hover',
							},
							{
								label: __('Always', 'folioblocks'),
								value: 'always',
							},
						]}
						onChange={(value) =>
							setAttributes({ wooCartIconDisplay: value })
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={__(
							'Choose when to display the Add to Cart icon.',
							'folioblocks'
						)}
					/>
				)}
			</>
		);
	}
);

addFilter(
	'folioBlocks.pbVideoBlock.WooProductSearch',
	'folioblocks/pb-video-woo-product-search',
	(
		output,
		{
			attributes,
			setAttributes,
			hasWooCommerce,
			enableWooCommerce,
			isInsideGallery,
			contextWooDefaultLinkAction,
		}
	) => {
		const effectiveEnable =
			typeof enableWooCommerce !== 'undefined'
				? !!enableWooCommerce
				: !!attributes.enableWooCommerce;
		if (!hasWooCommerce || !effectiveEnable) {
			return output;
		}

		const hasGalleryDefault =
			isInsideGallery &&
			typeof contextWooDefaultLinkAction === 'string' &&
			contextWooDefaultLinkAction.length > 0;
		const effectiveDefault = hasGalleryDefault
			? contextWooDefaultLinkAction
			: 'add_to_cart';
		const currentAction =
			attributes.wooLinkAction && attributes.wooLinkAction !== 'inherit'
				? attributes.wooLinkAction
				: 'inherit';
		const effectiveSelectedAction =
			currentAction === 'inherit' ? effectiveDefault : currentAction;
		const selectValue = hasGalleryDefault
			? currentAction
			: effectiveSelectedAction;

		return (
			<>
				{output}
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
							wooProductPrice:
								product.price_html || product.price || '',
							wooProductURL: product.permalink || '',
							wooProductImage:
								product.image ||
								product.images?.[0]?.src ||
								'',
							wooProductDescription: product.description || '',
						});
					}}
				/>
				{Number(attributes.wooProductId) > 0 && (
					<SelectControl
						label={__(
							'Default Add To Cart Icon Behavior',
							'folioblocks'
						)}
						value={selectValue}
						options={
							hasGalleryDefault
								? [
									{
										label: __(
											'Inherit (Gallery Default)',
											'folioblocks'
										),
										value: 'inherit',
									},
									{
										label: __(
											'Add to Cart',
											'folioblocks'
										),
										value: 'add_to_cart',
									},
									{
										label: __(
											'Open Product Page',
											'folioblocks'
										),
										value: 'product',
									},
								  ]
								: [
									{
										label: __(
											'Add to Cart',
											'folioblocks'
										),
										value: 'add_to_cart',
									},
									{
										label: __(
											'Open Product Page',
											'folioblocks'
										),
										value: 'product',
									},
								  ]
						}
						onChange={(value) =>
							setAttributes({ wooLinkAction: value })
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={
							hasGalleryDefault
								? __(
									'Choose what happens when visitors click the Add To Cart icon. Select Inherit to follow the gallery default.',
									'folioblocks'
								  )
								: __(
									'Choose what happens when visitors click the Add To Cart icon.',
									'folioblocks'
								  )
						}
					/>
				)}
			</>
		);
	}
);
addFilter(
	'folioBlocks.videoBlock.disableRightClickToggle',
	'folioblocks/pb-video-block-disable-rc',
	(Original, { attributes, setAttributes, isInsideGallery }) => {
		if (isInsideGallery) {
			return null;
		}
		const value = attributes.disableRightClick ?? false;
		return (
			<ToggleControl
				label={__('Disable Right-Click', 'folioblocks')}
				checked={!!value}
				onChange={(v) =>
					setAttributes({ disableRightClick: !!v })
				}
				__nextHasNoMarginBottom
				help={__(
					'Prevents visitors from right-clicking.',
					'folioblocks'
				)}
			/>
		);
	}
);

addFilter(
	'folioBlocks.videoBlock.lazyLoadToggle',
	'folioblocks/pb-video-block-lazyload',
	(Original, { attributes, setAttributes, context, isInsideGallery }) => {
		// Parent galleries provide one of these keys; prefer explicit lazyLoad if present
		const parentLazy =
			context?.['folioBlocks/lazyLoad'] ??
			context?.['folioBlocks/enableLazyLoad'] ??
			null;

		// Inside a gallery → no UI; the parent controls it
		if (isInsideGallery) {
			return null;
		}

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
	'folioBlocks.videoBlock.iconStyleControls',
	'folioblocks/pb-video-block-icon-style-controls',
	(Original, { attributes, setAttributes, isInsideGallery }) => {
		// Standalone only. In galleries, the parent controls icon styling via context.
		if (isInsideGallery) {
			return null;
		}

		const enableDownload = !!attributes.enableDownload;
		const enableWooCommerce = !!attributes.enableWooCommerce;

		if (!enableDownload && !enableWooCommerce) {
			return null;
		}

		return (
			<ToolsPanel
				label={__('E-Commerce Styles', 'folioblocks')}
				resetAll={() =>
					setAttributes({
						cartIconColor: '',
						cartIconBgColor: '',
					})
				}
			>
				{enableWooCommerce && (
					<ToolsPanelItem
						label={__('Add to Cart Icon Colors', 'folioblocks')}
						hasValue={() =>
							!!attributes.cartIconColor ||
							!!attributes.cartIconBgColor
						}
						onDeselect={() =>
							setAttributes({
								cartIconColor: '',
								cartIconBgColor: '',
							})
						}
						isShownByDefault
					>
						<CompactTwoColorControl
							label={__('Add to Cart Icon', 'folioblocks')}
							value={{
								first: attributes.cartIconColor,
								second: attributes.cartIconBgColor,
							}}
							onChange={(next) =>
								setAttributes({
									cartIconColor: next?.first || '',
									cartIconBgColor: next?.second || '',
								})
							}
							firstLabel={__('Icon', 'folioblocks')}
							secondLabel={__('Background', 'folioblocks')}
						/>
					</ToolsPanelItem>
				)}
			</ToolsPanel>
		);
	}
);

addFilter(
	'folioBlocks.pbVideoBlock.renderAddToCart',
	'folioblocks/pb-video-add-to-cart',
	(
		_,
		{ attributes, context, isInVideoGallery, cartIconStyleVars = {} }
	) => {
		// Prefer gallery context; fall back to standalone block attributes
		const hasWooCommerce = window.folioBlocksData?.hasWooCommerce || false;

		const contextHasEnableWoo =
			typeof context?.['folioBlocks/enableWooCommerce'] !== 'undefined';
		const contextEnableWoo = contextHasEnableWoo
			? !!context['folioBlocks/enableWooCommerce']
			: undefined;

		const contextCartDisplay =
			typeof context?.['folioBlocks/wooCartIconDisplay'] !== 'undefined'
				? context['folioBlocks/wooCartIconDisplay']
				: undefined;
		const contextDefaultAction =
			typeof context?.['folioBlocks/wooDefaultLinkAction'] !== 'undefined'
				? context['folioBlocks/wooDefaultLinkAction']
				: undefined;

		const enableWoo =
			contextEnableWoo !== undefined
				? contextEnableWoo
				: !!attributes.enableWooCommerce;

		const wooCartIconDisplay =
			contextCartDisplay || attributes.wooCartIconDisplay || 'hover';
		const attrAction = attributes.wooLinkAction ?? 'inherit';
		const linkAction =
			attrAction && attrAction !== 'inherit'
				? attrAction
				: contextDefaultAction || 'add_to_cart';

		// Need WooCommerce active, integration enabled, and a product selected
		if (!hasWooCommerce || !enableWoo || !attributes.wooProductId) {
			return null;
		}

		// Position icon (border info from context if in gallery; else from attributes)
		const borderWidth = isInVideoGallery
			? context?.['folioBlocks/borderWidth'] || 0
			: attributes.borderWidth || 0;

		const borderRadius = isInVideoGallery
			? context?.['folioBlocks/borderRadius'] || 0
			: attributes.borderRadius || 0;

		const top = 10 + Math.max(borderWidth, borderRadius * 0.1);
		const right = 10 + Math.max(borderWidth, borderRadius * 0.3);

		return (
			<button
				type="button"
				className={`pb-video-add-to-cart ${wooCartIconDisplay === 'hover' ? 'hover-only' : 'always'
					}`}
				data-woo-action={linkAction}
				data-product-id={attributes.wooProductId}
				data-product-url={attributes.wooProductURL || ''}
				aria-label={
					linkAction === 'add_to_cart'
						? __('Add to Cart', 'folioblocks')
						: __('View Product', 'folioblocks')
				}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
				style={{
					...(cartIconStyleVars || {}),
					top: `${top}px`,
					right: `${right}px`,
				}}
			>
				{wooCartIcon}
			</button>
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
		const safeWooProductURL = sanitizeExternalUrl(wooProductURL);

		// If a product is linked
			if (wooProductId > 0) {
				return (
					<>
						<div className="pb-video-lightbox-video">
							{getVideoEmbedMarkup(
								videoUrl,
								isInVideoGallery ? { controls: false } : undefined
							)}
						</div>
						<div className="pb-video-lightbox-info">
							{wooProductName && (
								<h2 className="pb-video-lightbox-product-title">
									{wooProductName}
							</h2>
						)}
						{wooProductPrice && (
							<div
								className="pb-video-lightbox-product-price"
								dangerouslySetInnerHTML={{
									__html: wooProductPrice,
								}}
							/>
						)}
						{wooProductDescription && (
							<div
								className="pb-video-lightbox-product-description"
								dangerouslySetInnerHTML={{
									__html: wooProductDescription,
								}}
							/>
						)}
						{safeWooProductURL && (
							<a
								href={safeWooProductURL}
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
					<div className="pb-video-lightbox-video">
						{getVideoEmbedMarkup(
							videoUrl,
							isInVideoGallery ? { controls: false } : undefined
						)}
					</div>
					<div className="pb-video-lightbox-info">
						{title && <h2 className="lightbox-title">{title}</h2>}
						{description && (
							<p className="lightbox-description">{description}</p>
					)}
				</div>
			</>
		);
	}
);
