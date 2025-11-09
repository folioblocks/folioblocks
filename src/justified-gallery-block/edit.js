/**
 * Justified Gallery Block
 * Edit JS
 **/
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	MediaPlaceholder,
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
} from '@wordpress/components';
import { subscribe, dispatch, select, useSelect, useDispatch } from '@wordpress/data';
import { plus } from '@wordpress/icons';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { addFilter, applyFilters } from '@wordpress/hooks';
import './editor.scss';

import IconJustifiedGallery from '../pb-helpers/IconJustifiedGallery';

const ALLOWED_BLOCKS = ['pb-gallery/pb-image-block'];

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		rowHeight = 250,
		noGap = false,
		preview,
		lightbox,
		lightboxCaption
	} = attributes;

	// Block Preview Image
	if (preview) {
		return (
			<div className="pb-block-preview">
				<IconJustifiedGallery />
			</div>
		);
	}

	// Runtime override: if WooCommerce is not active, force Woo features off without mutating saved attributes
	const hasWooCommerce = window.portfolioBlocksData?.hasWooCommerce ?? false;
	const effectiveEnableWoo = hasWooCommerce ? (attributes.enableWooCommerce || false) : false;
	useEffect(() => {
		const wooActive = window.portfolioBlocksData?.hasWooCommerce ?? false;
		if (wooActive !== attributes.hasWooCommerce) {
			setAttributes({ hasWooCommerce: wooActive });
		}
	}, [window.portfolioBlocksData?.hasWooCommerce]);


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

	// Filter to limit number of images in free version (only if not Pro)
	if (!window.portfolioBlocksData?.isPro) {
		addFilter(
			'portfolioBlocks.justifiedGallery.limitImages',
			'pb-gallery/justified-gallery-limit',
			(media, existingCount) => {
				const MAX_IMAGES_FREE = 15;
				const allowed = Math.max(0, MAX_IMAGES_FREE - existingCount);

				if (allowed <= 0) {
					const message = __('Free version allows up to 15 images. Upgrade to Pro for unlimited.', 'pb-gallery');
					wp.data.dispatch('core/notices').createNotice(
						'warning',
						message,
						{ isDismissible: true, id: 'pb-justified-limit-warning' }
					);
					return [];
				}

				if (media.length > allowed) {
					const message = sprintf(
						__('Free version allows up to %d images. Only the first %d were added.', 'pb-gallery'),
						MAX_IMAGES_FREE,
						allowed
					);
					wp.data.dispatch('core/notices').createNotice(
						'warning',
						message,
						{ isDismissible: true, id: 'pb-justified-limit-truncate' }
					);
				}

				return media.slice(0, allowed);
			}
		);
		// Prevent people duplicating blocks to bypass limits in free version
		subscribe(() => {
			const blocks = select('core/block-editor').getBlocksByClientId(clientId)[0]?.innerBlocks || [];
			if (blocks.length > 15) {
				const extras = blocks.slice(15);
				extras.forEach((block) => {
					dispatch('core/block-editor').removeBlock(block.clientId);
				});

				if (!document.getElementById('pb-gallery-limit-warning')) {
					dispatch('core/notices').createNotice(
						'warning',
						__('Free version allows up to 15 images. Upgrade to Pro for unlimited.', 'pb-gallery'),
						{ id: 'pb-gallery-limit-warning', isDismissible: true }
					);
				}
			}
		});
	}

	// Select Images Handler
	const onSelectImages = async (media) => {
		if (!media || media.length === 0) return;

		// Allow filtering of selected images (for free vs premium limits)
		media = applyFilters(
			'portfolioBlocks.justifiedGallery.limitImages',
			media,
			innerBlocks.length
		);

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

			return wp.blocks.createBlock('pb-gallery/pb-image-block', {
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

			if (!container) {
				console.warn('❌ No container found');
				return;
			}

			const containerWidth = container.clientWidth - 1;

			if (!containerWidth) {
				console.warn('❌ Container width is 0');
				return;
			}

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

	const blockProps = useBlockProps({
		context: {
			'portfolioBlocks/activeFilter': attributes.activeFilter,
			'portfolioBlocks/filterCategories': attributes.filterCategories,
			'portfolioBlocks/enableWooCommerce': effectiveEnableWoo,
			'portfolioBlocks/hasWooCommerce': hasWooCommerce,
		},
		style: {
			'--pb--filter-text-color': attributes.filterTextColor || '#000',
			'--pb--filter-bg-color': attributes.filterBgColor || 'transparent',
			'--pb--filter-active-text': attributes.activeFilterTextColor || '#fff',
			'--pb--filter-active-bg': attributes.activeFilterBgColor || '#000',
		},
	});

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
				selectedBlock.name === 'pb-gallery/pb-image-block' &&
				select(blockEditorStore).getBlockRootClientId(selectedId) === clientId
			) {
				return true;
			}

			return false;
		},
		[clientId]
	);
	const selectedBlock = useSelect(
		(select) => {
			const { getSelectedBlock } = select(blockEditorStore);
			return getSelectedBlock();
		},
		[]
	);
	applyFilters('portfolioBlocks.justifiedGallery.filterLogic', null, { clientId, attributes, setAttributes, selectedBlock });
	applyFilters('portfolioBlocks.justifiedGallery.editorEnhancements', null, { clientId, attributes, innerBlocks, isBlockOrChildSelected, replaceInnerBlocks });

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={plus}
						label={__('Add Images', 'pb-gallery')}
						disabled={!window.portfolioBlocksData?.isPro && innerBlocks.length >= 15}
						onClick={() => {
							wp.media({
								title: __('Select Images', 'pb-gallery'),
								multiple: true,
								library: { type: 'image' },
								button: { text: __('Add to Gallery', 'pb-gallery') },
							})
								.on('select', () => {
									const selection = wp.media.frame.state().get('selection').toJSON();
									onSelectImages(selection);
								})
								.open();
						}}
					>
						{__('Add Images', 'pb-gallery')}
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={__('General Gallery Settings', 'pb-gallery')} initialOpen={true}>
					<SelectControl
						label={__('Resolution', 'pb-gallery')}
						value={attributes.resolution || 'large'}
						options={[
							{ label: __('Thumbnail', 'pb-gallery'), value: 'thumbnail' },
							{ label: __('Medium', 'pb-gallery'), value: 'medium' },
							{ label: __('Large', 'pb-gallery'), value: 'large' },
							{ label: __('Full', 'pb-gallery'), value: 'full' }
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
						label={__('Row Height', 'pb-gallery')}
						value={rowHeight}
						onChange={(value) => setAttributes({ rowHeight: value })}
						min={100}
						max={500}
						help={__('Target row height for justified layout.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<ToggleControl
						label={__('Remove Image Gap', 'pb-gallery')}
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
									<strong>{__('Randomize Image Order', 'pb-gallery')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'pb-gallery')}
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
									<strong>{__('Enable Image Downloads', 'pb-gallery')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'pb-gallery')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes, hasWooCommerce, effectiveEnableWoo }
					)}
					{window.portfolioBlocksData?.hasWooCommerce && applyFilters(
						'portfolioBlocks.justifiedGallery.wooCommerceControls',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Woo Commerce', 'pb-gallery')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'pb-gallery')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes, hasWooCommerce, effectiveEnableWoo }
					)}
					{applyFilters(
						'portfolioBlocks.justifiedGallery.disableRightClickToggle',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Disable Right-Click', 'pb-gallery')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'pb-gallery')}
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
									<strong>{__('Enable Lazy Load of Images', 'pb-gallery')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'pb-gallery')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}

				</PanelBody>
				<PanelBody title={__('Gallery Image Settings', 'pb-gallery')} initialOpen={true}>
					{applyFilters(
						'portfolioBlocks.justifiedGallery.lightboxControls',
						(
							<>
								<ToggleControl
									label={__('Enable Lightbox', 'pb-gallery')}
									checked={!!lightbox}
									onChange={(newLightbox) => setAttributes({ lightbox: newLightbox })}
									__nextHasNoMarginBottom
									help={__('Open images in a lightbox when clicked.', 'pb-gallery')}
								/>

								{lightbox && (
									<ToggleControl
										label={__('Show Image Caption in Lightbox', 'pb-gallery')}
										checked={!!lightboxCaption}
										onChange={(newLightboxCaption) =>
											setAttributes({ lightboxCaption: newLightboxCaption })
										}
										__nextHasNoMarginBottom
										help={__('Display image captions inside the lightbox.', 'pb-gallery')}
									/>
								)}
							</>
						),
						{ attributes, setAttributes }
					)}
					{applyFilters(
						'portfolioBlocks.justifiedGallery.onHoverTitleToggle',
						(
							<>
								<ToggleControl
									label={__('Show Image Title on Hover', 'pb-gallery')}
									help={__('Display the image title when hovering over images.', 'pb-gallery')}
									__nextHasNoMarginBottom
									checked={!!attributes.onHoverTitle}
									onChange={(value) => setAttributes({ onHoverTitle: value })}
								/>
							</>
						),
						{ attributes, setAttributes }
					)}
				</PanelBody>
				<PanelBody title={__('Gallery Filter Settings', 'pb-gallery')} initialOpen={true}>
					{applyFilters(
						'portfolioBlocks.justifiedGallery.enableFilterToggle',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Image Filtering', 'pb-gallery')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'pb-gallery')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody title={__('Gallery Image Styles', 'pb-gallery')} initialOpen={true}>
					{applyFilters(
						'portfolioBlocks.justifiedGallery.borderColorControl',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Image Border Color', 'pb-gallery')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'pb-gallery')}
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
									<strong>{__('Enable Image Border Width', 'pb-gallery')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'pb-gallery')}
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
									<strong>{__('Enable Image Border Radius', 'pb-gallery')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'pb-gallery')}
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
									<strong>{__('Enable Image Drop Shadow', 'pb-gallery')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'pb-gallery')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
				</PanelBody>
				{applyFilters(
					'portfolioBlocks.justifiedGallery.filterStyleSettings',
					(
						<div style={{ marginBottom: '8px' }}>
							<Notice status="info" isDismissible={false}>
								<strong>{__('Filter Bar Styles', 'pb-gallery')}</strong><br />
								{__('This is a premium feature. Unlock all features: ', 'pb-gallery')}
								<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
									{__('Upgrade to Pro', 'pb-gallery')}
								</a>
							</Notice>
						</div>
					),
					{ attributes, setAttributes }
				)}
			</InspectorControls>

			<div {...blockProps}>
				{innerBlocks.length === 0 ? (
					<MediaPlaceholder
						icon={<IconJustifiedGallery />}
						labels={{
							title: __('Justified Gallery', 'pb-gallery'),
							instructions: !window.portfolioBlocksData?.isPro
								? __('Upload or select up to 15 images to create a Justified Gallery. Upgrade to Pro for unlimited images.', 'pb-gallery')
								: __('Upload or select images to create a Justified Gallery.', 'pb-gallery'),
						}}
						onSelect={onSelectImages}
						allowedTypes={['image']}
						multiple
					/>
				) : (
					<>
						{applyFilters(
							'portfolioBlocks.justifiedGallery.renderFilterBar',
							null,
							{ attributes, setAttributes }
						)}
						<div ref={combinedRef} {...restInnerBlocksProps} />
					</>
				)}
			</div>
		</>
	);
}