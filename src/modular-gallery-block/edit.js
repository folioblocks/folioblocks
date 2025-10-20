import { __ } from '@wordpress/i18n';
import { select, useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect, useRef } from '@wordpress/element';
import { BlockControls, useBlockProps, useInnerBlocksProps, InspectorControls, MediaPlaceholder } from '@wordpress/block-editor';
import { Notice, ToolbarGroup, ToolbarButton, PanelBody, ToggleControl, SelectControl, RangeControl, ColorPalette, BaseControl } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { applyFilters } from '@wordpress/hooks';
import { applyThumbnails } from '../pb-helpers/applyThumbnails';
import IconModularGallery from '../pb-helpers/IconModularGallery';

import './editor.scss';

const ALLOWED_BLOCKS = ['portfolio-blocks/pb-image-row'];

// Debounce utility to throttle function calls
const debounce = (fn, delay) => {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), delay);
	};
};

export default function Edit(props) {
	const { clientId, attributes, setAttributes } = props;
	const { resolution, dropShadow, noGap, lightbox, lightboxCaption, onHoverTitle, enableDownload, downloadOnHover, preview } = attributes;

	const checkoutUrl = window.portfolioBlocksData?.checkoutUrl || 'https://portfolio-blocks.com/portfolio-blocks-pricing/';

	// Block Preview Image
	if (preview) {
		return (
			<div className="pb-block-preview">
				<IconModularGallery />
			</div>
		);
	}

	const { insertBlock } = useDispatch('core/block-editor');

	const innerBlocks = useSelect((select) => {
		return select('core/block-editor').getBlock(clientId)?.innerBlocks || [];
	}, [clientId]);

	const handleImageSelect = async (media) => {
		try {
			// Fetch the full media object to ensure we get raw fields
			const response = await wp.apiFetch({
				path: `/wp/v2/media/${media.id}`,
			});

			const title = response.title?.rendered || '';
			// Prefer raw caption like Masonry, fallback to media.caption
			const caption = response.caption?.raw || media.caption || '';
			const alt = response.alt_text || media.alt || '';

			const rowBlock = wp.blocks.createBlock('portfolio-blocks/pb-image-row', {}, [
				wp.blocks.createBlock('portfolio-blocks/pb-image-block', {
					id: media.id,
					src: media.url,
					alt,
					title,
					caption,
					sizes: media.sizes || {},
					width: media.width || 0,
					height: media.height || 0,
				}),
			]);

			wp.data.dispatch('core/block-editor').replaceInnerBlocks(clientId, [rowBlock], false);

		} catch (error) {
			console.error('Failed to fetch image metadata:', error);
		}
	};

	const handleAddRow = () => {
		const { createBlock } = wp.blocks;
		const newRow = createBlock('portfolio-blocks/pb-image-row');
		insertBlock(newRow, innerBlocks.length, clientId);
	};
	const [layoutVersion, setLayoutVersion] = useState(0);
	const containerRef = useRef(null);
	const [rowLayouts, setRowLayouts] = useState({});
	const prevLayouts = useRef({});

	const recalculateLayout = () => {
		if (!containerRef.current) return;
		const rowWrappers = containerRef.current.querySelectorAll('.pb-image-row');
		const layouts = {};
		let allRowsReady = true;

		rowWrappers.forEach((row, rowIndex) => {
			const wrappers = Array.from(row.children).filter(
				(child) =>
					child.classList.contains('pb-image-block-wrapper') ||
					child.classList.contains('wp-block-portfolio-blocks-pb-image-stack')
			);
			if (!wrappers.length) return;

			// Guard: Only proceed if all images in the row are fully loaded
			const images = row.querySelectorAll('img');
			const anyNotLoaded = Array.from(images).some((img) => !img.complete);
			if (anyNotLoaded) {
				allRowsReady = false;
				return;
			}

			// Proceed with layout calculation for the row (unchanged)
			const containerWidth = row.clientWidth;
			const gap = noGap ? 0 : 10;
			const totalGaps = gap * (wrappers.length - 1);

			const aspectRatios = [];
			let totalNaturalWidth = 0;
			const stackMeta = [];

			wrappers.forEach((wrapper) => {
				let ratio;
				let isStack = false;

				if (wrapper.classList.contains('pb-image-block-wrapper')) {
					const img = wrapper.querySelector('img');
					if (img && img.naturalWidth && img.naturalHeight) {
						ratio = img.naturalWidth / img.naturalHeight;
					}
				} else if (wrapper.classList.contains('wp-block-portfolio-blocks-pb-image-stack')) {
					isStack = true;
					const images = wrapper.querySelectorAll('img');
					let totalStackHeight = 0;
					images.forEach((img) => {
						if (img.naturalWidth && img.naturalHeight) {
							totalStackHeight += img.naturalHeight / img.naturalWidth;
						}
					});
					if (totalStackHeight > 0) {
						ratio = 1 / totalStackHeight;
					}
				}

				if (ratio) {
					aspectRatios.push(ratio);
					totalNaturalWidth += ratio;
					stackMeta.push({ isStack, wrapper });
				}
			});

			if (aspectRatios.length !== wrappers.length || totalNaturalWidth === 0) return;

			const targetHeight = Math.round((containerWidth - totalGaps) / totalNaturalWidth);

			let usedWidth = 0;
			const widths = aspectRatios.map((ratio) => Math.floor(ratio * targetHeight));
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
				marginRight: i === wrappers.length - 1 ? '0' : `${gap}px`,
				isStack: stackMeta[i].isStack,
			}));

			wrappers.forEach((wrapper, index) => {
				const layout = layouts[rowIndex][index];
				if (!layout) return;

				if (!layout.isStack) {
					const figure = wrapper.querySelector('.pb-image-block');
					if (figure) {
						figure.style.width = `${layout.width}px`;
						figure.style.height = `${layout.height}px`;
						figure.style.marginRight = layout.marginRight;
					}
				} else {
					// Stack logic (already present above)
					const stackWrapper = wrapper;
					stackWrapper.style.width = `${layout.width}px`;
					stackWrapper.style.height = `${layout.height}px`;
					stackWrapper.style.marginRight = layout.marginRight;

					const images = stackWrapper.querySelectorAll('img');
					let totalRatio = 0;
					const ratios = [];
					images.forEach((img) => {
						if (img.naturalWidth && img.naturalHeight) {
							const r = img.naturalHeight / img.naturalWidth;
							ratios.push(r);
							totalRatio += r;
						}
					});

					const totalStackGaps = noGap ? 0 : (images.length - 1) * 10;
					const usableHeight = layout.height - totalStackGaps;

					images.forEach((img, idx) => {
						const share = ratios[idx] / totalRatio;
						const imgHeight = Math.round(share * usableHeight);
						const figure = img.closest('.pb-image-block');
						if (figure) {
							figure.style.height = `${imgHeight}px`;
							figure.style.marginBottom = (noGap || idx === images.length - 1) ? '0px' : '10px';
						}
					});
				}
			});
		});

		// If any row's images are not loaded, skip layout recalculation
		if (!allRowsReady) return;

		const layoutsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
		if (!layoutsEqual(prevLayouts.current, layouts)) {
			setRowLayouts(layouts);
			setLayoutVersion(Date.now());
			prevLayouts.current = layouts;
		}
	};

	const recalculateLayoutDebounced = debounce(recalculateLayout, 150);

	useEffect(() => {
		const observer = new ResizeObserver(() => {
			requestAnimationFrame(() => {
				recalculateLayoutDebounced();
			});
		});
		const container = containerRef.current;
		if (container) observer.observe(container);
		return () => observer.disconnect();
	}, [innerBlocks, noGap]);

	const blockProps = useBlockProps({
		ref: containerRef,
		context: {
			'portfolioBlocks/noGap': noGap,
			'portfolioBlocks/layoutVersion': layoutVersion,
			'portfolioBlocks/rowLayouts': rowLayouts,
		},
	});
	const innerBlocksProps = useInnerBlocksProps(
		{
			className: [
				'pb-modular-gallery',
				noGap ? 'no-row-gap' : '',
				attributes.collapseOnMobile ? 'collapse-on-mobile' : ''
			].filter(Boolean).join(' ')
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			orientation: 'vertical',
			template: [['portfolio-blocks/pb-image-row']],
			templateLock: false,
		}
	);

	// Determine if the Modular Gallery block or any of its children is selected
	const isBlockOrChildSelected = useSelect(
		(select) => {
			const blockEditorStore = 'core/block-editor';
			const selectedId = select(blockEditorStore).getSelectedBlockClientId();
			if (!selectedId) return false;

			const selectedBlock = select(blockEditorStore).getBlock(selectedId);
			if (!selectedBlock) return false;

			// Direct selection
			if (selectedBlock.clientId === clientId) return true;

			// Check if selected block is a pb-image-block nested within a pb-image-row or pb-image-stack
			if (
				selectedBlock.name === 'portfolio-blocks/pb-image-block'
			) {
				const parents = select(blockEditorStore).getBlockParents(selectedId);
				return parents.includes(clientId);
			}

			return false;
		},
		[clientId]
	);

	// When the block or a child is selected, applyThumbnails
	useEffect(() => {
		if (isBlockOrChildSelected) {
			setTimeout(() => {
				applyThumbnails(clientId);
			}, 200);
		}
	}, [isBlockOrChildSelected]);

	// Fallback: if block has images but no thumbnails rendered, applyThumbnails
	useEffect(() => {
		const hasImages = innerBlocks.length > 0;
		const listViewHasThumbnails = document.querySelector('[data-pb-thumbnail-applied="true"]');

		if (hasImages && !listViewHasThumbnails) {
			setTimeout(() => {
				applyThumbnails(clientId);
			}, 300);
		}
	}, [innerBlocks]);

	if (innerBlocks.length === 0) {
		return (
			<div {...blockProps}>
				<MediaPlaceholder
					icon={<IconModularGallery />}
					labels={{ title: 'Add First Image' }}
					accept="image/*"
					allowedTypes={['image']}
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
						icon={plus}
						label="Add Image Row"
						onClick={handleAddRow}
					>
						{__('Add Image Row', 'portfolio-blocks')}
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={__('General Gallery Settings', 'portfolio-blocks')} initialOpen={true}>
					{(() => {
						const allSizes = innerBlocks.flatMap(rowBlock => {
							const rowInnerBlocks = select('core/block-editor').getBlocks(rowBlock.clientId);
							return rowInnerBlocks.flatMap(imageBlock =>
								Object.keys(imageBlock.attributes?.sizes || {})
							);
						});
						const resolutionOptions = [
							{ label: __('Thumbnail', 'portfolio-blocks'), value: 'thumbnail' },
							{ label: __('Medium', 'portfolio-blocks'), value: 'medium' },
							{ label: __('Large', 'portfolio-blocks'), value: 'large' },
							{ label: __('Full', 'portfolio-blocks'), value: 'full' }
						].filter(option => allSizes.includes(option.value) || option.value === 'full');
						return (
							<SelectControl
								label={__('Image Resolution', 'portfolio-blocks')}
								value={attributes.resolution}
								options={resolutionOptions}
								onChange={(value) => {
									setAttributes({ resolution: value });
								}}
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								help={__('Select the size of the source image.')}
							/>
						);
					})()}
					<ToggleControl
						label={__('Collapse layout on Mobile', 'portfolio-blocks')}
						checked={attributes.collapseOnMobile}
						onChange={(value) => setAttributes({ collapseOnMobile: value })}
						__nextHasNoMarginBottom
						help={__('Stack all images vertically on mobile devices.', 'portfolio-blocks')}
					/>
					<ToggleControl
						label={__('Remove Image Gap', 'portfolio-blocks')}
						checked={attributes.noGap || false}
						onChange={(noGap) => setAttributes({ noGap })}
						help={__('Remove gap between images.')}
						__nextHasNoMarginBottom
					/>
					{applyFilters(
						'portfolioBlocks.modularGallery.downloadControls',
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
						'portfolioBlocks.modularGallery.wooCommerceControls',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Woo Commerce', 'portfolio-blocks')}</strong><br />
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
						'portfolioBlocks.modularGallery.disableRightClickToggle',
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
						'portfolioBlocks.modularGallery.lazyLoadToggle',
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
						'portfolioBlocks.modularGallery.lightboxControls',
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
						'portfolioBlocks.modularGallery.onHoverTitleToggle',
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
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody title={__('Gallery Image Styles', 'portfolio-blocks')} initialOpen={true}>
					{applyFilters(
						'portfolioBlocks.modularGallery.borderColorControl',
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
						'portfolioBlocks.modularGallery.borderWidthControl',
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
						'portfolioBlocks.modularGallery.borderRadiusControl',
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
						'portfolioBlocks.modularGallery.dropShadowToggle',
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

			</InspectorControls>

			<div {...blockProps}>
				<div {...innerBlocksProps} />
			</div>
		</>
	);
}