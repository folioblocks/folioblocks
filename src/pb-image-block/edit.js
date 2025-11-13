/**
 * PB Image Block
 * Edit JS
 **/
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaPlaceholder,
	BlockControls,
	MediaUpload,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextareaControl,
	TextControl,
	ToolbarGroup,
	ToolbarButton,
	Button,
} from '@wordpress/components';
import { useRef, useEffect } from '@wordpress/element';
import { media } from '@wordpress/icons';
import { applyFilters } from '@wordpress/hooks';
import './editor.scss';

export default function Edit({ attributes, setAttributes, context }) {
	const {
		id, src, sizes, alt, title, caption, width, height,
		enableLightbox, showCaptionInLightbox,
		dropshadow, enableDownload, downloadOnHover,
	} = attributes;

	const {
		'folioBlocks/enableDownload': contextEnableDownload = enableDownload,
		'folioBlocks/downloadOnHover': contextDownloadOnHover = downloadOnHover,
	} = context || {};

	const isInsideGallery = Object.keys(context || {}).some((key) => key.startsWith('folioBlocks/'));
	const imageSize = context['folioBlocks/resolution'] || 'large';

	const imageStyle = {
		borderColor: isInsideGallery ? context['folioBlocks/borderColor'] || '#ffffff' : attributes.borderColor || '#ffffff',
		borderWidth: isInsideGallery ? `${context['folioBlocks/borderWidth'] || 0}px` : attributes.borderWidth ? `${attributes.borderWidth}px` : undefined,
		borderStyle: (isInsideGallery ? context['folioBlocks/borderWidth'] : attributes.borderWidth) ? 'solid' : undefined,
		borderRadius: isInsideGallery ? `${context['folioBlocks/borderRadius'] || 0}px` : attributes.borderRadius ? `${attributes.borderRadius}px` : undefined,
	};
	const captionStyle = {
		borderColor: isInsideGallery ? context['folioBlocks/borderColor'] || '#ffffff' : attributes.borderColor || '#ffffff',
		borderWidth: isInsideGallery ? `${context['folioBlocks/borderWidth'] || 0}px` : attributes.borderWidth ? `${attributes.borderWidth}px` : undefined,
		borderStyle: (isInsideGallery ? context['folioBlocks/borderWidth'] : attributes.borderWidth) ? 'solid' : undefined,
		borderRadius: isInsideGallery ? `${context['folioBlocks/borderRadius'] || 0}px` : attributes.borderRadius ? `${attributes.borderRadius}px` : undefined,
	};

	const effectiveDropShadow = isInsideGallery ? context['folioBlocks/dropShadow'] : dropshadow;
	const effectiveHoverTitle = isInsideGallery ? context['folioBlocks/onHoverTitle'] : attributes.showTitleOnHover;
	const effectiveDownloadEnabled = isInsideGallery ? contextEnableDownload : enableDownload;
	const effectiveDownloadOnHover = isInsideGallery ? contextDownloadOnHover : downloadOnHover;

	const hasWooCommerce = context['folioBlocks/hasWooCommerce'] || false;
	const enableWooCommerce = context['folioBlocks/enableWooCommerce'] || false;
	const effectiveWooActive = hasWooCommerce && enableWooCommerce;

	const filterCategories = context['folioBlocks/filterCategories'] || [];
	const activeFilter = context?.['folioBlocks/activeFilter'] || 'All';
	const filterCategory = attributes.filterCategory || '';
	const isHidden =
		activeFilter !== 'All' &&
		(!filterCategory || filterCategory.toLowerCase() !== activeFilter.toLowerCase());


	const wrapperRef = useRef();

	const carouselHeight = context['folioBlocks/carouselHeight'] || 400;
	const displayHeight = carouselHeight;

	useEffect(() => {
		setAttributes({ imageSize });

		if (sizes && sizes[imageSize] && sizes[imageSize].url) {
			setAttributes({
				src: sizes[imageSize].url,
				imageSize: imageSize,
			});
		}
	}, [imageSize, sizes]);

	const onSelectImage = (media) => {
		if (!media?.id) return;

		const fullSize = media.sizes?.full || {};
		const width = fullSize.width || media.width || 0;
		const height = fullSize.height || media.height || 0;

		setAttributes({
			id: media.id,
			src: media.url || media.source_url || '',
			alt: media.alt || '',
			title: media.title || '',
			caption: media.caption || '',
			width,
			height,
			sizes: media.sizes || {},
		});
	};

	const selectedSrc = sizes?.[imageSize]?.url || src || '';

	return (
		<>
			<BlockControls>
				{src && (
					<ToolbarGroup>
						<MediaUpload
							onSelect={onSelectImage}
							allowedTypes={['image']}
							value={id}
							render={({ open }) => (
								<ToolbarButton
									icon={media}
									label={__('Replace Image', 'folioblocks')}
									onClick={open}
								>
									{__('Change Image', 'folioblocks')}
								</ToolbarButton>
							)}
						/>
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls>
				<PanelBody title={__('Image Settings', 'folioblocks')} initialOpen={true}>
					{id && src && (
						<div style={{ marginBottom: '16px' }}>
							<div className="pb-img-thumbnail-preview">
								<img src={selectedSrc} alt={title || ''} />
							</div>
							<MediaUpload
								onSelect={onSelectImage}
								allowedTypes={['image']}
								value={id}
								render={({ open }) => (
									<div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
										<Button onClick={open} variant="secondary">
											{__('Change Image', 'folioblocks')}
										</Button>
									</div>
								)}
							/>
						</div>
					)}

					<hr style={{ border: '0.5px solid #e0e0e0', margin: '12px 0' }} />

					<TextareaControl
						label={__('Image Caption', 'folioblocks')}
						value={caption}
						onChange={(value) => setAttributes({ caption: value })}
						help={__('Add image caption.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<TextControl
						label={__('Image Title', 'folioblocks')}
						value={title}
						onChange={(value) => setAttributes({ title: value })}
						help={__('Describe the role of this image on the page.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<TextControl
						label={__('Alternative Text', 'folioblocks')}
						value={alt}
						onChange={(value) => setAttributes({ alt: value })}
						help={__('Describe the purpose of the image. Leave empty if decorative.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					{applyFilters(
						'folioBlocks.imageBlock.wooProductLinkControl',
						null,
						{ attributes, setAttributes, effectiveWooActive }
					)}
					{applyFilters(
						'folioBlocks.imageBlock.filterCategoryControl',
						null,
						{ attributes, setAttributes, filterCategories }
					)}
				</PanelBody>
			</InspectorControls>
			{applyFilters(
				'folioBlocks.imageBlock.styleControls',
				null,
				{ attributes, setAttributes, isInsideGallery }
			)}
			<div
				ref={wrapperRef}
				className={`pb-image-block-wrapper${isHidden ? ' is-hidden' : ''}`}
			>
				<figure
					{...useBlockProps({
						className: `
							pb-image-block
							${effectiveHoverTitle ? 'title-hover' : ''}
							${effectiveDropShadow ? 'dropshadow' : ''}
							${enableDownload ? 'has-download' : ''}
							`,
					})}
					style={
						context['folioBlocks/inCarousel']
							? {
								height: `${displayHeight}px`,

							}
							: undefined
					}
				>
					{!src ? (
						<MediaPlaceholder
							icon="format-image"
							labels={{ title: __('Select Image', 'folioblocks') }}
							onSelect={onSelectImage}
							allowedTypes={['image']}
							multiple={false}
						/>
					) : (
						<>
							<img
								src={selectedSrc}
								alt={alt}
								width={width}
								height={height}
								className="pb-image-block-img"
								style={imageStyle}
							/>
							{effectiveHoverTitle && (
								(Number(attributes.wooProductId) > 0 ||
									(title && title.trim() !== '')) && (
									<figcaption className="pb-image-block-title" style={captionStyle}>
										{(() => {
											const hoverContent = applyFilters(
												'folioBlocks.imageBlock.hoverOverlayContent',
												null,
												{ attributes, setAttributes, effectiveWooActive, context, title }
											);
											return hoverContent || title;
										})()}
									</figcaption>
								)
							)}
							{applyFilters(
								'folioBlocks.imageBlock.downloadButton',
								null,
								{ attributes, setAttributes, effectiveDownloadEnabled, effectiveDownloadOnHover, sizes, src, context, isInsideGallery }
							)}
							{applyFilters(
								'folioBlocks.imageBlock.addToCartButton',
								null,
								{ attributes, setAttributes, effectiveWooActive, context, isInsideGallery }
							)}
						</>
					)}
				</figure>
			</div>
		</>
	);
}