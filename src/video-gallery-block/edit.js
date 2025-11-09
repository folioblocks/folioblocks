/**
 * Video Gallery Block
 * Edit JS
 **/
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
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
	Modal,
} from '@wordpress/components';
import { subscribe, select, dispatch, useDispatch, useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { plus } from '@wordpress/icons';
import ResponsiveRangeControl from '../pb-helpers/ResponsiveRangeControl';
import IconVideoGallery from '../pb-helpers/IconVideoGallery';
import './editor.scss';

export default function Edit({ attributes, setAttributes, clientId }) {
	/**
	 * Attribute Destructuring
	 */
	const {
		columns,
		tabletColumns,
		mobileColumns,
		lightbox,
		lightboxLayout,
		lazyLoad,
		gap,
		aspectRatio,
		thumbnailSize,
		playButtonVisibility,
		titleVisibility,
		activeFilter = 'All',
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
	
	const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

	// Selected block in the editor
	const selectedBlock = useSelect(
		(select) => {
			const { getSelectedBlock } = select(blockEditorStore);
			return getSelectedBlock();
		},
		[]
	);
	applyFilters('portfolioBlocks.videoGallery.filterLogic', null, { clientId, attributes, setAttributes, selectedBlock });


	// Reset activeFilter to 'All' if selected block's category doesn't match
	useEffect(() => {
		if (
			selectedBlock &&
			selectedBlock.name === 'pb-gallery/pb-video-block'
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
						__('Free version allows up to 15 videos. Upgrade to Pro for unlimited.', 'pb-gallery'),
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
					__('Video limit reached. Upgrade to Pro for unlimited videos.', 'pb-gallery'),
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
			: __('Video', 'pb-gallery');

		const newBlock = wp.blocks.createBlock('pb-gallery/pb-video-block', {
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
			allowedBlocks: ['pb-gallery/pb-video-block'],
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
						title: __('Video Gallery', 'pb-gallery'),
						instructions: isPro
							? __('Add first video. Upload, select from media library, or insert from URL.', 'pb-gallery')
							: __('Add first video. Upload or select up to 15 videos. Upgrade to Pro for unlimited.', 'pb-gallery')
					}}
					allowedTypes={['video']}
					onSelect={(media) => {
						// Limit check for free version
						if (!isPro && innerBlocks.length >= 15) {
							if (!document.getElementById('pb-video-limit-warning')) {
								wp.data.dispatch('core/notices').createNotice(
									'warning',
									__('Video limit reached. Upgrade to Pro for unlimited videos.', 'pb-gallery'),
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
					    if (!url) return;

					    const isPro = !!window.portfolioBlocksData?.isPro;
					    const currentBlocks = wp.data.select('core/block-editor').getBlock(clientId)?.innerBlocks || [];

					    if (!isPro && currentBlocks.length >= 15) {
					        if (!document.getElementById('pb-video-limit-warning')) {
					            wp.data.dispatch('core/notices').createNotice(
					                'warning',
					                __('Video limit reached. Upgrade to Pro for unlimited videos.', 'pb-gallery'),
					                {
					                    id: 'pb-video-limit-warning',
					                    isDismissible: true,
					                }
					            );
					        }
					        return;
					    }

					    const defaultTitle = __('Video', 'pb-gallery');
					    const newBlock = wp.blocks.createBlock('pb-gallery/pb-video-block', {
					        videoUrl: url,
					        title: defaultTitle,
					        alt: defaultTitle,
					    });

					    // Use replaceInnerBlocks instead of insertBlock to handle empty galleries
					    wp.data.dispatch('core/block-editor').replaceInnerBlocks(clientId, [newBlock], false);
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
					label={__('Add Videos', 'pb-gallery')}
					onClick={addVideoBlock}
					disabled={!window.portfolioBlocksData?.isPro && innerBlocks.length >= 15}
				>
					{__('Add Videos', 'pb-gallery')}
				</ToolbarButton>
			</BlockControls>
			{isVideoModalOpen && (
				<Modal
					title={__('Select or Insert Video', 'pb-gallery')}
					onRequestClose={() => setIsVideoModalOpen(false)}
				>
					<MediaPlaceholder
						labels={{
							title: __('Select or Insert Video', 'pb-gallery'),
							instructions: window.portfolioBlocksData?.isPro
								? __('Upload, select from media library, or insert from URL.', 'pb-gallery')
								: __('Upload or select up to 15 videos. Upgrade to Pro for unlimited.', 'pb-gallery'),
						}}
						allowedTypes={['video']}
						accept="video/*"
						multiple={false}
						onSelect={(media) => {
							const defaultTitle = media.title && media.title.trim() !== ''
								? media.title
								: __('Video', 'pb-gallery');
							const newBlock = wp.blocks.createBlock('pb-gallery/pb-video-block', {
								videoUrl: media.url,
								title: defaultTitle,
								alt: defaultTitle,
							});
							wp.data.dispatch('core/block-editor').insertBlock(newBlock, undefined, clientId);
							setIsVideoModalOpen(false);
						}}
						onSelectURL={(url) => {
							const defaultTitle = __('Video', 'pb-gallery');
							const newBlock = wp.blocks.createBlock('pb-gallery/pb-video-block', {
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
				<PanelBody title={__('General Gallery Settings', 'pb-gallery')} initialOpen={true}>
					<ResponsiveRangeControl
						label={__('Columns', 'pb-gallery')}
						columns={columns}
						tabletColumns={tabletColumns}
						mobileColumns={mobileColumns}
						onChange={(newValues) => setAttributes(newValues)}
					/>
					<RangeControl
						label={__('Gap Between Items (px)', 'pb-gallery')}
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
									<strong>{__('Enable Woo Commerce', 'pb-gallery')}</strong><br />
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
						'portfolioBlocks.videoGallery.disableRightClickToggle',
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
						'portfolioBlocks.videoGallery.lazyLoadToggle',
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

				<PanelBody title={__('Gallery Thumbnail Settings', 'pb-gallery')} initialOpen={true}>
					<SelectControl
						label={__('Thumbnail Aspect Ratio', 'pb-gallery')}
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
						label={__('Thumbnail Resolution', 'pb-gallery')}
						value={thumbnailSize}
						onChange={(val) => setAttributes({ thumbnailSize: val })}
						options={imageSizeOptions}
						help={__('Set thumbnail resolution.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<SelectControl
						label={__('Play Button Visibility', 'pb-gallery')}
						value={playButtonVisibility}
						onChange={(val) => setAttributes({ playButtonVisibility: val })}
						options={[
							{ label: __('Always Show', 'pb-gallery'), value: 'always' },
							{ label: __('On Hover', 'pb-gallery'), value: 'onHover' },
							{ label: __('Hidden', 'pb-gallery'), value: 'hidden' },
						]}
						help={__('Settings for the Play button overlay.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<SelectControl
						label={__('Title Visibility', 'pb-gallery')}
						value={titleVisibility}
						onChange={(val) => setAttributes({ titleVisibility: val })}
						options={[
							{ label: __('Always Show', 'pb-gallery'), value: 'always' },
							{ label: __('On Hover', 'pb-gallery'), value: 'onHover' },
							{ label: __('Hidden', 'pb-gallery'), value: 'hidden' },
						]}
						help={__('Settings for the Video Title overlay.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
				</PanelBody>
				<PanelBody title={__('Gallery Lightbox Settings', 'pb-gallery')} initialOpen={true}>
					<ToggleControl
						label={__('Disable Lightbox in Editor', 'pb-gallery')}
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
									<strong>{__('Lightbox Layout', 'pb-gallery')}</strong><br />
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
				<PanelBody title={__('Gallery Filter Settings', 'pb-gallery')} initialOpen={true}>
					{applyFilters(
						'portfolioBlocks.videoGallery.enableFilterToggle',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Enable Video Filtering', 'pb-gallery')}</strong><br />
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
				<PanelBody title={__('Video Thumbnail Styles', 'pb-gallery')} initialOpen={true}>
					{applyFilters(
						'portfolioBlocks.videoGallery.borderColorControl',
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
						'portfolioBlocks.videoGallery.borderWidthControl',
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
						'portfolioBlocks.videoGallery.borderRadiusControl',
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
						'portfolioBlocks.videoGallery.dropShadowToggle',
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
					'portfolioBlocks.videoGallery.filterStylesControls',
					(
						<div style={{ marginBottom: '8px' }}>
							<Notice status="info" isDismissible={false}>
								<strong>{__('Filter Styles Controls', 'pb-gallery')}</strong><br />
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
				{applyFilters(
					'portfolioBlocks.videoGallery.renderFilterBar',
					null,
					{ attributes, setAttributes }
				)}
				<div {...innerBlocksProps} />
			</div>
		</>
	);
}