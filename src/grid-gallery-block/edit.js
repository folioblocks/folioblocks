/**
 * Grid Gallery Block
 * Edit JS
 **/
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	MediaPlaceholder,
	BlockControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Notice,
	SelectControl,
	ToolbarGroup,
	ToolbarButton,
	ToggleControl,
} from '@wordpress/components';
import { useEffect, useRef, useCallback } from '@wordpress/element';
import { subscribe, dispatch, select, useDispatch, useSelect } from '@wordpress/data';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { plus } from '@wordpress/icons';
import { decodeEntities } from '@wordpress/html-entities';
import ResponsiveRangeControl from '../pb-helpers/ResponsiveRangeControl';
import IconGridGallery from '../pb-helpers/IconGridGallery';
import './editor.scss';

const ALLOWED_BLOCKS = ['pb-gallery/pb-image-block'];

// Improved layout calculation for grid gallery: clears previous styles, uses bounding rect, and accounts for border
const applyGridLayout = (galleryRef) => {
	const gallery = galleryRef?.current;
	if (!gallery) return;

	const wrappers = gallery.querySelectorAll('.pb-image-block-wrapper');

	wrappers.forEach((wrapper) => {
		const figure = wrapper.querySelector('figure');
		// Skip hidden wrappers
		if (wrapper.classList.contains('is-hidden')) return;
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
		columns,
		tabletColumns,
		mobileColumns,
		lightbox,
		lightboxCaption,
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

	const checkoutUrl = window.portfolioBlocksData?.checkoutUrl || 'https://portfolio-blocks.com/portfolio-blocks-pricing/';

	// Runtime override: if WooCommerce is not active, force Woo features off without mutating saved attributes
	const hasWooCommerce = window.portfolioBlocksData?.hasWooCommerce ?? false;
	const effectiveEnableWoo = hasWooCommerce ? (attributes.enableWooCommerce || false) : false;
	useEffect(() => {
		const wooActive = window.portfolioBlocksData?.hasWooCommerce ?? false;
		if (wooActive !== attributes.hasWooCommerce) {
			setAttributes({ hasWooCommerce: wooActive });
		}
	}, [window.portfolioBlocksData?.hasWooCommerce]);


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
				selectedBlock.name === 'pb-gallery/pb-image-block' &&
				select(blockEditorStore).getBlockRootClientId(selectedId) === clientId
			) {
				return true;
			}

			return false;
		},
		[clientId]
	);

	// Get inner blocks (images)
	const innerBlocks = useSelect(
		(select) => select('core/block-editor').getBlocks(clientId),
		[clientId]
	);

	// Inserts filtering logic
	applyFilters('portfolioBlocks.gridGallery.filterLogic', null, { clientId, attributes, setAttributes, selectedBlock, });


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

	// Adds randomize logic on pro version
	applyFilters('portfolioBlocks.gridGallery.editorEnhancements', null, { clientId, innerBlocks, attributes, isBlockOrChildSelected });

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
	
	const blockProps = useBlockProps({
		context: {
			'portfolioBlocks/activeFilter': attributes.activeFilter || 'All',
			'portfolioBlocks/filterCategories': attributes.filterCategories || [],
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
	const className = `${blockProps.className}`;

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
			renderAppender: false,
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


	// Filter to limit number of images in free version (only if not Pro)
	if (!window.portfolioBlocksData?.isPro) {
		addFilter(
			'portfolioBlocks.gridGallery.limitImages',
			'pb-gallery/grid-gallery-limit',
			(media, existingCount) => {
				const MAX_IMAGES_FREE = 15;
				const allowed = Math.max(0, MAX_IMAGES_FREE - existingCount);

				if (allowed <= 0) {
					const message = __('Free version allows up to 15 images. Upgrade to Pro for unlimited.', 'pb-gallery');
					wp.data.dispatch('core/notices').createNotice(
						'warning',
						message,
						{ isDismissible: true, id: 'pb-grid-limit-warning' }
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
						{ isDismissible: true, id: 'pb-grid-limit-truncate' }
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

	const onSelectImages = async (media) => {
		if (!media || media.length === 0) return;

		// Allow filtering of selected images (for free vs premium limits)
		media = applyFilters(
			'portfolioBlocks.gridGallery.limitImages',
			media,
			innerBlocks.length
		);

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

				return wp.blocks.createBlock('pb-gallery/pb-image-block', {
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

	applyFilters('portfolioBlocks.gridGallery.editorEnhancements', null, { clientId, innerBlocks, isBlockOrChildSelected });

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

			{/* Inspector Controls */}
			<InspectorControls>
				{/* Gallery Settings Panel */}
				<PanelBody title={__('General Gallery Settings', 'pb-gallery')} initialOpen={true}>
					<SelectControl
						label={__('Resolution', 'pb-gallery')}
						value={attributes.resolution || 'large'}
						options={[
							{ label: __('Thumbnail', 'pb-gallery'), value: 'thumbnail' },
							{ label: __('Medium', 'pb-gallery'), value: 'medium' },
							{ label: __('Large', 'pb-gallery'), value: 'large' },
							{ label: __('Full', 'pb-gallery'), value: 'full' },
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
						label={__('Columns', 'pb-gallery')}
						columns={columns}
						tabletColumns={tabletColumns}
						mobileColumns={mobileColumns}
						onChange={(newValues) => setAttributes(newValues)}
					/>

					{applyFilters(
						'portfolioBlocks.gridGallery.randomizeToggle',
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
						'portfolioBlocks.gridGallery.downloadControls',
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
						'portfolioBlocks.gridGallery.wooCommerceControls',
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
						'portfolioBlocks.gridGallery.disableRightClickToggle',
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
						'portfolioBlocks.gridGallery.lazyLoadToggle',
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
						'portfolioBlocks.gridGallery.lightboxControls',
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
						'portfolioBlocks.gridGallery.onHoverTitleToggle',
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
						'portfolioBlocks.gridGallery.enableFilterToggle',
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
						'portfolioBlocks.gridGallery.borderColorControl',
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
						'portfolioBlocks.gridGallery.borderWidthControl',
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
						'portfolioBlocks.gridGallery.borderRadiusControl',
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
						'portfolioBlocks.gridGallery.dropShadowToggle',
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
					'portfolioBlocks.gridGallery.filterStyleSettings',
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

			{/* Main Block Render */}
			<div {...{ ...blockProps, className }}>
				{innerBlocks.length === 0 ? (
					<MediaPlaceholder
						icon={<IconGridGallery />}
						labels={{
							title: __('Grid Gallery', 'pb-gallery'),
							instructions: !window.portfolioBlocksData?.isPro
								? __('Upload or select up to 15 images to create a Grid Gallery. Upgrade to Pro for unlimited images.', 'pb-gallery')
								: __('Upload or select images to create a Grid Gallery.', 'pb-gallery'),
						}}
						onSelect={onSelectImages}
						allowedTypes={['image']}
						multiple
					/>
				) : (
					<>
						{applyFilters(
							'portfolioBlocks.gridGallery.renderFilterBar',
							null,
							{ attributes, setAttributes }
						)}
						<div ref={mergedRef} {...restInnerBlocksProps} />
					</>
				)}
			</div>
		</>
	);
}