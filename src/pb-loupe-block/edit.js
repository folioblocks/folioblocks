/**
 * PB Loupe Block
 * Edit JS
 **/
import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	useBlockProps,
	MediaPlaceholder,
	InspectorControls,
	MediaUpload,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	Button,
	ToolbarGroup,
	ToolbarButton,
	RangeControl,
	Notice,
	Panel,
} from '@wordpress/components';
import { useState, useRef } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { media } from '@wordpress/icons';
import IconLoupe from '../pb-helpers/IconLoupe';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
	const { id, url, alt, resolution, availableSize, magnification, loupeShape, loupeTheme, preview } = attributes;
	const checkoutUrl = window.folioBlocksData?.checkoutUrl || 'https://folioblocks.com/folioblocks-pricing/?utm_source=folioblocks&utm_medium=loupe-block&utm_campaign=upgrade';
	const wrapperRef = useRef(null);

	const blockProps = useBlockProps({
		className: 'pb-loupe-block',
		ref: wrapperRef,
	});

	// Block Preview Image
	if (preview) {
		return (
			<div className="pb-block-preview">
				<IconLoupe />
			</div>
		);
	}


	const onSelectImage = (media) => {
		if (!media || !media.url) {
			return;
		}

		// Block SVGs
		if (media.mime === 'image/svg+xml' || media.url.endsWith('.svg')) {
			alert(__('SVG files are not supported for the Loupe effect. Please select a raster image (JPG/PNG).', 'pb-loupe-block'));
			return;
		}

		setAttributes({
			id: media.id,
			url: media.sizes?.large?.url || media.url,
			alt: media.alt,
			resolution: 'large',
			availableSize: Object.keys(media.sizes || {}).map(
				(slug) => slug
			),
		});
	};

	// Loupe state
	const [isLoupeVisible, setLoupeVisible] = useState(false);
	const [loupePos, setLoupePos] = useState({ x: 0, y: 0 });

	const zoom = magnification || 10; // previously 3x effective

	const containerRef = useRef(null);

	const loupeSize = 150;     // will move to settings later

	const lastTouchRef = useRef(0);

	const handleTouchStart = (event) => {
		const now = Date.now();
		const timeSinceLast = now - lastTouchRef.current;

		const rect = event.currentTarget.getBoundingClientRect();
		const touch = event.touches[0];
		const x = touch.clientX - rect.left;
		const y = touch.clientY - rect.top;

		if (timeSinceLast < 300) {
			setLoupeVisible(false);
		} else {
			setLoupeVisible(true);
			setLoupePos({ x, y });
		}

		lastTouchRef.current = now;
	};

	const handleTouchMove = (event) => {
		if (!isLoupeVisible) return;
		const rect = event.currentTarget.getBoundingClientRect();
		const touch = event.touches[0];
		const x = touch.clientX - rect.left;
		const y = touch.clientY - rect.top;
		setLoupePos({ x, y });
	};

	const handleTouchEnd = () => {
		// Loupe stays visible until double-tap toggles it off
	};

	const handleMouseMove = (event) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		setLoupePos({ x, y });
	};

	const handleMouseEnter = () => setLoupeVisible(true);
	const handleMouseLeave = () => setLoupeVisible(false);

	// If no image selected yet, show placeholder
	if (!url) {
		return (
			<div {...blockProps}>
				<MediaPlaceholder
					icon={<IconLoupe />}
					labels={{
						title: __('Loupe Block', 'pb-loupe-block'),
						instructions: __(
							'Select or upload an image to use with the loupe effect.',
							'pb-loupe-block'
						),
					}}
					onSelect={onSelectImage}
					accept="image/*"
					allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
					multiple={false}
				/>
			</div>
		);
	}

	// When an image is selected, render it in the editor
	return (
		<>
			<BlockControls>
				{resolution && (
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
				<PanelBody title={__('Loupe Block Settings', 'pb-loupe-block')} initialOpen={true}>
					{id && resolution && (
						<div style={{ marginBottom: '16px' }}>
							<div className="pb-loupe-img-thumbnail-preview">
								<img src={url} alt={alt || ''} />
							</div>
							<MediaUpload
								onSelect={onSelectImage}
								allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
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
					<TextControl
						label={__('Alternative Text', 'folioblocks')}
						value={alt}
						onChange={(value) => setAttributes({ alt: value })}
						help={__('Describe the purpose of the image. Leave empty if decorative.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<SelectControl
						label={__('Resolution', 'pb-loupe-block')}
						value={resolution}
						options={availableSize.map((slug) => ({
							label: slug.charAt(0).toUpperCase() + slug.slice(1),
							value: slug,
						}))}
						onChange={(newSize) => {
							const attachment = wp.media.attachment(attributes.id);
							attachment.fetch().then(() => {
								const sizes = attachment.get('sizes') || {};
								const newUrl = sizes[newSize]?.url || url;
								setAttributes({
									resolution: newSize,
									url: newUrl,
								});
							});
						}}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						help={__('Select the size of the source image.')}
					/>
				</PanelBody>
				<PanelBody title={__('Loupe Settings', 'pb-loupe-block')} initialOpen={true}>
					<RangeControl
						label={__('Magnification', 'pb-loupe-block')}
						value={magnification}
						onChange={(value) => setAttributes({ magnification: value })}
						min={1}
						max={20}
						step={1}
						help={__('Set the desired strength of the magnification effect.')}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					{applyFilters(
						'folioBlocks.loupeBlock.loupeShapeControl',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Loupe Shape', 'folioblocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'folioblocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'folioblocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
					{applyFilters(
						'folioBlocks.loupeBlock.loupeThemeControl',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Loupe Theme', 'folioblocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'folioblocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'folioblocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="advanced">
					{applyFilters(
						'folioBlocks.carouselGallery.disableRightClickToggle',
						(
							<div style={{ marginBottom: '8px' }}>
								<Notice status="info" isDismissible={false}>
									<strong>{__('Disable Right-Click', 'folioblocks')}</strong><br />
									{__('This is a premium feature. Unlock all features: ', 'folioblocks')}
									<a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
										{__('Upgrade to Pro', 'folioblocks')}
									</a>
								</Notice>
							</div>
						),
						{ attributes, setAttributes }
					)}
			</InspectorControls>
			<figure {...blockProps}>
				<div
					className="pb-loupe-container"
					ref={containerRef}
					onMouseMove={handleMouseMove}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
					style={{ cursor: 'none' }}
				>
					<img
						src={url}
						alt={alt || ''}
						className="pb-loupe-image"
					/>

					{isLoupeVisible && (
						<div
							className={`pb-loupe-lens pb-loupe-${loupeShape} pb-loupe-${loupeTheme}`}
							style={{
								width: loupeSize,
								height: loupeSize,
								left: loupePos.x - loupeSize / 2,
								top: loupePos.y - loupeSize / 2,
								backgroundImage: `url(${url})`,
								backgroundSize: `${zoom * (containerRef.current ? (containerRef.current.offsetWidth / 600) : 1) * 100}%`,
								backgroundPosition: `${containerRef.current
									? (loupePos.x / containerRef.current.offsetWidth) * 100
									: 0
									}% ${containerRef.current
										? (loupePos.y / containerRef.current.offsetHeight) * 100
										: 0
									}%`,
							}}
						></div>
					)}
				</div>
			</figure>
		</>
	);
}