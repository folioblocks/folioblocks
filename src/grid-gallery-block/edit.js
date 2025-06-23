
/**
 * External (WordPress) imports
 */
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	MediaPlaceholder,
	MediaUpload,
	BlockControls,
	PanelColorSettings,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	RangeControl,
	Button,
	SelectControl,
	ToolbarGroup,
	ToolbarButton,
	TextControl,
	ColorPalette,
	BaseControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useEffect, useRef, useCallback } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { plus } from '@wordpress/icons';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal imports
 */
import ResponsiveRangeControl from '../pb-helpers/ResponsiveRangeControl';
import IconGridGallery from '../pb-helpers/IconGridGallery';
import { applyThumbnails } from '../pb-helpers/applyThumbnails';

/**
 * Internal styles
 */
import './editor.scss';

const ALLOWED_BLOCKS = ['portfolio-blocks/pb-image-block'];

// Improved layout calculation for grid gallery: clears previous styles, uses bounding rect, and accounts for border
const applyGridLayout = (galleryRef) => {
	const gallery = galleryRef?.current;
	if (!gallery) return;

	const wrappers = gallery.querySelectorAll('.pb-image-block-wrapper');

	wrappers.forEach((wrapper) => {
		const figure = wrapper.querySelector('figure');
		const img = wrapper.querySelector('img');

		if (!figure || !img || !img.naturalWidth || !img.naturalHeight) return;

		// Reset existing styles to get accurate bounding sizes
		figure.style.width = '';
		figure.style.height = '';

		const borderWidth = parseFloat(getComputedStyle(img).borderWidth) || 0;
		const aspectRatio = img.naturalWidth / img.naturalHeight;

		// Use getBoundingClientRect for accurate, real-time dimensions
		const wrapperRect = wrapper.getBoundingClientRect();
		const wrapperWidth = wrapperRect.width;
		const wrapperHeight = wrapperRect.height;

		const maxWidth = wrapperWidth * 0.85;
		const maxHeight = wrapperHeight * 0.85;

		let scaledWidth = maxWidth;
		let scaledHeight = scaledWidth / aspectRatio;

		if (scaledHeight > maxHeight) {
			scaledHeight = maxHeight;
			scaledWidth = scaledHeight * aspectRatio;
		}

		// Add borderWidth * 2 to figure size to make space for borders inside the bounding box
		const adjustedWidth = scaledWidth + borderWidth * 2;
		const adjustedHeight = scaledHeight + borderWidth * 2;

		// Apply width/height to figure
		figure.style.width = `${adjustedWidth}px`;
		figure.style.height = `${adjustedHeight}px`;

		// Ensure img doesn't override layout
		img.style.width = '';
		img.style.height = '';
	});
};

// Utility: Wait for all images in gallery to load before applying layout (robust version)
const applyGridLayoutWhenImagesLoaded = (galleryRef) => {
	const gallery = galleryRef?.current;
	if (!gallery) return;

	const wrappers = gallery.querySelectorAll('.pb-image-block-wrapper');
	if (!wrappers.length) return;

	const allImages = gallery.querySelectorAll('img');
	if (!allImages.length) return;

	let loadedCount = 0;

	const maybeApplyLayout = () => {
		loadedCount++;
		if (loadedCount < allImages.length) return;
		// Delay to improve reliability on first load
		setTimeout(() => {
			requestAnimationFrame(() => applyGridLayout(galleryRef));
		}, 100);
	};

	allImages.forEach((img) => {
		if (img.complete && img.naturalWidth && img.naturalHeight) {
			maybeApplyLayout();
		} else {
			img.addEventListener('load', maybeApplyLayout, { once: true });
			img.addEventListener('error', maybeApplyLayout, { once: true });
		}
	});
};


/**
 * Grid Gallery Block Edit Component
 * Organized for clarity and maintainability.
 */
export default function Edit({ attributes, setAttributes, clientId }) {

	// ---------------------------------------------
	// Attribute Destructuring
	// ---------------------------------------------
	const {
		enableFilter = false,
		filterAlign = 'center',
		filtersInput = '',
		columns,
		tabletColumns,
		mobileColumns,
		enableDownload,
		downloadOnHover,
		preview,
	} = attributes;

	// ---------------------------------------------
	// State & Effects
	// ---------------------------------------------

	// Block Preview Image
	if (preview) {
		return (
			<div className="pb-block-preview">
				<IconGridGallery />
			</div>
		);
	}

	const galleryRef = useRef(null);
	const { replaceInnerBlocks, updateBlockAttributes } = useDispatch('core/block-editor');

	// Get the currently selected block
	const selectedBlock = useSelect(
		(select) => {
			const { getSelectedBlock } = select(blockEditorStore);
			return getSelectedBlock();
		},
		[]
	);

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

	// Get inner blocks (images)
	const innerBlocks = useSelect(
		(select) => select('core/block-editor').getBlocks(clientId),
		[clientId]
	);

	// Keep filterCategories in sync with filtersInput
	const filterCategories = filtersInput
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);

	useEffect(() => {
		setAttributes({ filterCategories });
	}, [filtersInput]);

	// Sync activeFilter if the selected image block is filtered out
	useEffect(() => {
		const activeFilter = attributes.activeFilter || 'All';
		if (
			selectedBlock &&
			selectedBlock.name === 'portfolio-blocks/pb-image-block'
		) {
			const selectedCategory = selectedBlock.attributes?.filterCategory || '';
			const isFilteredOut =
				activeFilter !== 'All' &&
				selectedCategory.toLowerCase() !== activeFilter.toLowerCase();
			if (isFilteredOut) {
				setAttributes({ activeFilter: 'All' });
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedBlock, attributes.activeFilter]);

	// Keep attributes.images up to date with innerBlocks
	useEffect(() => {
		const updatedImages = innerBlocks.map((block) => ({
			id: block.attributes.id,
			src: block.attributes.src,
			alt: block.attributes.alt,
			title: block.attributes.title,
			caption: block.attributes.caption,
			width: block.attributes.width,
			height: block.attributes.height,
		}));
		setAttributes({ images: updatedImages });
		applyGridLayoutWhenImagesLoaded(galleryRef);
	}, [innerBlocks]);

	// Apply thumbnails as a fallback when innerBlocks are updated but thumbnails haven't rendered yet
	useEffect(() => {
		const hasImages = innerBlocks.length > 0;
		const listViewHasThumbnails = document.querySelector('[data-pb-thumbnail-applied="true"]');

		if (hasImages && !listViewHasThumbnails) {
			setTimeout(() => {
				applyThumbnails(clientId);
			}, 300);
		}
	}, [innerBlocks]);

	// Recalculate layout when border/columns/innerBlocks change
	useEffect(() => {
		const applyLayout = () => {
			setTimeout(() => {
				applyGridLayoutWhenImagesLoaded(galleryRef);
			}, 50);
		};
		applyLayout();
		window.addEventListener('resize', applyLayout);
		const observer = new ResizeObserver(applyLayout);
		if (galleryRef.current?.parentElement) {
			observer.observe(galleryRef.current.parentElement);
		}
		return () => {
			window.removeEventListener('resize', applyLayout);
			observer.disconnect();
		};
	}, [
		innerBlocks,
		attributes.borderWidth,
		attributes.borderRadius,
		attributes.columns,
		attributes.tabletColumns,
		attributes.mobileColumns,
	]);

	// Shuffle images if randomizeOrder is enabled
	useEffect(() => {
		if (!attributes.randomizeOrder || innerBlocks.length === 0) return;
		const shuffled = [...innerBlocks];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		replaceInnerBlocks(clientId, shuffled);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [attributes.randomizeOrder]);

	// Watch for DOM mutations to re-apply layout
	useEffect(() => {
		if (!galleryRef.current) return;
		const observer = new MutationObserver(() => {
			setTimeout(() => {
				applyGridLayoutWhenImagesLoaded(galleryRef);
			}, 100);
		});
		observer.observe(galleryRef.current, {
			childList: true,
			subtree: false,
		});
		return () => observer.disconnect();
	}, []);

	// ---------------------------------------------
	// Context
	// ---------------------------------------------
	const activeFilter = attributes.activeFilter || 'All';
	const blockProps = useBlockProps({
		context: {
			'portfolioBlocks/activeFilter': activeFilter,
			'portfolioBlocks/filterCategories': filterCategories,
			'portfolioBlocks/borderColor': attributes.borderColor || '#ffffff',
			'portfolioBlocks/borderRadius': `${attributes.borderRadius || 0}px`,
			'portfolioBlocks/borderWidth': `${attributes.borderWidth || 0}px`,
		},
		style: {
			'--pb--filter-text-color': attributes.filterTextColor || '#000',
			'--pb--filter-bg-color': attributes.filterBgColor || 'transparent',
			'--pb--filter-active-text': attributes.activeFilterTextColor || '#fff',
			'--pb--filter-active-bg': attributes.activeFilterBgColor || '#000',
		},
	});
	const className = `${blockProps.className} ${attributes.dropShadow ? 'drop-shadow' : ''}`;

	// ---------------------------------------------
	// Derived / Effective Values
	// ---------------------------------------------
	const { ref: innerRef, ...restInnerBlocksProps } = useInnerBlocksProps(
		{
			className: 'pb-grid-gallery',
			style: {
				'--grid-cols-desktop': attributes.columns,
				'--grid-cols-tablet': attributes.tabletColumns,
				'--grid-cols-mobile': attributes.mobileColumns,
			},
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			templateLock: false,
			renderAppender: () => (
				<MediaUpload
					onSelect={onSelectImages}
					allowedTypes={['image']}
					multiple
					render={({ open }) => (
						<Button variant="primary" onClick={open} className="pb-add-images-button" style={{ marginRight: '5px' }}>
							+ Add Images
						</Button>
					)}
				/>
			),
		}
	);
	// Merge refs for gallery DOM node
	const mergedRef = useCallback((node) => {
		galleryRef.current = node;
		if (typeof innerRef === 'function') innerRef(node);
		else if (innerRef && typeof innerRef === 'object') innerRef.current = node;
	}, [innerRef]);

	// ---------------------------------------------
	// Controls & Handlers
	// ---------------------------------------------
	const handleFilterInputChange = (val) => {
		setAttributes({ filtersInput: val });
	};
	const handleFilterInputBlur = () => {
		const rawFilters = filtersInput.split(',').map((f) => f.trim());
		const cleanFilters = rawFilters.filter(Boolean);
		setAttributes({ filterCategories: cleanFilters });
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

		// Trigger layout recalculation
		setTimeout(() => {
			updateBlockAttributes(clientId, { _forceRefresh: Date.now() });
			applyGridLayoutWhenImagesLoaded(galleryRef);
		}, 300);
	};

	// ---------------------------------------------
	// Render
	// ---------------------------------------------
	return (
		<>
			{/* Block Toolbar Controls */}
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

			{/* Inspector Controls */}
			<InspectorControls>
				{/* Gallery Settings Panel */}
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
					<ResponsiveRangeControl
						label={__('Columns', 'portfolio-blocks')}
						columns={columns}
						tabletColumns={tabletColumns}
						mobileColumns={mobileColumns}
						onChange={(newValues) => setAttributes(newValues)}
					/>
					<ToggleControl
						label={__('Randomize Image Order', 'grid-gallery-block')}
						checked={attributes.randomizeOrder || false}
						onChange={(newRandomize) => setAttributes({ randomizeOrder: !!newRandomize })}
						__nextHasNoMarginBottom={true}
						help={__('Randomize order of images.')}
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

				{/* Filter Settings Panel */}
				<PanelBody title={__('Gallery Filter Settings', 'portfolio-blocks')} initialOpen={true}>
					<ToggleControl
						label={__('Enable Image Filtering', 'portfolio-blocks')}
						checked={enableFilter}
						onChange={(val) => setAttributes({ enableFilter: val })}
						__nextHasNoMarginBottom
						help={__('Enable Image filtering with categories.')}
					/>
					{enableFilter && (
						<>
							<ToggleGroupControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								value={filterAlign}
								isBlock
								label={__('Filter Bar Alignment', 'portfolio-blocks')}
								help={__('Set alignment of the filter bar.', 'portfolio-blocks')}
								onChange={(value) => setAttributes({ filterAlign: value })}
							>
								<ToggleGroupControlOption label="Left" value="left" />
								<ToggleGroupControlOption label="Center" value="center" />
								<ToggleGroupControlOption label="Right" value="right" />
							</ToggleGroupControl>
							<TextControl
								label={__('Filter Categories', 'portfolio-blocks')}
								value={filtersInput}
								onChange={handleFilterInputChange}
								onBlur={handleFilterInputBlur}
								help={__('Separate categories with commas')}
								__nextHasNoMarginBottom
							/>
						</>
					)}
				</PanelBody>
				<PanelBody title={__('Woo Integration', 'portfolio-blocks')} initialOpen={false}>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="styles">
				{/* Thumbnail Settings Panel */}
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
				{enableFilter && (
					<PanelColorSettings
						title="Filter Bar Styles"
						colorSettings={[
							{
								label: 'Active - Text Color',
								value: attributes.activeFilterTextColor,
								onChange: (value) =>
									setAttributes({ activeFilterTextColor: value }),
							},
							{
								label: 'Active - Background Color',
								value: attributes.activeFilterBgColor,
								onChange: (value) =>
									setAttributes({ activeFilterBgColor: value }),
							},
							{
								label: 'Inactive - Text Color',
								value: attributes.filterTextColor,
								onChange: (value) =>
									setAttributes({ filterTextColor: value }),
							},
							{
								label: 'Inactive - Background Color',
								value: attributes.filterBgColor,
								onChange: (value) =>
									setAttributes({ filterBgColor: value }),
							},
						]}
					/>
				)}
			</InspectorControls>

			{/* Main Block Render */}
			<div {...{ ...blockProps, className }}>
				{innerBlocks.length === 0 ? (
					<MediaPlaceholder
						icon={<IconGridGallery />}
						labels={{ title: __('Add Images', 'portfolio-blocks') }}
						onSelect={onSelectImages}
						allowedTypes={['image']}
						multiple
					/>
				) : (
					<>
						{enableFilter && Array.isArray(filterCategories) && (
							<div className={`pb-image-gallery-filters align-${filterAlign}`}>
								{['All', ...filterCategories].map((term) => (
									<button
										key={term}
										className={`filter-button${activeFilter === term ? ' is-active' : ''}`}
										onClick={() => setAttributes({ activeFilter: term })}
										type="button"
									>
										{term}
									</button>
								))}
							</div>
						)}
						<div ref={mergedRef} {...restInnerBlocksProps} />
					</>
				)}
			</div>
		</>
	);
}