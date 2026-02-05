/**
 * PB Image Block
 * Edit JS
 **/
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	InspectorControls,
	MediaPlaceholder,
	BlockControls,
	MediaUpload,
} from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";
import {
	PanelBody,
	Notice,
	ToggleControl,
	TextareaControl,
	TextControl,
	ToolbarGroup,
	ToolbarButton,
	Button,
	SelectControl,
} from "@wordpress/components";
import { useRef, useEffect } from "@wordpress/element";
import { stack } from "@wordpress/icons";
import { applyFilters } from "@wordpress/hooks";
import IconImageBlock from "../pb-helpers/IconImageBlock";
import "./editor.scss";

export default function Edit({ attributes, setAttributes, context, clientId }) {
	const {
		id,
		src,
		sizes,
		alt,
		title,
		caption,
		width,
		height,
		enableLightbox,
		showCaptionInLightbox,
		dropShadow,
		enableDownload,
		downloadOnHover,
		preview,
		downloadIconColor,
		downloadIconBgColor,
		cartIconColor,
		cartIconBgColor,
	} = attributes;

	// Block Preview Image
	if (preview) {
		return (
			<div className="pb-block-preview">
				<IconImageBlock />
			</div>
		);
	}

	// Back-compat normalization: unify enableLightbox vs lightbox; showCaptionInLightbox vs lightboxCaption
	const lightbox = (attributes.lightbox ?? enableLightbox) || false;
	const lightboxCaption =
		(attributes.lightboxCaption ?? showCaptionInLightbox) || false;

	const {
		"folioBlocks/enableDownload": contextEnableDownload = enableDownload,
		"folioBlocks/downloadOnHover": contextDownloadOnHover = downloadOnHover,
		"folioBlocks/wooDefaultLinkAction": contextWooDefaultLinkAction,
		"folioBlocks/downloadIconColor": contextDownloadIconColor,
		"folioBlocks/downloadIconBgColor": contextDownloadIconBgColor,
		"folioBlocks/cartIconColor": contextCartIconColor,
		"folioBlocks/cartIconBgColor": contextCartIconBgColor,
	} = context || {};

	const checkoutUrl =
		window.folioBlocksData?.checkoutUrl ||
		"https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks&utm_medium=image-block&utm_campaign=upgrade";
	const isInsideGallery = Object.keys(context || {}).some((key) =>
		key.startsWith("folioBlocks/"),
	);
	const imageSizeAttr = attributes.imageSize || "large";
	const effectiveResolution = isInsideGallery
		? context["folioBlocks/resolution"] || imageSizeAttr
		: imageSizeAttr;

	const imageStyle = {
		borderColor: isInsideGallery
			? context["folioBlocks/borderColor"] || "#ffffff"
			: attributes.borderColor || "#ffffff",
		borderWidth: isInsideGallery
			? `${context["folioBlocks/borderWidth"] || 0}px`
			: attributes.borderWidth
			? `${attributes.borderWidth}px`
			: undefined,
		borderStyle: (
			isInsideGallery
				? context["folioBlocks/borderWidth"]
				: attributes.borderWidth
		)
			? "solid"
			: undefined,
		borderRadius: isInsideGallery
			? `${context["folioBlocks/borderRadius"] || 0}px`
			: attributes.borderRadius
			? `${attributes.borderRadius}px`
			: undefined,
	};
	const captionStyle = {
		borderColor: isInsideGallery
			? context["folioBlocks/borderColor"] || "#ffffff"
			: attributes.borderColor || "#ffffff",
		borderWidth: isInsideGallery
			? `${context["folioBlocks/borderWidth"] || 0}px`
			: attributes.borderWidth
			? `${attributes.borderWidth}px`
			: undefined,
		borderStyle: (
			isInsideGallery
				? context["folioBlocks/borderWidth"]
				: attributes.borderWidth
		)
			? "solid"
			: undefined,
		borderRadius: isInsideGallery
			? `${context["folioBlocks/borderRadius"] || 0}px`
			: attributes.borderRadius
			? `${attributes.borderRadius}px`
			: undefined,
	};

	const effectiveDropShadow = isInsideGallery
		? context["folioBlocks/dropShadow"]
		: dropShadow;

	const ctxHoverStyle = context?.["folioBlocks/onHoverStyle"];
	const effectiveOnHoverStyle =
		ctxHoverStyle ?? attributes.onHoverStyle ?? "fade-overlay";
	const overlayBgColor = isInsideGallery
		? context?.["folioBlocks/overlayBgColor"] ?? ""
		: attributes.overlayBgColor ?? "";
	const overlayTextColor = isInsideGallery
		? context?.["folioBlocks/overlayTextColor"] ?? ""
		: attributes.overlayTextColor ?? "";
	const effectiveHoverTitle = isInsideGallery
		? context["folioBlocks/onHoverTitle"] ?? false
		: attributes.showTitleOnHover ??
		  attributes.hoverTitle ??
		  attributes.onHoverTitle ??
		  false;

	// Compute overlay state and matching CSS class for the chosen variant
	const overlayEnabled =
		(context?.["folioBlocks/onHoverTitle"] ??
			attributes.onHoverTitle ??
			effectiveHoverTitle) === true;

	const hoverClassMap = {
		"blur-overlay": "pb-hover-blur-overlay",
		"fade-overlay": "pb-hover-fade-overlay",
		"gradient-bottom": "pb-hover-gradient-bottom",
		chip: "pb-hover-chip",
		"color-overlay": "pb-hover-color-overlay",
	};
	const hoverVariantClass =
		hoverClassMap[effectiveOnHoverStyle] || "pb-hover-fade-overlay";
	const overlayStyleVars =
		effectiveOnHoverStyle === "color-overlay"
			? {
					...(overlayBgColor ? { "--pb-overlay-bg": overlayBgColor } : {}),
					...(overlayTextColor
						? { "--pb-overlay-color": overlayTextColor }
						: {}),
			  }
			: {};

	const effectiveDownloadEnabled = isInsideGallery
		? contextEnableDownload
		: enableDownload;
	const effectiveDownloadOnHover = isInsideGallery
		? contextDownloadOnHover
		: downloadOnHover;

	// Icon colors (gallery context wins when inside a gallery; attributes used when standalone)
	const effectiveDownloadIconColor = isInsideGallery
		? contextDownloadIconColor ?? ""
		: downloadIconColor ?? "";
	const effectiveDownloadIconBgColor = isInsideGallery
		? contextDownloadIconBgColor ?? ""
		: downloadIconBgColor ?? "";
	const effectiveCartIconColor = isInsideGallery
		? contextCartIconColor ?? ""
		: cartIconColor ?? "";
	const effectiveCartIconBgColor = isInsideGallery
		? contextCartIconBgColor ?? ""
		: cartIconBgColor ?? "";

	// CSS variables for icon/button styling (used by the button render filters)
	const downloadIconStyleVars = {
		...(effectiveDownloadIconColor
			? { "--pb-download-icon-color": effectiveDownloadIconColor }
			: {}),
		...(effectiveDownloadIconBgColor
			? { "--pb-download-icon-bg": effectiveDownloadIconBgColor }
			: {}),
	};
	const cartIconStyleVars = {
		...(effectiveCartIconColor
			? { "--pb-cart-icon-color": effectiveCartIconColor }
			: {}),
		...(effectiveCartIconBgColor
			? { "--pb-cart-icon-bg": effectiveCartIconBgColor }
			: {}),
	};

	// WooCommerce state (context when inside a gallery, runtime when standalone)
	const hasWooCommerce =
		context?.["folioBlocks/hasWooCommerce"] ??
		window.folioBlocksData?.hasWooCommerce ??
		false;
	const enableWooCommerce =
		context?.["folioBlocks/enableWooCommerce"] ??
		!!attributes.enableWooCommerce;
	const effectiveWooActive = hasWooCommerce && enableWooCommerce;
	// Alias used by premium controls (keep naming consistent with other galleries)
	const effectiveEnableWoo = effectiveWooActive;

	// Runtime override: keep hasWooCommerce attribute synced to environment (without mutating other Woo settings)
	useEffect(() => {
		const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
		if (wooActive !== attributes.hasWooCommerce) {
			setAttributes({ hasWooCommerce: wooActive });
		}
	}, [window.folioBlocksData?.hasWooCommerce]);
	// Show panel if (A) we're standalone (so Download + Woo controls can render)
	// OR (B) Woo is effectively active (so the product link control can render)
	const showECommercePanel = !isInsideGallery || !!effectiveWooActive;

	// Migrate legacy keys to new ones (non-destructive, only when new keys are undefined)
	useEffect(() => {
		if (enableLightbox !== undefined && attributes.lightbox === undefined) {
			setAttributes({ lightbox: !!enableLightbox });
		}
	}, [enableLightbox]);

	useEffect(() => {
		if (
			showCaptionInLightbox !== undefined &&
			attributes.lightboxCaption === undefined
		) {
			setAttributes({ lightboxCaption: !!showCaptionInLightbox });
		}
	}, [showCaptionInLightbox]);

	const filterCategories = context["folioBlocks/filterCategories"] || [];
	const activeFilter = context?.["folioBlocks/activeFilter"] || "All";
	const filterCategory = attributes.filterCategory || "";
	const isHidden =
		activeFilter !== "All" &&
		(!filterCategory ||
			filterCategory.toLowerCase() !== activeFilter.toLowerCase());

	const carouselHeight = context["folioBlocks/carouselHeight"] || 400;
	const displayHeight = carouselHeight;

	const blockProps = useBlockProps({
		className: isHidden ? "is-hidden" : undefined,
	});
	const baseFigureStyle = { ...imageStyle, ...overlayStyleVars };
	const figureStyle = context["folioBlocks/inCarousel"]
		? { ...baseFigureStyle, height: `${displayHeight}px` }
		: baseFigureStyle;

	// Detect: in Image Row, Image Stack, or Masonry Gallery
	const { isInImageRow, isInImageStack, isInMasonryGallery } = useSelect(
		(select) => {
			const { getBlockParents, getBlockName } = select("core/block-editor");
			const parents = getBlockParents(clientId, true) || [];
			const names = parents.map((id) => getBlockName(id));
			return {
				isInImageRow: names.includes("folioblocks/pb-image-row"),
				isInImageStack: names.includes("folioblocks/pb-image-stack"),
				isInMasonryGallery: names.includes("folioblocks/masonry-gallery-block"),
			};
		},
		[clientId],
	);

	useEffect(() => {
		if (!sizes) return;
		const nextUrl = sizes[effectiveResolution]?.url;
		if (nextUrl && nextUrl !== src) {
			setAttributes({ src: nextUrl });
		}
	}, [effectiveResolution, sizes, src, setAttributes]);

	const onSelectImage = (media) => {
		if (!media?.id) return;

		const fullSize = media.sizes?.full || {};
		const width = fullSize.width || media.width || 0;
		const height = fullSize.height || media.height || 0;

		setAttributes({
			id: media.id,
			src: media.url || media.source_url || "",
			alt: media.alt || "",
			title: media.title || "",
			caption: media.caption || "",
			width,
			height,
			sizes: media.sizes || {},
		});
	};

	const selectedSrc = sizes?.[effectiveResolution]?.url || src || "";

	return (
		<>
			<BlockControls>
				{src && (
					<ToolbarGroup>
						<MediaUpload
							onSelect={onSelectImage}
							allowedTypes={["image"]}
							value={id}
							render={({ open }) => (
								<ToolbarButton
									icon={IconImageBlock}
									label={__("Replace Image", "folioblocks")}
									onClick={open}
								>
									{__("Change Image", "folioblocks")}
								</ToolbarButton>
							)}
						/>
					</ToolbarGroup>
				)}
				{isInImageRow && !isInImageStack && (
					<ToolbarGroup>
						<ToolbarButton
							icon={stack}
							onClick={() => {
								window.dispatchEvent(
									new CustomEvent("folioblocks:add-to-image-stack", {
										detail: { clientId },
									}),
								);
							}}
							label={__("Add to Image Stack", "folioblocks")}
						>
							{__("Add to Image Stack", "folioblocks")}
						</ToolbarButton>
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={__("Image Block Settings", "folioblocks")}
					initialOpen={true}
				>
					{id && src && (
						<div style={{ marginBottom: "15px" }}>
							<div className="pb-imgage-block-thumbnail-preview">
								<img src={selectedSrc} alt={title || ""} />
							</div>
							<MediaUpload
								onSelect={onSelectImage}
								allowedTypes={["image"]}
								value={id}
								render={({ open }) => (
									<div
										style={{
											display: "flex",
											justifyContent: "center",
											marginTop: "8px",
										}}
									>
										<Button onClick={open} variant="secondary">
											{__("Change Image", "folioblocks")}
										</Button>
									</div>
								)}
							/>
						</div>
					)}
					{!isInsideGallery && (
						<SelectControl
							label={__("Resolution", "folioblocks")}
							value={attributes.imageSize || "large"}
							options={[
								{ label: __("Thumbnail", "folioblocks"), value: "thumbnail" },
								{ label: __("Medium", "folioblocks"), value: "medium" },
								{ label: __("Large", "folioblocks"), value: "large" },
								{ label: __("Full", "folioblocks"), value: "full" },
							].filter((option) => {
								const available = sizes ? Object.keys(sizes) : [];
								return (
									available.includes(option.value) || option.value === "full"
								);
							})}
							onChange={(newSize) => {
								setAttributes({ imageSize: newSize });
								const nextUrl = sizes?.[newSize]?.url;
								if (nextUrl && nextUrl !== src) {
									setAttributes({ src: nextUrl });
								}
							}}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							help={__("Select the size of the source image.")}
						/>
					)}
					<TextareaControl
						label={__("Image Caption", "folioblocks")}
						value={caption}
						onChange={(value) => setAttributes({ caption: value })}
						help={__("Add image caption.")}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<TextControl
						label={__("Image Title", "folioblocks")}
						value={title}
						onChange={(value) => setAttributes({ title: value })}
						help={__("Describe the role of this image on the page.")}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<TextControl
						label={__("Alternative Text", "folioblocks")}
						value={alt}
						onChange={(value) => setAttributes({ alt: value })}
						help={__(
							"Describe the purpose of the image. Leave empty if decorative.",
						)}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
				</PanelBody>
				{!isInsideGallery && (
					<>
						<PanelBody
							title={__("Lightbox & Hover Settings", "folioblocks")}
							initialOpen={true}
						>
							{applyFilters(
								"folioBlocks.imageBlock.lightboxControls",
								<>
									<ToggleControl
										label={__("Enable Lightbox", "folioblocks")}
										checked={!!lightbox}
										onChange={(newLightbox) =>
											setAttributes({
												lightbox: newLightbox,
												enableLightbox: newLightbox,
											})
										}
										__nextHasNoMarginBottom
										help={__(
											"Open images in a lightbox when clicked.",
											"folioblocks",
										)}
									/>
								</>,
								{ attributes, setAttributes },
							)}
							{applyFilters(
								"folioBlocks.imageBlock.onHoverTitleToggle",
								<div style={{ marginBottom: "8px" }}>
									<Notice status="info" isDismissible={false}>
										<strong>
											{__("Show Image Title on Hover", "folioblocks")}
										</strong>
										<br />
										{__(
											"This is a premium feature. Unlock all features: ",
											"folioblocks",
										)}
										<a
											href={checkoutUrl}
											target="_blank"
											rel="noopener noreferrer"
										>
											{__("Upgrade to Pro", "folioblocks")}
										</a>
									</Notice>
								</div>,
								{ attributes, setAttributes },
							)}
						</PanelBody>
					</>
				)}
				{applyFilters("folioBlocks.imageBlock.filterCategoryControl", null, {
					attributes,
					setAttributes,
					filterCategories,
					context,
					isInsideGallery,
				})}

				{showECommercePanel && (
					<PanelBody
						title={__("E-Commerce Settings", "folioblocks")}
						initialOpen={true}
					>
						{!isInsideGallery && (
							<>
								{applyFilters(
									"folioBlocks.imageBlock.downloadControls",
									<div style={{ marginBottom: "8px" }}>
										<Notice status="info" isDismissible={false}>
											<strong>
												{__("Enable Image Downloads", "folioblocks")}
											</strong>
											<br />
											{__(
												"This is a premium feature. Unlock all features: ",
												"folioblocks",
											)}
											<a
												href={checkoutUrl}
												target="_blank"
												rel="noopener noreferrer"
											>
												{__("Upgrade to Pro", "folioblocks")}
											</a>
										</Notice>
									</div>,
									{
										attributes,
										setAttributes,
										hasWooCommerce,
										effectiveEnableWoo,
									},
								)}

								{window.folioBlocksData?.hasWooCommerce &&
									applyFilters(
										"folioBlocks.imageBlock.wooCommerceControls",
										<div style={{ marginBottom: "8px" }}>
											<Notice status="info" isDismissible={false}>
												<strong>
													{__("Enable Woo Commerce", "folioblocks")}
												</strong>
												<br />
												{__(
													"This is a premium feature. Unlock all features: ",
													"folioblocks",
												)}
												<a
													href={checkoutUrl}
													target="_blank"
													rel="noopener noreferrer"
												>
													{__("Upgrade to Pro", "folioblocks")}
												</a>
											</Notice>
										</div>,
										{
											attributes,
											setAttributes,
											hasWooCommerce,
											effectiveEnableWoo,
										},
									)}
							</>
						)}

						{applyFilters(
							"folioBlocks.imageBlock.wooProductLinkControl",
							null,
							{
								attributes,
								setAttributes,
								effectiveWooActive,
								isInsideGallery,
								contextWooDefaultLinkAction,
							},
						)}
					</PanelBody>
				)}
			</InspectorControls>
			{!isInsideGallery && (
				<InspectorControls group="advanced">
					{applyFilters(
						"folioBlocks.imageBlock.disableRightClickToggle",
						<div style={{ marginBottom: "8px" }}>
							<Notice status="info" isDismissible={false}>
								<strong>{__("Disable Right-Click", "folioblocks")}</strong>
								<br />
								{__(
									"This is a premium feature. Unlock all features: ",
									"folioblocks",
								)}
								<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
									{__("Upgrade to Pro", "folioblocks")}
								</a>
							</Notice>
						</div>,
						{ attributes, setAttributes },
					)}
					{applyFilters(
						"folioBlocks.imageBlock.lazyLoadToggle",
						<div style={{ marginBottom: "8px" }}>
							<Notice status="info" isDismissible={false}>
								<strong>
									{__("Enable Lazy Load of Images", "folioblocks")}
								</strong>
								<br />
								{__(
									"This is a premium feature. Unlock all features: ",
									"folioblocks",
								)}
								<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
									{__("Upgrade to Pro", "folioblocks")}
								</a>
							</Notice>
						</div>,
						{ attributes, setAttributes },
					)}
				</InspectorControls>
			)}
			<InspectorControls group="styles">
				{applyFilters("folioBlocks.imageBlock.styleControls", null, {
					attributes,
					setAttributes,
					isInsideGallery,
				})}
				{applyFilters("folioBlocks.imageBlock.iconStyleControls", null, {
					attributes,
					setAttributes,
					isInsideGallery,
					context,
				})}
			</InspectorControls>
			{isInMasonryGallery ? (
				<div className="pb-image-block-wrapper">
					<div {...blockProps}>
						<figure
							className={[
								"pb-image-block",
							overlayEnabled ? hoverVariantClass : "",
							effectiveDropShadow ? "dropshadow" : "",
							effectiveDownloadEnabled ? "has-download" : "",
						]
							.filter(Boolean)
							.join(" ")}
							style={figureStyle}
						>
							{!src ? (
								<MediaPlaceholder
									icon={<IconImageBlock />}
									labels={{ title: __("Select Image", "folioblocks") }}
									onSelect={onSelectImage}
									allowedTypes={["image"]}
									multiple={false}
								/>
							) : (
								<>
									<img
										src={selectedSrc}
										alt={alt}
										width={width}
										height={height}
										className="pb-image-block-img"
									/>
									{effectiveHoverTitle &&
										(Number(attributes.wooProductId) > 0 ||
											(title && title.trim() !== "")) && (
											<div className="pb-image-block-title-container">
												<figcaption className="pb-image-block-title">
													{(() => {
														const hoverContent = applyFilters(
															"folioBlocks.imageBlock.hoverOverlayContent",
															null,
															{
																attributes,
																setAttributes,
																effectiveWooActive,
																context,
																title,
															},
														);
														return hoverContent || title;
													})()}
												</figcaption>
											</div>
										)}
									{applyFilters("folioBlocks.imageBlock.downloadButton", null, {
										attributes,
										setAttributes,
										effectiveDownloadEnabled,
										effectiveDownloadOnHover,
										sizes,
										src,
										context,
										isInsideGallery,
										downloadIconStyleVars,
										effectiveDownloadIconColor,
										effectiveDownloadIconBgColor,
									})}
									{applyFilters(
										"folioBlocks.imageBlock.addToCartButton",
										null,
										{
											attributes,
											setAttributes,
											effectiveWooActive,
											context,
											isInsideGallery,
											cartIconStyleVars,
											effectiveCartIconColor,
											effectiveCartIconBgColor,
										},
									)}
								</>
							)}
						</figure>
					</div>
				</div>
			) : (
				<div {...blockProps}>
					<figure
						className={[
							"pb-image-block",
							overlayEnabled ? hoverVariantClass : "",
							effectiveDropShadow ? "dropshadow" : "",
							effectiveDownloadEnabled ? "has-download" : "",
						]
							.filter(Boolean)
							.join(" ")}
						style={figureStyle}
					>
						{!src ? (
							<MediaPlaceholder
								icon={<IconImageBlock />}
								labels={{ title: __("Select Image", "folioblocks") }}
								onSelect={onSelectImage}
								allowedTypes={["image"]}
								multiple={false}
							/>
						) : (
							<>
								<img
									src={selectedSrc}
									alt={alt}
									width={width}
									height={height}
									className="pb-image-block-img"
								/>
								{effectiveHoverTitle &&
									(Number(attributes.wooProductId) > 0 ||
										(title && title.trim() !== "")) && (
										<div className="pb-image-block-title-container">
											<figcaption className="pb-image-block-title">
												{(() => {
													const hoverContent = applyFilters(
														"folioBlocks.imageBlock.hoverOverlayContent",
														null,
														{
															attributes,
															setAttributes,
															effectiveWooActive,
															context,
															title,
														},
													);
													return hoverContent || title;
												})()}
											</figcaption>
										</div>
									)}
								{applyFilters("folioBlocks.imageBlock.downloadButton", null, {
									attributes,
									setAttributes,
									effectiveDownloadEnabled,
									effectiveDownloadOnHover,
									sizes,
									src,
									context,
									isInsideGallery,
									downloadIconStyleVars,
									effectiveDownloadIconColor,
									effectiveDownloadIconBgColor,
								})}
								{applyFilters("folioBlocks.imageBlock.addToCartButton", null, {
									attributes,
									setAttributes,
									effectiveWooActive,
									context,
									isInsideGallery,
									cartIconStyleVars,
									effectiveCartIconColor,
									effectiveCartIconBgColor,
								})}
							</>
						)}
					</figure>
				</div>
			)}
		</>
	);
}
