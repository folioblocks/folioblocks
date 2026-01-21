/**
 * Video Gallery Block
 * Premium JS
 **/
import { __ } from '@wordpress/i18n';
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
import { useEffect } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
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
    'folioBlocks.videoGallery.wooCommerceControls',
    'folioblocks/video-gallery-premium-woocommerce',
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
                            setAttributes({
                                wooLightboxInfoType: 'caption',
                                wooProductPriceOnHover: false,
                                wooCartIconDisplay: 'hover'
                            });
                        }
                    }}
                    __nextHasNoMarginBottom
                    help={__('Link gallery videos to WooCommerce products.', 'folioblocks')}
                    disabled={enableDownload}
                />

                {enableWooCommerce && (
                    <SelectControl
                        label={__('Display Add to Cart Icon', 'folioblocks')}
                        value={wooCartIconDisplay}
                        options={[
                            { label: __('On Hover', 'folioblocks'), value: 'hover' },
                            { label: __('Always', 'folioblocks'), value: 'always' }
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
    'folioBlocks.videoGallery.disableRightClickToggle',
    'folioblocks/video-gallery-premium-disable-right-click',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Disable Right-Click on Page', 'folioblocks')}
                help={__('Prevents visitors from right-clicking.', 'folioblocks')}
                __nextHasNoMarginBottom={true}
                checked={!!attributes.disableRightClick}
                onChange={(value) => setAttributes({ disableRightClick: value })}
            />
        );
    }
);
addFilter(
    'folioBlocks.videoGallery.lazyLoadToggle',
    'folioblocks/video-gallery-premium-lazy-load',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Enable Lazy Load of Images', 'folioblocks')}
                help={__('Enables lazy loading of Video Gallery thumbnails.', 'folioblocks')}
                __nextHasNoMarginBottom={true}
                checked={!!attributes.lazyLoad}
                onChange={(value) => setAttributes({ lazyLoad: value })}
            />
        );
    }
);

addFilter(
    'folioBlocks.videoGallery.lightboxLayout',
    'folioblocks/video-gallery-premium-lightbox-layout',
    (defaultContent, props) => {
        const { setAttributes, attributes } = props;
        const { enableWooCommerce } = attributes;

        // Base layout options
        const options = [
            { label: __('Video Only', 'folioblocks'), value: 'video-only' },
            { label: __('Video + Info', 'folioblocks'), value: 'split' },
        ];

        // Add WooCommerce-specific layout option only when WooCommerce is installed and enabled
        if (window.folioBlocksData?.hasWooCommerce && enableWooCommerce) {
            options.push({
                label: __('Video + Product Info', 'folioblocks'),
                value: 'video-product',
            });
        }

        return (
            <SelectControl
                label={__('Lightbox Layout', 'folioblocks')}
                value={attributes.lightboxLayout}
                options={options}
                onChange={(value) => setAttributes({ lightboxLayout: value })}
                __nextHasNoMarginBottom
                __next40pxDefaultSize
            />
        );
    }
);
addFilter(
    'folioBlocks.videoGallery.filterLogic',
    'folioblocks/video-gallery-filter-logic',
    (_, { attributes, setAttributes, selectedBlock }) => {
        const {
            enableFilter = false,
            filterAlign = 'center',
            filtersInput = '',
            activeFilter = 'All',
        } = attributes;

        // Derive categories from filtersInput
        const filterCategories = filtersInput
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        // Sync categories whenever filtersInput changes
        useEffect(() => {
            setAttributes({ filterCategories });
        }, [filtersInput]);

        // Reset activeFilter if selected block is filtered out
        useEffect(() => {
            if (
                selectedBlock &&
                selectedBlock.name === 'folioblocks/pb-video-block'
            ) {
                const selectedCategory = selectedBlock.attributes?.filterCategory || '';
                const isFilteredOut =
                    activeFilter !== 'All' &&
                    selectedCategory.toLowerCase() !== activeFilter.toLowerCase();

                if (isFilteredOut) {
                    setAttributes({ activeFilter: 'All' });
                }
            }
        }, [selectedBlock, activeFilter]);

        // Keep base toggles in sync
        useEffect(() => {
            if (attributes.enableFilter !== enableFilter)
                setAttributes({ enableFilter });
            if (attributes.filterAlign !== filterAlign)
                setAttributes({ filterAlign });
        }, [enableFilter, filterAlign]);

        return null;
    }
);
addFilter(
    'folioBlocks.videoGallery.enableFilterToggle',
    'folioblocks/video-gallery-premium-filter-toggle',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        const { enableFilter, filterAlign, filterCategories } = attributes;

        const handleFilterInputChange = (val) => {
            setAttributes({ filtersInput: val });
        };
        const handleFilterInputBlur = () => {
            const rawFilters = filtersInput.split(',').map((f) => f.trim());
            const cleanFilters = rawFilters.filter(Boolean);
            setAttributes({ filterCategories: cleanFilters });
        };

        return (
            <>
                <ToggleControl
                    label={__('Enable Video Filtering', 'folioblocks')}
                    checked={!!attributes.enableFilter}
                    onChange={(val) => setAttributes({ enableFilter: val })}
                    __nextHasNoMarginBottom={true}
                    help={__('Enable video filtering with categories.', 'folioblocks')}
                />
                {enableFilter && (
                    <>
                        <ToggleGroupControl
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                            value={filterAlign}
                            isBlock
                            label={__('Filter Bar Alignment', 'folioblocks')}
                            help={__('Set alignment of the filter bar.', 'folioblocks')}
                            onChange={(value) => setAttributes({ filterAlign: value })}
                        >
                            <ToggleGroupControlOption label="Left" value="left" />
                            <ToggleGroupControlOption label="Center" value="center" />
                            <ToggleGroupControlOption label="Right" value="right" />
                        </ToggleGroupControl>

                        <TextControl
                            label={__('Filter Categories', 'folioblocks')}
                            value={attributes.filtersInput || ''} // directly use attribute
                            onChange={(val) => {
                                setAttributes({ filtersInput: val });
                                if (val.includes(',')) {
                                    const raw = val.split(',').map((f) => f.trim());
                                    const clean = raw.filter(Boolean);
                                    setAttributes({ filterCategories: clean });
                                }
                            }}
                            onBlur={() => {
                                const raw = (attributes.filtersInput || '').split(',').map((f) => f.trim());
                                const clean = raw.filter(Boolean);
                                setAttributes({ filterCategories: clean });
                            }}
                            help={__('Separate categories with commas')}
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize
                        />
                    </>
                )}
            </>
        );
    }
);


addFilter(
    'folioBlocks.videoGallery.borderColorControl',
    'folioblocks/video-gallery-premium-border-color',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;
        return (
            <CompactColorControl
                label={__("Border Color", "folioblocks")}
                value={attributes.borderColor}
                onChange={(borderColor) => setAttributes({ borderColor })}
                help={__("Set Video block border color.")}
            />
        );
    }
);

addFilter(
    'folioBlocks.videoGallery.borderWidthControl',
    'folioblocks/video-gallery-premium-border-width',
    (defaultContent, props) => {
        const { attributes, setAttributes, clientId, updateBlockAttributes } = props;

        return (
            <RangeControl
                label={__('Border Width', 'folioblocks')}
                value={attributes.borderWidth}
                onChange={(value) => {
                    setAttributes({ borderWidth: value });
                    if (typeof updateBlockAttributes === 'function') {
                        setTimeout(() => {
                            updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
                        }, 50);
                    }
                }}
                min={0}
                max={20}
                __next40pxDefaultSize={true}
                __nextHasNoMarginBottom={true}
                help={__('Set Video block border width.', 'folioblocks')}
            />
        );
    }
);

addFilter(
    'folioBlocks.videoGallery.borderRadiusControl',
    'folioblocks/video-gallery-premium-border-radius',
    (defaultContent, props) => {
        const { attributes, setAttributes, clientId, updateBlockAttributes } = props;

        return (
            <RangeControl
                label={__('Border Radius', 'folioblocks')}
                value={attributes.borderRadius}
                onChange={(value) => {
                    setAttributes({ borderRadius: value });
                    if (typeof updateBlockAttributes === 'function') {
                        setTimeout(() => {
                            updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
                        }, 50);
                    }
                }}
                min={0}
                max={50}
                __next40pxDefaultSize={true}
                __nextHasNoMarginBottom={true}
                help={__('Set Video block border radius.', 'folioblocks')}
            />
        );
    }
);

addFilter(
    'folioBlocks.videoGallery.dropShadowToggle',
    'folioblocks/video-gallery-premium-drop-shadow',
    (defaultContent, props) => {
        const { attributes, setAttributes } = props;

        return (
            <ToggleControl
                label={__('Enable Drop Shadow', 'folioblocks')}
                checked={!!attributes.dropShadow}
                onChange={(newDropShadow) => setAttributes({ dropShadow: newDropShadow })}
                __nextHasNoMarginBottom={true}
                help={__('Applies a subtle drop shadow.', 'folioblocks')}
            />
        );
    }
);

addFilter(
    'folioBlocks.videoGallery.filterStylesControls',
    'folioblocks/video-gallery-premium-filter-styles-controls',
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
    'folioBlocks.videoGallery.renderFilterBar',
    'folioblocks/video-gallery-premium-render-filter-bar',
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
				className={`pb-video-gallery-filters align-${filterAlign} ${decorationClass}`}
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

addFilter(
	"folioBlocks.videoGallery.iconStyleControls",
	"folioblocks/video-gallery-icon-style-controls",
	(_, { attributes, setAttributes }) => {
		const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
		if (!wooActive) return null;

		const enableWooCommerce = !!attributes.enableWooCommerce;
		if (!enableWooCommerce) return null;

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