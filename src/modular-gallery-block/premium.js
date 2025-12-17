/**
 * Modular Gallery Block
 * Premium JS
 **/
import { __ } from "@wordpress/i18n";
import {
	ToggleControl,
	SelectControl,
	BaseControl,
	ColorPalette,
	RangeControl,
} from "@wordpress/components";
import { useEffect } from "@wordpress/element";
import { addFilter } from "@wordpress/hooks";
import { applyThumbnails } from "../pb-helpers/applyThumbnails";

addFilter(
	"folioBlocks.modularGallery.editorEnhancements",
	"folioblocks/modular-gallery-premium-thumbnails",
	(_, { clientId, innerBlocks, isBlockOrChildSelected }) => {
		// When the block or a child is selected, applyThumbnails
		useEffect(() => {
			if (isBlockOrChildSelected) {
				setTimeout(() => {
					applyThumbnails(clientId);
				}, 200);
			}
		}, [isBlockOrChildSelected]);

		// Fallback: if block has images but no thumbnails rendered, applyThumbnails
		useEffect(() => {
			const hasImages = innerBlocks.length > 0;
			const listViewHasThumbnails = document.querySelector(
				'[data-pb-thumbnail-applied="true"]',
			);

			if (hasImages && !listViewHasThumbnails) {
				setTimeout(() => {
					applyThumbnails(clientId);
				}, 300);
			}
		}, [innerBlocks]);
		return null;
	},
);

addFilter(
	"folioBlocks.modularGallery.downloadControls",
	"folioblocks/modular-gallery-premium-downloads",
	(defaultContent, props) => {
		const { attributes, setAttributes, effectiveEnableWoo } = props;

		if (effectiveEnableWoo && attributes.enableDownload) {
			setAttributes({ enableDownload: false });
		}

		const { enableDownload, downloadOnHover } = attributes;

		return (
			<>
				<ToggleControl
					label={__("Enable Image Downloads", "folioblocks")}
					checked={!!enableDownload}
					onChange={(value) => setAttributes({ enableDownload: value })}
					__nextHasNoMarginBottom
					help={__(
						"Enable visitors to download images from the gallery.",
						"folioblocks",
					)}
					disabled={effectiveEnableWoo}
				/>

				{enableDownload && (
					<SelectControl
						label={__("Display Image Download Icon", "folioblocks")}
						value={downloadOnHover ?? true ? "hover" : "always"}
						options={[
							{ label: __("On Hover", "folioblocks"), value: "hover" },
							{ label: __("Always", "folioblocks"), value: "always" },
						]}
						onChange={(value) =>
							setAttributes({ downloadOnHover: value === "hover" })
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={__(
							"Set display preference for Image Download icon.",
							"folioblocks",
						)}
					/>
				)}
			</>
		);
	},
);

addFilter(
	"folioBlocks.modularGallery.wooCommerceControls",
	"folioblocks/modular-gallery-premium-woocommerce",
	(defaultContent, props) => {
		const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
		if (!wooActive) return null;

		const { attributes, setAttributes } = props;
		const { enableWooCommerce, wooCartIconDisplay, enableDownload } =
			attributes;

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
						"Link gallery images to WooCommerce products.",
						"folioblocks",
					)}
					disabled={enableDownload}
				/>

				{enableWooCommerce && (
					<SelectControl
						label={__("Display Add to Cart Icon", "folioblocks")}
						value={wooCartIconDisplay}
						options={[
							{ label: __("On Hover", "folioblocks"), value: "hover" },
							{ label: __("Always", "folioblocks"), value: "always" },
						]}
						onChange={(value) => setAttributes({ wooCartIconDisplay: value })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
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
	"folioBlocks.modularGallery.disableRightClickToggle",
	"folioblocks/modular-gallery-premium-disable-right-click",
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
	"folioBlocks.modularGallery.lazyLoadToggle",
	"folioblocks/modular-gallery-premium-lazy-load",
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;

		return (
			<ToggleControl
				label={__("Enable Lazy Load of Images", "folioblocks")}
				help={__("Enables lazy loading of gallery images.", "folioblocks")}
				__nextHasNoMarginBottom={true}
				checked={!!attributes.lazyLoad}
				onChange={(value) => setAttributes({ lazyLoad: value })}
			/>
		);
	},
);
addFilter(
	"folioBlocks.modularGallery.lightboxControls",
	"folioblocks/modular-gallery-premium-lightbox",
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;
		const {
			lightbox,
			lightboxCaption,
			enableWooCommerce,
			wooLightboxInfoType,
		} = attributes;

		return (
			<>
				<ToggleControl
					label={__("Enable Lightbox", "folioblocks")}
					checked={!!lightbox}
					onChange={(newLightbox) => setAttributes({ lightbox: newLightbox })}
					__nextHasNoMarginBottom
					help={__("Enable image Lightbox on click.", "folioblocks")}
				/>

				{lightbox && (
					<>
						<ToggleControl
							label={
								enableWooCommerce
									? __(
											"Show Image Caption or Product Info in Lightbox",
											"folioblocks",
									  )
									: __("Show Image Caption in Lightbox", "folioblocks")
							}
							help={
								enableWooCommerce
									? __(
											"Display Image Caption or Product Info inside the Lightbox.",
											"folioblocks",
									  )
									: __(
											"Display Image Caption inside the lightbox.",
											"folioblocks",
									  )
							}
							checked={!!lightboxCaption}
							onChange={(newLightboxCaption) =>
								setAttributes({ lightboxCaption: newLightboxCaption })
							}
							__nextHasNoMarginBottom
						/>

						{enableWooCommerce && lightboxCaption && (
							<SelectControl
								label={__("Lightbox Info", "folioblocks")}
								value={wooLightboxInfoType}
								options={[
									{
										label: __("Show Image Caption", "folioblocks"),
										value: "caption",
									},
									{
										label: __("Show Product Info", "folioblocks"),
										value: "product",
									},
								]}
								onChange={(value) =>
									setAttributes({ wooLightboxInfoType: value })
								}
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								help={__(
									"Choose what appears below images in the lightbox.",
									"folioblocks",
								)}
							/>
						)}
					</>
				)}
			</>
		);
	},
);

addFilter(
	"folioBlocks.modularGallery.onHoverTitleToggle",
	"folioblocks/modular-gallery-premium-title-toggle",
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;
		const { onHoverTitle, enableWooCommerce, wooProductPriceOnHover } =
			attributes;

		return (
			<>
				<ToggleControl
					label={__("Show Overlay on Hover", "folioblocks")}
					help={
						enableWooCommerce
							? __(
									"Display Image title or Product Info when hovering over images.",
									"folioblocks",
							  )
							: __(
									"Display Image title when hovering over image.",
									"folioblocks",
							  )
					}
					__nextHasNoMarginBottom
					checked={!!attributes.onHoverTitle}
					onChange={(value) => setAttributes({ onHoverTitle: value })}
				/>

				{enableWooCommerce && onHoverTitle && (
					<SelectControl
						label={__("Overlay Content", "folioblocks")}
						value={wooProductPriceOnHover ? "product" : "title"}
						options={[
							{ label: __("Show Image Title", "folioblocks"), value: "title" },
							{
								label: __("Show Product Info", "folioblocks"),
								value: "product",
							},
						]}
						onChange={(val) => {
							// Ensure hover info is enabled, then switch mode
							setAttributes({
								onHoverTitle: true,
								wooProductPriceOnHover: val === "product",
							});
						}}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={__(
							"Choose what appears when hovering over images.",
							"folioblocks",
						)}
					/>
				)}
				{onHoverTitle && (
					<SelectControl
						label={__("Hover Style", "folioblocks")}
						value={attributes.onHoverStyle || "blur-overlay"}
						options={[
							{
								label: __("Blur Overlay - Centered", "folioblocks"),
								value: "blur-overlay",
							},
							{
								label: __("Fade Overlay - Centered", "folioblocks"),
								value: "fade-overlay",
							},
							{
								label: __("Gradient Overlay - Slide-up Bottom", "folioblocks"),
								value: "gradient-bottom",
							},
							{
								label: __("Chip Overlay - Top-Left Label", "folioblocks"),
								value: "chip",
							},
						]}
						onChange={(v) => setAttributes({ onHoverStyle: v })}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
				)}
			</>
		);
	},
);

addFilter(
	"folioBlocks.modularGallery.borderColorControl",
	"folioblocks/modular-gallery-premium-border-color",
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;
		return (
			<BaseControl
				label={__("Border Color", "folioblocks")}
				__nextHasNoMarginBottom={true}
			>
				<ColorPalette
					value={attributes.borderColor}
					onChange={(value) => setAttributes({ borderColor: value })}
					clearable={false}
					help={__("Set border color.", "folioblocks")}
				/>
			</BaseControl>
		);
	},
);

addFilter(
	"folioBlocks.modularGallery.borderWidthControl",
	"folioblocks/modular-gallery-premium-border-width",
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
							updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
						}, 50);
					}
				}}
				min={0}
				max={15}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				help={__("Set border width in pixels.", "folioblocks")}
			/>
		);
	},
);

addFilter(
	"folioBlocks.modularGallery.borderRadiusControl",
	"folioblocks/modular-gallery-premium-border-radius",
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
							updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
						}, 50);
					}
				}}
				min={0}
				max={50}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				help={__("Set border radius in pixels.", "folioblocks")}
			/>
		);
	},
);

addFilter(
	"folioBlocks.modularGallery.dropShadowToggle",
	"folioblocks/modular-gallery-premium-drop-shadow",
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
				help={__("Applies a subtle drop shadow to images.", "folioblocks")}
			/>
		);
	},
);
