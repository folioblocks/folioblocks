import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	MediaPlaceholder,
	PanelColorSettings,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	ToolbarGroup,
	ToolbarButton,
	ColorPalette,
	BaseControl,
	RangeControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { alignLeft, alignCenter, alignRight } from '@wordpress/icons';
import { plus } from '@wordpress/icons';
import { decodeEntities } from '@wordpress/html-entities';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useCallback, useRef, useState } from '@wordpress/element';
import { applyThumbnails } from '../pb-helpers/applyThumbnails';
import IconCarouselGallery from '../pb-helpers/IconCarouselGallery';
import './editor.scss';

export default function Edit({ clientId, attributes, setAttributes }) {
	const ALLOWED_BLOCKS = ['portfolio-blocks/pb-image-block'];

	const {
		carouselHeight,
		enableDownload,
		downloadOnHover,
		preview,
	} = attributes;

	// Block Preview Image
	if (preview) {
		return (
			<div className="pb-block-preview">
				<IconCarouselGallery />
			</div>
		);
	}


	const blockProps = useBlockProps({
		'data-carousel-height': carouselHeight, // optional debug aid
		'data-in-carousel': true, // optional debug aid
	});
	const galleryRef = useRef(null);

	const { replaceInnerBlocks, updateBlockAttributes } = useDispatch(blockEditorStore);

	const innerBlocks = useSelect(
		(select) => select(blockEditorStore).getBlocks(clientId),
		[clientId]
	);

	const calculateCarouselHeight = () => {
		const container = galleryRef.current;
		const width = container?.offsetWidth || containerWidth || 0;

		const isMobile = width <= 768;
		const [w, h] = (isMobile && attributes.verticalOnMobile) ? [2, 3] : [3, 2];
		const ratio = h / w;

		return Math.round(width * 0.85 * ratio);
	};

	const onSelectImages = async (media) => {
		if (!media || media.length === 0) return;

		const currentBlocks = wp.data.select('core/block-editor').getBlocks(clientId);
		const existingImageIds = currentBlocks.map((block) => block.attributes.id);

		// Fetch titles in a single batch for performance
		const imageIds = media.map((image) => image.id);
		const titleMap = {};
		try {
			const responses = await wp.apiFetch({
				path: `/wp/v2/media?include=${imageIds.join(',')}&per_page=100`,
			});

			responses.forEach((item) => {
				titleMap[item.id] = decodeEntities(item.title?.rendered || '');
			});
		} catch (error) {
			console.error("Failed to fetch image titles:", error);
		}

		// Create new blocks
		const newBlocks = media
			.filter((image) => !existingImageIds.includes(image.id))
			.map((image) => {
				const fullSize = image.sizes?.full || {};
				const width = fullSize.width || image.width || 0;
				const height = fullSize.height || image.height || 0;

				return wp.blocks.createBlock('portfolio-blocks/pb-image-block', {
					id: image.id,
					src: image.url,
					alt: image.alt || '',
					title: titleMap[image.id] || image.title || '',
					width,
					height,
					sizes: image.sizes || {},
					caption: image.caption || '',
				});
			});

		// Replace inner blocks
		replaceInnerBlocks(clientId, [...currentBlocks, ...newBlocks]);

		const immediateHeight = calculateCarouselHeight();
		if (!isNaN(immediateHeight)) {
			setAttributes({ carouselHeight: immediateHeight });
		}

		// Trigger layout recalculation
		setTimeout(() => {
			updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
		}, 300);
	};

	const { ref: innerRef, ...restInnerBlocksProps } = useInnerBlocksProps(
		{
			className: 'pb-carousel-gallery',
			style: { '--pb-carousel-height': `${carouselHeight || 400}px` },
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			templateLock: false,
			orientation: 'horizontal',
			renderAppender: false,
		}
	);
	// Merge refs for gallery DOM node
	const containerRef = useRef();
	const mergedRef = useCallback((node) => {
		galleryRef.current = node;
		containerRef.current = node;
		if (typeof innerRef === 'function') innerRef(node);
		else if (innerRef && typeof innerRef === 'object') innerRef.current = node;
	}, [innerRef]);


	// Calculate and set carousel height based on aspect ratio and container width
	const [containerWidth, setContainerWidth] = useState(0);
	useEffect(() => {
		const observer = new ResizeObserver(([entry]) => {
			setContainerWidth(entry.contentRect.width);
		});
		if (galleryRef.current) {
			observer.observe(galleryRef.current);
		}
		return () => observer.disconnect();
	}, []);
	useEffect(() => {
		const isMobile = containerWidth <= 768;
		const [w, h] = (isMobile && attributes.verticalOnMobile) ? [2, 3] : [3, 2];
		const ratio = h / w;
		const idealHeight = Math.round(containerWidth * 0.85 * ratio);
		const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.85 : idealHeight;
		const newHeight = Math.min(idealHeight, maxHeight);

		if (!isNaN(newHeight) && newHeight !== attributes.carouselHeight) {
			const timeout = setTimeout(() => {
				setAttributes({ carouselHeight: newHeight });
			}, 100);
			return () => clearTimeout(timeout);
		}
	}, [containerWidth, attributes.verticalOnMobile]);

	// Determine if this block or one of its children is selected
	const isBlockOrChildSelected = useSelect(
		(select) => {
			const selectedId = select(blockEditorStore).getSelectedBlockClientId();
			if (!selectedId) return false;

			const selectedBlock = select(blockEditorStore).getBlock(selectedId);
			if (!selectedBlock) return false;

			// Check if this block is selected
			if (selectedBlock.clientId === clientId) return true;

			// Check if selected block is a pb-image-block inside this gallery
			if (
				selectedBlock.name === 'portfolio-blocks/pb-image-block' &&
				select(blockEditorStore).getBlockRootClientId(selectedId) === clientId
			) {
				return true;
			}

			return false;
		},
		[clientId]
	);
	// Apply thumbnails when this block or a child is selected
	useEffect(() => {
		if (isBlockOrChildSelected) {
			setTimeout(() => {
				applyThumbnails(clientId);
			}, 200);
		}
	}, [isBlockOrChildSelected]);


	// --- Scroll selected pb-image-block into center view in List View
	const selectedBlockClientId = useSelect(
		(select) => select(blockEditorStore).getSelectedBlockClientId(),
		[]
	);
	useEffect(() => {
		if (!selectedBlockClientId) return;

		const selectedBlock = wp.data.select('core/block-editor').getBlock(selectedBlockClientId);
		if (!selectedBlock || selectedBlock.name !== 'portfolio-blocks/pb-image-block') return;

		const parent = selectedBlock?.parent;
		if (!parent || !parent.includes(clientId)) return;

		const domEl = document.querySelector(`[data-block="${selectedBlockClientId}"]`);
		const container = containerRef.current;

		if (container && domEl) {
			const containerRect = container.getBoundingClientRect();
			const elementRect = domEl.getBoundingClientRect();
			const scrollLeft = container.scrollLeft;
			const offset = elementRect.left - containerRect.left - (containerRect.width - elementRect.width) / 2;

			// Get the scrollable ancestor (block editor canvas)
			const scrollContainer = document.querySelector('.edit-post-visual-editor');

			// Save original scroll position
			const originalTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY;

			container.scrollTo({
				left: scrollLeft + offset,
				behavior: 'smooth',
			});

			// Restore scroll after animation
			setTimeout(() => {
				if (scrollContainer) {
					scrollContainer.scrollTop = originalTop;
				} else {
					window.scrollTo({ top: originalTop });
				}
			}, 200);
		}
	}, [selectedBlockClientId]);

	// --- Sync images to attributes.images (existing)
	useEffect(() => {
		const updatedImages = innerBlocks.map(block => ({
			id: block.attributes.id,
			src: block.attributes.src,
			alt: block.attributes.alt,
			title: block.attributes.title,
			width: block.attributes.width,
			height: block.attributes.height,
			sizes: block.attributes.sizes,
			caption: block.attributes.caption,
		}));
		setAttributes({ images: updatedImages });
	}, [innerBlocks]);

	// --- Apply thumbnails as a fallback if not already present
	useEffect(() => {
		const hasImages = innerBlocks.length > 0;
		const listViewHasThumbnails = document.querySelector('[data-pb-thumbnail-applied="true"]');

		if (hasImages && !listViewHasThumbnails) {
			setTimeout(() => {
				applyThumbnails(clientId);
			}, 300);
		}
	}, [innerBlocks]);

	// Carousel navigation state and handlers
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);

	const goToPrevSlide = () => {
		setCurrentSlide((prev) => Math.max(0, prev - 1));
	};

	const goToNextSlide = () => {
		setCurrentSlide((prev) => Math.min(innerBlocks.length - 1, prev + 1));
	};

	// Scroll to active slide on change
	useEffect(() => {
		const scrollContainer = containerRef.current;
		console.log("▶️ Scroll triggered. currentSlide:", currentSlide);
		console.log("📦 Scroll container (from ref):", scrollContainer);

		if (!scrollContainer) return;

		const blockOrder = wp.data.select('core/block-editor').getBlockOrder(clientId);
		const blockClientId = blockOrder[currentSlide];
		console.log("🔢 blockClientId for currentSlide:", blockClientId);

		const blockNode = scrollContainer.querySelector(`[data-block="${blockClientId}"]`);
		console.log("🧱 blockNode:", blockNode);

		if (!blockNode) return;

		const containerRect = scrollContainer.getBoundingClientRect();
		const elementRect = blockNode.getBoundingClientRect();
		const scrollLeft = scrollContainer.scrollLeft;
		const offset = elementRect.left - containerRect.left;

		scrollContainer.scrollTo({
			left: scrollLeft + offset,
			behavior: 'smooth',
		});
	}, [currentSlide, clientId]);

	// Autoplay effect: advance slide automatically if isPlaying and autoplay are true
	useEffect(() => {
		if (!attributes.autoplay || !isPlaying) return;

		const interval = setInterval(() => {
			setCurrentSlide((prev) => {
				if (prev + 1 < innerBlocks.length) {
					return prev + 1;
				} else {
					return 0; // Jump back to the first slide instead of stopping
				}
			});
		}, (attributes.autoplaySpeed || 3) * 1000);

		return () => clearInterval(interval);
	}, [isPlaying, attributes.autoplaySpeed, attributes.autoplay, innerBlocks.length]);

	// Listen for scroll events to update currentSlide
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		let scrollTimeout;

		const handleScroll = () => {
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}

			scrollTimeout = setTimeout(() => {
				const children = Array.from(container.querySelectorAll('[data-block]'));
				const containerRect = container.getBoundingClientRect();

				let closestIndex = 0;
				let minOffset = Infinity;

				children.forEach((child, index) => {
					const rect = child.getBoundingClientRect();
					const containerRight = containerRect.right;

					if (index === children.length - 1) {
						// If the last slide is flush with the right edge, mark it as active
						if (Math.abs(rect.right - containerRight) < 2) {
							closestIndex = index;
							return; // Exit early if last slide is detected
						}
					}

					const offset = Math.abs(rect.left - containerRect.left - containerRect.width / 2 + rect.width / 2);
					if (offset < minOffset) {
						minOffset = offset;
						closestIndex = index;
					}
				});

				setCurrentSlide(closestIndex);
			}, 100); // wait 100ms after scroll ends
		};

		container.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			container.removeEventListener('scroll', handleScroll);
			if (scrollTimeout) clearTimeout(scrollTimeout);
		};
	}, []);

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={plus}
						label={__('Add Images', 'portfolio-blocks')}
						onClick={() => {
							wp.media({
								title: __('Select Images', 'portfolio-blocks'),
								multiple: true,
								library: { type: 'image' },
								button: { text: __('Add to Gallery', 'portfolio-blocks') },
							})
								.on('select', () => {
									const selection = wp.media.frame.state().get('selection').toJSON();
									onSelectImages(selection);
								})
								.open();
						}}
					>
						{__('Add Images', 'portfolio-blocks')}
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={__('General Gallery Settings', 'portfolio-blocks')} initialOpen={true}>
					<SelectControl
						label={__('Resolution', 'portfolio-blocks')}
						value={attributes.resolution || 'large'}
						options={[
							{ label: __('Thumbnail', 'portfolio-blocks'), value: 'thumbnail' },
							{ label: __('Medium', 'portfolio-blocks'), value: 'medium' },
							{ label: __('Large', 'portfolio-blocks'), value: 'large' },
							{ label: __('Full', 'portfolio-blocks'), value: 'full' },
						].filter(option => {
							// Check all images for available sizes
							const allSizes = innerBlocks.flatMap(block => Object.keys(block.attributes.sizes || {}));
							return allSizes.includes(option.value) || option.value === 'full';
						})}
						onChange={(newResolution) => {
							setAttributes({ resolution: newResolution });
							innerBlocks.forEach((block) => {
								const newSrc = block.attributes.sizes?.[newResolution]?.url || block.attributes.src;
								updateBlockAttributes(block.clientId, {
									src: newSrc,
									imageSize: newResolution,
								});
							});
						}}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={__('Select the size of the source image.')}
					/>
					<SelectControl
						label={__('Image Orientation (Mobile)', 'portfolio-blocks')}
						value={attributes.verticalOnMobile ? 'vertical' : 'horizontal'}
						options={[
							{ label: __('Horizontal Images', 'portfolio-blocks'), value: 'horizontal' },
							{ label: __('Vertical Images', 'portfolio-blocks'), value: 'vertical' },
						]}
						onChange={(val) => setAttributes({ verticalOnMobile: val === 'vertical' })}
						help={__('Affects layout on mobile only. Switch ONLY when all images are vertical in orientation.', 'portfolio-blocks')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<ToggleControl
						label={__('Enable Image Downloads', 'portfolio-blocks')}
						checked={enableDownload}
						onChange={(value) => setAttributes({ enableDownload: value })}
						__nextHasNoMarginBottom
						help={__('Enable visitors to download images from the gallery.', 'portfolio-blocks')}
					/>

					{enableDownload && (
						<SelectControl
							label={__('Display Image Download Icon', 'portfolio-blocks')}
							value={downloadOnHover ? 'hover' : 'always'}
							options={[
								{ label: __('Always', 'portfolio-blocks'), value: 'always' },
								{ label: __('On Hover', 'portfolio-blocks'), value: 'hover' },
							]}
							onChange={(value) => setAttributes({ downloadOnHover: value === 'hover' })}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							help={__('Set display preference for Image Download icon.')}
						/>
					)}
					<ToggleControl
						label="Disable Right-Click on Page"
						help="Prevents visitors from right-clicking."
						__nextHasNoMarginBottom={true}
						checked={attributes.disableRightClick}
						onChange={(value) => setAttributes({ disableRightClick: value })}
					/>
				</PanelBody>
				<PanelBody title={__('Gallery Control Settings', 'portfolio-blocks')} initialOpen={true}>
					<ToggleControl
						label={__('Enable Carousel Controls', 'portfolio-blocks')}
						checked={attributes.showControls}
						onChange={(value) => setAttributes({ showControls: value })}
						__nextHasNoMarginBottom
						help={__('Toggle visibility of navigation arrows.', 'portfolio-blocks')}
					/>
					{attributes.showControls && (
						<>
							<ToggleGroupControl
								label={__('Controls Alignment', 'portfolio-blocks')}
								value={attributes.controlsAlignment || 'center'}
								onChange={(newValue) => setAttributes({ controlsAlignment: newValue })}
								isBlock
								help={__('Set the horizontal alignment of carousel controls.', 'portfolio-blocks')}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							>
								<ToggleGroupControlOption value="left" icon={alignLeft} label={__('Left', 'portfolio-blocks')} />
								<ToggleGroupControlOption value="center" icon={alignCenter} label={__('Center', 'portfolio-blocks')} />
								<ToggleGroupControlOption value="right" icon={alignRight} label={__('Right', 'portfolio-blocks')} />
							</ToggleGroupControl>

							<ToggleControl
								label={__('Enable Autoplay', 'portfolio-blocks')}
								checked={attributes.autoplay || false}
								onChange={(value) => setAttributes({ autoplay: value })}
								__nextHasNoMarginBottom
								help={__('Automatically advance to the next image in the carousel.', 'portfolio-blocks')}
							/>
							{attributes.autoplay && (
								<RangeControl
									label={__('Autoplay Speed (seconds)', 'portfolio-blocks')}
									value={attributes.autoplaySpeed || 3}
									onChange={(value) => setAttributes({ autoplaySpeed: value })}
									min={1}
									max={5}
									step={0.25}
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									help={__('Time between automatic slide transitions.', 'portfolio-blocks')}
								/>
							)}
						</>
					)}
				</PanelBody>
				<PanelBody title={__('Gallery Image Settings', 'portfolio-blocks')} initialOpen={true}>
					<ToggleControl
						label={__('Enable Lightbox', 'portfolio-blocks')}
						checked={attributes.lightbox || false}
						onChange={(newLightbox) => setAttributes({ lightbox: newLightbox })}
						__nextHasNoMarginBottom={true}
						help={__('Enable image Lightbox on click.')}
					/>
					{attributes.lightbox && (
						<ToggleControl
							label={__('Show Caption in Lightbox', 'portfolio-blocks')}
							checked={attributes.lightboxCaption || false}
							onChange={(newLightboxCaption) => setAttributes({ lightboxCaption: newLightboxCaption })}
							__nextHasNoMarginBottom={true}
							help={__('Display image Captions inside the lightbox.')}
						/>
					)}
					<ToggleControl
						label={__('Show Title on Hover', 'portfolio-blocks')}
						checked={attributes.onHoverTitle || false}
						onChange={(newonHoverTitle) => setAttributes({ onHoverTitle: newonHoverTitle })}
						__nextHasNoMarginBottom={true}
						help={__('Enable image Title appearing on hover.')}
					/>

				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				{attributes.showControls && (
					<PanelColorSettings
						title={__('Carousel Control Styles', 'portfolio-blocks')}
						initialOpen={true}
						colorSettings={[
							{
								value: attributes.controlsBackgroundColor,
								onChange: (value) => setAttributes({ controlsBackgroundColor: value }),
								label: __('Control Background Color', 'portfolio-blocks'),
							},
							{
								value: attributes.controlsIconColor,
								onChange: (value) => setAttributes({ controlsIconColor: value }),
								label: __('Control Icon Color', 'portfolio-blocks'),
							},
						]}
					/>
				)}
				<PanelBody title={__('Gallery Image Styles', 'portfolio-blocks')} initialOpen={true}>
					<ToggleControl
						label={__('Enable Drop Shadow', 'portfolio-blocks')}
						checked={attributes.dropShadow || false}
						onChange={(newDropShadow) => setAttributes({ dropShadow: newDropShadow })}
						__nextHasNoMarginBottom
						help={__('Applies a subtle drop shadow to images.')}
					/>
					<BaseControl label={__('Border Color', 'portfolio-blocks')} __nextHasNoMarginBottom>
						<ColorPalette
							value={attributes.borderColor}
							onChange={(value) => setAttributes({ borderColor: value })}
							clearable={false}
							help={__('Set border color.')}
						/>
					</BaseControl>
					<RangeControl
						label={__('Border Width', 'portfolio-blocks')}
						value={attributes.borderWidth}
						onChange={(value) => {
							setAttributes({ borderWidth: value });
							setTimeout(() => {
								updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
							}, 50);
						}}
						min={0}
						max={20}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						help={__('Set border width in pixels.')}
					/>
					<RangeControl
						label={__('Border Radius', 'portfolio-blocks')}
						value={attributes.borderRadius}
						onChange={(value) => {
							setAttributes({ borderRadius: value });
							setTimeout(() => {
								updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
							}, 50);
						}}
						min={0}
						max={100}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						help={__('Set border radius in pixels.')}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{innerBlocks.length === 0 ? (
					<MediaPlaceholder
						icon={<IconCarouselGallery />}
						labels={{
							title: __('Carousel Gallery', 'portfolio-blocks'),
							instructions: __('Upload or select images to create a carousel.', 'portfolio-blocks'),
						}}
						onSelect={onSelectImages}
						accept="image/*"
						allowedTypes={['image']}
						multiple
					/>
				) : (
					<div
						ref={mergedRef}
						{...restInnerBlocksProps}
					/>
				)}
				{attributes.showControls && innerBlocks.length > 0 && (
					<div className={`pb-carousel-controls align-${attributes.controlsAlignment || 'center'}`} >
						<button
							onClick={goToPrevSlide}
							className="pb-carousel-chevron prev"
							style={{
								backgroundColor: attributes.controlsBackgroundColor || 'rgba(0, 0, 0, 0.5)',
								color: attributes.controlsIconColor || '#ffffff',
							}}
						>
							<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
								<path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
							</svg>
						</button>
						{attributes.autoplay && (
							<button
								className="pb-carousel-play-button"
								aria-label={isPlaying ? 'Pause' : 'Play'}
								onClick={() => setIsPlaying((prev) => !prev)}
								style={{
									backgroundColor: attributes.controlsBackgroundColor || 'rgba(0, 0, 0, 0.5)',
									color: attributes.controlsIconColor || '#ffffff',
								}}
							>
								{isPlaying ? (
									<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
										<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
									</svg>
								) : (
									<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
										<path d="M8 5v14l11-7z"/>
									</svg>
								)}
							</button>
						)}
						<button
							onClick={goToNextSlide}
							className="pb-carousel-chevron next"
							style={{
								backgroundColor: attributes.controlsBackgroundColor || 'rgba(0, 0, 0, 0.5)',
								color: attributes.controlsIconColor || '#ffffff',
							}}
						>
							<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
								<path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
							</svg>
						</button>
					</div>
				)}
			</div>
		</>
	);
}