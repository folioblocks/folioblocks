/**
 * Video Gallery Block
 * Edit JS
 **/
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
	Notice,
	RangeControl,
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
import IconVideoGallery from "../pb-helpers/IconVideoGallery";
import "./editor.scss";

export default function Edit({ attributes, setAttributes, clientId }) {
	/**
	 * Attribute Destructuring
	 */
	const {
		columns,
		tabletColumns,
		mobileColumns,
		lightbox,
		lightboxLayout,
		lazyLoad,
		gap,
		aspectRatio,
		thumbnailSize,
		playButtonVisibility,
		titleVisibility,
		activeFilter = "All",
		filterTextColor,
		filterBgColor,
		activeFilterTextColor,
		activeFilterBgColor,
		preview,
		enableWooCommerce,
		wooCartIconDisplay,
	} = attributes;

	const checkoutUrl =
		window.folioBlocksData?.checkoutUrl ||
		"https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks&utm_medium=video-gallery-block&utm_campaign=upgrade";

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

	// Reset activeFilter to 'All' if selected block's category doesn't match
	useEffect(() => {
		if (selectedBlock && selectedBlock.name === "folioblocks/pb-video-block") {
			const selectedCategory = selectedBlock.attributes?.filterCategory || "";

			if (
				activeFilter !== "All" &&
				selectedCategory.toLowerCase() !== activeFilter.toLowerCase()
			) {
				setAttributes({ activeFilter: "All" });
			}
		}
	}, [selectedBlock, activeFilter, setAttributes]);

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
		if (!media || !media.url) return;
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
			"folioBlocks/activeFilter": activeFilter,
			"folioBlocks/lightbox": lightbox,
			"folioBlocks/lightboxLayout": lightboxLayout,
			"folioBlocks/lazyLoad": lazyLoad,
			"folioBlocks/enableWooCommerce": enableWooCommerce,
			"folioBlocks/wooCartIconDisplay": wooCartIconDisplay,
		},
		style: {
			"--pb--filter-text-color": filterTextColor || "#000",
			"--pb--filter-bg-color": filterBgColor || "transparent",
			"--pb--filter-active-text": activeFilterTextColor || "#fff",
			"--pb--filter-active-bg": activeFilterBgColor || "#000",
		},
	});

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: `pb-video-gallery cols-d-${columns} cols-t-${tabletColumns} cols-m-${mobileColumns}`,
			style: { "--gap": `${gap}px` },
		},
		{
			allowedBlocks: ["folioblocks/pb-video-block"],
			orientation: "horizontal",
			templateLock: false,
			context: {
				"folioBlocks/aspectRatio": aspectRatio,
				"folioBlocks/playButtonVisibility": playButtonVisibility,
				"folioBlocks/titleVisibility": titleVisibility,
				"folioBlocks/activeFilter": activeFilter,
				"folioBlocks/lightbox": lightbox,
				"folioBlocks/lightboxLayout": lightboxLayout,
				"folioBlocks/lazyLoad": lazyLoad,
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
			if (indexA === -1) return 1;
			if (indexB === -1) return -1;
			return indexA - indexB;
		});

	// Handler to add a new video block inside the gallery
	const addVideoBlock = () => {
		setIsVideoModalOpen(true);
	};

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
						if (!url) return;

						const defaultTitle = __("Video", "folioblocks");
						const newBlock = wp.blocks.createBlock(
							"folioblocks/pb-video-block",
							{
								videoUrl: url,
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
							const defaultTitle = __("Video", "folioblocks");
							const newBlock = wp.blocks.createBlock(
								"folioblocks/pb-video-block",
								{
									videoUrl: url,
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
					<RangeControl
						label={__("Gap Between Items (px)", "folioblocks")}
						value={gap}
						onChange={(val) => setAttributes({ gap: val })}
						min={0}
						max={40}
						step={1}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={__("Set gap size between Thumbnails.")}
					/>
					<SelectControl
						label={__("Thumbnail Resolution", "folioblocks")}
						value={thumbnailSize}
						onChange={(val) => setAttributes({ thumbnailSize: val })}
						options={imageSizeOptions}
						help={__("Set thumbnail resolution.")}
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
						help={__("Set thumbnail aspect ratio.")}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
				</PanelBody>
				<PanelBody
					title={__("Lightbox & Hover Settings", "folioblocks")}
					initialOpen={true}
				>
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
					{applyFilters(
						"folioBlocks.videoGallery.lightboxLayout",
						<div style={{ marginBottom: "8px" }}>
							<Notice status="info" isDismissible={false}>
								<strong>{__("Lightbox Layout", "folioblocks")}</strong>
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
					<hr style={{ border: "0.5px solid #e0e0e0", margin: "12px 0" }} />
					<SelectControl
						label={__("Play Button Visibility", "folioblocks")}
						value={playButtonVisibility}
						onChange={(val) => setAttributes({ playButtonVisibility: val })}
						options={[
							{ label: __("Always Show", "folioblocks"), value: "always" },
							{ label: __("On Hover", "folioblocks"), value: "onHover" },
							{ label: __("Hidden", "folioblocks"), value: "hidden" },
						]}
						help={__("Settings for the Play button overlay.")}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<SelectControl
						label={__("Title Visibility", "folioblocks")}
						value={titleVisibility}
						onChange={(val) => setAttributes({ titleVisibility: val })}
						options={[
							{ label: __("Always Show", "folioblocks"), value: "always" },
							{ label: __("On Hover", "folioblocks"), value: "onHover" },
							{ label: __("Hidden", "folioblocks"), value: "hidden" },
						]}
						help={__("Settings for the Video Title overlay.")}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
				</PanelBody>
				<PanelBody
					title={__("Gallery Filtering Settings", "folioblocks")}
					initialOpen={true}
				>
					{applyFilters(
						"folioBlocks.videoGallery.enableFilterToggle",
						<div style={{ marginBottom: "8px" }}>
							<Notice status="info" isDismissible={false}>
								<strong>{__("Enable Video Filtering", "folioblocks")}</strong>
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
				</PanelBody>
				<PanelBody
					title={__("E-Commerce Settings", "folioblocks")}
					initialOpen={false}
				>
					{window.folioBlocksData?.hasWooCommerce &&
						applyFilters(
							"folioBlocks.videoGallery.wooCommerceControls",
							<div style={{ marginBottom: "8px" }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__("Enable Woo Commerce", "folioblocks")}</strong>
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
			</InspectorControls>
			<InspectorControls group="advanced">
				{applyFilters(
					"folioBlocks.videoGallery.disableRightClickToggle",
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
					"folioBlocks.videoGallery.lazyLoadToggle",
					<div style={{ marginBottom: "8px" }}>
						<Notice status="info" isDismissible={false}>
							<strong>{__("Enable Lazy Load of Images", "folioblocks")}</strong>
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
			<InspectorControls group="styles">
				<PanelBody
					title={__("Video Thumbnail Styles", "folioblocks")}
					initialOpen={true}
				>
					{applyFilters(
						"folioBlocks.videoGallery.borderColorControl",
						<div style={{ marginBottom: "8px" }}>
							<Notice status="info" isDismissible={false}>
								<strong>
									{__("Enable Image Border Color", "folioblocks")}
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
					{applyFilters(
						"folioBlocks.videoGallery.borderWidthControl",
						<div style={{ marginBottom: "8px" }}>
							<Notice status="info" isDismissible={false}>
								<strong>
									{__("Enable Image Border Width", "folioblocks")}
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
					{applyFilters(
						"folioBlocks.videoGallery.borderRadiusControl",
						<div style={{ marginBottom: "8px" }}>
							<Notice status="info" isDismissible={false}>
								<strong>
									{__("Enable Image Border Radius", "folioblocks")}
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
					{applyFilters(
						"folioBlocks.videoGallery.dropShadowToggle",
						<div style={{ marginBottom: "8px" }}>
							<Notice status="info" isDismissible={false}>
								<strong>{__("Enable Image Drop Shadow", "folioblocks")}</strong>
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
				</PanelBody>

				{applyFilters(
					"folioBlocks.videoGallery.filterStylesControls",
					<div style={{ marginBottom: "8px" }}>
						<Notice status="info" isDismissible={false}>
							<strong>{__("Filter Styles Controls", "folioblocks")}</strong>
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

				{applyFilters("folioBlocks.videoGallery.iconStyleControls", null, {
					attributes,
					setAttributes,
				})}
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
