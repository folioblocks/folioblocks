import { __ } from '@wordpress/i18n';

/**
 * External (WordPress) imports
 */
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
	PanelColorSettings,
	store as blockEditorStore,
	MediaPlaceholder,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Notice,
	RangeControl,
	SelectControl,
	ToggleControl,
	ToolbarButton,
	TextControl,
	BaseControl,
	ColorPalette,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	Modal,
} from '@wordpress/components';
import { subscribe, select, dispatch, useDispatch, useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { plus } from '@wordpress/icons';


/**
 * Internal imports
 */
import ResponsiveRangeControl from '../pb-helpers/ResponsiveRangeControl';
import IconVideoGallery from '../pb-helpers/IconVideoGallery';
/**
 * Internal styles
 */
import './editor.scss';

export default function Edit({ attributes, setAttributes, clientId }) {
	/**
	 * Attribute Destructuring
	 */
	const {
		columns,
		tabletColumns,
		mobileColumns,
		enableFilter,
		filterAlign = 'left',
		lightbox,
		lightboxLayout,
		lazyLoad,
		gap,
		aspectRatio,
		thumbnailSize,
		playButtonVisibility,
		titleVisibility,
		activeFilter = 'All',
		filterCategories = [],
		dropShadow,
		borderColor,
		borderWidth,
		borderRadius,
		filterTextColor,
		filterBgColor,
		activeFilterTextColor,
		activeFilterBgColor,
		preview,
		enableWooCommerce, 
		wooCartIconDisplay,
	} = attributes;

	const checkoutUrl = window.portfolioBlocksData?.checkoutUrl || 'https://portfolio-blocks.com/portfolio-blocks-pricing/';

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
	const [filtersInput, setFiltersInput] = useState(filterCategories.join(', '));
	const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

	// Selected block in the editor
	const selectedBlock = useSelect(
		(select) => {
			const { getSelectedBlock } = select(blockEditorStore);
			return getSelectedBlock();
		},
		[]
	);

	// Sync filtersInput state when filterCategories attribute changes
	useEffect(() => {
		setFiltersInput(filterCategories.join(', '));
	}, [filterCategories]);

	// Reset activeFilter to 'All' if selected block's category doesn't match
	useEffect(() => {
		if (
			selectedBlock &&
			selectedBlock.name === 'portfolio-blocks/pb-video-block'
		) {
			const selectedCategory = selectedBlock.attributes?.filterCategory || '';

			if (
				activeFilter !== 'All' &&
				selectedCategory.toLowerCase() !== activeFilter.toLowerCase()
			) {
				setAttributes({ activeFilter: 'All' });
			}
		}
	}, [selectedBlock, activeFilter, setAttributes]);

	// Force layout update in editor after filtering to fix rendering issues
	useEffect(() => {
		if (wp?.data?.select('core/block-editor').isBlockSelected(clientId)) {
			const container = document.querySelector(`[data-block="${clientId}"] .pb-video-gallery`);
			if (container) {
				container.style.display = 'none';
				requestAnimationFrame(() => {
					container.style.display = '';
				});
			}
		}
	}, [activeFilter, clientId]);

	// Prevent people duplicating blocks to bypass limits
	if (!window.portfolioBlocksData?.isPro) {
		subscribe(() => {
			const blocks = select('core/block-editor').getBlocksByClientId(clientId)[0]?.innerBlocks || [];
			if (blocks.length > 15) {
				// Remove extras immediately
				const extras = blocks.slice(15);
				extras.forEach((block) => {
					dispatch('core/block-editor').removeBlock(block.clientId);
				});

				// Show warning notice
				if (!document.getElementById('pb-video-limit-warning')) {
					dispatch('core/notices').createNotice(
						'warning',
						__('Free version allows up to 15 videos. Upgrade to Pro for unlimited.', 'portfolio-blocks'),
						{ id: 'pb-video-limit-warning', isDismissible: true }
					);
				}
			}
		});
	}

	// Handler to add first video via MediaPlaceholder
	const { replaceInnerBlocks, insertBlock } = useDispatch('core/block-editor');
	const handleVideoSelect = (media) => {
		if (!media || !media.url) return;
		const isPro = !!window.portfolioBlocksData?.isPro;
		const currentBlocks = wp.data.select('core/block-editor').getBlock(clientId)?.innerBlocks || [];
		if (!isPro && currentBlocks.length >= 15) {
			// Show warning notice
			if (!document.getElementById('pb-video-limit-warning')) {
				wp.data.dispatch('core/notices').createNotice(
					'warning',
					__('Video limit reached. Upgrade to Pro for unlimited videos.', 'portfolio-blocks'),
					{
						id: 'pb-video-limit-warning',
						isDismissible: true,
					}
				);
			}
			return;
		}
		const defaultTitle = media.title && media.title.trim() !== ''
			? media.title
			: __('Video', 'portfolio-blocks');

		const newBlock = wp.blocks.createBlock('portfolio-blocks/pb-video-block', {
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
			'portfolioBlocks/aspectRatio': aspectRatio,
			'portfolioBlocks/playButtonVisibility': playButtonVisibility,
			'portfolioBlocks/titleVisibility': titleVisibility,
			'portfolioBlocks/activeFilter': activeFilter,
			'portfolioBlocks/lightbox': lightbox,
			'portfolioBlocks/lightboxLayout': lightboxLayout,
			'portfolioBlocks/lazyLoad': lazyLoad,
			'portfolioBlocks/enableWooCommerce': enableWooCommerce,
			'portfolioBlocks/wooCartIconDisplay': wooCartIconDisplay,
		},
		style: {
			'--pb--filter-text-color': filterTextColor || '#000',
			'--pb--filter-bg-color': filterBgColor || 'transparent',
			'--pb--filter-active-text': activeFilterTextColor || '#fff',
			'--pb--filter-active-bg': activeFilterBgColor || '#000',
		},
	});

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: `pb-video-gallery cols-d-${columns} cols-t-${tabletColumns} cols-m-${mobileColumns}`,
			style: { '--gap': `${gap}px` },
		},
		{
			allowedBlocks: ['portfolio-blocks/pb-video-block'],
			orientation: 'horizontal',
			templateLock: false,
			context: {
				'portfolioBlocks/aspectRatio': aspectRatio,
				'portfolioBlocks/playButtonVisibility': playButtonVisibility,
				'portfolioBlocks/titleVisibility': titleVisibility,
				'portfolioBlocks/activeFilter': activeFilter,
				'portfolioBlocks/lightbox': lightbox,
				'portfolioBlocks/lightboxLayout': lightboxLayout,
				'portfolioBlocks/lazyLoad': lazyLoad,
			},
		}
	);

	/**
	 * Derived / Effective Values
	 */
	const imageSizeOptions = wp
		.data
		.select('core/block-editor')
		.getSettings()
		.imageSizes
		.map((size) => ({
			label: size.name,
			value: size.slug,
		}))
		.sort((a, b) => {
			const order = ['thumbnail', 'medium', 'large', 'full'];
			const indexA = order.indexOf(a.value);
			const indexB = order.indexOf(b.value);
			if (indexA === -1 && indexB === -1) {
				return 0;
			}
			if (indexA === -1) return 1;
			if (indexB === -1) return -1;
			return indexA - indexB;
		});

	/**
	 * Controls & Handlers
	 */

	// Handler for filter input change
	const handleFilterInputChange = (val) => {
		setFiltersInput(val);
	};

	// Handler for filter input blur event to update filterCategories attribute
	const handleFilterInputBlur = () => {
		const rawFilters = filtersInput.split(',').map((f) => f.trim());
		const cleanFilters = rawFilters.filter(Boolean);
		setAttributes({ filterCategories: cleanFilters });
	};

	// Handler to add a new video block inside the gallery
	const addVideoBlock = () => {
		setIsVideoModalOpen(true);
	};

	/**
	 * Render
	 */
	// If no videos yet, show MediaPlaceholder
	const innerBlocks = useSelect(
		(select) => select('core/block-editor').getBlock(clientId)?.innerBlocks || [],
		[clientId]
	);

	if (innerBlocks.length === 0) {
		const isPro = !!window.portfolioBlocksData?.isPro;
		return (
			<div {...blockProps}>
				<MediaPlaceholder
					icon={<IconVideoGallery />}
					labels={{
						title: __('Video Gallery', 'portfolio-blocks'),
						instructions: isPro
							? __('Add first video. Upload, select from media library, or insert from URL.', 'portfolio-blocks')
							: __('Add first video. Upload or select up to 15 videos. Upgrade to Pro for unlimited.', 'portfolio-blocks')
					}}
					allowedTypes={['video']}
					onSelect={(media) => {
						// Limit check for free version
						if (!isPro && innerBlocks.length >= 15) {
							if (!document.getElementById('pb-video-limit-warning')) {
								wp.data.dispatch('core/notices').createNotice(
									'warning',
									__('Video limit reached. Upgrade to Pro for unlimited videos.', 'portfolio-blocks'),
									{
										id: 'pb-video-limit-warning',
										isDismissible: true,
									}
								);
							}
							return;
						}
						handleVideoSelect(media);
					}}
					onSelectURL={(url) => {
						if (!isPro && innerBlocks.length >= 15) {
							if (!document.getElementById('pb-video-limit-warning')) {
								wp.data.dispatch('core/notices').createNotice(
									'warning',
									__('Video limit reached. Upgrade to Pro for unlimited videos.', 'portfolio-blocks'),
									{
										id: 'pb-video-limit-warning',
										isDismissible: true,
									}
								);
							}
							return;
						}
						const videoBlock = wp.blocks.createBlock('portfolio-blocks/pb-video-block', { videoUrl: url });
						insertBlock(videoBlock, undefined, clientId);
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
					label={__('Add Videos', 'portfolio-blocks')}
					onClick={addVideoBlock}
					disabled={!window.portfolioBlocksData?.isPro && innerBlocks.length >= 15}
				>
					{__('Add Videos', 'portfolio-blocks')}
				</ToolbarButton>
			</BlockControls>
			{isVideoModalOpen && (
				<Modal
					title={__('Select or Insert Video', 'portfolio-blocks')}
					onRequestClose={() => setIsVideoModalOpen(false)}
				>
					<MediaPlaceholder
						labels={{
							title: __('Select or Insert Video', 'portfolio-blocks'),
							instructions: window.portfolioBlocksData?.isPro
								? __('Upload, select from media library, or insert from URL.', 'portfolio-blocks')
								: __('Upload or select up to 15 videos. Upgrade to Pro for unlimited.', 'portfolio-blocks'),
						}}
						allowedTypes={['video']}
						accept="video/*"
						multiple={false}
						onSelect={(media) => {
							const defaultTitle = media.title && media.title.trim() !== ''
								? media.title
								: __('Video', 'portfolio-blocks');
							const newBlock = wp.blocks.createBlock('portfolio-blocks/pb-video-block', {
								videoUrl: media.url,
								title: defaultTitle,
								alt: defaultTitle,
							});
							wp.data.dispatch('core/block-editor').insertBlock(newBlock, undefined, clientId);
							setIsVideoModalOpen(false);
						}}
						onSelectURL={(url) => {
							const defaultTitle = __('Video', 'portfolio-blocks');
							const newBlock = wp.blocks.createBlock('portfolio-blocks/pb-video-block', {
								videoUrl: url,
								title: defaultTitle,
								alt: defaultTitle,
							});
							wp.data.dispatch('core/block-editor').insertBlock(newBlock, undefined, clientId);
							setIsVideoModalOpen(false);
						}}
					/>
				</Modal>
			)}

			<InspectorControls>
				{/* Gallery Settings Panel */}
				<PanelBody title={__('General Gallery Settings', 'portfolio-blocks')} initialOpen={true}>
					<ResponsiveRangeControl
						label={__('Columns', 'portfolio-blocks')}
						columns={columns}
						tabletColumns={tabletColumns}
						mobileColumns={mobileColumns}
						onChange={(newValues) => setAttributes(newValues)}
					/>
					<RangeControl
						label={__('Gap Between Items (px)', 'portfolio-blocks')}
						value={gap}
						onChange={(val) => setAttributes({ gap: val })}
						min={0}
						max={40}
						step={1}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={__('Set gap size between Thumbnails.')}
					/>
					{ window.portfolioBlocksData?.hasWooCommerce && applyFilters(
						'portfolioBlocks.videoGallery.wooCommerceControls',
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
						'portfolioBlocks.videoGallery.disableRightClickToggle',
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
						'portfolioBlocks.videoGallery.lazyLoadToggle',
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

				<PanelBody title={__('Gallery Thumbnail Settings', 'portfolio-blocks')} initialOpen={true}>
					<SelectControl
						label={__('Thumbnail Aspect Ratio', 'portfolio-blocks')}
						value={aspectRatio}
						onChange={(val) => setAttributes({ aspectRatio: val })}
						options={[
							{ label: '21:9', value: '21:9' },
							{ label: '16:9', value: '16:9' },
							{ label: '9:16', value: '9:16' },
							{ label: '4:3', value: '4:3' },
							{ label: '3:2', value: '3:2' },
							{ label: '1:1', value: '1:1' },
						]}
						help={__('Set thumbnail aspect ratio.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<SelectControl
						label={__('Thumbnail Resolution', 'portfolio-blocks')}
						value={thumbnailSize}
						onChange={(val) => setAttributes({ thumbnailSize: val })}
						options={imageSizeOptions}
						help={__('Set thumbnail resolution.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<SelectControl
						label={__('Play Button Visibility', 'portfolio-blocks')}
						value={playButtonVisibility}
						onChange={(val) => setAttributes({ playButtonVisibility: val })}
						options={[
							{ label: __('Always Show', 'portfolio-blocks'), value: 'always' },
							{ label: __('On Hover', 'portfolio-blocks'), value: 'onHover' },
							{ label: __('Hidden', 'portfolio-blocks'), value: 'hidden' },
						]}
						help={__('Settings for the Play button overlay.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<SelectControl
						label={__('Title Visibility', 'portfolio-blocks')}
						value={titleVisibility}
						onChange={(val) => setAttributes({ titleVisibility: val })}
						options={[
							{ label: __('Always Show', 'portfolio-blocks'), value: 'always' },
							{ label: __('On Hover', 'portfolio-blocks'), value: 'onHover' },
							{ label: __('Hidden', 'portfolio-blocks'), value: 'hidden' },
						]}
						help={__('Settings for the Video Title overlay.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
				</PanelBody>
				<PanelBody title={__('Gallery Lightbox Settings', 'portfolio-blocks')} initialOpen={true}>
					<ToggleControl
						label={__('Disable Lightbox in Editor', 'portfolio-blocks')}
						checked={!lightbox}
						onChange={(val) => setAttributes({ lightbox: !val })}
						__nextHasNoMarginBottom
						help={__('Prevent videos from opening in a Lightbox while editing.')}
					/>
					{applyFilters(
						'portfolioBlocks.videoGallery.lightboxLayout',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Lightbox Layout', 'portfolio-blocks')}</strong><br />
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
						'portfolioBlocks.videoGallery.enableFilterToggle',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Video Filtering', 'portfolio-blocks')}</strong><br />
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
								__next40pxDefaultSize
							/>
						</>
					)}
				</PanelBody>

			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody title={__('Video Thumbnail Styles', 'portfolio-blocks')} initialOpen={true}>
					{applyFilters(
						'portfolioBlocks.videoGallery.borderColorControl',
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
						'portfolioBlocks.videoGallery.borderWidthControl',
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
						'portfolioBlocks.videoGallery.borderRadiusControl',
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
						'portfolioBlocks.videoGallery.dropShadowToggle',
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
						title={__('Filter Bar Styles', 'portfolio-blocks')}
						colorSettings={[
							{
								label: __('Active - Text Color', 'portfolio-blocks'),
								value: activeFilterTextColor,
								onChange: (value) => setAttributes({ activeFilterTextColor: value }),
							},
							{
								label: __('Active - Background Color', 'portfolio-blocks'),
								value: activeFilterBgColor,
								onChange: (value) => setAttributes({ activeFilterBgColor: value }),
							},
							{
								label: __('Inactive - Text Color', 'portfolio-blocks'),
								value: filterTextColor,
								onChange: (value) => setAttributes({ filterTextColor: value }),
							},
							{
								label: __('Inactive - Background Color', 'portfolio-blocks'),
								value: filterBgColor,
								onChange: (value) => setAttributes({ filterBgColor: value }),
							},
						]}
					/>
				)}
			</InspectorControls>

			<div {...blockProps}>
				{/* Filter Bar */}
				{enableFilter && (
					<div className={`pb-video-gallery-filters align-${filterAlign}`}>
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

				{/* Inner Video Blocks */}
				<div {...innerBlocksProps} />
			</div>
		</>
	);
}