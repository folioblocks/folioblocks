import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaPlaceholder,
	BlockControls,
	MediaUpload,
	ColorPalette,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextareaControl,
	TextControl,
	SelectControl,
	ToolbarGroup,
	ToolbarButton,
	Button,
	RangeControl,
	BaseControl,
} from '@wordpress/components';
import { useRef, useState, useEffect } from '@wordpress/element';
import { media, download } from '@wordpress/icons';
import './editor.scss';

export default function Edit({ attributes, setAttributes, context }) {
	const {
		id, src, sizes, alt, title, caption, width, height,
		enableLightbox, showCaptionInLightbox,
		showTitleOnHover, dropshadow, enableDownload, downloadOnHover
	} = attributes;

	const {
		'portfolioBlocks/enableDownload': contextEnableDownload = enableDownload,
		'portfolioBlocks/downloadOnHover': contextDownloadOnHover = downloadOnHover
	} = context || {};

	const isInsideGallery = Object.keys(context || {}).some((key) => key.startsWith('portfolioBlocks/'));
	const imageSize = context['portfolioBlocks/resolution'] || 'large';

	const imageStyle = {
		borderColor: isInsideGallery ? context['portfolioBlocks/borderColor'] || '#ffffff' : attributes.borderColor || '#ffffff',
		borderWidth: isInsideGallery ? `${context['portfolioBlocks/borderWidth'] || 0}px` : attributes.borderWidth ? `${attributes.borderWidth}px` : undefined,
		borderStyle: (isInsideGallery ? context['portfolioBlocks/borderWidth'] : attributes.borderWidth) ? 'solid' : undefined,
		borderRadius: isInsideGallery ? `${context['portfolioBlocks/borderRadius'] || 0}px` : attributes.borderRadius ? `${attributes.borderRadius}px` : undefined,
	};
	const captionStyle = {
		borderColor: isInsideGallery ? context['portfolioBlocks/borderColor'] || '#ffffff' : attributes.borderColor || '#ffffff',
		borderWidth: isInsideGallery ? `${context['portfolioBlocks/borderWidth'] || 0}px` : attributes.borderWidth ? `${attributes.borderWidth}px` : undefined,
		borderStyle: (isInsideGallery ? context['portfolioBlocks/borderWidth'] : attributes.borderWidth) ? 'solid' : undefined,
		borderRadius: isInsideGallery ? `${context['portfolioBlocks/borderRadius'] || 0}px` : attributes.borderRadius ? `${attributes.borderRadius}px` : undefined,
	};

	const effectiveDropShadow = isInsideGallery ? context['portfolioBlocks/dropShadow'] : dropshadow;
	const effectiveLightbox = isInsideGallery ? context['portfolioBlocks/lightbox'] : enableLightbox;
	const effectiveLightboxCaption = isInsideGallery ? context['portfolioBlocks/lightboxCaption'] : showCaptionInLightbox;
	const effectiveHoverTitle = isInsideGallery ? context['portfolioBlocks/onHoverTitle'] : attributes.showTitleOnHover;
	const effectiveDownloadEnabled = isInsideGallery ? contextEnableDownload : enableDownload;
	const effectiveDownloadOnHover = isInsideGallery ? contextDownloadOnHover : downloadOnHover;
	const filterCategories = context['portfolioBlocks/filterCategories'] || [];

	const activeFilter = context?.['portfolioBlocks/activeFilter'] || 'All';
	const filterCategory = attributes.filterCategory || '';
	const isHidden =
		activeFilter !== 'All' &&
		(!filterCategory || filterCategory.toLowerCase() !== activeFilter.toLowerCase());


	const wrapperRef = useRef();

	const [isLightboxOpen, setLightboxOpen] = useState(false);

	const carouselHeight = context['portfolioBlocks/carouselHeight'] || 400;
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
									label={__('Replace Image', 'portfolio-blocks')}
									onClick={open}
								>
									{__('Change Image', 'portfolio-blocks')}
								</ToolbarButton>
							)}
						/>
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls>
				<PanelBody title={__('Image Settings', 'portfolio-blocks')} initialOpen={true}>
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
											{__('Change Image', 'portfolio-blocks')}
										</Button>
									</div>
								)}
							/>
						</div>
					)}

					<hr style={{ border: '0.5px solid #e0e0e0', margin: '12px 0' }} />

					<TextareaControl
						label={__('Image Caption', 'portfolio-blocks')}
						value={caption}
						onChange={(value) => setAttributes({ caption: value })}
						help={__('Add image caption.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<TextControl
						label={__('Image Title', 'portfolio-blocks')}
						value={title}
						onChange={(value) => setAttributes({ title: value })}
						help={__('Describe the role of this image on the page.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<TextControl
						label={__('Alternative Text', 'portfolio-blocks')}
						value={alt}
						onChange={(value) => setAttributes({ alt: value })}
						help={__('Describe the purpose of the image. Leave empty if decorative.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>

					{filterCategories.length > 0 && (
						<>
							<hr style={{ border: '0.5px solid #e0e0e0', margin: '12px 0' }} />
							<SelectControl
								label={__('Filter Category', 'portfolio-blocks')}
								value={filterCategory}
								onChange={(val) => setAttributes({ filterCategory: val })}
								options={[
									{ label: __('None', 'portfolio-blocks'), value: '' },
									...filterCategories.map((cat) => ({ label: cat, value: cat }))
								]}
								help={__('Set image filter category.')}
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>
						</>
					)}
				</PanelBody>
			</InspectorControls>
			{!isInsideGallery && (
				<InspectorControls group="styles">
					<PanelBody title={__('Image Styles', 'pb-image-block')} initialOpen={true}>
						<BaseControl label={__('Border Color', 'portfolio-blocks')} __nextHasNoMarginBottom>
							<ColorPalette
								value={attributes.borderColor}
								onChange={(value) => setAttributes({ borderColor: value })}
								help={__('Set border color.')}
							/>
						</BaseControl>
						<RangeControl
							label={__('Border Width', 'portfolio-blocks')}
							value={attributes.borderWidth}
							onChange={(value) => setAttributes({ borderRadius: value })}
							min={0}
							max={20}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							help={__('Set border width in pixels.')}
						/>
						<RangeControl
							label={__('Border Radius', 'portfolio-blocks')}
							value={attributes.borderRadius}
							onChange={(value) => setAttributes({ borderRadius: value })}
							min={0}
							max={100}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							help={__('Set border radius in pixels.')}

						/>
					</PanelBody>
				</InspectorControls>
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
						context['portfolioBlocks/inCarousel']
							? {
									height: `${displayHeight}px`,
					
							  }
							: undefined
					}
				>
					{!src ? (
						<MediaPlaceholder
							icon="format-image"
							labels={{ title: __('Select Image', 'portfolio-blocks') }}
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
								className="pb-image-block__img"
								style={imageStyle}
								onClick={() => {
									if (effectiveLightbox) {
										setLightboxOpen(true);
									}
								}}
							/>
							{title && effectiveHoverTitle && (
								<figcaption className="pb-image-block-title" style={captionStyle}>{title}</figcaption>
							)}
							{effectiveDownloadEnabled && src && (
								<button
									className={`pb-image-block-download ${effectiveDownloadOnHover ? 'hover-only' : ''}`}
									style={{
										top: `${8 + (isInsideGallery ? (context['portfolioBlocks/borderWidth'] || 0) : (attributes.borderWidth || 0))}px`,
										right: `${8 + (isInsideGallery ? (context['portfolioBlocks/borderWidth'] || 0) : (attributes.borderWidth || 0))}px`
									}}
									onClick={(e) => {
										e.stopPropagation();

										// Extract the original file name
										const fileUrl = sizes?.full?.url || src;
										const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

										// Create a download link
										const link = document.createElement('a');
										link.href = fileUrl;
										link.download = fileName || 'download';
										link.click();
									}}
									aria-label={__('Download Image', 'portfolio-blocks')}
								>
									{download}
								</button>
							)}
						</>
					)}
				</figure>
				{isLightboxOpen && (
					<div className="pb-image-lightbox">
						<div className="lightbox-inner">
							<button
								className="lightbox-close"
								onClick={() => setLightboxOpen(false)}
							>
								&times;
							</button>
							{effectiveDownloadEnabled && (
								<button
									className="pb-lightbox-download"
									onClick={(e) => {
										e.stopPropagation();
										
										// Extract the original file name
										const fileUrl = sizes?.full?.url || src;
										const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

										// Create a download link
										const link = document.createElement('a');
										link.href = fileUrl;
										link.download = fileName || 'download';
										link.click();
									}}
									aria-label={__('Download Image', 'portfolio-blocks')}
								>
									{download}
								</button>
							)}
							<div className="lightbox-image">
								<img src={sizes?.full?.url || src} alt={alt} />
								{effectiveLightboxCaption && caption && (
									<p className="lightbox-caption">{caption}</p>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}