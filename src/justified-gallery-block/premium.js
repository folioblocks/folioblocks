/**
 * Justified Gallery Block
 * Premium JS
 **/
import { __ } from "@wordpress/i18n";
import {
	LineHeightControl,
	__experimentalUnitControl as UnitControl,
	__experimentalTextDecorationControl as TextDecorationControl,
	__experimentalTextTransformControl as TextTransformControl,
	__experimentalFontAppearanceControl as FontAppearanceControl,
	useSettings,
} from "@wordpress/block-editor";
import {
	ToggleControl,
	SelectControl,
	RangeControl,
	TextControl,
	FontSizePicker,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";
import { addFilter } from "@wordpress/hooks";
import { useEffect } from "@wordpress/element";
import { applyThumbnails } from "../pb-helpers/applyThumbnails";
import CompactColorControl, {
	CompactTwoColorControl,
} from "../pb-helpers/CompactColorControl";
import {
	getFontFamilyOptions,
	normalizeFontFamilies,
	normalizeFontSizes,
	getFontSizeOptions,
	getFilterTypographyCSS,
} from "../pb-helpers/GetThemeSettings";

addFilter(
	"folioBlocks.justifiedGallery.editorEnhancements",
	"folioblocks/justified-gallery-premium-thumbnails",
	(_, { clientId, innerBlocks, isBlockOrChildSelected }) => {
		// Apply thumbnails when this block or a child is selected
		useEffect(() => {
			if (isBlockOrChildSelected) {
				setTimeout(() => {
					applyThumbnails(clientId);
				}, 200);
			}
		}, [isBlockOrChildSelected]);

		// Fallback: Apply thumbnails if images are present but thumbnails haven't rendered yet
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
	"folioBlocks.justifiedGallery.editorEnhancements",
	"folioblocks/justified-gallery-randomize",
	(_, { attributes, innerBlocks, clientId, replaceInnerBlocks }) => {
		// Shuffle images if randomizeOrder is enabled
		useEffect(() => {
			if (!attributes || !attributes.randomizeOrder || innerBlocks.length === 0)
				return;

			// Use a small delay to avoid nested updates inside React render phase
			const timer = setTimeout(() => {
				const shuffled = [...innerBlocks];
				for (let i = shuffled.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
				}

				if (typeof replaceInnerBlocks === "function") {
					replaceInnerBlocks(clientId, shuffled);
				}
			}, 100);

			return () => clearTimeout(timer);
		}, [attributes?.randomizeOrder]);

		return null;
	},
);
addFilter(
	"folioBlocks.justifiedGallery.randomizeToggle",
	"folioblocks/justified-gallery-premium-toggle",
	(defaultContent, props) => {
		const { attributes, setAttributes, clientId, updateBlockAttributes } =
			props;
		return (
			<ToggleControl
				label={__("Randomize Image Order", "folioblocks")}
				checked={!!attributes.randomizeOrder}
				onChange={(value) => {
					setAttributes({ randomizeOrder: value });
					if (typeof updateBlockAttributes === "function") {
						setTimeout(() => {
							updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
						}, 50);
					}
				}}
				__nextHasNoMarginBottom={true}
				help={__("Randomize order of images.", "folioblocks")}
			/>
		);
	},
);

addFilter(
	"folioBlocks.justifiedGallery.downloadControls",
	"folioblocks/justified-gallery-premium-downloads",
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
	"folioBlocks.justifiedGallery.wooCommerceControls",
	"folioblocks/justified-gallery-premium-woocommerce",
	(defaultContent, props) => {
		const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
		if (!wooActive) return null;

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
						"Link gallery images to WooCommerce products.",
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
						<SelectControl
							label={__("Default Add To Cart Icon Behavior", "folioblocks")}
							value={wooDefaultLinkAction}
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
								"Sets the default action for Add To Cart icons in this gallery. Individual images can override this setting.",
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
	"folioBlocks.justifiedGallery.disableRightClickToggle",
	"folioblocks/justified-gallery-premium-disable-right-click",
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
	"folioBlocks.justifiedGallery.lazyLoadToggle",
	"folioblocks/justified-gallery-premium-lazy-load",
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
	"folioBlocks.justifiedGallery.lightboxControls",
	"folioblocks/justified-gallery-premium-lightbox",
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
	"folioBlocks.justifiedGallery.onHoverTitleToggle",
	"folioblocks/justified-gallery-premium-title-toggle",
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
							{
								label: __("Color Overlay - Custom Colors", "folioblocks"),
								value: "color-overlay",
							},
						]}
						onChange={(v) => setAttributes({ onHoverStyle: v })}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
				)}
				{onHoverTitle && attributes.onHoverStyle === "color-overlay" && (
					<CompactTwoColorControl
						label={__("Overlay Colors", "folioblocks")}
						value={{
							first: attributes.overlayBgColor,
							second: attributes.overlayTextColor,
						}}
						onChange={({ first, second }) =>
							setAttributes({
								overlayBgColor: first || "",
								overlayTextColor: second || "",
							})
						}
						firstLabel={__("Background", "folioblocks")}
						secondLabel={__("Text", "folioblocks")}
						help={__(
							"Pick custom background and text colors for the overlay.",
							"folioblocks",
						)}
					/>
				)}
			</>
		);
	},
);
addFilter(
	"folioBlocks.justifiedGallery.filterLogic",
	"folioblocks/justified-gallery-filter-logic",
	(_, { attributes, setAttributes, selectedBlock }) => {
		const {
			enableFilter = false,
			filterAlign = "center",
			filtersInput = "",
			activeFilter = "All",
		} = attributes;

		// Derive categories from filtersInput
		const filterCategories = filtersInput
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		// Sync derived categories
		useEffect(() => {
			setAttributes({ filterCategories });
		}, [filtersInput]);

		// Reset activeFilter if selected block becomes hidden
		useEffect(() => {
			if (
				selectedBlock &&
				selectedBlock.name === "folioblocks/pb-image-block"
			) {
				const selectedCategory = selectedBlock.attributes?.filterCategory || "";
				const isFilteredOut =
					activeFilter !== "All" &&
					selectedCategory.toLowerCase() !== activeFilter.toLowerCase();

				if (isFilteredOut) {
					setAttributes({ activeFilter: "All" });
				}
			}
		}, [selectedBlock, activeFilter]);

		// Keep these base filter attributes consistent
		useEffect(() => {
			if (attributes.enableFilter !== enableFilter)
				setAttributes({ enableFilter });
			if (attributes.filterAlign !== filterAlign)
				setAttributes({ filterAlign });
		}, [enableFilter, filterAlign]);

		return null;
	},
);
addFilter(
	"folioBlocks.justifiedGallery.enableFilterToggle",
	"folioblocks/justified-gallery-premium-filter-toggle",
	(defaultContent, props) => {
		const { attributes, setAttributes } = props;
		const { enableFilter, filterAlign, filtersInput } = attributes;

		const handleFilterInputChange = (value) => {
			setAttributes({ filtersInput: value });
		};

		const handleFilterInputBlur = () => {
			const parsed = filtersInput
				.split(",")
				.map((item) => item.trim())
				.filter((item) => item.length > 0);
			setAttributes({ filterCategories: parsed });
		};

		return (
			<>
				<ToggleControl
					label={__("Enable Image Filtering", "folioblocks")}
					checked={!!attributes.enableFilter}
					onChange={(val) => setAttributes({ enableFilter: val })}
					__nextHasNoMarginBottom={true}
					help={__("Enable image filtering with categories.", "folioblocks")}
				/>
				{enableFilter && (
					<>
						<ToggleGroupControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							value={filterAlign}
							isBlock
							label={__("Filter Bar Alignment", "folioblocks")}
							help={__("Set alignment of the filter bar.", "folioblocks")}
							onChange={(value) => setAttributes({ filterAlign: value })}
						>
							<ToggleGroupControlOption label="Left" value="left" />
							<ToggleGroupControlOption label="Center" value="center" />
							<ToggleGroupControlOption label="Right" value="right" />
						</ToggleGroupControl>

						<TextControl
							label={__("Filter Categories", "folioblocks")}
							value={filtersInput}
							onChange={handleFilterInputChange}
							onBlur={handleFilterInputBlur}
							help={__("Separate categories with commas")}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
					</>
				)}
			</>
		);
	},
);

addFilter(
	"folioBlocks.justifiedGallery.imageStyles",
	"folioblocks/justified-gallery-premium-image-styles",
	(defaultContent, props) => {
		const { attributes, setAttributes, clientId, updateBlockAttributes } =
			props;

		const forceRefresh = () => {
			if (typeof updateBlockAttributes === "function") {
				setTimeout(() => {
					updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
				}, 50);
			}
		};

		return (
			<>
				<CompactColorControl
					label={__("Border Color", "folioblocks")}
					value={attributes.borderColor}
					onChange={(borderColor) => {
						setAttributes({ borderColor });
						forceRefresh();
					}}
					help={__("Set Image border color.", "folioblocks")}
				/>

				<RangeControl
					label={__("Border Width", "folioblocks")}
					value={attributes.borderWidth}
					onChange={(value) => {
						setAttributes({ borderWidth: value });
						forceRefresh();
					}}
					min={0}
					max={15}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					help={__("Set Image border width.", "folioblocks")}
				/>

				<RangeControl
					label={__("Border Radius", "folioblocks")}
					value={attributes.borderRadius}
					onChange={(value) => {
						setAttributes({ borderRadius: value });
						forceRefresh();
					}}
					min={0}
					max={50}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					help={__("Set Image border radius.", "folioblocks")}
				/>

				<ToggleControl
					label={__("Enable Drop Shadow", "folioblocks")}
					checked={!!attributes.dropShadow}
					onChange={(newDropShadow) =>
						setAttributes({ dropShadow: newDropShadow })
					}
					__nextHasNoMarginBottom
					help={__("Applies a subtle drop shadow to images.", "folioblocks")}
				/>
			</>
		);
	},
);

addFilter(
	"folioBlocks.justifiedGallery.filterStyleSettings",
	"folioblocks/justified-gallery-premium-filter-styles",
	(defaultContent, { attributes, setAttributes }) => {
		// IMPORTANT: Hooks must be called in the same order on every render.
		// We call useSettings() unconditionally, then decide what to render.
		const [themeFontSizes] = useSettings("typography.fontSizes");
		const normalizedFontSizes = normalizeFontSizes(themeFontSizes);
		const fontSizeOptions = getFontSizeOptions(normalizedFontSizes);

		// Pull font families from theme.json / Global Styles.
		// Depending on WP version, this can be an array or an object with groups (e.g. { theme: [], custom: [] }).
		const [fontFamilies] = useSettings("typography.fontFamilies");
		const families = normalizeFontFamilies(fontFamilies);
		const fontFamilyOptions = getFontFamilyOptions(families, __);

		if (!attributes.enableFilter) {
			return null;
		}

		return (
			<>
				<ToolsPanel
					label={__("Filter Bar Styles", "folioblocks")}
					resetAll={() =>
						setAttributes({
							filterFontFamily: "",
							filterFontSize: 16,
							filterFontWeight: "",
							filterFontStyle: "",
							filterLineHeight: null,
							filterLetterSpacing: 0,
							filterTextDecoration: "none",
							filterTextTransform: "none",
						})
					}
				>
					<ToolsPanelItem
						label={__("Font Family", "folioblocks")}
						hasValue={() => !!attributes.filterFontFamily}
						onDeselect={() => setAttributes({ filterFontFamily: "" })}
						isShownByDefault
					>
						<SelectControl
							label={__("Font Family", "folioblocks")}
							value={attributes.filterFontFamily || ""}
							options={fontFamilyOptions}
							onChange={(value) => setAttributes({ filterFontFamily: value })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							help={
								fontFamilyOptions.length > 1
									? __(
											"Uses fonts from your theme’s Global Styles.",
											"folioblocks",
									  )
									: __(
											"No theme fonts found. Add font families in theme.json or Global Styles.",
											"folioblocks",
									  )
							}
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						label={__("Font Size", "folioblocks")}
						hasValue={() => (attributes.filterFontSize ?? 16) !== 16}
						onDeselect={() => setAttributes({ filterFontSize: 16 })}
						isShownByDefault
					>
						<FontSizePicker
							__next40pxDefaultSize
							fontSizes={fontSizeOptions}
							value={
								typeof attributes.filterFontSize === "number"
									? attributes.filterFontSize
									: 16
							}
							onChange={(size) => {
								// FontSizePicker should return a number (px). Guard to avoid persisting invalid values.
								const next =
									typeof size === "number" && Number.isFinite(size) ? size : 16;
								setAttributes({ filterFontSize: next });
							}}
						/>
					</ToolsPanelItem>
					<ToolsPanelItem
						label={__("Appearance", "folioblocks")}
						hasValue={() =>
							!!attributes.filterFontWeight ||
							!!attributes.filterFontStyle ||
							(attributes.filterLineHeight != null &&
								attributes.filterLineHeight !== "")
						}
						onDeselect={() =>
							setAttributes({
								filterFontWeight: "",
								filterFontStyle: "",
								filterLineHeight: null,
							})
						}
						isShownByDefault
					>
						<div
							style={{
								display: "flex",
								gap: "12px",
								alignItems: "flex-start",
							}}
						>
							<div style={{ flex: "1 1 0", minWidth: 0 }}>
								<FontAppearanceControl
									label={__("Appearance", "folioblocks")}
									value={{
										fontWeight: attributes.filterFontWeight || undefined,
										fontStyle: attributes.filterFontStyle || undefined,
									}}
									onChange={(next) => {
										setAttributes({
											filterFontWeight: next?.fontWeight || "",
											filterFontStyle: next?.fontStyle || "",
										});
									}}
									__next40pxDefaultSize
									help={__(
										"Select the font’s weight and style (matches WordPress Typography → Appearance).",
										"folioblocks",
									)}
								/>
							</div>

							<div style={{ flex: "1 1 0", minWidth: 0 }}>
								<LineHeightControl
									label={__("Line Height", "folioblocks")}
									value={
										attributes.filterLineHeight == null ||
										attributes.filterLineHeight === ""
											? undefined
											: attributes.filterLineHeight
									}
									__next40pxDefaultSize
									__unstableInputWidth="100px"
									onChange={(value) =>
										setAttributes({ filterLineHeight: value })
									}
								/>
							</div>
						</div>
					</ToolsPanelItem>

					<ToolsPanelItem
						label={__("Typography", "folioblocks")}
						hasValue={() =>
							(attributes.filterLetterSpacing ?? 0) !== 0 ||
							(attributes.filterTextDecoration || "none") !== "none"
						}
						onDeselect={() =>
							setAttributes({
								filterLetterSpacing: 0,
								filterTextDecoration: "none",
							})
						}
						isShownByDefault
					>
						<div
							style={{
								display: "flex",
								gap: "12px",
								alignItems: "flex-start",
							}}
						>
							<div style={{ flex: "1 1 0", minWidth: 0 }}>
								<UnitControl
									label={__("Letter spacing", "folioblocks")}
									value={attributes.filterLetterSpacing}
									onChange={(value) =>
										setAttributes({ filterLetterSpacing: value })
									}
									min={0}
									max={0.2}
									step={0.01}
									__next40pxDefaultSize
								/>
							</div>

							<div style={{ flex: "1 1 0", minWidth: 0 }}>
								<TextDecorationControl
									value={attributes.filterTextDecoration || "none"}
									onChange={(value) =>
										setAttributes({ filterTextDecoration: value })
									}
								/>
							</div>
						</div>
					</ToolsPanelItem>

					<ToolsPanelItem
						label={__("Letter case", "folioblocks")}
						hasValue={() =>
							(attributes.filterTextTransform || "none") !== "none"
						}
						onDeselect={() => setAttributes({ filterTextTransform: "none" })}
						isShownByDefault
					>
						<TextTransformControl
							value={attributes.filterTextTransform || "none"}
							onChange={(value) =>
								setAttributes({ filterTextTransform: value })
							}
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						label={__("Filter Bar Colors", "folioblocks")}
						hasValue={() =>
							!!attributes.activeFilterTextColor ||
							!!attributes.activeFilterBgColor ||
							!!attributes.filterTextColor ||
							!!attributes.filterBgColor
						}
						onDeselect={() => {
							setAttributes({
								activeFilterTextColor: undefined,
								activeFilterBgColor: undefined,
								filterTextColor: undefined,
								filterBgColor: undefined,
							});
							forceRefresh();
						}}
						isShownByDefault
					>
						<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
							<CompactTwoColorControl
								label={__("Active Item Colors", "folioblocks")}
								value={{
									first: attributes.activeFilterTextColor,
									second: attributes.activeFilterBgColor,
								}}
								onChange={(next) => {
									setAttributes({
										activeFilterTextColor: next?.first,
										activeFilterBgColor: next?.second,
									});
									forceRefresh();
								}}
								firstLabel={__("Text", "folioblocks")}
								secondLabel={__("Background", "folioblocks")}
							/>

							<CompactTwoColorControl
								label={__("Inactive Item Colors", "folioblocks")}
								value={{
									first: attributes.filterTextColor,
									second: attributes.filterBgColor,
								}}
								onChange={(next) => {
									setAttributes({
										filterTextColor: next?.first,
										filterBgColor: next?.second,
									});
									forceRefresh();
								}}
								firstLabel={__("Text", "folioblocks")}
								secondLabel={__("Background", "folioblocks")}
							/>
						</div>
					</ToolsPanelItem>
				</ToolsPanel>
			</>
		);
	},
);

addFilter(
  "folioBlocks.justifiedGallery.iconStyleControls",
  "folioblocks/justified-gallery-icon-style-controls",
  (Original, { attributes, setAttributes }) => {
	const enableDownload = !!attributes.enableDownload;
	const enableWooCommerce = !!attributes.enableWooCommerce;

	if (!enableDownload && !enableWooCommerce) return null;

	return (
		<ToolsPanel
		  label={__("E-Commerce Styles", "folioblocks")}
		  resetAll={() =>
			setAttributes({
			  downloadIconColor: "",
			  downloadIconBgColor: "",
			  cartIconColor: "",
			  cartIconBgColor: "",
			})
		  }
		>
		  {enableDownload && (
			<ToolsPanelItem
			  label={__("Download Icon Colors", "folioblocks")}
			  hasValue={() =>
				!!attributes.downloadIconColor || !!attributes.downloadIconBgColor
			  }
			  onDeselect={() =>
				setAttributes({
				  downloadIconColor: "",
				  downloadIconBgColor: "",
				})
			  }
			  isShownByDefault
			>
			  <CompactTwoColorControl
				label={__("Download Icon", "folioblocks")}
				value={{
				  first: attributes.downloadIconColor,
				  second: attributes.downloadIconBgColor,
				}}
				onChange={(next) =>
				  setAttributes({
					downloadIconColor: next?.first || "",
					downloadIconBgColor: next?.second || "",
				  })
				}
				firstLabel={__("Icon", "folioblocks")}
				secondLabel={__("Background", "folioblocks")}
			  />
			</ToolsPanelItem>
		  )}

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
  }
);

addFilter(
	"folioBlocks.justifiedGallery.renderFilterBar",
	"folioblocks/justified-gallery-premium-filter-bar",
	(defaultContent, { attributes, setAttributes }) => {
		const {
			enableFilter = false,
			activeFilter = "All",
			filterCategories = [],
			filterAlign = "center",
		} = attributes;

		if (!enableFilter || !Array.isArray(filterCategories)) {
			return defaultContent;
		}

		const { decorationClass, cssVars } = getFilterTypographyCSS(attributes);

		return (
			<div
				className={`pb-image-gallery-filters align-${filterAlign} ${decorationClass}`}
				style={cssVars}
			>
				{["All", ...filterCategories].map((term) => (
					<button
						key={term}
						className={`filter-button${
							activeFilter === term ? " is-active" : ""
						}`}
						onClick={() => setAttributes({ activeFilter: term })}
						type="button"
					>
						{term}
					</button>
				))}
			</div>
		);
	},
);
