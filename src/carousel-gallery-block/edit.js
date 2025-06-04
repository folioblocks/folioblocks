import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
	BlockControls,
	MediaPlaceholder,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	ToolbarGroup,
	ToolbarButton,
} from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { applyThumbnails } from '../pb-helpers/applyThumbnails';
import './editor.scss';

export default function Edit({ clientId, attributes, setAttributes }) {
	const ALLOWED_BLOCKS = ['portfolio-blocks/pb-image-block'];
	const blockProps = useBlockProps();
	const innerBlocksProps = useBlockProps.save({
		className: 'pb-carousel-gallery-inner',
		allowedBlocks: ALLOWED_BLOCKS,
	});
	
	const { replaceInnerBlocks, updateBlockAttributes } = useDispatch(blockEditorStore);

	const innerBlocks = useSelect(
		(select) => select(blockEditorStore).getBlocks(clientId),
		[clientId]
	);

	const onSelectImages = (media) => {
		if (!media || media.length === 0) return;

		const currentBlocks = wp.data.select(blockEditorStore).getBlocks(clientId);
		const existingImageIds = currentBlocks.map((block) => block.attributes.id);
		const newBlocks = media
			.filter((image) => !existingImageIds.includes(image.id))
			.map((image) =>
				wp.blocks.createBlock('portfolio-blocks/pb-image-block', {
					id: image.id,
					src: image.url,
					alt: image.alt || '',
					title: image.title || '',
					sizes: image.sizes || {},
					caption: image.caption || '',
				})
			);

		replaceInnerBlocks(clientId, [...currentBlocks, ...newBlocks]);
	};

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
					/>
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
						].filter((option) => {
							const allSizes = innerBlocks.flatMap((block) =>
								Object.keys(block.attributes.sizes || {})
							);
							return allSizes.includes(option.value) || option.value === 'full';
						})}
						onChange={(newResolution) => {
							setAttributes({ resolution: newResolution });
							innerBlocks.forEach((block) => {
								const newSrc =
									block.attributes.sizes?.[newResolution]?.url || block.attributes.src;
								updateBlockAttributes(block.clientId, {
									src: newSrc,
									imageSize: newResolution,
								});
							});
							setTimeout(() => applyThumbnails(clientId), 300);
						}}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={__('Select the size of the source image.')}
					/>
					<ToggleControl
						label={__('Enable Image Downloads', 'portfolio-blocks')}
						checked={attributes.enableDownload}
						onChange={(value) => setAttributes({ enableDownload: value })}
						__nextHasNoMarginBottom
					/>
					{attributes.enableDownload && (
						<SelectControl
							label={__('Display Image Download Icon', 'portfolio-blocks')}
							value={attributes.downloadOnHover ? 'hover' : 'always'}
							options={[
								{ label: __('Always', 'portfolio-blocks'), value: 'always' },
								{ label: __('On Hover', 'portfolio-blocks'), value: 'hover' },
							]}
							onChange={(value) =>
								setAttributes({ downloadOnHover: value === 'hover' })
							}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
					)}
					<ToggleControl
						label={__('Disable Right-Click on Page', 'portfolio-blocks')}
						checked={attributes.disableRightClick}
						onChange={(value) => setAttributes({ disableRightClick: value })}
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={__('Gallery Image Settings', 'portfolio-blocks')} initialOpen={true}>
					<ToggleControl
						label={__('Add Drop Shadow', 'portfolio-blocks')}
						checked={attributes.dropShadow || false}
						onChange={(value) => setAttributes({ dropShadow: value })}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={__('Enable Lightbox', 'portfolio-blocks')}
						checked={attributes.lightbox || false}
						onChange={(value) => setAttributes({ lightbox: value })}
						__nextHasNoMarginBottom
					/>
					{attributes.lightbox && (
						<ToggleControl
							label={__('Show Caption in Lightbox', 'portfolio-blocks')}
							checked={attributes.lightboxCaption || false}
							onChange={(value) => setAttributes({ lightboxCaption: value })}
							__nextHasNoMarginBottom
						/>
					)}
					<ToggleControl
						label={__('Show Title on Hover', 'portfolio-blocks')}
						checked={attributes.onHoverTitle || false}
						onChange={(value) => setAttributes({ onHoverTitle: value })}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{innerBlocks.length === 0 ? (
					<MediaPlaceholder
						icon="format-gallery"
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
					<div {...innerBlocksProps} />
				)}
			</div>
		</>
	);
}