/**
 * Video Gallery Block
 * Edit JS
 */
import { __ } from "@wordpress/i18n";
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
	store as blockEditorStore,
	MediaPlaceholder,
} from "@wordpress/block-editor";
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	ToolbarButton,
	Modal,
} from "@wordpress/components";
import {
	subscribe,
	select,
	dispatch,
	useDispatch,
	useSelect,
} from "@wordpress/data";
import { useState, useEffect } from "@wordpress/element";
import { applyFilters } from "@wordpress/hooks";
import { plus } from "@wordpress/icons";
import ResponsiveRangeControl from "../pb-helpers/ResponsiveRangeControl";
import { IconVideoGallery } from "../pb-helpers/icons";
import {
	FBKS_ALL_FILTER_TOKEN,
	fbksNormalizeActiveFilterValue,
} from "../pb-helpers/filterConstants";
import { isValidHttpUrl } from "../pb-helpers/urlValidation";
import ProFeatureNotice from "../pb-helpers/ProFeatureNotice";
import { resolveGalleryGaps } from "../pb-helpers/galleryGap";
import "./editor.scss";

const getOverlayContent = (titleVisibility, playButtonVisibility, showCategory) => {
	const showTitle = titleVisibility !== "hidden";
	const showPlayButton = playButtonVisibility !== "hidden";

	if (showCategory && showTitle && showPlayButton) {
		return "title-play-category";
	}
	if (showTitle && showPlayButton) {
		return "title-play";
	}
	if (showTitle) {
		return "title";
	}
	if (showPlayButton) {
		return "play";
	}
	return "none";
};

const getOverlayVisibility = (titleVisibility, playButtonVisibility) =>
	titleVisibility === "always" || playButtonVisibility === "always"
		? "always"
		: "onHover";

const getOverlayContentAttributes = (content, visibility) => ({
	titleVisibility:
		content === "title" ||
			content === "title-play" ||
			content === "title-play-category"
			? visibility
			: "hidden",
	playButtonVisibility:
		content === "play" ||
			content === "title-play" ||
			content === "title-play-category"
			? visibility
			: "hidden",
	showFilterCategory: content === "title-play-category",
});

export default function Edit({ attributes, setAttributes, clientId }) {
	/**
	 * Attribute Destructuring
	 */
	const {
		columns,
		tabletColumns,
		mobileColumns,
		lightbox,
		lightboxTheme,
		lightboxLayout,
		lazyLoad,
		aspectRatio,
		thumbnailSize,
		playButtonVisibility,
		titleVisibility,
		showFilterCategory,
		overlayStyle,
		overlayBgColor,
		overlayTextColor,
		filterCategories,
		enableFilter,
		activeFilter = FBKS_ALL_FILTER_TOKEN,
		filterTextColor,
		filterBgColor,
		activeFilterTextColor,
		activeFilterBgColor,
		preview,
		enableWooCommerce,
		wooCartIconDisplay,
		wooDefaultLinkAction,
	} = attributes;
	const responsiveGaps = resolveGalleryGaps(attributes);
	const overlayContent = getOverlayContent(
		titleVisibility,
		playButtonVisibility,
		showFilterCategory,
	);
	const overlayVisibility = getOverlayVisibility(
		titleVisibility,
		playButtonVisibility,
	);

	// Block Preview Image
	if (preview) {
		return (
			<div className="pb-block-preview">
				<IconVideoGallery />
			</div>
		);
	}

	/**
	 * State & Effects
	 */

	// Local state for filter input field

	const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
	const validateVideoUrl = (url) => {
		const trimmedUrl = typeof url === "string" ? url.trim() : "";
		if (isValidHttpUrl(trimmedUrl)) {
			return trimmedUrl;
		}
		return "";
	};

	// Selected block in the editor
	const selectedBlock = useSelect((select) => {
		const { getSelectedBlock } = select(blockEditorStore);
		return getSelectedBlock();
	}, []);
	applyFilters("folioBlocks.videoGallery.filterLogic", null, {
		clientId,
		attributes,
		setAttributes,
		selectedBlock,
	});

	const normalizedActiveFilter = fbksNormalizeActiveFilterValue(activeFilter);

	// Force layout update in editor after filtering to fix rendering issues
	useEffect(() => {
		if (wp?.data?.select("core/block-editor").isBlockSelected(clientId)) {
			const container = document.querySelector(
				`[data-block="${clientId}"] .pb-video-gallery`,
			);
			if (container) {
				container.style.display = "none";
				requestAnimationFrame(() => {
					container.style.display = "";
				});
			}
		}
	}, [activeFilter, clientId]);

	// Handler to add first video via MediaPlaceholder
	const { replaceInnerBlocks, insertBlock } = useDispatch("core/block-editor");
	const handleVideoSelect = (media) => {
		if (!media || !media.url) {
			return;
		}
		const defaultTitle =
			media.title && media.title.trim() !== ""
				? media.title
				: __("Video", "folioblocks");
		const newBlock = wp.blocks.createBlock("folioblocks/pb-video-block", {
			videoUrl: media.url,
			title: defaultTitle,
			alt: defaultTitle,
		});
		replaceInnerBlocks(clientId, [newBlock], false);
	};

	/**
	 * Context
	 */
	const blockProps = useBlockProps({
		context: {
			"folioBlocks/aspectRatio": aspectRatio,
			"folioBlocks/playButtonVisibility": playButtonVisibility,
			"folioBlocks/titleVisibility": titleVisibility,
			"folioBlocks/showFilterCategory": showFilterCategory,
			"folioBlocks/overlayStyle": overlayStyle,
			"folioBlocks/overlayBgColor": overlayBgColor,
			"folioBlocks/overlayTextColor": overlayTextColor,
			"folioBlocks/filterCategories": filterCategories,
			"folioBlocks/enableFilter": enableFilter,
			"folioBlocks/activeFilter": normalizedActiveFilter,
			"folioBlocks/lightbox": lightbox,
			"folioBlocks/lightboxTheme": lightboxTheme,
			"folioBlocks/lightboxLayout": lightboxLayout,
			"folioBlocks/lazyLoad": lazyLoad,
			"folioBlocks/enableWooCommerce": enableWooCommerce,
			"folioBlocks/wooCartIconDisplay": wooCartIconDisplay,
			"folioBlocks/wooDefaultLinkAction": wooDefaultLinkAction,
		},
		style: {
			"--pb--filter-text-color": filterTextColor || "#000",
			"--pb--filter-bg-color": filterBgColor || "transparent",
			"--pb--filter-active-text": activeFilterTextColor || "#fff",
			"--pb--filter-active-bg": activeFilterBgColor || "#000",
			"--pb-gallery-gap-desktop": `${responsiveGaps.gap}px`,
			"--pb-gallery-gap-tablet": `${responsiveGaps.tabletGap}px`,
			"--pb-gallery-gap-mobile": `${responsiveGaps.mobileGap}px`,
		},
	});

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: `pb-video-gallery cols-d-${columns} cols-t-${tabletColumns} cols-m-${mobileColumns}`,
			style: { "--gap": `${responsiveGaps.gap}px` },
		},
		{
			allowedBlocks: ["folioblocks/pb-video-block"],
			orientation: "horizontal",
			templateLock: false,
			context: {
				"folioBlocks/aspectRatio": aspectRatio,
				"folioBlocks/playButtonVisibility": playButtonVisibility,
				"folioBlocks/titleVisibility": titleVisibility,
				"folioBlocks/showFilterCategory": showFilterCategory,
				"folioBlocks/overlayStyle": overlayStyle,
				"folioBlocks/overlayBgColor": overlayBgColor,
				"folioBlocks/overlayTextColor": overlayTextColor,
				"folioBlocks/filterCategories": filterCategories,
				"folioBlocks/enableFilter": enableFilter,
				"folioBlocks/activeFilter": normalizedActiveFilter,
				"folioBlocks/lightbox": lightbox,
				"folioBlocks/lightboxTheme": lightboxTheme,
				"folioBlocks/lightboxLayout": lightboxLayout,
				"folioBlocks/lazyLoad": lazyLoad,
				"folioBlocks/enableWooCommerce": enableWooCommerce,
				"folioBlocks/wooCartIconDisplay": wooCartIconDisplay,
				"folioBlocks/wooDefaultLinkAction": wooDefaultLinkAction,
			},
		},
	);

	/**
	 * Derived / Effective Values
	 */
	const imageSizeOptions = wp.data
		.select("core/block-editor")
		.getSettings()
		.imageSizes.map((size) => ({
			label: size.name,
			value: size.slug,
		}))
		.sort((a, b) => {
			const order = ["thumbnail", "medium", "large", "full"];
			const indexA = order.indexOf(a.value);
			const indexB = order.indexOf(b.value);
			if (indexA === -1 && indexB === -1) {
				return 0;
			}
			if (indexA === -1) {
				return 1;
			}
			if (indexB === -1) {
				return -1;
			}
			return indexA - indexB;
		});

	// Handler to add a new video block inside the gallery
	const addVideoBlock = () => {
		setIsVideoModalOpen(true);
	};

	const filterStylesControls = applyFilters(
		"folioBlocks.videoGallery.filterStyleSettings",
		<PanelBody
			title={__("Gallery Filtering Styles", "folioblocks")}
			initialOpen={true}
		>
			<ProFeatureNotice
				title={__("Gallery Filtering Styles", "folioblocks")}
				description={__(
					"Match the filter bar to the design of your site.",
					"folioblocks",
				)}
				features={[
					__("Customize filter text and background colors.", "folioblocks"),
					__("Style the active filtering category.", "folioblocks"),
					__("Control filter-bar typography.", "folioblocks"),
				]}
				campaign="video-gallery-filter-styles"
			/>
		</PanelBody>,
		{ attributes, setAttributes },
	);

	/**
	 * Render
	 */
	// If no videos yet, show MediaPlaceholder
	const innerBlocks = useSelect(
		(select) =>
			select("core/block-editor").getBlock(clientId)?.innerBlocks || [],
		[clientId],
	);

	if (innerBlocks.length === 0) {
		const isPro = !!window.folioBlocksData?.isPro;
		return (
			<div {...blockProps}>
				<MediaPlaceholder
					icon={<IconVideoGallery />}
					labels={{
						title: __("Video Gallery", "folioblocks"),
						instructions: __(
							"Add first video. Upload, select from media library, or insert from URL.",
							"folioblocks",
						),
					}}
					allowedTypes={["video"]}
					onSelect={(media) => {
						handleVideoSelect(media);
					}}
					onSelectURL={(url) => {
						const validUrl = validateVideoUrl(url);
						if (!validUrl) {
							return;
						}

						const defaultTitle = __("Video", "folioblocks");
						const newBlock = wp.blocks.createBlock(
							"folioblocks/pb-video-block",
							{
								videoUrl: validUrl,
								title: defaultTitle,
								alt: defaultTitle,
							},
						);

						// Use replaceInnerBlocks instead of insertBlock to handle empty galleries
						wp.data
							.dispatch("core/block-editor")
							.replaceInnerBlocks(clientId, [newBlock], false);
					}}
					accept="video/*"
					multiple={false}
				/>
			</div>
		);
	}

	return (
		<>
			<BlockControls>
				<ToolbarButton
					icon={plus}
					label={__("Add Videos", "folioblocks")}
					onClick={addVideoBlock}
				>
					{__("Add Videos", "folioblocks")}
				</ToolbarButton>
			</BlockControls>
			{isVideoModalOpen && (
				<Modal
					title={__("Select or Insert Video", "folioblocks")}
					onRequestClose={() => setIsVideoModalOpen(false)}
				>
					<MediaPlaceholder
						labels={{
							title: __("Select or Insert Video", "folioblocks"),
							instructions: __(
								"Upload, select from media library, or insert from URL.",
								"folioblocks",
							),
						}}
						allowedTypes={["video"]}
						accept="video/*"
						multiple={false}
						onSelect={(media) => {
							const defaultTitle =
								media.title && media.title.trim() !== ""
									? media.title
									: __("Video", "folioblocks");
							const newBlock = wp.blocks.createBlock(
								"folioblocks/pb-video-block",
								{
									videoUrl: media.url,
									title: defaultTitle,
									alt: defaultTitle,
								},
							);
							wp.data
								.dispatch("core/block-editor")
								.insertBlock(newBlock, undefined, clientId);
							setIsVideoModalOpen(false);
						}}
						onSelectURL={(url) => {
							const validUrl = validateVideoUrl(url);
							if (!validUrl) {
								return;
							}
							const defaultTitle = __("Video", "folioblocks");
							const newBlock = wp.blocks.createBlock(
								"folioblocks/pb-video-block",
								{
									videoUrl: validUrl,
									title: defaultTitle,
									alt: defaultTitle,
								},
							);
							wp.data
								.dispatch("core/block-editor")
								.insertBlock(newBlock, undefined, clientId);
							setIsVideoModalOpen(false);
						}}
					/>
				</Modal>
			)}

			<InspectorControls>
				<PanelBody
					title={__("Video Gallery Settings", "folioblocks")}
					initialOpen={true}
				>
					<ResponsiveRangeControl
						label={__("Columns", "folioblocks")}
						columns={columns}
						tabletColumns={tabletColumns}
						mobileColumns={mobileColumns}
						onChange={(newValues) => setAttributes(newValues)}
					/>
					<ResponsiveRangeControl
						label={__("Gap Between Items", "folioblocks")}
						columns={responsiveGaps.gap}
						tabletColumns={responsiveGaps.tabletGap}
						mobileColumns={responsiveGaps.mobileGap}
						desktopKey="gap"
						tabletKey="tabletGap"
						mobileKey="mobileGap"
						min={0}
						max={50}
						lockTabletMobileToDesktop={false}
						onChange={(newValues) => setAttributes(newValues)}
						help={__("Set the space between video thumbnails.", "folioblocks")}
					/>
					<SelectControl
						label={__("Thumbnail Resolution", "folioblocks")}
						value={thumbnailSize}
						onChange={(val) => setAttributes({ thumbnailSize: val })}
						options={imageSizeOptions}
						help={__("Set thumbnail resolution.", "folioblocks")}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<SelectControl
						label={__("Thumbnail Aspect Ratio", "folioblocks")}
						value={aspectRatio}
						onChange={(val) => setAttributes({ aspectRatio: val })}
						options={[
							{ label: "21:9", value: "21:9" },
							{ label: "16:9", value: "16:9" },
							{ label: "9:16", value: "9:16" },
							{ label: "4:3", value: "4:3" },
							{ label: "3:2", value: "3:2" },
							{ label: "1:1", value: "1:1" },
						]}
						help={__("Set thumbnail aspect ratio.", "folioblocks")}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
				</PanelBody>
				<PanelBody
					title={__("Gallery Click Settings", "folioblocks")}
					initialOpen={true}
				>
					{applyFilters(
						"folioBlocks.videoGallery.lightboxTheme",
						null,
						{ attributes, setAttributes },
					)}
					{applyFilters(
						"folioBlocks.videoGallery.lightboxLayout",
						<ProFeatureNotice
							title={__("Video Lightbox", "folioblocks")}
							description={__(
								"Create a richer, more polished viewing experience for your videos.",
								"folioblocks",
							)}
							features={[
								__("Choose a light or dark appearance.", "folioblocks"),
								__("Display video titles and descriptions.", "folioblocks"),
								__("Customize the information shown in the lightbox.", "folioblocks"),
							]}
							campaign="video-gallery-lightbox"
						/>,
						{ attributes, setAttributes },
					)}
					<ToggleControl
						label={__("Enable Lightbox in Editor", "folioblocks")}
						checked={!!lightbox}
						onChange={(val) => setAttributes({ lightbox: !!val })}
						__nextHasNoMarginBottom
						help={__(
							"Allows videos to open in a Lightbox while editing.",
							"folioblocks",
						)}
					/>
				</PanelBody>
				<PanelBody
					title={__("Gallery Hover Settings", "folioblocks")}
					initialOpen={true}
				>
					{applyFilters(
						"folioBlocks.videoGallery.customOverlayControls",
						<ProFeatureNotice
							title={__("Gallery Hover Settings", "folioblocks")}
							description={__(
								"Create distinctive interactions for your video thumbnails.",
								"folioblocks",
							)}
							features={[
								__("Choose gradient, blur, or color hover styles.", "folioblocks"),
								__("Customize overlay and play-button colors.", "folioblocks"),
								__("Override hover settings for individual videos.", "folioblocks"),
							]}
							campaign="video-gallery-hover-settings"
						/>,
						{ attributes, setAttributes },
					)}
					<SelectControl
						label={__("Overlay Content", "folioblocks")}
						value={overlayContent}
						onChange={(value) =>
							setAttributes(
								getOverlayContentAttributes(value, overlayVisibility),
							)
						}
						options={[
							{
								label: __("None", "folioblocks"),
								value: "none",
							},
							{
								label: __("Play Button", "folioblocks"),
								value: "play",
							},
							{
								label: __("Video Title", "folioblocks"),
								value: "title",
							},
							{
								label: __("Video Title + Play Button", "folioblocks"),
								value: "title-play",
							},
							...(enableFilter
								? [
									{
										label: __(
											"Video Title + Play Button + Filtering Category",
											"folioblocks",
										),
										value: "title-play-category",
									},
								]
								: []),
						]}
						help={__("Choose what appears over video thumbnails.")}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					{overlayContent !== "none" && (
						<ToggleControl
							label={__("Always Display Overlay", "folioblocks")}
							checked={overlayVisibility === "always"}
							onChange={(alwaysDisplay) =>
								setAttributes(
									getOverlayContentAttributes(
										overlayContent,
										alwaysDisplay ? "always" : "onHover",
									),
								)
							}
							help={__(
								"Display overlay content at all times instead of on hover.",
								"folioblocks",
							)}
							__nextHasNoMarginBottom
						/>
					)}
				</PanelBody>
				<PanelBody
					title={__("Gallery Filtering Settings", "folioblocks")}
					initialOpen={true}
				>
					{applyFilters(
						"folioBlocks.videoGallery.enableFilterToggle",
						<ProFeatureNotice
							title={__("Video Gallery Filtering", "folioblocks")}
							description={__(
								"Help visitors quickly find the videos that interest them.",
								"folioblocks",
							)}
							features={[
								__("Add a visitor-facing filter bar.", "folioblocks"),
								__("Assign multiple categories to videos.", "folioblocks"),
								__("Customize filter-bar typography and colors.", "folioblocks"),
							]}
							campaign="video-gallery-filtering"
						/>,
						{ attributes, setAttributes },
					)}
				</PanelBody>
				<PanelBody
					title={__("E-Commerce Settings", "folioblocks")}
					initialOpen={false}
				>
					{window.folioBlocksData?.hasWooCommerce &&
						applyFilters(
							"folioBlocks.videoGallery.wooCommerceControls",
							<ProFeatureNotice
								title={__("WooCommerce Integration", "folioblocks")}
								description={__(
									"Turn video galleries into engaging product showcases.",
									"folioblocks",
								)}
								features={[
									__("Link videos to WooCommerce products.", "folioblocks"),
									__("Add product and cart actions.", "folioblocks"),
									__("Display product information with videos.", "folioblocks"),
								]}
								campaign="woocommerce-video-gallery"
							/>,
							{ attributes, setAttributes },
						)}
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="advanced">
				{applyFilters(
					"folioBlocks.videoGallery.disableRightClickToggle",
					<ProFeatureNotice
						title={__("Protection and Performance", "folioblocks")}
						description={__(
							"Add page-level controls for protecting and loading your media.",
							"folioblocks",
						)}
						features={[
							__("Disable right-click on displayed media.", "folioblocks"),
							__("Lazy-load videos and thumbnails.", "folioblocks"),
						]}
						campaign="media-protection-performance"
						compact
					/>,
					{ attributes, setAttributes },
				)}
				{applyFilters(
					"folioBlocks.videoGallery.lazyLoadToggle",
					null,
					{ attributes, setAttributes },
				)}
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody
					title={__("Video Thumbnail Styles", "folioblocks")}
					initialOpen={true}
				>
					{applyFilters(
						"folioBlocks.videoGallery.imageStyles",
						<ProFeatureNotice
							title={__("Video Thumbnail Styles", "folioblocks")}
							description={__(
								"Give every video thumbnail a polished, consistent appearance.",
								"folioblocks",
							)}
							features={[
								__("Customize border colors and widths.", "folioblocks"),
								__("Add rounded corners.", "folioblocks"),
								__("Apply thumbnail drop shadows.", "folioblocks"),
							]}
							campaign="video-gallery-thumbnail-styles"
						/>,
						{ attributes, setAttributes },
					)}
				</PanelBody>

				{filterStylesControls}

				{applyFilters("folioBlocks.videoGallery.iconStyleControls", null, {
					attributes,
					setAttributes,
				})}
				{applyFilters(
					"folioBlocks.videoGallery.hoverOverlayStyleControls",
					null,
					{ attributes, setAttributes },
				)}
			</InspectorControls>

			<div {...blockProps}>
				{applyFilters("folioBlocks.videoGallery.renderFilterBar", null, {
					attributes,
					setAttributes,
				})}
				<div {...innerBlocksProps} />
			</div>
		</>
	);
}
