import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { select } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { BlockControls, useBlockProps, useInnerBlocksProps, InspectorControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton, PanelBody, ToggleControl, SelectControl, RangeControl, ColorPalette, BaseControl } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { applyThumbnails } from '../pb-helpers/applyThumbnails';
import IconModularGallery from '../pb-helpers/IconModularGallery';


const ALLOWED_BLOCKS = ['portfolio-blocks/pb-image-row'];

export default function Edit(props) {
	const { clientId, attributes, setAttributes } = props;
	const { resolution, dropShadow, noGap, lightbox, lightboxCaption, onHoverTitle, enableDownload, downloadOnHover, preview } = attributes;

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

	const handleAddRow = () => {
		const { createBlock } = wp.blocks;
		const newRow = createBlock('portfolio-blocks/pb-image-row');
		insertBlock(newRow, innerBlocks.length, clientId);
	};
	const [layoutVersion, setLayoutVersion] = useState(0);

	useEffect(() => {
		const observer = new ResizeObserver(() => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setLayoutVersion(Date.now());
				});
			});
		});
		const container = document.querySelector(`[data-block="${clientId}"]`);
		if (container) observer.observe(container);
		return () => observer.disconnect();
	}, []);

	const blockProps = useBlockProps({
		context: {
			'portfolioBlocks/lightbox': lightbox,
			'portfolioBlocks/lightboxCaption': lightboxCaption,
			'portfolioBlocks/dropShadow': dropShadow,
			'portfolioBlocks/resolution': resolution,
			'portfolioBlocks/onHoverTitle': onHoverTitle,
			'portfolioBlocks/noGap': noGap,
			'portfolioBlocks/borderColor': attributes.borderColor || '#ffffff',
			'portfolioBlocks/borderRadius': `${attributes.borderRadius || 0}px`,
			'portfolioBlocks/borderWidth': `${attributes.borderWidth || 0}px`,
			'portfolioBlocks/layoutVersion': layoutVersion
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
				<PanelBody title={__('Geenral Gallery Settings', 'portfolio-blocks')} initialOpen={true}>
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
						checked={attributes.disableRightClick}
						__nextHasNoMarginBottom
						onChange={(value) => setAttributes({ disableRightClick: value })}
					/>
				</PanelBody>
				<PanelBody title={__('Gallery Image Settings', 'portfolio-blocks')} initialOpen={true}>
					<ToggleControl
						label={__('Enable Lightbox', 'portfolio-blocks')}
						checked={lightbox}
						onChange={(value) => setAttributes({ lightbox: value })}
						__nextHasNoMarginBottom
						help={__('Enable image Lightbox on click.', 'portfolio-blocks')}
					/>
					{lightbox && (
						<ToggleControl
							label={__('Show Caption in Lightbox', 'portfolio-blocks')}
							checked={lightboxCaption}
							onChange={(value) => setAttributes({ lightboxCaption: value })}
							__nextHasNoMarginBottom
							help={__('Display image captions inside the lightbox.', 'portfolio-blocks')}
						/>
					)}
					<ToggleControl
						label={__('Show Title on Hover', 'portfolio-blocks')}
						checked={onHoverTitle}
						onChange={(value) => setAttributes({ onHoverTitle: value })}
						__nextHasNoMarginBottom
						help={__('Enable captions appearing on hover.', 'portfolio-blocks')}
					/>
				</PanelBody>
				<PanelBody title={__('Woo Settings', 'portfolio-blocks')} initialOpen={false}>

				</PanelBody>
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody title={__('Gallery Image Styles', 'portfolio-blocks')} initialOpen={true}>
					<ToggleControl
						label={__('Enable Drop Shadow', 'portfolio-blocks')}
						checked={dropShadow}
						onChange={(value) => setAttributes({ dropShadow: value })}
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

			</InspectorControls>

			<div {...blockProps}>
				<div {...innerBlocksProps} />
			</div>
		</>
	);
}