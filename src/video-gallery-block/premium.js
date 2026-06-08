/**
 * Video Gallery Block
 * Premium JS
 */
import { __ } from "@wordpress/i18n";
import {
	ToggleControl,
	SelectControl,
	RangeControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";
import { useEffect } from "@wordpress/element";
import { addFilter } from "@wordpress/hooks";
import CompactColorControl, {
	CompactTwoColorControl,
} from "../pb-helpers/CompactColorControl";
import { registerFilteringPremiumControls } from "../pb-helpers/filteringPremiumControls";

registerFilteringPremiumControls({
	hookPrefix: "folioBlocks.videoGallery",
	namespace: "folioblocks/video-gallery",
	childBlockName: "folioblocks/pb-video-block",
	enableFilterLabel: __("Enable Video Filtering", "folioblocks"),
	enableFilterHelp: __(
		"Enable video filtering with categories.",
		"folioblocks",
	),
	filterBarClassName: "pb-video-gallery-filters",
});

addFilter(
	"folioBlocks.videoGallery.wooCommerceControls",
	"folioblocks/video-gallery-premium-woocommerce",
	(defaultContent, props) => {
		const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
		if (!wooActive) {
			return null;
		}

		const { attributes, setAttributes } = props;
		const {
			enableWooCommerce,
			wooCartIconDisplay,
			wooDefaultLinkAction,
			enableDownload,
		} = attributes;

		return (
			<>
				<ToggleControl
					label={__("Enable WooCommerce Integration", "folioblocks")}
					checked={!!enableWooCommerce}
					onChange={(value) => {
						setAttributes({ enableWooCommerce: value });

						if (!value) {
							setAttributes({
								wooLightboxInfoType: "caption",
								wooProductPriceOnHover: false,
								wooCartIconDisplay: "hover",
							});
						}
					}}
					__nextHasNoMarginBottom
					help={__(
						"Link gallery videos to WooCommerce products.",
						"folioblocks",
					)}
					disabled={enableDownload}
				/>

				{enableWooCommerce && (
					<>
						<SelectControl
							label={__("Display Add to Cart Icon", "folioblocks")}
							value={wooCartIconDisplay}
							options={[
								{
									label: __("On Hover", "folioblocks"),
									value: "hover",
								},
								{
									label: __("Always", "folioblocks"),
									value: "always",
								},
							]}
							onChange={(value) => setAttributes({ wooCartIconDisplay: value })}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							help={__(
								"Choose when to display the Add to Cart icon.",
								"folioblocks",
							)}
						/>
						<SelectControl
							label={__("Default Add To Cart Icon Behavior", "folioblocks")}
							value={wooDefaultLinkAction || "add_to_cart"}
							options={[
								{
									label: __("Add to Cart", "folioblocks"),
									value: "add_to_cart",
								},
								{
									label: __("Open Product Page", "folioblocks"),
									value: "product",
								},
							]}
							onChange={(value) =>
								setAttributes({ wooDefaultLinkAction: value })
							}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							help={__(
								"Sets the default action for Add To Cart icons in this gallery. Individual videos can override this setting.",
								"folioblocks",
							)}
						/>
					</>
				)}
			</>
		);
	},
);

addFilter(
	"folioBlocks.videoGallery.disableRightClickToggle",
	"folioblocks/video-gallery-premium-disable-right-click",
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={__("Disable Right-Click on Page", "folioblocks")}
				help={__("Prevents visitors from right-clicking.", "folioblocks")}
				__nextHasNoMarginBottom={true}
				checked={!!attributes.disableRightClick}
				onChange={(value) => setAttributes({ disableRightClick: value })}
			/>
		);
	},
);
addFilter(
	"folioBlocks.videoGallery.lazyLoadToggle",
	"folioblocks/video-gallery-premium-lazy-load",
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={__("Enable Lazy Load of Images", "folioblocks")}
				help={__(
					"Enables lazy loading of Video Gallery thumbnails.",
					"folioblocks",
				)}
				__nextHasNoMarginBottom={true}
				checked={!!attributes.lazyLoad}
				onChange={(value) => setAttributes({ lazyLoad: value })}
			/>
		);
	},
);

addFilter(
	"folioBlocks.videoGallery.lightboxLayout",
	"folioblocks/video-gallery-premium-lightbox-layout",
	(defaultContent, props) => {
		const { setAttributes, attributes } = props;
		const { enableWooCommerce } = attributes;

		// Base layout options
		const options = [
			{ label: __("Video Only", "folioblocks"), value: "video-only" },
			{ label: __("Video + Info", "folioblocks"), value: "split" },
		];

		// Add WooCommerce-specific layout option only when WooCommerce is installed and enabled
		if (window.folioBlocksData?.hasWooCommerce && enableWooCommerce) {
			options.push({
				label: __("Video + Product Info", "folioblocks"),
				value: "video-product",
			});
		}

		return (
			<SelectControl
				label={__("Lightbox Layout", "folioblocks")}
				value={attributes.lightboxLayout}
				options={options}
				onChange={(value) => setAttributes({ lightboxLayout: value })}
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			/>
		);
	},
);

addFilter(
	"folioBlocks.videoGallery.customOverlayControls",
	"folioblocks/video-gallery-premium-custom-overlay",
	(defaultContent, props) => {
		const { attributes, setAttributes, combinedVisibility } = props;

		if (combinedVisibility !== "onHover") {
			return null;
		}

		return (
			<>
				<SelectControl
					label={__("Overlay Style", "folioblocks")}
					value={attributes.overlayStyle || "default"}
					onChange={(value) => setAttributes({ overlayStyle: value })}
					options={[
						{
							label: __("Default Overlay", "folioblocks"),
							value: "default",
						},
						{
							label: __("Blur Overlay", "folioblocks"),
							value: "blur",
						},
						{
							label: __("Color Overlay", "folioblocks"),
							value: "color",
						},
					]}
					help={__("Choose the hover overlay style.", "folioblocks")}
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				/>
				{(attributes.overlayStyle || "default") === "color" && (
					<CompactTwoColorControl
						label={__("Overlay Colors", "folioblocks")}
						value={{
							first: attributes.overlayBgColor,
							second: attributes.overlayTextColor,
						}}
						onChange={(next) =>
							setAttributes({
								overlayBgColor: next?.first || "",
								overlayTextColor: next?.second || "",
							})
						}
						firstLabel={__("Background", "folioblocks")}
						secondLabel={__("Text", "folioblocks")}
					/>
				)}
			</>
		);
	},
);
;
;

addFilter(
	"folioBlocks.videoGallery.borderColorControl",
	"folioblocks/video-gallery-premium-border-color",
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;
		return (
			<CompactColorControl
				label={__("Border Color", "folioblocks")}
				value={attributes.borderColor}
				onChange={(borderColor) => setAttributes({ borderColor })}
				help={__("Set Video block border color.", "folioblocks")}
			/>
		);
	},
);

addFilter(
	"folioBlocks.videoGallery.borderWidthControl",
	"folioblocks/video-gallery-premium-border-width",
	(defaultContent, props) => {
		const { attributes, setAttributes, clientId, updateBlockAttributes } =
			props;

		return (
			<RangeControl
				label={__("Border Width", "folioblocks")}
				value={attributes.borderWidth}
				onChange={(value) => {
					setAttributes({ borderWidth: value });
					if (typeof updateBlockAttributes === "function") {
						setTimeout(() => {
							updateBlockAttributes(clientId, {
								_forceRefresh: Date.now(),
							});
						}, 50);
					}
				}}
				min={0}
				max={20}
				__next40pxDefaultSize={true}
				__nextHasNoMarginBottom={true}
				help={__("Set Video block border width.", "folioblocks")}
			/>
		);
	},
);

addFilter(
	"folioBlocks.videoGallery.borderRadiusControl",
	"folioblocks/video-gallery-premium-border-radius",
	(defaultContent, props) => {
		const { attributes, setAttributes, clientId, updateBlockAttributes } =
			props;

		return (
			<RangeControl
				label={__("Border Radius", "folioblocks")}
				value={attributes.borderRadius}
				onChange={(value) => {
					setAttributes({ borderRadius: value });
					if (typeof updateBlockAttributes === "function") {
						setTimeout(() => {
							updateBlockAttributes(clientId, {
								_forceRefresh: Date.now(),
							});
						}, 50);
					}
				}}
				min={0}
				max={50}
				__next40pxDefaultSize={true}
				__nextHasNoMarginBottom={true}
				help={__("Set Video block border radius.", "folioblocks")}
			/>
		);
	},
);

addFilter(
	"folioBlocks.videoGallery.dropShadowToggle",
	"folioblocks/video-gallery-premium-drop-shadow",
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={__("Enable Drop Shadow", "folioblocks")}
				checked={!!attributes.dropShadow}
				onChange={(newDropShadow) =>
					setAttributes({ dropShadow: newDropShadow })
				}
				__nextHasNoMarginBottom={true}
				help={__("Applies a subtle drop shadow.", "folioblocks")}
			/>
		);
	},
);


addFilter(
	"folioBlocks.videoGallery.iconStyleControls",
	"folioblocks/video-gallery-icon-style-controls",
	(_, { attributes, setAttributes }) => {
		const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
		if (!wooActive) {
			return null;
		}

		const enableWooCommerce = !!attributes.enableWooCommerce;
		if (!enableWooCommerce) {
			return null;
		}

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
			</ToolsPanel>
		);
	},
);
