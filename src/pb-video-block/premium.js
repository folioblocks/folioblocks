/**
 * PB Video Block
 * Premium JS
 **/
import { addFilter } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";
import { 
	SelectControl, 
	ToggleControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";
import { wooCartIcon } from "../pb-helpers/wooCartIcon.js";
import ProductSearchControl from "../pb-helpers/ProductSearchControl.js";
import CompactColorControl, { CompactTwoColorControl } from "../pb-helpers/CompactColorControl.js";


addFilter(
	"folioBlocks.videoBlock.lightboxLayout",
	"folioblocks/video-block-premium-lightbox-layout",
	(defaultContent, props) => {
		const { attributes, setAttributes, isInsideGallery } = props;
		const { enableWooCommerce } = attributes;

		// In galleries, the parent controls layout via context
		if (isInsideGallery) return null;

		const options = [
			{ label: __("Video Only", "folioblocks"), value: "video-only" },
			{ label: __("Video + Info", "folioblocks"), value: "split" },
		];

		// Only show Woo layout when Woo is installed + explicitly enabled on this block
		if (window.folioBlocksData?.hasWooCommerce && enableWooCommerce) {
			options.push({
				label: __("Video + Product Info", "folioblocks"),
				value: "video-product",
			});
		}

		return (
			<SelectControl
				label={__("Lightbox Layout", "folioblocks")}
				value={attributes.lightboxLayout || "video-only"}
				options={options}
				onChange={(value) => setAttributes({ lightboxLayout: value })}
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			/>
		);
	},
);

addFilter(
	"folioBlocks.pbVideoBlock.filterCategories",
	"folioblocks/pb-video-filter-category",
	(output, { attributes, setAttributes, context }) => {
		const filterCategories = context?.["folioBlocks/filterCategories"] || [];

		if (filterCategories.length === 0) {
			return output;
		}

		return (
			<>
				{output}
				<SelectControl
					label={__("Filter Category", "folioblocks")}
					value={attributes.filterCategory}
					onChange={(val) => setAttributes({ filterCategory: val })}
					options={[
						{ label: __("None", "folioblocks"), value: "" },
						...filterCategories.map((cat) => ({
							label: cat,
							value: cat,
						})),
					]}
					help={__("Set video filter category.", "folioblocks")}
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				/>
			</>
		);
	},
);
addFilter(
	"folioBlocks.videoBlock.wooCommerceControls",
	"folioblocks/pb-video-block-premium-woocommerce",
	(defaultContent, props) => {
		const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
		if (!wooActive) return null;

		const { attributes, setAttributes, isInsideGallery } = props;
		if (isInsideGallery) return null; // parent galleries control Woo via context

		const { enableWooCommerce, wooCartIconDisplay, lightboxLayout } =
			attributes;

		return (
			<>
				<ToggleControl
					label={__("Enable WooCommerce Integration", "folioblocks")}
					checked={!!enableWooCommerce}
					onChange={(value) => {
						setAttributes({ enableWooCommerce: !!value });

						// When disabling Woo, revert product-specific lightbox layout + icon display
						if (!value) {
							const next = { wooCartIconDisplay: "hover" };
							if (lightboxLayout === "video-product")
								next.lightboxLayout = "split";
							setAttributes(next);
						}
					}}
					__nextHasNoMarginBottom
					help={__("Link this video to a WooCommerce product.", "folioblocks")}
				/>

				{enableWooCommerce && (
					<SelectControl
						label={__("Display Add to Cart Icon", "folioblocks")}
						value={wooCartIconDisplay || "hover"}
						options={[
							{ label: __("On Hover", "folioblocks"), value: "hover" },
							{ label: __("Always", "folioblocks"), value: "always" },
						]}
						onChange={(value) => setAttributes({ wooCartIconDisplay: value })}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={__(
							"Choose when to display the Add to Cart icon.",
							"folioblocks",
						)}
					/>
				)}
			</>
		);
	},
);

addFilter(
	"folioBlocks.pbVideoBlock.WooProductSearch",
	"folioblocks/pb-video-woo-product-search",
	(
		output,
		{ attributes, setAttributes, hasWooCommerce, enableWooCommerce },
	) => {
		const effectiveEnable =
			typeof enableWooCommerce !== "undefined"
				? !!enableWooCommerce
				: !!attributes.enableWooCommerce;
		if (!hasWooCommerce || !effectiveEnable) return output;

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
									image: attributes.wooProductImage || "",
							  }
							: null
					}
					onSelect={(product) => {
						if (!product || !product.id) {
							setAttributes({
								wooProductId: 0,
								wooProductName: "",
								wooProductPrice: "",
								wooProductURL: "",
								wooProductDescription: "",
								wooProductImage: "",
							});
							return;
						}

						setAttributes({
							wooProductId: product.id,
							wooProductName: product.name,
							wooProductPrice: product.price_html || product.price || "",
							wooProductURL: product.permalink || "",
							wooProductImage: product.image || product.images?.[0]?.src || "",
							wooProductDescription: product.description || "",
						});
					}}
				/>
			</>
		);
	},
);
addFilter(
	"folioBlocks.videoBlock.disableRightClickToggle",
	"folioblocks/pb-video-block-disable-rc",
	(Original, { attributes, setAttributes, isInsideGallery }) => {
		if (isInsideGallery) return null;
		const value = attributes.disableRightClick ?? false;
		return (
			<ToggleControl
				label={__("Disable Right-Click", "folioblocks")}
				checked={!!value}
				onChange={(v) => setAttributes({ disableRightClick: !!v })}
				__nextHasNoMarginBottom
				help={__("Prevents visitors from right-clicking.", "folioblocks")}
			/>
		);
	},
);

addFilter(
	"folioBlocks.videoBlock.lazyLoadToggle",
	"folioblocks/pb-video-block-lazyload",
	(Original, { attributes, setAttributes, context, isInsideGallery }) => {
		// Parent galleries provide one of these keys; prefer explicit lazyLoad if present
		const parentLazy =
			context?.["folioBlocks/lazyLoad"] ??
			context?.["folioBlocks/enableLazyLoad"] ??
			null;

		// Inside a gallery → no UI; the parent controls it
		if (isInsideGallery) return null;

		// Standalone → show a toggle that writes the block's own attribute
		const value = attributes.lazyLoad ?? true;

		return (
			<ToggleControl
				label={__("Enable Lazy Load of Images", "folioblocks")}
				checked={!!value}
				onChange={(val) => setAttributes({ lazyLoad: !!val })}
				__nextHasNoMarginBottom
				help={__("Enables lazy loading of image.", "folioblocks")}
			/>
		);
	},
);

addFilter(
	"folioBlocks.videoBlock.iconStyleControls",
	"folioblocks/pb-video-block-icon-style-controls",
	(Original, { attributes, setAttributes, isInsideGallery }) => {
		// Standalone only. In galleries, the parent controls icon styling via context.
		if (isInsideGallery) return null;

		const enableDownload = !!attributes.enableDownload;
		const enableWooCommerce = !!attributes.enableWooCommerce;

		if (!enableDownload && !enableWooCommerce) return null;

		return (
					<ToolsPanel
						label={__("E-Commerce Styles", "folioblocks")}
						resetAll={() =>
							setAttributes({
								cartIconColor: "",
								cartIconBgColor: "",
							})
						}
					>
						{enableWooCommerce && (
							<ToolsPanelItem
								label={__("Add to Cart Icon Colors", "folioblocks")}
								hasValue={() =>
									!!attributes.cartIconColor || !!attributes.cartIconBgColor
								}
								onDeselect={() =>
									setAttributes({
										cartIconColor: "",
										cartIconBgColor: "",
									})
								}
								isShownByDefault
							>
								<CompactTwoColorControl
									label={__("Add to Cart Icon", "folioblocks")}
									value={{
										first: attributes.cartIconColor,
										second: attributes.cartIconBgColor,
									}}
									onChange={(next) =>
										setAttributes({
											cartIconColor: next?.first || "",
											cartIconBgColor: next?.second || "",
										})
									}
									firstLabel={__("Icon", "folioblocks")}
									secondLabel={__("Background", "folioblocks")}
								/>
							</ToolsPanelItem>
						)}
					</ToolsPanel>
		);
	},
);

addFilter(
	"folioBlocks.pbVideoBlock.renderAddToCart",
	"folioblocks/pb-video-add-to-cart",
	(_, { attributes, context, isInVideoGallery, cartIconStyleVars = {} }) => {
		// Prefer gallery context; fall back to standalone block attributes
		const hasWooCommerce = window.folioBlocksData?.hasWooCommerce || false;

		const contextHasEnableWoo =
			typeof context?.["folioBlocks/enableWooCommerce"] !== "undefined";
		const contextEnableWoo = contextHasEnableWoo
			? !!context["folioBlocks/enableWooCommerce"]
			: undefined;

		const contextCartDisplay =
			typeof context?.["folioBlocks/wooCartIconDisplay"] !== "undefined"
				? context["folioBlocks/wooCartIconDisplay"]
				: undefined;

		const enableWoo =
			contextEnableWoo !== undefined
				? contextEnableWoo
				: !!attributes.enableWooCommerce;

		const wooCartIconDisplay =
			contextCartDisplay || attributes.wooCartIconDisplay || "hover";

		// Need WooCommerce active, integration enabled, and a product selected
		if (!hasWooCommerce || !enableWoo || !attributes.wooProductId) {
			return null;
		}

		// Position icon (border info from context if in gallery; else from attributes)
		const borderWidth = isInVideoGallery
			? context?.["folioBlocks/borderWidth"] || 0
			: attributes.borderWidth || 0;

		const borderRadius = isInVideoGallery
			? context?.["folioBlocks/borderRadius"] || 0
			: attributes.borderRadius || 0;

		const top = 10 + Math.max(borderWidth, borderRadius * 0.1);
		const right = 10 + Math.max(borderWidth, borderRadius * 0.3);

		return (
			<a
				href={`?add-to-cart=${attributes.wooProductId}`}
				className={`pb-video-add-to-cart ${
					wooCartIconDisplay === "hover" ? "hover-only" : "always"
				}`}
				data-product_id={attributes.wooProductId}
				style={{
					...(cartIconStyleVars || {}),
					top: `${top}px`,
					right: `${right}px`,
				}}
			>
				{wooCartIcon}
			</a>
		);
	},
);

addFilter(
	"folioBlocks.pbVideoBlock.renderLightbox",
	"folioblocks/pb-video-lightbox-product",
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
		},
	) => {
		// Only apply if WooCommerce layout is selected and Woo is enabled
		if (lightboxLayout !== "video-product" || !enableWooCommerce) {
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
					<div className="pb-video-lightbox-video" style={{ flex: "0 0 70%" }}>
						{getVideoEmbedMarkup(
							videoUrl,
							isInVideoGallery ? { controls: false } : undefined,
						)}
					</div>
					<div className="pb-video-lightbox-info" style={{ flex: "0 0 30%" }}>
						{wooProductName && (
							<h2 className="pb-video-lightbox-product-title">
								{wooProductName}
							</h2>
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
								{__("View Product", "folioblocks")}
							</a>
						)}
					</div>
				</>
			);
		}

		// Fallback: split layout if no product linked
		return (
			<>
				<div className="pb-video-lightbox-video" style={{ flex: "0 0 70%" }}>
					{getVideoEmbedMarkup(
						videoUrl,
						isInVideoGallery ? { controls: false } : undefined,
					)}
				</div>
				<div className="pb-video-lightbox-info" style={{ flex: "0 0 30%" }}>
					{title && <h2 className="lightbox-title">{title}</h2>}
					{description && <p className="lightbox-description">{description}</p>}
				</div>
			</>
		);
	},
);
