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
} from '@wordpress/components';
import { useEffect, useState, useRef } from '@wordpress/element';
import { media } from '@wordpress/icons';
import IconLoupe from '../pb-helpers/IconLoupe';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
	const { id, url, alt, resolution, availableSize, magnification, preview } = attributes;
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
				<PanelBody title={__('Image Settings', 'pb-loupe-block')} initialOpen={true}>
					{id && resolution && (
						<div style={{ marginBottom: '16px' }}>
							<div className="pb-img-thumbnail-preview">
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
							setAttributes({
								resolution: newSize,
								url:
									attributes.id &&
									wp.media
										.attachment(attributes.id)
										.get('sizes')[newSize]?.url || url,
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
				</PanelBody>
			</InspectorControls>
			<figure {...blockProps}>
				<div
					className="pb-loupe-container"
					ref={containerRef}
					onMouseMove={handleMouseMove}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					<img
						src={url}
						alt={alt || ''}
						className="pb-loupe-image"
					/>

					{isLoupeVisible && (
						<div
							className="pb-loupe-lens"
							style={{
								width: loupeSize,
								height: loupeSize,
								left: loupePos.x + 3,
								top: loupePos.y - loupeSize + 20,
								backgroundImage: `url(${url})`,
								backgroundSize: `${zoom * 100}%`,
								backgroundPosition: `${containerRef.current ? (loupePos.x / containerRef.current.offsetWidth) * 100 : 0
									}% ${containerRef.current ? (loupePos.y / containerRef.current.offsetHeight) * 100 : 0
									}%`,
							}}
						></div>
					)}
				</div>
			</figure>
		</>
	);
}