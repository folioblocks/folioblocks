/**
 * Video Gallery Block
 * Premium JS
 */
import { __ } from "@wordpress/i18n";
import {
	ToggleControl,
	SelectControl,
	RangeControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";
import { useEffect } from "@wordpress/element";
import { addFilter } from "@wordpress/hooks";
import { CompactTwoColorControl } from "../pb-helpers/CompactColorControl";
import ImageStyleControl from "../pb-helpers/ImageStyleControl";
import { registerFilteringPremiumControls } from "../pb-helpers/filteringPremiumControls";

const DEFAULT_OVERLAY_BG_COLOR = "#f9f9f9";
const DEFAULT_OVERLAY_TEXT_COLOR = "#000000";

const LightboxThemeControl = ({ attributes, setAttributes }) => (
	<ToggleGroupControl
		label={__("Lightbox Appearance", "folioblocks")}
		value={attributes.lightboxTheme || "dark"}
		onChange={(lightboxTheme) => {
			if (lightboxTheme) {
				setAttributes({ lightboxTheme });
			}
		}}
		isBlock
		__nextHasNoMarginBottom
		__next40pxDefaultSize
		help={__(
			'Choose a light or dark lightbox background.',
			'folioblocks'
		)}
	>
		<ToggleGroupControlOption label={__("Light", "folioblocks")} value="light" />		
		<ToggleGroupControlOption label={__("Dark", "folioblocks")} value="dark" />
	</ToggleGroupControl>
);

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
	"folioBlocks.videoGallery.lightboxTheme",
	"folioblocks/video-gallery-premium-lightbox-theme",
	(defaultContent, props) => <LightboxThemeControl {...props} />,
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
				label={__("Lightbox Content", "folioblocks")}
				value={attributes.lightboxLayout}
				options={options}
				onChange={(value) => setAttributes({ lightboxLayout: value })}
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				help={__(
					'Choose what appears with the Video in the lightbox.',
					'folioblocks'
				)}
			/>
		);
	},
);

addFilter(
	"folioBlocks.videoGallery.customOverlayControls",
	"folioblocks/video-gallery-premium-custom-overlay",
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;

		return (
			<>
				<SelectControl
					label={__("Hover Style", "folioblocks")}
					value={attributes.overlayStyle || "default"}
					onChange={(value) => {
						const nextAttributes = { overlayStyle: value };
						if (value === "color") {
							nextAttributes.overlayBgColor =
								attributes.overlayBgColor || DEFAULT_OVERLAY_BG_COLOR;
							nextAttributes.overlayTextColor =
								attributes.overlayTextColor || DEFAULT_OVERLAY_TEXT_COLOR;
						}
						setAttributes(nextAttributes);
					}}
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
					help={
						(attributes.overlayStyle || "default") === "color"
							? __(
								"Displays the overlay content over custom overlay colors set in Styles panel.",
								"folioblocks",
							)
							: __("Choose the hover overlay style.", "folioblocks")
					}
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				/>
			</>
		);
	},
);

addFilter(
	"folioBlocks.videoGallery.hoverOverlayStyleControls",
	"folioblocks/video-gallery-premium-hover-overlay-styles",
	(defaultContent, { attributes, setAttributes }) => {
		if ((attributes.overlayStyle || "default") !== "color") {
			return null;
		}

		return (
			<ToolsPanel
				label={__("Gallery Hover Styles", "folioblocks")}
				resetAll={() =>
					setAttributes({
						overlayBgColor: DEFAULT_OVERLAY_BG_COLOR,
						overlayTextColor: DEFAULT_OVERLAY_TEXT_COLOR,
					})
				}
			>
				<ToolsPanelItem
					label={__("Overlay Colors", "folioblocks")}
					hasValue={() =>
						(attributes.overlayBgColor || DEFAULT_OVERLAY_BG_COLOR) !==
						DEFAULT_OVERLAY_BG_COLOR ||
						(attributes.overlayTextColor || DEFAULT_OVERLAY_TEXT_COLOR) !==
						DEFAULT_OVERLAY_TEXT_COLOR
					}
					onDeselect={() =>
						setAttributes({
							overlayBgColor: DEFAULT_OVERLAY_BG_COLOR,
							overlayTextColor: DEFAULT_OVERLAY_TEXT_COLOR,
						})
					}
					isShownByDefault
				>
					<CompactTwoColorControl
						label={__("Color Overlay", "folioblocks")}
						value={{
							first:
								attributes.overlayTextColor || DEFAULT_OVERLAY_TEXT_COLOR,
							second: attributes.overlayBgColor || DEFAULT_OVERLAY_BG_COLOR,
						}}
						onChange={(next) =>
							setAttributes({
								overlayTextColor:
									next?.first || DEFAULT_OVERLAY_TEXT_COLOR,
								overlayBgColor: next?.second || DEFAULT_OVERLAY_BG_COLOR,
							})
						}
						firstLabel={__("Text", "folioblocks")}
						secondLabel={__("Background", "folioblocks")}
					/>
				</ToolsPanelItem>
			</ToolsPanel>
		);
	},
);

addFilter(
	"folioBlocks.videoGallery.imageStyles",
	"folioblocks/video-gallery-premium-image-styles",
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;
		return (
			<ImageStyleControl
				attributes={attributes}
				setAttributes={setAttributes}
				subject={__("Video", "folioblocks")}
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
