/**
 * Modular Gallery Block
 * Edit JS
 */
import { __ } from "@wordpress/i18n";
import { select, useSelect, useDispatch } from "@wordpress/data";
import { useState, useEffect, useRef, useCallback } from "@wordpress/element";
import {
	BlockControls,
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	MediaPlaceholder,
} from "@wordpress/block-editor";
import {
	ToolbarGroup,
	ToolbarButton,
	PanelBody,
	ToggleControl,
	SelectControl,
	Panel,
} from "@wordpress/components";
import { createBlock } from "@wordpress/blocks";
import { row } from "@wordpress/icons";
import { applyFilters } from "@wordpress/hooks";
import { IconModularGallery } from "../pb-helpers/icons";
import { getExifAttributesFromMedia } from "../pb-helpers/exifMetadata";
import { getImageSizeOptions } from "../pb-helpers/imageSizeOptions";
import { imageProFeatureNotice } from "../pb-helpers/imageProFeatureNotices";
import ResponsiveRangeControl from "../pb-helpers/ResponsiveRangeControl";
import {
	getGalleryGapForWidth,
	resolveGalleryGaps,
} from "../pb-helpers/galleryGap";

import "./editor.scss";

const ALLOWED_BLOCKS = ["folioblocks/pb-image-row"];

const getImageClickAction = ({
	lightbox,
	enableDownload,
	enableWooCommerce,
	imageClickAction,
}) => {
	if (imageClickAction) {
		return imageClickAction;
	}
	if (enableWooCommerce) {
		return "woocommerce";
	}
	if (enableDownload) {
		return "download";
	}
	if (lightbox) {
		return "lightbox";
	}
	return "none";
};

const getImageClickAttributes = (value) => {
	switch (value) {
		case "lightbox":
			return {
				imageClickAction: "lightbox",
				lightbox: true,
				enableDownload: false,
				enableWooCommerce: false,
			};
		case "download":
			return {
				imageClickAction: "download",
				imageClickTarget: "icon",
				lightbox: false,
				enableDownload: true,
				enableWooCommerce: false,
			};
		case "woocommerce":
			return {
				imageClickAction: "woocommerce",
				imageClickTarget: "icon",
				enableDownload: false,
				enableWooCommerce: true,
			};
		case "media_file":
			return {
				imageClickAction: "media_file",
				lightbox: false,
				enableDownload: false,
				enableWooCommerce: false,
			};
		case "custom_url":
			return {
				imageClickAction: "custom_url",
				imageClickTarget: "icon",
				lightbox: false,
				enableDownload: false,
				enableWooCommerce: false,
			};
		case "page_post":
			return {
				imageClickAction: "page_post",
				imageClickTarget: "icon",
				lightbox: false,
				enableDownload: false,
				enableWooCommerce: false,
			};
		case "none":
		default:
			return {
				imageClickAction: "none",
				lightbox: false,
				enableDownload: false,
				enableWooCommerce: false,
			};
	}
};

const getImageClickHelp = (value) => {
	switch (value) {
		case "woocommerce":
			return __(
				"Choose WooCommerce products from the individual Image Block settings.",
				"folioblocks",
			);
		case "custom_url":
			return __(
				"Add custom URLs from the individual Image Block settings.",
				"folioblocks",
			);
		case "page_post":
			return __(
				"Choose pages or posts from the individual Image Block settings.",
				"folioblocks",
			);
		default:
			return __(
				"Choose what happens when visitors click gallery images.",
				"folioblocks",
			);
	}
};

const getImageAspectRatio = (img) => {
	if (!img) {
		return 0;
	}

	const width = img.naturalWidth || img.width || 0;
	const height = img.naturalHeight || img.height || 0;

	return width > 0 && height > 0 ? width / height : 0;
};

const getRowAspectRatio = (rowWrapper) => {
	const row = rowWrapper?.querySelector(".pb-image-row");
	const imageWrappers = row
		? Array.from(row.children).filter((child) =>
				child.classList.contains("wp-block-folioblocks-pb-image-block"),
		  )
		: [];

	return imageWrappers.reduce((total, wrapper) => {
		const ratio = getImageAspectRatio(wrapper.querySelector("img"));
		return total + ratio;
	}, 0);
};

const getRowImageCount = (rowWrapper) => {
	const row = rowWrapper?.querySelector(".pb-image-row");
	return row
		? Array.from(row.children).filter((child) =>
				child.classList.contains("wp-block-folioblocks-pb-image-block"),
		  ).length
		: 0;
};

const getStackItems = (stackWrapper) => {
	const stack = stackWrapper?.querySelector(".pb-image-stack");
	if (!stack) {
		return [];
	}

	return Array.from(stack.children)
		.map((child) => {
			if (child.classList.contains("wp-block-folioblocks-pb-image-block")) {
				const ratio = getImageAspectRatio(child.querySelector("img"));
				return ratio ? { wrapper: child, type: "image", ratio } : null;
			}

			if (child.classList.contains("wp-block-folioblocks-pb-image-row")) {
				const ratio = getRowAspectRatio(child);
				return ratio
					? {
							wrapper: child,
							type: "row",
							ratio,
							imageCount: getRowImageCount(child),
					  }
					: null;
			}

			return null;
		})
		.filter(Boolean);
};

const getStackAspectRatio = (stackWrapper) => {
	const stackItems = getStackItems(stackWrapper);
	const totalInverseRatio = stackItems.reduce(
		(total, item) => total + 1 / item.ratio,
		0,
	);

	return totalInverseRatio > 0 ? 1 / totalInverseRatio : 0;
};

const getStackNestedRowGapAdjustment = (stackItems, gap) =>
	stackItems.reduce((total, item) => {
		if (item.type !== "row") {
			return total;
		}

		const rowGaps = Math.max(0, item.imageCount - 1) * gap;
		return total + rowGaps / item.ratio;
	}, 0);

const applyImageWrapperLayout = (wrapper, width, height, marginRight = "0") => {
	wrapper.style.width = `${width}px`;
	wrapper.style.height = `${height}px`;
	wrapper.style.marginRight = marginRight;

	const figure = wrapper.querySelector(".pb-image-block");
	if (figure) {
		figure.style.width = "100%";
		figure.style.height = "100%";
		figure.style.marginRight = "0";
		figure.style.marginBottom = "0";
	}
};

const applyNestedRowLayout = (rowWrapper, width, height, gap) => {
	rowWrapper.style.width = `${width}px`;
	rowWrapper.style.height = `${height}px`;

	const row = rowWrapper.querySelector(".pb-image-row");
	if (!row) {
		return;
	}

	const imageWrappers = Array.from(row.children).filter((child) =>
		child.classList.contains("wp-block-folioblocks-pb-image-block"),
	);
	const ratios = imageWrappers.map((wrapper) =>
		getImageAspectRatio(wrapper.querySelector("img")),
	);
	const totalRatio = ratios.reduce((total, ratio) => total + ratio, 0);
	if (!totalRatio || ratios.some((ratio) => !ratio)) {
		return;
	}

	const widths = ratios.map((ratio) => ratio * height);

	imageWrappers.forEach((wrapper, imageIndex) => {
		applyImageWrapperLayout(
			wrapper,
			widths[imageIndex],
			height,
			imageIndex === imageWrappers.length - 1 ? "0" : `${gap}px`,
		);
	});
};

const applyStackLayout = (stackWrapper, layout, gap) => {
	stackWrapper.style.width = `${layout.width}px`;
	stackWrapper.style.height = `${layout.height}px`;
	stackWrapper.style.marginRight = layout.marginRight;

	const stackItems = getStackItems(stackWrapper);
	if (!stackItems.length) {
		return;
	}

	stackItems.forEach((item, index) => {
		const itemHeight =
			item.type === "row"
				? Math.max(
						1,
						(layout.width - Math.max(0, item.imageCount - 1) * gap) /
							item.ratio,
				  )
				: layout.width / item.ratio;
		const marginBottom =
			gap === 0 || index === stackItems.length - 1 ? "0px" : `${gap}px`;

		item.wrapper.style.marginBottom = marginBottom;

		if (item.type === "image") {
			applyImageWrapperLayout(item.wrapper, layout.width, itemHeight, "0");
			return;
		}

		applyNestedRowLayout(item.wrapper, layout.width, itemHeight, gap);
	});
};

export default function Edit(props) {
	const { clientId, attributes, setAttributes } = props;
	const { noGap, lightbox, lightboxCaption, preview } = attributes;
	const responsiveGaps = resolveGalleryGaps(attributes);

	// Block Preview Image
	if (preview) {
		return (
			<div className="pb-block-preview">
				<IconModularGallery />
			</div>
		);
	}

	// Runtime override: if WooCommerce is not active, force Woo features off without mutating saved attributes
	const hasWooCommerce = window.folioBlocksData?.hasWooCommerce ?? false;
	const effectiveEnableWoo = hasWooCommerce
		? attributes.enableWooCommerce || false
		: false;
	useEffect(() => {
		const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
		if (wooActive !== attributes.hasWooCommerce) {
			setAttributes({ hasWooCommerce: wooActive });
		}
	}, [window.folioBlocksData?.hasWooCommerce]);

	const { insertBlock, replaceBlocks, selectBlock } =
		useDispatch("core/block-editor");

	const innerBlocks = useSelect(
		(select) => {
			return select("core/block-editor").getBlock(clientId)?.innerBlocks || [];
		},
		[clientId],
	);
	const availableImageSizes = useSelect(
		(select) => select("core/block-editor").getSettings()?.imageSizes || [],
		[],
	);
	const imageSizeOptions = getImageSizeOptions(availableImageSizes, __);

	const handleImageSelect = async (media) => {
		try {
			// Fetch the full media object to ensure we get raw fields
			const response = await wp.apiFetch({
				path: `/wp/v2/media/${media.id}`,
			});

			const title = response.title?.rendered || "";
			// Prefer raw caption, fallback to media.caption
			const caption = response.caption?.raw || media.caption || "";
			const alt = response.alt_text || media.alt || "";

			const rowBlock = wp.blocks.createBlock("folioblocks/pb-image-row", {}, [
				wp.blocks.createBlock("folioblocks/pb-image-block", {
					id: media.id,
					src: media.url,
					alt,
					title,
					caption,
					sizes: media.sizes || {},
					width: media.width || 0,
					height: media.height || 0,
					...(getExifAttributesFromMedia(response) ||
						getExifAttributesFromMedia(media) ||
						{}),
				}),
			]);

			wp.data
				.dispatch("core/block-editor")
				.replaceInnerBlocks(clientId, [rowBlock], false);
		} catch (error) {
			console.error("Failed to fetch image metadata:", error);
		}
	};

	useEffect(() => {
		const onAddToImageStack = (e) => {
			const targetId = e?.detail?.clientId;
			if (!targetId) {
				return;
			}

			const beSelect = select("core/block-editor");
			const parents = beSelect.getBlockParents(targetId, true) || [];
			// ensure the image is inside THIS gallery instance
			if (!parents.includes(clientId)) {
				return;
			}

			const getName = beSelect.getBlockName;
			const names = parents.map(getName);

			// must be inside an Image Row and NOT already in an Image Stack
			const inRow = names.includes("folioblocks/pb-image-row");
			const inStack = names.includes("folioblocks/pb-image-stack");
			if (!inRow || inStack) {
				return;
			}

			const imgBlock = beSelect.getBlock(targetId);
			if (!imgBlock || imgBlock.name !== "folioblocks/pb-image-block") {
				return;
			}

			// Build a new stack with a cloned image child
			const childImage = createBlock("folioblocks/pb-image-block", {
				...imgBlock.attributes,
			});
			const stackBlock = createBlock("folioblocks/pb-image-stack", {}, [
				childImage,
			]);

			// Replace the image with the new stack
			replaceBlocks(targetId, stackBlock);

			// Optional: focus the new child image
			// setTimeout(() => {
			//   const tree = select('core/block-editor').getBlock(stackBlock.clientId);
			//   const newChildId = tree?.innerBlocks?.[0]?.clientId;
			//   if (newChildId) {
			//     selectBlock(newChildId);
			//   }
			// }, 0);
		};

		window.addEventListener(
			"folioblocks:add-to-image-stack",
			onAddToImageStack,
		);
		return () =>
			window.removeEventListener(
				"folioblocks:add-to-image-stack",
				onAddToImageStack,
			);
	}, [clientId]);

	const handleAddRow = () => {
		const { createBlock } = wp.blocks;
		const newRow = createBlock("folioblocks/pb-image-row");
		insertBlock(newRow, innerBlocks.length, clientId);
	};
	const [layoutVersion, setLayoutVersion] = useState(0);
	const containerRef = useRef(null);
	const [rowLayouts, setRowLayouts] = useState({});
	const prevLayouts = useRef({});

	// Used to prevent a jarring first paint (images briefly appear at natural size)
	// by fading the gallery in only after we have applied the first successful layout.
	const [isLayoutReady, setIsLayoutReady] = useState(false);
	// Only fade-in once (initial load). After that, never hide the gallery during edits/reordering.
	const hasCompletedInitialFade = useRef(false);

	const recalculateLayout = useCallback(() => {
		if (!containerRef.current) {
			return;
		}
		const rowWrappers = Array.from(
			containerRef.current.querySelectorAll(".pb-image-row"),
		).filter((row) => !row.closest(".wp-block-folioblocks-pb-image-stack"));
		const layouts = {};
		let allRowsReady = true;

		rowWrappers.forEach((row, rowIndex) => {
			const wrappers = Array.from(row.children).filter(
				(child) =>
					child.classList.contains("wp-block-folioblocks-pb-image-block") ||
					child.classList.contains("wp-block-folioblocks-pb-image-stack"),
			);
			if (!wrappers.length) {
				return;
			}

			// Guard: Only proceed if all images in the row are fully loaded
			const images = row.querySelectorAll("img");
			const anyNotLoaded = Array.from(images).some((img) => !img.complete);
			if (anyNotLoaded) {
				allRowsReady = false;
				return;
			}

			// Proceed with layout calculation for the row (unchanged)
			const containerWidth = row.clientWidth;
			const gap = getGalleryGapForWidth(attributes, containerWidth);
			const totalGaps = gap * (wrappers.length - 1);

			const aspectRatios = [];
			let totalNaturalWidth = 0;
			const stackMeta = [];

			wrappers.forEach((wrapper) => {
				let ratio;
				let isStack = false;
				let stackImageCount = 0;
				let nestedRowGapAdjustment = 0;

				if (wrapper.classList.contains("wp-block-folioblocks-pb-image-block")) {
					ratio = getImageAspectRatio(wrapper.querySelector("img"));
				} else if (
					wrapper.classList.contains("wp-block-folioblocks-pb-image-stack")
				) {
					isStack = true;
					const stackItems = getStackItems(wrapper);
					stackImageCount = stackItems.length;
					nestedRowGapAdjustment = getStackNestedRowGapAdjustment(
						stackItems,
						gap,
					);
					ratio = getStackAspectRatio(wrapper);
				}

				if (ratio) {
					aspectRatios.push(ratio);
					totalNaturalWidth += ratio;
					stackMeta.push({
						isStack,
						stackImageCount,
						nestedRowGapAdjustment,
						wrapper,
					});
				}
			});

			if (aspectRatios.length !== wrappers.length || totalNaturalWidth === 0) {
				return;
			}

			const stackGapWidthAdjustment = stackMeta.reduce((total, item, index) => {
				if (!item.isStack) {
					return total;
				}
				const stackGaps = Math.max(0, item.stackImageCount - 1);
				return total + stackGaps * gap * aspectRatios[index];
			}, 0);
			const nestedRowGapWidthAdjustment = stackMeta.reduce(
				(total, item, index) => {
					if (!item.isStack) {
						return total;
					}

					return total + item.nestedRowGapAdjustment * aspectRatios[index];
				},
				0,
			);
			const targetHeight = Math.max(
				1,
				Math.floor(
					(containerWidth -
						totalGaps +
						stackGapWidthAdjustment -
						nestedRowGapWidthAdjustment) /
						totalNaturalWidth,
				),
			);

			let usedWidth = 0;
			const widths = aspectRatios.map((ratio, index) => {
				const item = stackMeta[index];
				const stackGaps = item.isStack
					? Math.max(0, item.stackImageCount - 1) * gap
					: 0;
				const nestedRowGapAdjustment = item.isStack
					? item.nestedRowGapAdjustment
					: 0;
				return Math.floor(
					ratio *
						Math.max(1, targetHeight - stackGaps + nestedRowGapAdjustment),
				);
			});
			widths.forEach((width) => {
				usedWidth += width;
			});
			const remainingWidth = containerWidth - usedWidth - totalGaps;

			const widthAdjustments = new Array(wrappers.length).fill(0);
			for (let i = 0; i < remainingWidth; i++) {
				widthAdjustments[i % wrappers.length]++;
			}

			layouts[rowIndex] = widths.map((w, i) => ({
				width: w + widthAdjustments[i],
				height: targetHeight,
				marginRight: i === wrappers.length - 1 ? "0" : `${gap}px`,
				isStack: stackMeta[i].isStack,
			}));

			wrappers.forEach((wrapper, index) => {
				const layout = layouts[rowIndex][index];
				if (!layout) {
					return;
				}

				if (!layout.isStack) {
					applyImageWrapperLayout(
						wrapper,
						layout.width,
						layout.height,
						layout.marginRight,
					);
				} else {
					applyStackLayout(wrapper, layout, gap);
				}
			});
		});

		// If any row's images are not loaded, skip layout recalculation.
		// IMPORTANT: we only hide during the initial load fade-in.
		if (!allRowsReady) {
			if (!hasCompletedInitialFade.current) {
				// Keep hidden until we can apply the first full layout.
				if (isLayoutReady) {
					setIsLayoutReady(false);
				}
			}
			return;
		}

		// At this point the layout has been applied for all rows.
		// Only fade in once. After that, keep the gallery visible even when reordering.
		if (!hasCompletedInitialFade.current) {
			if (!isLayoutReady) {
				setIsLayoutReady(true);
			}
			hasCompletedInitialFade.current = true;
		}

		const layoutsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
		if (!layoutsEqual(prevLayouts.current, layouts)) {
			setRowLayouts(layouts);
			setLayoutVersion(Date.now());
			prevLayouts.current = layouts;
		}
	}, [
		attributes,
		isLayoutReady,
		noGap,
		attributes.gap,
		attributes.tabletGap,
		attributes.mobileGap,
	]);

	const layoutTimer = useRef(null);
	const layoutFrame = useRef(null);

	const scheduleLayout = useCallback(
		(delay = 80) => {
			if (layoutTimer.current) {
				clearTimeout(layoutTimer.current);
			}
			if (layoutFrame.current) {
				cancelAnimationFrame(layoutFrame.current);
			}

			layoutTimer.current = setTimeout(() => {
				layoutFrame.current = requestAnimationFrame(() => {
					layoutFrame.current = null;
					recalculateLayout();
				});
			}, delay);
		},
		[recalculateLayout],
	);

	// Recalculate after add/remove/reorder. This does NOT hide the gallery.
	useEffect(() => {
		scheduleLayout();
	}, [
		innerBlocks,
		noGap,
		attributes.gap,
		attributes.tabletGap,
		attributes.mobileGap,
		scheduleLayout,
	]);

	useEffect(() => {
		const observer = new ResizeObserver(() => {
			scheduleLayout();
		});
		const container = containerRef.current;
		if (container) {
			observer.observe(container);
		}
		return () => observer.disconnect();
	}, [
		innerBlocks,
		noGap,
		attributes.gap,
		attributes.tabletGap,
		attributes.mobileGap,
		scheduleLayout,
	]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return undefined;
		}

		const images = Array.from(container.querySelectorAll("img"));
		const pendingImages = images.filter((img) => !img.complete);
		if (!pendingImages.length) {
			return undefined;
		}

		const handleImageReady = () => scheduleLayout(0);
		pendingImages.forEach((img) => {
			img.addEventListener("load", handleImageReady, { once: true });
			img.addEventListener("error", handleImageReady, { once: true });
		});

		return () => {
			pendingImages.forEach((img) => {
				img.removeEventListener("load", handleImageReady);
				img.removeEventListener("error", handleImageReady);
			});
		};
	}, [innerBlocks, scheduleLayout]);

	useEffect(() => {
		return () => {
			if (layoutTimer.current) {
				clearTimeout(layoutTimer.current);
			}
			if (layoutFrame.current) {
				cancelAnimationFrame(layoutFrame.current);
			}
		};
	}, []);

	const blockProps = useBlockProps({
		ref: containerRef,
		context: {
			"folioBlocks/noGap": noGap,
			"folioBlocks/layoutVersion": layoutVersion,
			"folioBlocks/rowLayouts": rowLayouts,
			"folioBlocks/enableWooCommerce": effectiveEnableWoo,
			"folioBlocks/hasWooCommerce": hasWooCommerce,
		},
		style: {
			"--pb-gallery-gap-desktop": `${responsiveGaps.gap}px`,
			"--pb-gallery-gap-tablet": `${responsiveGaps.tabletGap}px`,
			"--pb-gallery-gap-mobile": `${responsiveGaps.mobileGap}px`,
		},
	});
	const innerBlocksProps = useInnerBlocksProps(
		{
			className: [
				"pb-modular-gallery",
				noGap ? "no-row-gap" : "",
				attributes.collapseOnMobile ? "collapse-on-mobile" : "",
			]
				.filter(Boolean)
				.join(" "),
			style: {
				opacity: isLayoutReady ? 1 : 0,
				transition: "opacity 200ms ease",
				willChange: "opacity",
			},
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			orientation: "vertical",
			template: [["folioblocks/pb-image-row"]],
			templateLock: false,
		},
	);

	// Determine if the Modular Gallery block or any of its children is selected
	const isBlockOrChildSelected = useSelect(
		(select) => {
			const blockEditorStore = "core/block-editor";
			const selectedId = select(blockEditorStore).getSelectedBlockClientId();
			if (!selectedId) {
				return false;
			}

			const selectedBlock = select(blockEditorStore).getBlock(selectedId);
			if (!selectedBlock) {
				return false;
			}

			// Direct selection
			if (selectedBlock.clientId === clientId) {
				return true;
			}

			// Check if selected block is a pb-image-block nested within a pb-image-row or pb-image-stack
			if (selectedBlock.name === "folioblocks/pb-image-block") {
				const parents = select(blockEditorStore).getBlockParents(selectedId);
				return parents.includes(clientId);
			}

			return false;
		},
		[clientId],
	);

	// Always call editorEnhancements filter for consistent hook ordering
	applyFilters("folioBlocks.modularGallery.editorEnhancements", null, {
		attributes,
		clientId,
		innerBlocks,
		isBlockOrChildSelected,
	});

	const imageClickAction = getImageClickAction({
		lightbox,
		enableDownload: attributes.enableDownload,
		enableWooCommerce: effectiveEnableWoo,
		imageClickAction: attributes.imageClickAction,
	});
	const imageClickActionOptions = applyFilters(
		"folioBlocks.modularGallery.imageClickActionOptions",
		[
			{ label: __("None", "folioblocks"), value: "none" },
			{
				label: __("Open in Lightbox", "folioblocks"),
				value: "lightbox",
			},
		],
		{ attributes, hasWooCommerce },
	);
	const activeImageClickAction = imageClickActionOptions.some(
		(option) => option.value === imageClickAction,
	)
		? imageClickAction
		: "none";

	if (innerBlocks.length === 0) {
		return (
			<div {...blockProps}>
				<MediaPlaceholder
					icon={<IconModularGallery />}
					labels={{ title: __("Add First Image", "folioblocks") }}
					accept="image/*"
					allowedTypes={["image"]}
					multiple={false}
					onSelect={handleImageSelect}
				/>
			</div>
		);
	}

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={row}
						label="Add Image Row"
						onClick={handleAddRow}
					>
						{__("Add Image Row", "folioblocks")}
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={__("General Gallery Settings", "folioblocks")}
					initialOpen={true}
				>
					<SelectControl
						label={__("Image Resolution", "folioblocks")}
						value={attributes.resolution}
						options={imageSizeOptions}
						onChange={(value) => {
							setAttributes({ resolution: value });
						}}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={__("Select the size of the source image.")}
					/>
					<ToggleControl
						label={__("Collapse layout on Mobile", "folioblocks")}
						checked={attributes.collapseOnMobile}
						onChange={(value) => setAttributes({ collapseOnMobile: value })}
						__nextHasNoMarginBottom
						help={__(
							"Stack all images vertically on mobile devices.",
							"folioblocks",
						)}
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
						onChange={(newValues) =>
							setAttributes({
								...newValues,
								noGap: false,
							})
						}
						help={__("Set the space between gallery images.", "folioblocks")}
					/>
				</PanelBody>
				<PanelBody
					title={__("Gallery Click Settings", "folioblocks")}
					initialOpen={true}
				>
					<SelectControl
						label={__("Image Click Behavior", "folioblocks")}
						value={activeImageClickAction}
						options={imageClickActionOptions}
						onChange={(value) => setAttributes(getImageClickAttributes(value))}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={__(
							"Choose what happens when visitors click gallery images.",
							"folioblocks",
						)}
					/>
					{applyFilters(
						"folioBlocks.modularGallery.imageClickActionNotice",
						imageProFeatureNotice("clickActions"),
						{
							attributes,
							setAttributes,
							hasWooCommerce,
							effectiveEnableWoo,
						},
					)}
					{activeImageClickAction === "lightbox" &&
						applyFilters("folioBlocks.modularGallery.lightboxControls", null, {
							attributes,
							setAttributes,
						})}
					{activeImageClickAction === "download" &&
						applyFilters("folioBlocks.modularGallery.downloadControls", null, {
							attributes,
							setAttributes,
						})}
					{(activeImageClickAction === "custom_url" ||
						activeImageClickAction === "page_post") &&
						applyFilters(
							"folioBlocks.modularGallery.linkTargetControls",
							null,
							{
								attributes,
								setAttributes,
								imageClickAction: activeImageClickAction,
							},
						)}
					{activeImageClickAction === "woocommerce" &&
						applyFilters(
							"folioBlocks.modularGallery.wooCommerceControls",
							null,
							{ attributes, setAttributes },
						)}
				</PanelBody>
				<PanelBody
					title={__("Gallery Hover Settings", "folioblocks")}
					initialOpen={true}
				>
					{applyFilters(
						"folioBlocks.modularGallery.onHoverTitleToggle",
						imageProFeatureNotice("hoverSettings"),
						{ attributes, setAttributes },
					)}
				</PanelBody>
				<PanelBody
					title={__("Watermark Overlay", "folioblocks")}
					initialOpen={false}
				>
					{applyFilters(
						"folioBlocks.modularGallery.watermarkControls",
						imageProFeatureNotice("watermarkOverlay"),
						{ attributes, setAttributes },
					)}
				</PanelBody>
				{applyFilters(
					"folioBlocks.modularGallery.lazyLoadToggle",
					imageProFeatureNotice("protectionPerformance"),
					{ attributes, setAttributes },
				)}
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody
					title={__("Gallery Image Styles", "folioblocks")}
					initialOpen={true}
				>
					{applyFilters(
						"folioBlocks.modularGallery.imageStyles",
						imageProFeatureNotice("imageStyles"),
						{ attributes, setAttributes },
					)}
				</PanelBody>
				{applyFilters("folioBlocks.modularGallery.iconStyleControls", null, {
					attributes,
					setAttributes,
				})}
				{applyFilters(
					"folioBlocks.modularGallery.hoverOverlayStyleControls",
					null,
					{
						attributes,
						setAttributes,
					},
				)}
			</InspectorControls>

			<div {...blockProps}>
				<div {...innerBlocksProps} />
			</div>
		</>
	);
}
