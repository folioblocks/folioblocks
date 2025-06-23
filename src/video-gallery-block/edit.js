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
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	ToolbarButton,
	TextControl,
	BaseControl,
	ColorPalette,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	Panel,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
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
		preview
	} = attributes;

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

	// Ensure at least one video block exists inside on initial mount
	const { insertBlock } = useDispatch('core/block-editor');
	useEffect(() => {
		const timeout = setTimeout(() => {
			const block = wp.data.select('core/block-editor').getBlock(clientId);

			if (block && block.innerBlocks.length === 0) {
				insertBlock(
					wp.blocks.createBlock('portfolio-blocks/pb-video-block'),
					undefined,
					clientId
				);
			}
		}, 0); // Delay to ensure block is ready

		return () => clearTimeout(timeout);
	}, [clientId, insertBlock]);

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
		insertBlock(
			wp.blocks.createBlock('portfolio-blocks/pb-video-block'),
			undefined,
			clientId
		);
	};

	/**
	 * Render
	 */
	return (
		<>
			<BlockControls>
				<ToolbarButton
					icon={plus}
					label={__('Add Videos', 'portfolio-blocks')}
					onClick={addVideoBlock}
				>
					{__('Add Videos', 'portfolio-blocks')}
				</ToolbarButton>
			</BlockControls>

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
					<ToggleControl
						label={__('Disable Lightbox in Editor', 'portfolio-blocks')}
						checked={!lightbox}
						onChange={(val) => setAttributes({ lightbox: !val })}
						__nextHasNoMarginBottom
						help={__('Prevent videos from opening in a Lightbox while editing.')}
					/>
					<ToggleControl
						label={__('Enable Drop Shadow', 'portfolio-blocks')}
						checked={!!dropShadow}
						onChange={(value) => setAttributes({ dropShadow: value })}
						help={__('Enable drop show on Video Blocks.')}
						__nextHasNoMarginBottom
					/>
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
				<PanelBody title={__('Gallery Filter Settings', 'portfolio-blocks')} initialOpen={true}>
					<ToggleControl
						label={__('Enable Video Filtering', 'portfolio-blocks')}
						checked={enableFilter}
						onChange={(val) => setAttributes({ enableFilter: val })}
						__nextHasNoMarginBottom
						help={__('Enable Video filtering with categories.')}
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
								__next40pxDefaultSize
							/>
						</>
					)}
				</PanelBody>

			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody title={__('Video Thumbnail Styles', 'portfolio-blocks')} initialOpen={true}>
					<BaseControl label={__('Border Color', 'portfolio-blocks')} __nextHasNoMarginBottom>
						<ColorPalette
							value={borderColor}
							onChange={(value) => setAttributes({ borderColor: value })}
							clearable={false}
							help={__('Set border color.')}
						/>
					</BaseControl>
					<RangeControl
						label={__('Border Width', 'portfolio-blocks')}
						value={borderWidth}
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
						value={borderRadius}
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