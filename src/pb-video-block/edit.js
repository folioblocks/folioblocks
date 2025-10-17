
// ---------------------------
// External (WordPress) imports
// ---------------------------
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	BlockControls,
	MediaPlaceholder
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	TextareaControl,
	Button,
	SelectControl,
	ToolbarButton,
	ToolbarGroup,
	Modal,
	BaseControl,
	ColorPalette,
	RangeControl,
	ToggleControl
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

// ---------------------------
// Internal styles
// ---------------------------
import './editor.scss';


// ---------------------------
// Aspect ratios & helpers
// ---------------------------
const ASPECT_RATIOS = {
	"21:9": "aspect-21-9",
	"16:9": "aspect-16-9",
	"9:16": "aspect-9-16",
	"4:3": "aspect-4-3",
	"3:2": "aspect-3-2",
	"1:1": "aspect-1-1"
};

function getVideoEmbedMarkup(videoUrl) {
	if (!videoUrl) return null;

	// Handle YouTube URLs
	if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
		let videoId = '';
		try {
			const url = new URL(videoUrl);
			if (url.hostname.includes('youtu.be')) {
				videoId = url.pathname.replace('/', '');
			} else if (url.searchParams.has('v')) {
				videoId = url.searchParams.get('v');
			}
		} catch (e) {
			console.warn('Invalid YouTube URL:', videoUrl);
		}
		if (videoId) {
			return (
				<iframe
					src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
					style={{ border: 'none' }}
					allow="autoplay; fullscreen"
					allowFullScreen
					title="YouTube Video"
				/>
			);
		}
	}

	// Handle Vimeo URLs
	if (videoUrl.includes('vimeo.com')) {
		const videoId = videoUrl.split('/').pop().split('?')[0];
		return (
			<iframe
				src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
				style={{ border: 'none' }}
				allow="autoplay; fullscreen"
				allowFullScreen
				title="Vimeo Video"
			/>
		);
	}

	// Fallback for self-hosted videos
	return <video src={videoUrl} controls autoPlay />;
}

export default function Edit({ attributes, setAttributes, context }) {
	// ---------------------------
	// Attribute destructuring
	// ---------------------------
	const {
		videoUrl,
		thumbnail,
		thumbnailId,
		title,
		description,
		aspectRatio,
		playButtonVisibility,
		titleVisibility,
		filterCategory,
		thumbnailSize,
		// borderColor, borderWidth, borderRadius, dropShadow (used via attributes below)
	} = attributes;

	// ---------------------------
	// State & Effects
	// ---------------------------
	const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
	const [isLightboxOpen, setLightboxOpen] = useState(false);

	// Effect: Listen for Escape key to close lightbox
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape') {
				setLightboxOpen(false);
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, []);

	// ---------------------------
	// Context
	// ---------------------------
	// Inherited/Parent values from context
	const parentAspectRatio = context?.['portfolioBlocks/aspectRatio'];
	const parentPlayButton = context?.['portfolioBlocks/playButtonVisibility'];
	const parentTitleVisibility = context?.['portfolioBlocks/titleVisibility'];
	const lightboxEnabled = context?.['portfolioBlocks/lightbox'] ?? true;
	const lightboxLayout = context?.['portfolioBlocks/lightboxLayout'];
	const lazyLoad = context?.['portfolioBlocks/lazyLoad'];
	const inheritedBorderColor = context?.['portfolioBlocks/borderColor'];
	const inheritedBorderWidth = context?.['portfolioBlocks/borderWidth'];
	const inheritedBorderRadius = context?.['portfolioBlocks/borderRadius'];
	const inheritedDropShadow = context?.['portfolioBlocks/dropShadow'];
	const inheritedAspectRatio = context?.['portfolioBlocks/aspectRatio'];
	const inheritedPlayButtonVisibility = context?.['portfolioBlocks/playButtonVisibility'];
	const inheritedTitleVisibility = context?.['portfolioBlocks/titleVisibility'];
	const filterCategories = context?.['portfolioBlocks/filterCategories'] || [];
	const inheritedThumbnailSize = context?.['portfolioBlocks/thumbnailSize'];
	const activeFilter = context?.['portfolioBlocks/activeFilter'] || 'All';
	const isInVideoGallery = typeof context?.['portfolioBlocks/gallery'] !== 'undefined';

	// Effect: Sync with parent/inherited values
	useEffect(() => {
		if (parentAspectRatio && aspectRatio !== parentAspectRatio) {
			setAttributes({ aspectRatio: parentAspectRatio });
		}
		if (parentPlayButton && playButtonVisibility !== parentPlayButton) {
			setAttributes({ playButtonVisibility: parentPlayButton });
		}
		if (parentTitleVisibility && titleVisibility !== parentTitleVisibility) {
			setAttributes({ titleVisibility: parentTitleVisibility });
		}
		if (inheritedBorderColor !== undefined) {
			setAttributes({ borderColor: inheritedBorderColor });
		}
		if (inheritedBorderWidth !== undefined) {
			setAttributes({ borderWidth: inheritedBorderWidth });
		}
		if (inheritedBorderRadius !== undefined) {
			setAttributes({ borderRadius: inheritedBorderRadius });
		}
		if (inheritedDropShadow !== undefined) {
			setAttributes({ dropShadow: inheritedDropShadow });
		}
		if (lazyLoad !== undefined && attributes.lazyLoad !== lazyLoad) {
			setAttributes({ lazyLoad });
		}
		if (lightboxLayout && attributes.lightboxLayout !== lightboxLayout) {
			setAttributes({ lightboxLayout });
		}
	}, [
		parentAspectRatio,
		parentPlayButton,
		parentTitleVisibility,
		inheritedBorderColor,
		inheritedBorderWidth,
		inheritedBorderRadius,
		inheritedDropShadow,
		lazyLoad,
		lightboxLayout
	]);

	// ---------------------------
	// Derived / Effective Values
	// ---------------------------
	const effectiveThumbnailSize = inheritedThumbnailSize ?? thumbnailSize;
	const effectiveAspectRatio = inheritedAspectRatio || aspectRatio;
	const effectivePlayButtonVisibility = inheritedPlayButtonVisibility ?? playButtonVisibility ?? 'always';
	const effectiveTitleVisibility = inheritedTitleVisibility ?? titleVisibility ?? 'always';
	const currentCategory = filterCategory?.trim() || '';
	const isHidden = activeFilter !== 'All' && currentCategory.toLowerCase() !== activeFilter.toLowerCase();
	const showOverlayAlways = effectivePlayButtonVisibility === 'always' || effectiveTitleVisibility === 'always';
	const showOverlayOnHover = effectivePlayButtonVisibility === 'onHover' || effectiveTitleVisibility === 'onHover';

	const imageSizeOptions = wp.data
		.select('core/block-editor')
		.getSettings().imageSizes
		.map((size) => ({
			label: size.name,
			value: size.slug,
		}))
		.sort((a, b) => {
			const order = ['thumbnail', 'medium', 'large', 'full'];
			const indexA = order.indexOf(a.value);
			const indexB = order.indexOf(b.value);
			if (indexA === -1 && indexB === -1) return 0;
			if (indexA === -1) return 1;
			if (indexB === -1) return -1;
			return indexA - indexB;
		});

	// Effective border values (context > attribute)
	const effectiveBorderColor = inheritedBorderColor ?? attributes.borderColor;
	const effectiveBorderWidth = inheritedBorderWidth ?? attributes.borderWidth;
	const effectiveBorderRadius = inheritedBorderRadius ?? attributes.borderRadius;

	// ---------------------------
	// Controls & Handlers
	// ---------------------------
	const setThumbnail = (media) => {
		if (!media || !media.url || !media.id) return;
		setAttributes({
			thumbnailId: media.id,
			thumbnail: media.url, // fallback display
		});
	};
	const thumbnailData = useSelect(
		(select) => {
			const media = thumbnailId ? select('core').getMedia(thumbnailId) : null;
			return media;
		},
		[thumbnailId, effectiveThumbnailSize]
	);
	const resolvedThumbnailUrl =
		thumbnailData?.media_details?.sizes?.[effectiveThumbnailSize]?.source_url ||
		thumbnail;
	const openMediaLibrary = () => {
		const frame = wp.media({
			title: __('Select a video', 'portfolio-blocks'),
			library: { type: 'video' },
			multiple: false,
			button: { text: __('Use this video', 'portfolio-blocks') }
		});
		frame.on('select', () => {
			const media = frame.state().get('selection').first().toJSON();
			if (media && media.url) {
				setAttributes({ videoUrl: media.url });
			}
		});
		frame.open();
	};
	const blockProps = useBlockProps({
		className: isHidden ? 'is-hidden' : undefined
	});

	return (
		<>
			{/* BlockControls */}
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						label={__('Change Video', 'portfolio-blocks')}
						icon="format-video"
						onClick={() => setIsVideoModalOpen(true)}
					>
						{__('Change Video', 'portfolio-blocks')}
					</ToolbarButton>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={(media) => {
								if (!media || !media.id || !media.url) return;
								setAttributes({
									thumbnailId: media.id,
									thumbnail: media.url,
								});
							}}
							allowedTypes={['image']}
							render={({ open }) => (
								<ToolbarButton
									label={__('Change Thumbnail', 'portfolio-blocks')}
									icon="format-image"
									onClick={open}
								>
									{__('Change Thumbnail', 'portfolio-blocks')}
								</ToolbarButton>
							)}
						/>
					</MediaUploadCheck>
					{isVideoModalOpen && (
						<Modal
							title={__('Select or Insert Video', 'portfolio-blocks')}
							onRequestClose={() => setIsVideoModalOpen(false)}
						>
							<MediaPlaceholder
								labels={{
									title: __('Select or Insert Video', 'portfolio-blocks'),
									instructions: __('Upload, select from media library or insert from URL.', 'portfolio-blocks'),
								}}
								allowedTypes={['video']}
								accept="video/*"
								onSelect={(media) => {
									setAttributes({ videoUrl: media.url });
									setIsVideoModalOpen(false);
								}}
								onSelectURL={(url) => {
									setAttributes({ videoUrl: url });
									setIsVideoModalOpen(false);
								}}
								onError={(errorMessage) => {
									console.error(errorMessage);
								}}
							/>
						</Modal>
					)}
				</ToolbarGroup>
			</BlockControls>

			{/* InspectorControls */}
			<InspectorControls>
				<PanelBody title={__('Video Block Settings', 'portfolio-blocks')} initialOpen={true}>
					{thumbnail && (
						<div style={{ marginBottom: '16px' }}>
							<div className={`pb-thumbnail-preview ${ASPECT_RATIOS[effectiveAspectRatio]}`} >
								<img src={resolvedThumbnailUrl} alt={title || ''} />
							</div>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={setThumbnail}
									allowedTypes={['image']}
									render={({ open }) => (
										<div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
											<Button onClick={open} variant="secondary">
												{__('Change Thumbnail', 'portfolio-blocks')}
											</Button>
										</div>
									)}
								/>
							</MediaUploadCheck>
						</div>
					)}
					{!inheritedThumbnailSize && (
						<SelectControl
							label={__('Thumbnail Resolution', 'portfolio-blocks')}
							value={thumbnailSize}
							onChange={(val) => setAttributes({ thumbnailSize: val })}
							options={imageSizeOptions}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
					)}
					{!inheritedAspectRatio && (
						<>
							<SelectControl
								label={__('Thumbnail Aspect Ratio', 'portfolio-blocks')}
								value={aspectRatio}
								onChange={(val) => setAttributes({ aspectRatio: val })}
								options={Object.keys(ASPECT_RATIOS).map((ratio) => ({ label: ratio, value: ratio }))}
								help={__('Set video Thumbnail aspect ratio.')}
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>
						</>
					)}
					<hr style={{ border: '0.5px solid #e0e0e0', margin: '12px 0' }} />
					<TextControl
						label={__('Video URL', 'portfolio-blocks')}
						value={videoUrl}
						onChange={(val) => setAttributes({ videoUrl: val })}
						help={(
							<>
								{__('Supports YouTube, Vimeo, or ')}
								<a href="#" onClick={(e) => { e.preventDefault(); openMediaLibrary(); }}>
									{__('self-hosted videos')}
								</a>
								{'. Note: Some YouTube & Vimeo videos may not work due to privacy settings.'}
							</>
						)}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<TextControl
						label={__('Video Title', 'portfolio-blocks')}
						value={title}
						onChange={(val) => {
							setAttributes({
								title: val,
								alt: val // keep alt synced with title edits
							});
						}}
						help={__('Set Video Title used in the Hover Overlay, Lightbox, and for Alt-text.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<TextareaControl
						label={__('Description', 'portfolio-blocks')}
						value={description}
						onChange={(value) => setAttributes({ description: value })}
						help={__('Shown in the lightbox when enabled in Gallery Lightbox Settings.', 'portfolio-blocks')}
						__nextHasNoMarginBottom
					/>

					{filterCategories.length > 0 && (
						<SelectControl
							label={__('Filter Category', 'portfolio-blocks')}
							value={filterCategory}
							onChange={(val) => setAttributes({ filterCategory: val })}
							options={[
								{ label: __('None', 'portfolio-blocks'), value: '' },
								...filterCategories.map((cat) => ({ label: cat, value: cat }))
							]}
							help={__('Set video filter category.')}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
					)}
					{typeof inheritedPlayButtonVisibility === 'undefined' && (
						<SelectControl
							label={__('Play Button Visibility', 'portfolio-blocks')}
							value={playButtonVisibility}
							onChange={(val) => setAttributes({ playButtonVisibility: val })}
							options={[
								{ label: __('Always Show', 'portfolio-blocks'), value: 'always' },
								{ label: __('On Hover', 'portfolio-blocks'), value: 'onHover' },
								{ label: __('Hidden', 'portfolio-blocks'), value: 'hidden' }
							]}
							help={__('Set video Play button visibility state.')}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
					)}
					{typeof inheritedTitleVisibility === 'undefined' && (
						<SelectControl
							label={__('Title Visibility', 'portfolio-blocks')}
							value={titleVisibility}
							onChange={(val) => setAttributes({ titleVisibility: val })}
							options={[
								{ label: __('Always Show', 'portfolio-blocks'), value: 'always' },
								{ label: __('On Hover', 'portfolio-blocks'), value: 'onHover' },
								{ label: __('Hidden', 'portfolio-blocks'), value: 'hidden' }
							]}
							help={__('Set video Title visibility state.')}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
					)}
				</PanelBody>
			</InspectorControls>

			{typeof inheritedBorderColor === 'undefined' &&
				typeof inheritedBorderWidth === 'undefined' &&
				typeof inheritedBorderRadius === 'undefined' && (
					<InspectorControls group="styles">
						<PanelBody title={__('Video Block Styles', 'pb-video-block')} initialOpen={true}>
							<BaseControl label={__('Border Color', 'portfolio-blocks')} __nextHasNoMarginBottom>
								<ColorPalette
									value={attributes.borderColor}
									onChange={(value) => setAttributes({ borderColor: value || undefined })}
									clearable={false}
									help={__('Set border color.')}
								/>
							</BaseControl>
							<RangeControl
								label={__('Border Width', 'portfolio-blocks')}
								value={attributes.borderWidth}
								onChange={(value) => setAttributes({ borderWidth: value })}
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
							<ToggleControl
								label={__('Enable Drop Shadow', 'portfolio-blocks')}
								checked={!!attributes.dropShadow}
								onChange={(value) => setAttributes({ dropShadow: value })}
								help={__('Enable drop shadow effect.')}
							/>
						</PanelBody>
					</InspectorControls>
				)}

			{/* Visual layout: thumbnail or placeholder or video */}
			<div {...blockProps}>
				{!thumbnail ? (
					<div className={`pb-video-block ${ASPECT_RATIOS[effectiveAspectRatio]}`}>
						<div className="video-thumbnail-placeholder">
							<span className="placeholder-label">{__('No Thumbnail Selected', 'portfolio-blocks')}</span>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={(media) => {
										setThumbnail(media);
									}}
									allowedTypes={["image"]}
									render={({ open }) => (
										<Button onClick={open} variant="secondary">
											{__('Select Thumbnail', 'portfolio-blocks')}
										</Button>
									)}
								/>
							</MediaUploadCheck>
						</div>
					</div>
				) : !videoUrl ? (
					<MediaPlaceholder
						icon="format-video"
						labels={{ title: __('Add Video', 'portfolio-blocks') }}
						allowedTypes={['video']}
						onSelect={(media) => setAttributes({ videoUrl: media.url })}
						onSelectURL={(url) => setAttributes({ videoUrl: url })}
						accept="video/*"
						addToGallery={false}
						notices={[]}
					/>
				) : (
					<div
						className={`pb-video-block ${ASPECT_RATIOS[effectiveAspectRatio]}${showOverlayAlways ? ' has-overlay-always' : ''}${showOverlayOnHover ? ' has-overlay-hover' : ''}${attributes.dropShadow ? ' drop-shadow' : ''}`}
						style={{
							borderWidth: effectiveBorderWidth ? `${effectiveBorderWidth}px` : undefined,
							borderStyle: effectiveBorderWidth ? 'solid' : undefined,
							borderColor: effectiveBorderColor || undefined,
							borderRadius: effectiveBorderRadius ? `${effectiveBorderRadius}px` : undefined
						}}
						data-filter={currentCategory}
						onClick={() => {
							if (!lightboxEnabled) return;
							if (videoUrl) setLightboxOpen(true);
						}}
					>
						<img
							src={resolvedThumbnailUrl}
							alt={title || ''}
							className="pb-video-block-img"
							loading={lazyLoad ? 'lazy' : 'eager'}
						/>
						<div className="video-overlay">
							<div className="overlay-content">
								{title && effectiveTitleVisibility !== 'hidden' && (
									<div className={`video-title-overlay ${effectiveTitleVisibility}`}>{title}</div>
								)}
								{effectivePlayButtonVisibility !== 'hidden' && (
									<div className={`video-play-button ${effectivePlayButtonVisibility}`}>▶</div>
								)}
							</div>
						</div>
					</div>
				)}

				{isLightboxOpen && (
					<div
						className={`pb-video-lightbox ${lightboxLayout === 'split' ? 'split-layout' : ''}`}
						onClick={(e) => {
							if (e.target.classList.contains('pb-video-lightbox')) {
								setLightboxOpen(false);
							}
						}}
					>
						<div className="pb-video-lightbox-inner">
							<button
								className="pb-video-lightbox-close"
								onClick={() => setLightboxOpen(false)}
								aria-label={__('Close lightbox', 'portfolio-blocks')}
							>
								×
							</button>

							{lightboxLayout === 'video-only' && (
								<div className="pb-video-lightbox-video">
									{getVideoEmbedMarkup(videoUrl, isInVideoGallery ? { controls: false } : undefined)}
								</div>
							)}

							{lightboxLayout === 'split' && (
								<>
									<div className="pb-video-lightbox-video" style={{ flex: '0 0 70%' }}>
										{getVideoEmbedMarkup(videoUrl, isInVideoGallery ? { controls: false } : undefined)}
									</div>
									<div className="pb-video-lightbox-info" style={{ flex: '0 0 30%' }}>
										{title && <h2 className="lightbox-title">{title}</h2>}
										{description && <p className="lightbox-description">{description}</p>}
									</div>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</>
	);
}