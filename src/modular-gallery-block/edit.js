/**
 * Modular Gallery Block
 * Edit JS
 **/
import { __ } from '@wordpress/i18n';
import { select, useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect, useRef } from '@wordpress/element';
import { BlockControls, useBlockProps, useInnerBlocksProps, InspectorControls, MediaPlaceholder } from '@wordpress/block-editor';
import { Notice, ToolbarGroup, ToolbarButton, PanelBody, ToggleControl, SelectControl, Panel } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import { row } from '@wordpress/icons';
import { applyFilters } from '@wordpress/hooks';
import IconModularGallery from '../pb-helpers/IconModularGallery';

import './editor.scss';

const ALLOWED_BLOCKS = ['folioblocks/pb-image-row'];

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
	const { noGap, lightbox, lightboxCaption, preview } = attributes;

	const checkoutUrl = window.folioBlocksData?.checkoutUrl || 'https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks&utm_medium=modular-gallery-block&utm_campaign=upgrade';

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
	const effectiveEnableWoo = hasWooCommerce ? (attributes.enableWooCommerce || false) : false;
	useEffect(() => {
		const wooActive = window.folioBlocksData?.hasWooCommerce ?? false;
		if (wooActive !== attributes.hasWooCommerce) {
			setAttributes({ hasWooCommerce: wooActive });
		}
	}, [window.folioBlocksData?.hasWooCommerce]);


	const { insertBlock, replaceBlocks, selectBlock } = useDispatch('core/block-editor');

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
			// Prefer raw caption, fallback to media.caption
			const caption = response.caption?.raw || media.caption || '';
			const alt = response.alt_text || media.alt || '';

			const rowBlock = wp.blocks.createBlock('folioblocks/pb-image-row', {}, [
				wp.blocks.createBlock('folioblocks/pb-image-block', {
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

	useEffect(() => {
		const onAddToImageStack = (e) => {
			const targetId = e?.detail?.clientId;
			if (!targetId) return;

			const beSelect = select('core/block-editor');
			const parents = beSelect.getBlockParents(targetId, true) || [];
			// ensure the image is inside THIS gallery instance
			if (!parents.includes(clientId)) return;

			const getName = beSelect.getBlockName;
			const names = parents.map(getName);

			// must be inside an Image Row and NOT already in an Image Stack
			const inRow = names.includes('folioblocks/pb-image-row');
			const inStack = names.includes('folioblocks/pb-image-stack');
			if (!inRow || inStack) return;

			const imgBlock = beSelect.getBlock(targetId);
			if (!imgBlock || imgBlock.name !== 'folioblocks/pb-image-block') return;

			// Build a new stack with a cloned image child
			const childImage = createBlock('folioblocks/pb-image-block', { ...imgBlock.attributes });
			const stackBlock = createBlock('folioblocks/pb-image-stack', {}, [childImage]);

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

		window.addEventListener('folioblocks:add-to-image-stack', onAddToImageStack);
		return () => window.removeEventListener('folioblocks:add-to-image-stack', onAddToImageStack);
	}, [clientId]);

	const handleAddRow = () => {
		const { createBlock } = wp.blocks;
		const newRow = createBlock('folioblocks/pb-image-row');
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
					child.classList.contains('wp-block-folioblocks-pb-image-block') ||
					child.classList.contains('wp-block-folioblocks-pb-image-stack')
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

				if (wrapper.classList.contains('wp-block-folioblocks-pb-image-block')) {
					const img = wrapper.querySelector('img');
					if (img && img.naturalWidth && img.naturalHeight) {
						ratio = img.naturalWidth / img.naturalHeight;
					}
				} else if (wrapper.classList.contains('wp-block-folioblocks-pb-image-stack')) {
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
			'folioBlocks/noGap': noGap,
			'folioBlocks/layoutVersion': layoutVersion,
			'folioBlocks/rowLayouts': rowLayouts,
			'folioBlocks/enableWooCommerce': effectiveEnableWoo,
			'folioBlocks/hasWooCommerce': hasWooCommerce,
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
			template: [['folioblocks/pb-image-row']],
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
				selectedBlock.name === 'folioblocks/pb-image-block'
			) {
				const parents = select(blockEditorStore).getBlockParents(selectedId);
				return parents.includes(clientId);
			}

			return false;
		},
		[clientId]
	);

	// Always call editorEnhancements filter for consistent hook ordering
	applyFilters('folioBlocks.modularGallery.editorEnhancements', null, { attributes, clientId, innerBlocks, isBlockOrChildSelected });

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
						icon={row}
						label="Add Image Row"
						onClick={handleAddRow}
					>
						{__('Add Image Row', 'folioblocks')}
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={__('General Gallery Settings', 'folioblocks')} initialOpen={true}>
					{(() => {
						const allSizes = innerBlocks.flatMap(rowBlock => {
							const rowInnerBlocks = select('core/block-editor').getBlocks(rowBlock.clientId);
							return rowInnerBlocks.flatMap(imageBlock =>
								Object.keys(imageBlock.attributes?.sizes || {})
							);
						});
						const resolutionOptions = [
							{ label: __('Thumbnail', 'folioblocks'), value: 'thumbnail' },
							{ label: __('Medium', 'folioblocks'), value: 'medium' },
							{ label: __('Large', 'folioblocks'), value: 'large' },
							{ label: __('Full', 'folioblocks'), value: 'full' }
						].filter(option => allSizes.includes(option.value) || option.value === 'full');
						return (
							<SelectControl
								label={__('Image Resolution', 'folioblocks')}
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
						label={__('Collapse layout on Mobile', 'folioblocks')}
						checked={attributes.collapseOnMobile}
						onChange={(value) => setAttributes({ collapseOnMobile: value })}
						__nextHasNoMarginBottom
						help={__('Stack all images vertically on mobile devices.', 'folioblocks')}
					/>
					<ToggleControl
						label={__('Remove Image Gap', 'folioblocks')}
						checked={attributes.noGap || false}
						onChange={(noGap) => setAttributes({ noGap })}
						help={__('Remove gap between images.')}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
				<PanelBody title={__('Lightbox & Hover Settings', 'folioblocks')} initialOpen={true}>
					{applyFilters(
						'folioBlocks.modularGallery.lightboxControls',
						(
							<>
								<ToggleControl
									label={__('Enable Lightbox', 'folioblocks')}
									checked={!!lightbox}
									onChange={(newLightbox) => setAttributes({ lightbox: newLightbox })}
									__nextHasNoMarginBottom
									help={__('Open images in a lightbox when clicked.', 'folioblocks')}
								/>

								{lightbox && (
									<ToggleControl
										label={__('Show Image Caption in Lightbox', 'folioblocks')}
										checked={!!lightboxCaption}
										onChange={(newLightboxCaption) =>
											setAttributes({ lightboxCaption: newLightboxCaption })
										}
										__nextHasNoMarginBottom
										help={__('Display image captions inside the lightbox.', 'folioblocks')}
									/>
								)}
							</>
						),
						{ attributes, setAttributes }
					)}
					{applyFilters(
						'folioBlocks.modularGallery.onHoverTitleToggle',
						(
							<>
								<ToggleControl
									label={__('Show Image Title on Hover', 'folioblocks')}
									help={__('Display the image title when hovering over images.', 'folioblocks')}
									__nextHasNoMarginBottom
									checked={!!attributes.onHoverTitle}
									onChange={(value) => setAttributes({ onHoverTitle: value })}
								/>
							</>
						),
						{ attributes, setAttributes }
					)}
				</PanelBody>
				<PanelBody title={__('E-Commerce Settings', 'folioblocks')} initialOpen={true}>
					{applyFilters(
						'folioBlocks.modularGallery.downloadControls',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Image Downloads', 'folioblocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'folioblocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'folioblocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes, hasWooCommerce, effectiveEnableWoo }
					)}
					{window.folioBlocksData?.hasWooCommerce && applyFilters(
						'folioBlocks.modularGallery.wooCommerceControls',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Woo Commerce', 'folioblocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'folioblocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'folioblocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes, hasWooCommerce, effectiveEnableWoo }
					)}
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="advanced">
				{applyFilters(
					'folioBlocks.modularGallery.disableRightClickToggle',
					(
						<div style={{ marginBottom: '8px' }}>
							<Notice status="info" isDismissible={false}>
								<strong>{__('Disable Right-Click', 'folioblocks')}</strong><br />
								{__('This is a premium feature. Unlock all features: ', 'folioblocks')}
								<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
									{__('Upgrade to Pro', 'folioblocks')}
								</a>
							</Notice>
						</div>
					),
					{ attributes, setAttributes }
				)}
				{applyFilters(
					'folioBlocks.modularGallery.lazyLoadToggle',
					(
						<div style={{ marginBottom: '8px' }}>
							<Notice status="info" isDismissible={false}>
								<strong>{__('Enable Lazy Load of Images', 'folioblocks')}</strong><br />
								{__('This is a premium feature. Unlock all features: ', 'folioblocks')}
								<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
									{__('Upgrade to Pro', 'folioblocks')}
								</a>
							</Notice>
						</div>
					),
					{ attributes, setAttributes }
				)}
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody title={__('Gallery Image Styles', 'folioblocks')} initialOpen={true}>
					{applyFilters(
						'folioBlocks.modularGallery.borderColorControl',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Image Border Color', 'folioblocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'folioblocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'folioblocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
					{applyFilters(
						'folioBlocks.modularGallery.borderWidthControl',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Image Border Width', 'folioblocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'folioblocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'folioblocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
					{applyFilters(
						'folioBlocks.modularGallery.borderRadiusControl',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Image Border Radius', 'folioblocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'folioblocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'folioblocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
					{applyFilters(
						'folioBlocks.modularGallery.dropShadowToggle',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Image Drop Shadow', 'folioblocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'folioblocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'folioblocks')}
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