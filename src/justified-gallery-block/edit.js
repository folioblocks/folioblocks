import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	MediaPlaceholder,
	PanelColorSettings,
	store as blockEditorStore
} from '@wordpress/block-editor';
import {
	PanelBody,
	Notice,
	ToggleControl,
	RangeControl,
	SelectControl,
	ToolbarGroup,
	ToolbarButton,
	TextControl,
	ColorPalette,
	BaseControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { plus } from '@wordpress/icons';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { applyFilters } from '@wordpress/hooks';
import './editor.scss';

import IconJustifiedGallery from '../pb-helpers/IconJustifiedGallery';
import { applyThumbnails } from '../pb-helpers/applyThumbnails';

const ALLOWED_BLOCKS = ['portfolio-blocks/pb-image-block'];

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		rowHeight = 250,
		noGap = false,
		randomizeOrder = false,
		enableFilter = false,
		filterCategories = [],
		filtersInput = '',
		filterAlign = 'center',
		enableDownload,
		downloadOnHover,
		preview
	} = attributes;

	// Block Preview Image
	if (preview) {
		return (
			<div className="pb-block-preview">
				<IconJustifiedGallery />
			</div>
		);
	}

	const checkoutUrl = window.portfolioBlocksData?.checkoutUrl || 'https://portfolio-blocks.com/portfolio-blocks-pricing/';
	const { replaceInnerBlocks, updateBlockAttributes } = useDispatch('core/block-editor');

	const innerBlocks = useSelect(
		select => select('core/block-editor').getBlocks(clientId),
		[clientId]
	);

	const galleryRef = useRef(null);

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'pb-justified-gallery' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			orientation: 'horizontal',
			renderAppender: false,
		}
	);

	const { ref: innerRef, ...restInnerBlocksProps } = innerBlocksProps;

	const combinedRef = useCallback(
		(node) => {
			galleryRef.current = node;
			if (typeof innerRef === 'function') {
				innerRef(node);
			} else if (innerRef && typeof innerRef === 'object') {
				innerRef.current = node;
			}
			// console.log('📌 combinedRef node:', node);
		},
		[innerRef]
	);

	const onSelectImages = async (media) => {
		if (!media || media.length === 0) return;

		// Preserve randomization logic
		const images = attributes.randomizeOrder ? [...media].sort(() => 0.5 - Math.random()) : media;

		// Fetch titles in a single batch for performance
		const imageIds = images.map((image) => image.id);
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

		const newBlocks = images.map((image) => {
			const fullSize = image.sizes?.full || {};
			const width = fullSize.width || image.width || 1;
			const height = fullSize.height || image.height || 1;

			return wp.blocks.createBlock('portfolio-blocks/pb-image-block', {
				id: image.id,
				src: image.url,
				alt: image.alt || '',
				title: titleMap[image.id] || image.title || '',
				caption: image.caption || '',
				width,
				height,
				sizes: image.sizes || {},
			});
		});

		replaceInnerBlocks(clientId, newBlocks);

		// Trigger a layout recalculation
		setTimeout(() => {
			const container = galleryRef.current;
			if (container) {
				container.dispatchEvent(new Event('resize'));
			}
		}, 100);
	};

	useEffect(() => {
		// console.log('📦 ResizeObserver setup');
		if (!galleryRef.current) return;

		let resizeTimeout;

		const handleResizeEnd = () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				requestAnimationFrame(calculateLayout);
			}, 150);
		};

		const container = galleryRef.current;

		const calculateLayout = () => {
			const container = galleryRef.current;
			// console.log('⏱️ Running calculateLayout');
			// console.log('📏 container ref:', container);

			if (!container) {
				console.warn('❌ No container found');
				return;
			}

			const containerWidth = container.clientWidth - 1;
			// console.log('📏 container width:', containerWidth);

			if (!containerWidth) {
				console.warn('❌ Container width is 0');
				return;
			}

			// console.log('🧱 innerBlocks count:', innerBlocks.length);

			const wrappers = container.querySelectorAll('.pb-image-block-wrapper:not(.is-hidden)');
			const images = Array.from(wrappers).map((wrapper) => {
				const img = wrapper.querySelector('img');
				const width = parseInt(img.getAttribute('width')) || 1;
				const height = parseInt(img.getAttribute('height')) || 1;
				return { wrapper, width, height };
			});

			const targetRowHeight = attributes.rowHeight || 250;
			const gap = attributes.noGap ? 0 : 10;
			const rows = [];
			let currentRow = [];
			let currentRowWidth = 0;

			images.forEach((img, i) => {
				const aspectRatio = img.width / img.height;
				const scaledWidth = aspectRatio * targetRowHeight;
				currentRow.push({ ...img, scaledWidth, aspectRatio });
				currentRowWidth += scaledWidth + gap;

				if (currentRowWidth >= containerWidth && currentRow.length > 0) {
					rows.push(currentRow);
					currentRow = [];
					currentRowWidth = 0;
				}
			});

			if (currentRow.length > 0) {
				rows.push(currentRow);
			}

			rows.forEach((row) => {
				const totalScaledWidth = row.reduce((sum, img) => sum + img.scaledWidth, 0);
				const totalGaps = (row.length - 1) * gap;
				const isFinalRow = row === rows[rows.length - 1];
				const rowFillRatio = (totalScaledWidth + totalGaps) / containerWidth;
				const shouldScale = !isFinalRow || rowFillRatio > 0.9;
				const scale = shouldScale ? Math.min((containerWidth - totalGaps) / totalScaledWidth, 1) : 1;

				row.forEach((img, index) => {
					const isLast = index === row.length - 1;
					const finalWidth = Math.round(img.scaledWidth * scale) - (isLast ? 1 : 0);
					const finalHeight = Math.round(targetRowHeight * scale);
					img.wrapper.style.setProperty('--pb-width', `${finalWidth}px`);
					img.wrapper.style.setProperty('--pb-height', `${finalHeight}px`);
					img.wrapper.style.setProperty('--pb-margin', index !== row.length - 1 ? `${gap}px` : `0px`);
				});
			});
		};

		const resizeObserver = new ResizeObserver(() => {
			requestAnimationFrame(calculateLayout);
			handleResizeEnd(); // NEW: schedule final pass after resize ends
		});

		resizeObserver.observe(container);
		setTimeout(calculateLayout, 50);

		return () => {
			resizeObserver.disconnect();
			clearTimeout(resizeTimeout);
		};
	}, [
		innerBlocks,
		attributes.rowHeight,
		attributes.noGap,
		attributes.activeFilter,
		attributes.filterCategories,
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
	}, [attributes.randomizeOrder]);

	const activeFilter = attributes.activeFilter || 'All';
	const blockProps = useBlockProps({
		context: {
			'portfolioBlocks/activeFilter': activeFilter,
			'portfolioBlocks/filterCategories': filterCategories,
		},
		style: {
			'--pb--filter-text-color': attributes.filterTextColor || '#000',
			'--pb--filter-bg-color': attributes.filterBgColor || 'transparent',
			'--pb--filter-active-text': attributes.activeFilterTextColor || '#fff',
			'--pb--filter-active-bg': attributes.activeFilterBgColor || '#000',
		},
	});

	const handleFilterInputChange = (value) => {
		setAttributes({ filtersInput: value });
	};

	const handleFilterInputBlur = () => {
		const parsed = filtersInput
			.split(',')
			.map((item) => item.trim())
			.filter((item) => item.length > 0);
		setAttributes({ filterCategories: parsed });
	};

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

	// Fallback: Apply thumbnails if images are present but thumbnails haven't rendered yet
	useEffect(() => {
		const hasImages = innerBlocks.length > 0;
		const listViewHasThumbnails = document.querySelector('[data-pb-thumbnail-applied="true"]');

		if (hasImages && !listViewHasThumbnails) {
			setTimeout(() => {
				applyThumbnails(clientId);
			}, 300);
		}
	}, [innerBlocks]);

	const selectedBlock = useSelect(
		(select) => {
			const { getSelectedBlock } = select(blockEditorStore);
			return getSelectedBlock();
		},
		[]
	);
	useEffect(() => {
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
	}, [selectedBlock, activeFilter]);

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
							{ label: __('Full', 'portfolio-blocks'), value: 'full' }
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
					<RangeControl
						label={__('Row Height', 'portfolio-blocks')}
						value={rowHeight}
						onChange={(value) => setAttributes({ rowHeight: value })}
						min={100}
						max={500}
						help={__('Target row height for justified layout.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<ToggleControl
						label={__('Remove Image Gap', 'portfolio-blocks')}
						checked={noGap}
						onChange={(value) => setAttributes({ noGap: value })}
						help={__('Remove image gap from gallery.')}
						__nextHasNoMarginBottom
					/>


					{applyFilters(
						'portfolioBlocks.justifiedGallery.randomizeToggle',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Randomize Image Order', 'portfolio-blocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'portfolio-blocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
					{applyFilters(
						'portfolioBlocks.justifiedGallery.downloadControls',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Image Downloads', 'portfolio-blocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'portfolio-blocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
					{applyFilters(
						'portfolioBlocks.justifiedGallery.disableRightClickToggle',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Disable Right-Click', 'portfolio-blocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'portfolio-blocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
					{applyFilters(
						'portfolioBlocks.justifiedGallery.lazyLoadToggle',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Lazy Load of Images', 'portfolio-blocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'portfolio-blocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}

				</PanelBody>
				<PanelBody title={__('Gallery Image Settings', 'portfolio-blocks')} initialOpen={true}>
					{applyFilters(
						'portfolioBlocks.justifiedGallery.lightboxControls',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enalble Lightbox', 'portfolio-blocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'portfolio-blocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
					{applyFilters(
						'portfolioBlocks.justifiedGallery.onHoverTitleToggle',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Show Title on Hover', 'portfolio-blocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'portfolio-blocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
				</PanelBody>
				<PanelBody title={__('Gallery Filter Settings', 'portfolio-blocks')} initialOpen={true}>
					{applyFilters(
						'portfolioBlocks.justifiedGallery.enableFilterToggle',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Image Filtering', 'portfolio-blocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'portfolio-blocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
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
								<ToggleGroupControlOption
									label="Left"
									value="left"
								/>
								<ToggleGroupControlOption
									label="Center"
									value="center"
								/>
								<ToggleGroupControlOption
									label="Right"
									value="right"
								/>
							</ToggleGroupControl>

							<TextControl
								label={__('Filter Categories', 'portfolio-blocks')}
								value={filtersInput}
								onChange={handleFilterInputChange}
								onBlur={handleFilterInputBlur}
								help={__('Separate categories with commas')}
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>
						</>
					)}
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody title={__('Gallery Image Styles', 'portfolio-blocks')} initialOpen={true}>
					{applyFilters(
						'portfolioBlocks.justifiedGallery.borderColorControl',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Image Border Color', 'portfolio-blocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'portfolio-blocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
					{applyFilters(
						'portfolioBlocks.justifiedGallery.borderWidthControl',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Image Border Width', 'portfolio-blocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'portfolio-blocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
					{applyFilters(
						'portfolioBlocks.justifiedGallery.borderRadiusControl',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Image Border Radius', 'portfolio-blocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'portfolio-blocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
					{applyFilters(
						'portfolioBlocks.justifiedGallery.dropShadowToggle',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Image Drop Shadow', 'portfolio-blocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'portfolio-blocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'portfolio-blocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
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

			<div {...blockProps}>
				{innerBlocks.length === 0 ? (
					<MediaPlaceholder
						icon={<IconJustifiedGallery />}
						labels={{ title: __('Add Images', 'portfolio-blocks') }}
						onSelect={onSelectImages}
						allowedTypes={['image']}
						multiple
					/>
				) : (
					<>
						{enableFilter && (
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
						<div ref={combinedRef} {...restInnerBlocksProps} />
					</>
				)}
			</div>
		</>
	);
}