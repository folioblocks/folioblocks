/**
 * PB Video Block
 * Edit JS
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	BlockControls,
	MediaPlaceholder,
} from "@wordpress/block-editor";
import {
	PanelBody,
	TextControl,
	TextareaControl,
	Button,
	SelectControl,
	ToolbarButton,
	ToolbarGroup,
	Modal,
	ToggleControl,
	Notice,
	SandBox,
	Spinner,
} from "@wordpress/components";
import { useState, useEffect } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import { applyFilters } from "@wordpress/hooks";
import { IconVideoBlock, IconPlayButton } from "../pb-helpers/icons";
import ImageStyleControl, {
	getShadowStyleClass,
} from "../pb-helpers/ImageStyleControl.js";
import {
	getVideoIframeSrc,
	getVideoProviderData,
	getVideoProviderLabel,
} from "../pb-helpers/videoProviders";
import { isValidHttpUrl } from "../pb-helpers/urlValidation";
import ValidatedUrlControl from "../pb-helpers/ValidatedUrlControl";
import ProFeatureNotice from "../pb-helpers/ProFeatureNotice";
import {
	FBKS_ALL_FILTER_TOKEN,
	fbksNormalizeActiveFilterValue,
} from "../pb-helpers/filterConstants";
import "./editor.scss";

const ASPECT_RATIOS = {
	"21:9": "aspect-21-9",
	"16:9": "aspect-16-9",
	"9:16": "aspect-9-16",
	"4:3": "aspect-4-3",
	"3:2": "aspect-3-2",
	"1:1": "aspect-1-1",
};
const isWordPressVersionAtLeast = (version, minimumVersion) => {
	const currentParts = String(version || "")
		.split(".")
		.map((part) => parseInt(part, 10) || 0);
	const minimumParts = String(minimumVersion)
		.split(".")
		.map((part) => parseInt(part, 10) || 0);
	const length = Math.max(currentParts.length, minimumParts.length);

	for (let index = 0; index < length; index++) {
		const current = currentParts[index] || 0;
		const minimum = minimumParts[index] || 0;

		if (current > minimum) {
			return true;
		}
		if (current < minimum) {
			return false;
		}
	}

	return true;
};

const getAssignedFilterCategories = (attributes = {}) => {
	const categories = Array.isArray(attributes.filterCategories)
		? attributes.filterCategories
			.map((category) =>
				typeof category === "string" ? category.trim() : "",
			)
			.filter(Boolean)
		: [];

	if (categories.length > 0) {
		return [...new Set(categories)];
	}

	const legacyCategory =
		typeof attributes.filterCategory === "string"
			? attributes.filterCategory.trim()
			: "";
	return legacyCategory ? [legacyCategory] : [];
};

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

// Function to support YouTube, Vimeo, Bunny Stream, and self-hosted videos.
function getVideoEmbedMarkup(videoUrl, youtubeEmbedPreview) {
	if (!videoUrl) {
		return null;
	}

	const providerData = getVideoProviderData(videoUrl);
	const providerLabel = getVideoProviderLabel(videoUrl);

	if (providerData.provider === "youtube") {
		if (youtubeEmbedPreview?.html) {
			return (
				<SandBox
					allowSameOrigin
					html={youtubeEmbedPreview.html}
					scripts={youtubeEmbedPreview.scripts}
					title={`${providerLabel} Video`}
					type="video wp-has-aspect-ratio"
				/>
			);
		}

		if (youtubeEmbedPreview === false) {
			return (
				<Notice status="warning" isDismissible={false}>
					{__(
						"YouTube could not be previewed in the editor. The video will still play on the published page.",
						"folioblocks",
					)}
				</Notice>
			);
		}

		return <Spinner />;
	}

	const iframeSrc = getVideoIframeSrc(videoUrl);

	if (iframeSrc) {
		return (
			<iframe
				src={iframeSrc}
				style={{ border: "none" }}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowFullScreen
				title={`${providerLabel} Video`}
			/>
		);
	}

	// Fallback for self-hosted videos
	return <video src={videoUrl} controls autoPlay />;
}

export default function Edit({ attributes, setAttributes, context }) {
	const {
		videoUrl,
		videoWidth,
		videoHeight,
		videoDimensionsUrl,
		thumbnail,
		thumbnailId,
		title,
		description,
		aspectRatio,
		playButtonVisibility,
		titleVisibility,
		showFilterCategory,
		overrideGalleryHoverSettings,
		overlayStyle,
		overlayBgColor,
		overlayTextColor,
		filterCategory,
		filterCategories,
		thumbnailSize,
		lightbox,
		lightboxLayout,
		preview,
		cartIconColor,
		cartIconBgColor,
	} = attributes;

	// Block Preview Image
	if (preview) {
		return (
			<div className="pb-block-preview">
				<IconVideoBlock />
			</div>
		);
	}

	const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
	const [isLightboxOpen, setLightboxOpen] = useState(false);
	const updateVideoUrl = (nextUrl) => {
		const trimmedUrl = typeof nextUrl === "string" ? nextUrl.trim() : "";
		if (!trimmedUrl) {
			setAttributes({ videoUrl: "" });
			return true;
		}
		if (!isValidHttpUrl(trimmedUrl)) {
			return false;
		}
		setAttributes({ videoUrl: trimmedUrl });
		return true;
	};
	const shouldUseContentInspector = isWordPressVersionAtLeast(
		window.folioBlocksData?.wpVersion,
		"7.0",
	);
	const videoProvider = getVideoProviderData(videoUrl).provider;
	const isYouTubeVideo = videoProvider === "youtube";
	const isOEmbedVideo = isYouTubeVideo || videoProvider === "vimeo";
	const videoEmbedPreview = useSelect(
		(select) =>
			isOEmbedVideo
				? select("core").getEmbedPreview(videoUrl)
				: undefined,
		[isOEmbedVideo, videoUrl],
	);
	const youtubeEmbedPreview = isYouTubeVideo ? videoEmbedPreview : undefined;

	useEffect(() => {
		const width = Number(videoEmbedPreview?.width) || 0;
		const height = Number(videoEmbedPreview?.height) || 0;
		if (!width || !height) {
			return;
		}
		if (
			videoDimensionsUrl !== videoUrl ||
			videoWidth !== width ||
			videoHeight !== height
		) {
			setAttributes({
				videoWidth: width,
				videoHeight: height,
				videoDimensionsUrl: videoUrl,
			});
		}
	}, [
		videoEmbedPreview,
		videoUrl,
		videoDimensionsUrl,
		videoWidth,
		videoHeight,
		setAttributes,
	]);

	useEffect(() => {
		if (!videoUrl || videoProvider !== "self") {
			return undefined;
		}

		const video = document.createElement("video");
		video.preload = "metadata";
		video.src = videoUrl;
		const storeVideoDimensions = () => {
			if (video.videoWidth > 0 && video.videoHeight > 0) {
				setAttributes({
					videoWidth: video.videoWidth,
					videoHeight: video.videoHeight,
					videoDimensionsUrl: videoUrl,
				});
			}
		};
		video.addEventListener("loadedmetadata", storeVideoDimensions);
		return () => {
			video.removeEventListener("loadedmetadata", storeVideoDimensions);
			video.removeAttribute("src");
			video.load();
		};
	}, [videoProvider, videoUrl, setAttributes]);

	// Effect: Listen for Escape key to close lightbox
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				setLightboxOpen(false);
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const parentAspectRatio = context?.["folioBlocks/aspectRatio"];
	const lightboxEnabled =
		typeof context?.["folioBlocks/lightbox"] !== "undefined"
			? !!context["folioBlocks/lightbox"]
			: !!attributes.lightbox;

	const effectiveLightboxLayout =
		typeof context?.["folioBlocks/lightboxLayout"] !== "undefined"
			? context["folioBlocks/lightboxLayout"]
			: attributes.lightboxLayout || "video-only";
	const inheritedLightboxTheme = context?.["folioBlocks/lightboxTheme"];
	const effectiveLightboxTheme =
		(inheritedLightboxTheme ?? attributes.lightboxTheme) === "light"
			? "light"
			: "dark";
	const inheritedAspectRatio = context?.["folioBlocks/aspectRatio"];
	const inheritedPlayButtonVisibility =
		context?.["folioBlocks/playButtonVisibility"];
	const inheritedTitleVisibility = context?.["folioBlocks/titleVisibility"];
	const inheritedShowFilterCategory = context?.["folioBlocks/showFilterCategory"];
	const inheritedOverlayStyle = context?.["folioBlocks/overlayStyle"];
	const inheritedOverlayBgColor = context?.["folioBlocks/overlayBgColor"];
	const inheritedOverlayTextColor = context?.["folioBlocks/overlayTextColor"];
	const inheritedThumbnailSize = context?.["folioBlocks/thumbnailSize"];

	const isInVideoGallery =
		typeof context?.["folioBlocks/gallery"] !== "undefined" ||
		typeof context?.["folioBlocks/thumbnailSize"] !== "undefined" ||
		typeof context?.["folioBlocks/aspectRatio"] !== "undefined" ||
		typeof context?.["folioBlocks/enableWooCommerce"] !== "undefined";
	const isInsideGallery = isInVideoGallery;
	const galleryHoverOverridesEnabled = applyFilters(
		"folioBlocks.videoBlock.galleryHoverOverridesEnabled",
		false,
	);
	const overridesGalleryHover =
		isInsideGallery &&
		galleryHoverOverridesEnabled &&
		!!overrideGalleryHoverSettings;
	const galleryFilterEnabled = !!context?.["folioBlocks/enableFilter"];
	const activeFilter =
		context?.["folioBlocks/activeFilter"] || FBKS_ALL_FILTER_TOKEN;

	const lazyLoad = context?.["folioBlocks/lazyLoad"];
	const enableWooCommerce =
		typeof context?.["folioBlocks/enableWooCommerce"] !== "undefined"
			? !!context["folioBlocks/enableWooCommerce"]
			: !!attributes.enableWooCommerce;
	const contextWooDefaultLinkAction =
		context?.["folioBlocks/wooDefaultLinkAction"];
	const hasWooCommerce = window.folioBlocksData?.hasWooCommerce || false;
	const inheritedBorderColor = context?.["folioBlocks/borderColor"];
	const inheritedBorderWidth = context?.["folioBlocks/borderWidth"];
	const inheritedBorderRadius = context?.["folioBlocks/borderRadius"];
	const inheritedDropShadow = context?.["folioBlocks/dropShadow"];
	const inheritedShadowStyle = context?.["folioBlocks/shadowStyle"];
	// Cart icon styling (provided by Video Gallery via context)
	const inheritedCartIconColor = context?.["folioBlocks/cartIconColor"];
	const inheritedCartIconBgColor = context?.["folioBlocks/cartIconBgColor"];

	// Effect: Sync with parent/inherited values
	useEffect(() => {
		if (parentAspectRatio && aspectRatio !== parentAspectRatio) {
			setAttributes({ aspectRatio: parentAspectRatio });
		}
		if (inheritedBorderColor !== undefined) {
			setAttributes({ borderColor: inheritedBorderColor });
		}
		if (inheritedBorderWidth !== undefined) {
			setAttributes({ borderWidth: inheritedBorderWidth });
		}
		if (inheritedBorderRadius !== undefined) {
			setAttributes({ borderRadius: inheritedBorderRadius });
		}
		if (inheritedDropShadow !== undefined) {
			setAttributes({ dropShadow: inheritedDropShadow });
		}
		if (inheritedShadowStyle !== undefined) {
			setAttributes({ shadowStyle: inheritedShadowStyle });
		}
		if (lazyLoad !== undefined && attributes.lazyLoad !== lazyLoad) {
			setAttributes({ lazyLoad });
		}
		if (lightboxLayout && attributes.lightboxLayout !== lightboxLayout) {
			setAttributes({ lightboxLayout });
		}
		// Optionally clear WooCommerce product data if Woo is not available
		if (!hasWooCommerce) {
			setAttributes({
				wooProductId: 0,
				wooProductName: "",
				wooProductPrice: "",
				wooProductURL: "",
				wooProductDescription: "",
				wooProductImage: "",
			});
		}
	}, [
		parentAspectRatio,
		inheritedBorderColor,
		inheritedBorderWidth,
		inheritedBorderRadius,
		inheritedDropShadow,
		lazyLoad,
		lightboxLayout,
		hasWooCommerce,
	]);

	// ---------------------------
	// Derived / Effective Values
	// ---------------------------
	const effectiveThumbnailSize = inheritedThumbnailSize ?? thumbnailSize;
	const effectiveAspectRatio = inheritedAspectRatio || aspectRatio;
	const hasVideoDimensions =
		videoDimensionsUrl === videoUrl && videoWidth > 0 && videoHeight > 0;
	const videoLightboxRatio = hasVideoDimensions
		? videoWidth / videoHeight
		: 16 / 9;
	const effectivePlayButtonVisibility =
		(overridesGalleryHover ? undefined : inheritedPlayButtonVisibility) ??
		playButtonVisibility ??
		"always";
	const effectiveTitleVisibility =
		(overridesGalleryHover ? undefined : inheritedTitleVisibility) ??
		titleVisibility ??
		"always";
	const effectiveShowFilterCategory =
		galleryFilterEnabled &&
		((overridesGalleryHover ? undefined : inheritedShowFilterCategory) ??
			showFilterCategory ??
			false);
	const effectiveOverlayVisibility = getOverlayVisibility(
		effectiveTitleVisibility,
		effectivePlayButtonVisibility,
	);
	const effectiveOverlayStyle =
		(overridesGalleryHover ? undefined : inheritedOverlayStyle) ??
		overlayStyle ??
		"default";
	const effectiveOverlayBgColor =
		(overridesGalleryHover ? undefined : inheritedOverlayBgColor) ||
		overlayBgColor ||
		"#f9f9f9";
	const effectiveOverlayTextColor =
		(overridesGalleryHover ? undefined : inheritedOverlayTextColor) ||
		overlayTextColor ||
		"#000000";
	const overlayContent = getOverlayContent(
		titleVisibility,
		playButtonVisibility,
		showFilterCategory,
	);
	const overlayVisibility = getOverlayVisibility(
		titleVisibility,
		playButtonVisibility,
	);
	const assignedCategories = getAssignedFilterCategories({
		filterCategory,
		filterCategories,
	});
	const normalizedActiveFilter =
		fbksNormalizeActiveFilterValue(activeFilter).toLowerCase();
	const isHidden =
		normalizedActiveFilter !== "all" &&
		!assignedCategories.some(
			(category) => category.toLowerCase() === normalizedActiveFilter,
		);
	const primaryCategory = assignedCategories[0] || "";
	const allCategories = assignedCategories.join(",");
	const showOverlayAlways =
		effectivePlayButtonVisibility === "always" ||
		effectiveTitleVisibility === "always";
	const showOverlayOnHover =
		effectivePlayButtonVisibility === "onHover" ||
		effectiveTitleVisibility === "onHover";
	const isColorOverlay = effectiveOverlayStyle === "color";
	const isBlurOverlay = effectiveOverlayStyle === "blur";
	const overlayStyleVars = {
		...(isColorOverlay && effectiveOverlayBgColor
			? { "--pb-video-overlay-bg": effectiveOverlayBgColor }
			: {}),
		...(isColorOverlay && effectiveOverlayTextColor
			? { "--pb-video-overlay-text": effectiveOverlayTextColor }
			: {}),
	};

	// ---------------------------
	// Icon styles (context > attribute)
	// ---------------------------
	const effectiveCartIconColor = isInsideGallery
		? inheritedCartIconColor ?? ""
		: cartIconColor ?? "";
	const effectiveCartIconBgColor = isInsideGallery
		? inheritedCartIconBgColor ?? ""
		: cartIconBgColor ?? "";

	const cartIconStyleVars = {
		...(effectiveCartIconColor
			? { "--pb-cart-icon-color": effectiveCartIconColor }
			: {}),
		...(effectiveCartIconBgColor
			? { "--pb-cart-icon-bg": effectiveCartIconBgColor }
			: {}),
	};

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

	// Effective border values (context > attribute)
	const effectiveBorderColor = inheritedBorderColor ?? attributes.borderColor;
	const rawEffectiveBorderWidth =
		inheritedBorderWidth ?? attributes.borderWidth ?? 0;
	const effectiveBorderWidth = Number.isFinite(Number(rawEffectiveBorderWidth))
		? Number(rawEffectiveBorderWidth)
		: 0;
	const effectiveBorderRadius =
		inheritedBorderRadius ?? attributes.borderRadius ?? 0;
	const shadowStyleClass = getShadowStyleClass(
		inheritedShadowStyle ?? attributes.shadowStyle,
		inheritedDropShadow ?? attributes.dropShadow,
	);

	// Set Block Thumbnail
	const setThumbnail = (media) => {
		if (!media || !media.url || !media.id) {
			return;
		}
		setAttributes({
			thumbnailId: media.id,
			thumbnail: media.url, // fallback display
		});
	};
	const thumbnailData = useSelect(
		(select) => {
			if (!thumbnailId) {
				return null;
			}
			// WP 6.9+: use core.getEntityRecord for attachments
			return (
				select("core").getEntityRecord("postType", "attachment", thumbnailId) ||
				null
			);
		},
		[thumbnailId, effectiveThumbnailSize],
	);
	const resolvedThumbnailUrl =
		thumbnailData?.media_details?.sizes?.[effectiveThumbnailSize]?.source_url ||
		thumbnail;
	const openMediaLibrary = () => {
		const frame = wp.media({
			title: __("Select a video", "folioblocks"),
			library: { type: "video" },
			multiple: false,
			button: { text: __("Use this video", "folioblocks") },
		});
		frame.on("select", () => {
			const media = frame.state().get("selection").first().toJSON();
			if (media && media.url) {
				setAttributes({ videoUrl: media.url });
			}
		});
		frame.open();
	};
	const blockProps = useBlockProps({
		className: isHidden ? "is-hidden" : undefined,
	});
	const shouldShowVideoBlockSettingsPanel =
		!shouldUseContentInspector ||
		!isInsideGallery ||
		!inheritedThumbnailSize ||
		!inheritedAspectRatio;
	const videoContentControls = (
		<>
			{thumbnail && (
				<div style={{ marginBottom: "16px" }}>
					<div
						className={`pb-video-thumbnail-preview ${ASPECT_RATIOS[effectiveAspectRatio]}`}
					>
						<img src={resolvedThumbnailUrl} alt={title || ""} />
					</div>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={setThumbnail}
							allowedTypes={["image"]}
							render={({ open }) => (
								<div
									style={{
										display: "flex",
										justifyContent: "center",
										marginTop: "8px",
									}}
								>
									<Button onClick={open} variant="secondary">
										{__("Change Thumbnail", "folioblocks")}
									</Button>
								</div>
							)}
						/>
					</MediaUploadCheck>
				</div>
			)}
			<ValidatedUrlControl
				label={__("Video URL", "folioblocks")}
				value={videoUrl}
				onChange={(val) => setAttributes({ videoUrl: val })}
				help={
					<>
						{__("Supports YouTube, Vimeo, Bunny Stream, or ", "folioblocks")}
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								openMediaLibrary();
							}}
						>
							{__("self-hosted videos", "folioblocks")}
						</a>
						{__(
							". Note: Some provider videos may not work due to privacy settings.",
							"folioblocks",
						)}
					</>
				}
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			/>
			<TextControl
				label={__("Video Title", "folioblocks")}
				value={title}
				onChange={(val) => {
					setAttributes({
						title: val,
						alt: val,
					});
				}}
				help={__(
					"Set Video Title used in the Hover Overlay, Lightbox, and for Alt-text.",
					"folioblocks",
				)}
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			/>
			<TextareaControl
				label={__("Description", "folioblocks")}
				value={description}
				onChange={(value) => setAttributes({ description: value })}
				help={__(
					"Shown in the lightbox when enabled in Gallery Lightbox Settings.",
					"folioblocks",
				)}
				__nextHasNoMarginBottom
			/>
		</>
	);

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						label={__("Change Video", "folioblocks")}
						icon="format-video"
						onClick={() => setIsVideoModalOpen(true)}
					>
						{__("Change Video", "folioblocks")}
					</ToolbarButton>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={(media) => {
								if (!media || !media.id || !media.url) {
									return;
								}
								setAttributes({
									thumbnailId: media.id,
									thumbnail: media.url,
								});
							}}
							allowedTypes={["image"]}
							render={({ open }) => (
								<ToolbarButton
									label={__("Change Thumbnail", "folioblocks")}
									icon="format-image"
									onClick={open}
								>
									{__("Change Thumbnail", "folioblocks")}
								</ToolbarButton>
							)}
						/>
					</MediaUploadCheck>
					{isVideoModalOpen && (
						<Modal
							title={__("Select or Insert Video", "folioblocks")}
							onRequestClose={() => setIsVideoModalOpen(false)}
						>
							<MediaPlaceholder
								labels={{
									title: __("Select or Insert Video", "folioblocks"),
									instructions: __(
										"Upload, select from media library or insert from URL.",
										"folioblocks",
									),
								}}
								allowedTypes={["video"]}
								accept="video/*"
								onSelect={(media) => {
									setAttributes({ videoUrl: media.url });
									setIsVideoModalOpen(false);
								}}
								onSelectURL={(url) => {
									if (updateVideoUrl(url)) {
										setIsVideoModalOpen(false);
									}
								}}
								onError={(errorMessage) => {
									console.error(errorMessage);
								}}
							/>
						</Modal>
					)}
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				{shouldShowVideoBlockSettingsPanel && (
					<PanelBody
						title={__("Video Block Settings", "folioblocks")}
						initialOpen={true}
					>
						{!shouldUseContentInspector && videoContentControls}
						{!inheritedThumbnailSize && (
							<>
								<SelectControl
									label={__("Thumbnail Resolution", "folioblocks")}
									value={thumbnailSize}
									onChange={(val) => setAttributes({ thumbnailSize: val })}
									options={imageSizeOptions}
									__nextHasNoMarginBottom
									__next40pxDefaultSize
								/>
							</>
						)}
						{!inheritedAspectRatio && (
							<>
								<SelectControl
									label={__("Thumbnail Aspect Ratio", "folioblocks")}
									value={aspectRatio}
									onChange={(val) => setAttributes({ aspectRatio: val })}
									options={Object.keys(ASPECT_RATIOS).map((ratio) => ({
										label: ratio,
										value: ratio,
									}))}
									help={__("Set video Thumbnail aspect ratio.", "folioblocks")}
									__nextHasNoMarginBottom
									__next40pxDefaultSize
								/>
							</>
						)}
					</PanelBody>
				)}

				{(!isInsideGallery || galleryHoverOverridesEnabled) && (
					<>
						{!isInsideGallery && <PanelBody
							title={__("Video Click Settings", "folioblocks")}
							initialOpen={true}
						>
							{applyFilters("folioBlocks.videoBlock.lightboxTheme", null, {
								attributes,
								setAttributes,
								isInsideGallery,
								})}
								{applyFilters(
									"folioBlocks.videoBlock.lightboxLayout",
									<ProFeatureNotice
										title={__("Video Lightbox", "folioblocks")}
										description={__(
											"Create a richer, more polished viewing experience for your video.",
											"folioblocks",
										)}
										features={[
											__("Choose a light or dark appearance.", "folioblocks"),
											__("Display the video title and description.", "folioblocks"),
											__("Customize the information shown in the lightbox.", "folioblocks"),
										]}
										campaign="video-lightbox"
									/>,
									{
										attributes,
										setAttributes,
										isInsideGallery,
									},
								)}
							<ToggleControl
								label={__("Enable Lightbox in Editor", "folioblocks")}
								checked={!!lightbox}
								onChange={(val) => setAttributes({ lightbox: !!val })}
								__nextHasNoMarginBottom
								help={__(
									"Allows video to open in a Lightbox while editing.",
									"folioblocks",
								)}
							/>
						</PanelBody>}
						<PanelBody
							title={__("Video Hover Settings", "folioblocks")}
							initialOpen={true}
						>
							{isInsideGallery && galleryHoverOverridesEnabled && (
								<ToggleControl
									label={__("Override Gallery Hover Settings", "folioblocks")}
									checked={overridesGalleryHover}
									onChange={(value) =>
										setAttributes({ overrideGalleryHoverSettings: value })
									}
									help={__(
										"Use hover behavior configured specifically for this video.",
										"folioblocks",
									)}
									__nextHasNoMarginBottom
								/>
							)}
							{(!isInsideGallery || overridesGalleryHover) && applyFilters(
								"folioBlocks.videoBlock.customOverlayControls",
								<ProFeatureNotice
									title={__("Video Hover Settings", "folioblocks")}
									description={__(
										"Give individual videos their own hover appearance and behavior.",
										"folioblocks",
									)}
									features={[
										__("Choose gradient, blur, or color hover styles.", "folioblocks"),
										__("Customize overlay and play-button colors.", "folioblocks"),
										__("Override gallery hover settings for individual videos.", "folioblocks"),
									]}
									campaign="video-hover-settings"
								/>,
								{ attributes, setAttributes, isInsideGallery },
							)}
							{(!isInsideGallery || overridesGalleryHover) && <SelectControl
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
									...(galleryFilterEnabled
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
								help={__(
									"Choose what appears over the video thumbnail.",
									"folioblocks",
								)}
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>}
							{(!isInsideGallery || overridesGalleryHover) &&
								overlayContent !== "none" && (
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
					</>
				)}
				{!shouldUseContentInspector &&
					applyFilters("folioBlocks.pbVideoBlock.filterCategories", null, {
						attributes,
						setAttributes,
						context,
						isInsideGallery,
						galleryFilterEnabled,
					})}
				{(!isInsideGallery || enableWooCommerce) && (
					<PanelBody
						title={__("E-Commerce Settings", "folioblocks")}
						initialOpen={true}
					>
						{!isInsideGallery &&
							applyFilters(
								"folioBlocks.videoBlock.wooCommerceControls",
								<ProFeatureNotice
									title={__("WooCommerce Integration", "folioblocks")}
									description={__(
										"Connect videos directly to products in your store.",
										"folioblocks",
									)}
									features={[
										__("Link videos to WooCommerce products.", "folioblocks"),
										__("Add product and cart actions.", "folioblocks"),
										__("Display product information with videos.", "folioblocks"),
									]}
									campaign="woocommerce-video"
								/>,
								{
									attributes,
									setAttributes,
									isInsideGallery,
								},
							)}
						{applyFilters("folioBlocks.pbVideoBlock.WooProductSearch", null, {
							attributes,
							setAttributes,
							hasWooCommerce,
							enableWooCommerce,
							isInsideGallery,
							contextWooDefaultLinkAction,
						})}
					</PanelBody>
				)}
			</InspectorControls>
			{shouldUseContentInspector && (
				<InspectorControls group="content">
					<PanelBody title={__("Video Content", "folioblocks")} initialOpen={true}>
						{videoContentControls}
					</PanelBody>
					{applyFilters("folioBlocks.pbVideoBlock.filterCategories", null, {
						attributes,
						setAttributes,
						context,
						isInsideGallery,
						galleryFilterEnabled,
					})}
				</InspectorControls>
			)}
			{!isInsideGallery && (
				<InspectorControls group="advanced">
					{applyFilters(
						"folioBlocks.videoBlock.disableRightClickToggle",
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
						"folioBlocks.videoBlock.lazyLoadToggle",
						null,
						{ attributes, setAttributes },
					)}
				</InspectorControls>
			)}
			{typeof inheritedBorderColor === "undefined" &&
				typeof inheritedBorderWidth === "undefined" &&
				typeof inheritedBorderRadius === "undefined" && (
					<InspectorControls group="styles">
						<PanelBody
							title={__("Video Block Styles", "folioblocks")}
							initialOpen={true}
						>
							<ImageStyleControl
								attributes={attributes}
								setAttributes={setAttributes}
								subject={__("Video", "folioblocks")}
							/>
						</PanelBody>
						{applyFilters("folioBlocks.videoBlock.iconStyleControls", null, {
							attributes,
							setAttributes,
							isInsideGallery,
							enableWooCommerce,
							hasWooCommerce,
						})}
					</InspectorControls>
				)}
			<InspectorControls group="styles">
				{applyFilters(
					"folioBlocks.videoBlock.hoverOverlayStyleControls",
					null,
					{
						attributes,
						setAttributes,
						isInsideGallery: isInsideGallery && !overridesGalleryHover,
					},
				)}
			</InspectorControls>

			{/* Visual layout: thumbnail or placeholder or video */}
			<div {...blockProps}>
				{!thumbnail ? (
					<div
						className={`pb-video-block ${ASPECT_RATIOS[effectiveAspectRatio]}`}
					>
						<div className="video-thumbnail-placeholder">
							<span className="placeholder-label">
								{__("No Thumbnail Selected", "folioblocks")}
							</span>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={(media) => {
										setThumbnail(media);
									}}
									allowedTypes={["image"]}
									render={({ open }) => (
										<Button onClick={open} variant="secondary">
											{__("Select Thumbnail", "folioblocks")}
										</Button>
									)}
								/>
							</MediaUploadCheck>
						</div>
					</div>
				) : !videoUrl ? (
					<MediaPlaceholder
						icon="format-video"
						labels={{ title: __("Add Video", "folioblocks") }}
						allowedTypes={["video"]}
						onSelect={(media) => setAttributes({ videoUrl: media.url })}
						onSelectURL={updateVideoUrl}
						accept="video/*"
						addToGallery={false}
					/>
				) : (
					<div
						className={`pb-video-block ${ASPECT_RATIOS[effectiveAspectRatio]}${showOverlayAlways ? " has-overlay-always" : ""
							}${showOverlayOnHover ? " has-overlay-hover" : ""}${isColorOverlay ? " has-color-overlay" : ""
							}${isBlurOverlay ? " has-blur-overlay" : ""}${shadowStyleClass ? ` ${shadowStyleClass}` : ""
							}`}
						style={{
							"--pb-border-width": `${effectiveBorderWidth}px`,
							borderWidth: `${effectiveBorderWidth}px`,
							borderStyle: "solid",
							borderColor: effectiveBorderColor || "transparent",
							borderRadius: effectiveBorderRadius
								? `${effectiveBorderRadius}px`
								: undefined,
							...overlayStyleVars,
						}}
						data-filter={primaryCategory}
						data-filters={allCategories}
						onClick={() => {
							if (!lightboxEnabled) {
								return;
							}
							if (videoUrl) {
								setLightboxOpen(true);
							}
						}}
					>
						<img
							src={resolvedThumbnailUrl}
							alt={title || ""}
							className="pb-video-block-img"
						/>

						{applyFilters("folioBlocks.pbVideoBlock.renderAddToCart", null, {
							attributes,
							context,
							isInVideoGallery,
							isInsideGallery,
							cartIconStyleVars,
							effectiveCartIconColor,
							effectiveCartIconBgColor,
						})}
						<div className="video-overlay">
							<div className="overlay-content">
								{title && effectiveTitleVisibility !== "hidden" && (
									<div
										className={`video-title-overlay ${effectiveTitleVisibility}`}
									>
										{title}
									</div>
								)}
								{effectivePlayButtonVisibility !== "hidden" && (
									<div
										className={`video-play-button ${effectivePlayButtonVisibility}`}
									>
										<IconPlayButton />
									</div>
								)}
								{effectiveShowFilterCategory && primaryCategory && (
									<div
										className={`video-category-overlay ${effectiveOverlayVisibility}`}
									>
										{primaryCategory}
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{isLightboxOpen && (
					<div
						className={`pb-video-lightbox ${isLightboxOpen ? "active" : ""} ${effectiveLightboxLayout === "split" ? "split-layout" : ""
							} ${effectiveLightboxLayout === "video-product"
								? "video-product-layout"
								: ""
							} ${effectiveLightboxTheme === "light" ? "light-mode" : ""}`}
						style={{ "--pb-video-lightbox-ratio": videoLightboxRatio }}
						onClick={(e) => {
							if (!e.target.closest(".pb-video-lightbox-video, .pb-video-lightbox-info, .pb-video-lightbox-close, .lightbox-fullscreen")) {
								setLightboxOpen(false);
							}
						}}
					>
						<div className="pb-video-lightbox-inner">
							<button
								className="pb-video-lightbox-close"
								onClick={() => setLightboxOpen(false)}
								aria-label={__("Close lightbox", "folioblocks")}
							>
								×
							</button>

							{effectiveLightboxLayout === "video-only" && (
								<div className="pb-video-lightbox-video">
									{getVideoEmbedMarkup(videoUrl, youtubeEmbedPreview)}
								</div>
							)}

							{effectiveLightboxLayout === "split" && (
								<>
									<div className="pb-video-lightbox-video">
										{getVideoEmbedMarkup(videoUrl, youtubeEmbedPreview)}
									</div>
									<div className="pb-video-lightbox-info">
										{title && <h2 className="lightbox-title">{title}</h2>}
										{description && (
											<p className="lightbox-description">{description}</p>
										)}
									</div>
								</>
							)}

							{applyFilters("folioBlocks.pbVideoBlock.renderLightbox", null, {
								attributes,
								videoUrl,
								isInVideoGallery,
								lightboxLayout: effectiveLightboxLayout,
								enableWooCommerce,
								getVideoEmbedMarkup: (url) =>
									getVideoEmbedMarkup(url, youtubeEmbedPreview),
								title,
								description,
								__,
							})}
						</div>
					</div>
				)}
			</div>
		</>
	);
}
