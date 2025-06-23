import { __ } from '@wordpress/i18n';
import { useBlockProps, MediaUpload, BlockControls, InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import { Button, Icon, PanelBody, ToolbarGroup, ToolbarButton, SelectControl, RangeControl, ToggleControl } from '@wordpress/components';
import { useState, useRef, useEffect } from '@wordpress/element';
import IconBeforeAfter from '../pb-helpers/IconBeforeAfter';
import './editor.scss';

function CustomPlaceholder({ beforeImage, afterImage, onSelectBefore, onSelectAfter }) {
	return (
		<div className="pb-split-placeholder">
			<div className="pb-placeholder-header">
				<Icon icon={IconBeforeAfter} />
				<h2>{__('Select two images for Before & After Block', 'portfolio-blocks')}</h2>
			</div>
			<p className="pb-placeholder-instructions">
				{__('For best results, use images with the same dimensions (width and height).', 'portfolio-blocks')}
			</p>
			<div className="pb-placeholder-fields">
				<div>
					<p>{__('Before Image', 'portfolio-blocks')}</p>
					<MediaUpload
						onSelect={onSelectBefore}
						allowedTypes={['image']}
						render={({ open }) => (
							beforeImage?.src ? (
								<div onClick={open} style={{ cursor: 'pointer' }}>
									<img src={beforeImage.src} alt={beforeImage.alt || ''} style={{ maxWidth: '100%', height: 'auto' }} />
								</div>
							) : (
								<Button variant="primary" onClick={open}>
									{__('Select Before Image')}
								</Button>
							)
						)}
					/>
				</div>
				<div>
					<p>{__('After Image', 'portfolio-blocks')}</p>
					<MediaUpload
						onSelect={onSelectAfter}
						allowedTypes={['image']}
						render={({ open }) => (
							afterImage?.src ? (
								<div onClick={open} style={{ cursor: 'pointer' }}>
									<img src={afterImage.src} alt={afterImage.alt || ''} style={{ maxWidth: '100%', height: 'auto' }} />
								</div>
							) : (
								<Button variant="secondary" onClick={open}>
									{__('Select After Image')}
								</Button>
							)
						)}
					/>
				</div>
			</div>
		</div>
	);
}

export default function Edit({ attributes, setAttributes }) {
	const {
		beforeImage = {},
		afterImage = {},
		sliderOrientation = 'horizontal',
		showLabels,
		labelPosition,
		labelTextColor,
		labelBackgroundColor,
		sliderColor,
		preview
	} = attributes;
	const [sliderValue, setSliderValue] = useState(50);
	const containerRef = useRef(null);
	const afterImageRef = useRef(null);

	// Block Preview Image
	if (preview) {
		return (
			<div className="pb-block-preview">
				<IconBeforeAfter />
			</div>
		);
	}

	useEffect(() => {
		if (!containerRef.current || !afterImageRef.current) return;

		const container = containerRef.current;
		const img = afterImageRef.current;

		const updateHeight = () => {
			if (img.naturalWidth && img.naturalHeight) {
				const aspectRatio = img.naturalHeight / img.naturalWidth;
				container.style.height = `${container.offsetWidth * aspectRatio}px`;
			}
		};

		if (img.complete) {
			updateHeight();
		} else {
			img.onload = updateHeight;
		}

		const observer = new ResizeObserver(updateHeight);
		observer.observe(container);

		return () => {
			observer.disconnect();
		};
	}, [afterImage?.src]);

	useEffect(() => {
		if (beforeImage?.sizes) {
			const newSrc = beforeImage.sizes[attributes.resolution]?.url || beforeImage.src;
			setAttributes({
				beforeImage: {
					...beforeImage,
					src: newSrc,
				},
			});
		}
		if (afterImage?.sizes) {
			const newSrc = afterImage.sizes[attributes.resolution]?.url || afterImage.src;
			setAttributes({
				afterImage: {
					...afterImage,
					src: newSrc,
				},
			});
		}
	}, [attributes.resolution]);

	const handleBeforeSelect = (media) => {
		const resolution = attributes.resolution || 'full';
		const src = media.sizes?.[resolution]?.url || media.url;
		setAttributes({
			beforeImage: {
				id: media.id,
				src,
				alt: media.alt || '',
				sizes: media.sizes || {},
			},
		});
	};

	const handleAfterSelect = (media) => {
		const resolution = attributes.resolution || 'full';
		const src = media.sizes?.[resolution]?.url || media.url;
		setAttributes({
			afterImage: {
				id: media.id,
				src,
				alt: media.alt || '',
				sizes: media.sizes || {},
			},
		});
	};

	const toolbarControls = (
		<BlockControls>
			<ToolbarGroup>
				<MediaUpload
					onSelect={handleBeforeSelect}
					allowedTypes={['image']}
					render={({ open }) => (
						<ToolbarButton
							label={__('Replace Before Image', 'portfolio-blocks')}
							icon="format-image"
							onClick={open}
						>
							{__('Replace Before Image', 'portfolio-blocks')}
						</ToolbarButton>
					)}
				/>
				<MediaUpload
					onSelect={handleAfterSelect}
					allowedTypes={['image']}
					render={({ open }) => (
						<ToolbarButton
							label={__('Replace After Image', 'portfolio-blocks')}
							icon="format-image"
							onClick={open}
						>
							{__('Replace After Image', 'portfolio-blocks')}
						</ToolbarButton>
					)}
				/>
			</ToolbarGroup>
		</BlockControls>
	);


	const blockProps = useBlockProps();

	return (
		<>
			{toolbarControls}
			{beforeImage?.src && afterImage?.src && (
				<>
					<InspectorControls>
						<PanelBody title={__('Image Order', 'portfolio-blocks')} initialOpen={true}>
							<div className="pb-thumbnail-row">
								<div className="pb-thumbnail">
									<p>{__('Before', 'portfolio-blocks')}</p>
									<div className="pb-thumbnail-wrapper">
										<img src={beforeImage.src} alt={beforeImage.alt || ''} />
									</div>
								</div>
								<div className="pb-thumbnail">
									<p>{__('After', 'portfolio-blocks')}</p>
									<div className="pb-thumbnail-wrapper">
										<img src={afterImage.src} alt={afterImage.alt || ''} />
									</div>
								</div>
							</div>
							<div className="pb-swap-button">
								<Button
									variant="secondary"
									onClick={() =>
										setAttributes({
											beforeImage: afterImage,
											afterImage: beforeImage,
										})
									}
								>
									{__('Swap Position', 'portfolio-blocks')}
								</Button>
							</div>
						</PanelBody>
						<PanelBody title={__('General Settings', 'portfolio-blocks')} initialOpen={true}>
							<SelectControl
								label={__('Resolution', 'portfolio-blocks')}
								value={attributes.resolution}
								options={[
									{ label: 'Thumbnail', value: 'thumbnail' },
									{ label: 'Medium', value: 'medium' },
									{ label: 'Large', value: 'large' },
									{ label: 'Full', value: 'full' }
								]}
								onChange={(value) => setAttributes({ resolution: value })}
								help={__('Select the size of the source image.')}
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>
							<SelectControl
								label={__('Slider Orientation', 'portfolio-blocks')}
								value={attributes.sliderOrientation}
								options={[
									{ label: __('Horizontal', 'portfolio-blocks'), value: 'horizontal' },
									{ label: __('Vertical', 'portfolio-blocks'), value: 'vertical' },
								]}
								onChange={(newOrientation) => setAttributes({ sliderOrientation: newOrientation })}
								help={__('Choose whether the slider moves left-to-right or top-to-bottom.', 'portfolio-blocks')}
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							/>
							<RangeControl
								label={__('Drag Handle Starting Position (%)', 'portfolio-blocks')}
								value={attributes.startingPosition}
								onChange={(value) => setAttributes({ startingPosition: value })}
								min={0}
								max={100}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								help={__('Set starting position for slider drag handle.', 'portfolio-blocks')}
							/>
							<ToggleControl
								label={__('Show Before & After Labels', 'portfolio-blocks')}
								checked={showLabels}
								onChange={(value) => setAttributes({ showLabels: value })}
								help={__('Display Before & After labels.', 'portfolio-blocks')}
								__nextHasNoMarginBottom
							/>
							{showLabels && (
								<SelectControl
									label={__('Label Position', 'portfolio-blocks')}
									value={labelPosition}
									options={
										sliderOrientation === 'vertical'
											? [
												{ label: __('Left', 'portfolio-blocks'), value: 'left' },
												{ label: __('Center', 'portfolio-blocks'), value: 'center' },
												{ label: __('Right', 'portfolio-blocks'), value: 'right' },
											]
											: [
												{ label: __('Top', 'portfolio-blocks'), value: 'top' },
												{ label: __('Center', 'portfolio-blocks'), value: 'center' },
												{ label: __('Bottom', 'portfolio-blocks'), value: 'bottom' },
											]
									}
									onChange={(value) => setAttributes({ labelPosition: value })}
									help={__('Set Before & After label position.', 'portfolio-blocks')}
									__nextHasNoMarginBottom
									__next40pxDefaultSize
								/>
							)}
						</PanelBody>
					</InspectorControls>
					<InspectorControls group="styles">
						<PanelColorSettings
							title={__('Before & After Block Styles', 'portfolio-blocks')}
							initialOpen={true}
							colorSettings={[
								{
									label: __('Slider Handle & Line Color', 'portfolio-blocks'),
									value: sliderColor,
									onChange: (value) => setAttributes({ sliderColor: value }),
								},
								{
									label: __('Label Text Color', 'portfolio-blocks'),
									value: labelTextColor,
									onChange: (value) => setAttributes({ labelTextColor: value }),
								},
								{
									label: __('Label Background Color', 'portfolio-blocks'),
									value: labelBackgroundColor,
									onChange: (value) => setAttributes({ labelBackgroundColor: value }),
								},
							]}
						/>
					</InspectorControls>
				</>
			)}
			<div {...blockProps}>
				{beforeImage?.src && afterImage?.src ? (
					<div className={`pb-before-after-container ${sliderOrientation === 'vertical' ? 'is-vertical' : ''}`} ref={containerRef}>
						<div className="pb-after-wrapper">
							<img ref={afterImageRef} className="pb-after-image" src={afterImage.src} alt={afterImage.alt} />
							{showLabels && (
								<div
									className={`pb-label pb-after-label label-${labelPosition}`}
									style={{
										color: labelTextColor,
										backgroundColor: labelBackgroundColor,
									}}
								>
									{__('After', 'portfolio-blocks')}
								</div>
							)}
						</div>
						<div
							className="pb-before-wrapper"
							style={
								sliderOrientation === 'vertical'
									? { clipPath: `inset(0 0 ${100 - sliderValue}% 0)` }
									: { clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }
							}
						>
							<img
								className="pb-before-image"
								src={beforeImage.src}
								alt={beforeImage.alt}
							/>
							{showLabels && (
								<div
									className={`pb-label pb-before-label label-${labelPosition}`}
									style={{
										color: labelTextColor,
										backgroundColor: labelBackgroundColor,
									}}
								>
									{__('Before', 'portfolio-blocks')}
								</div>
							)}
						</div>
						<input
							type="range"
							min="0"
							max="100"
							value={sliderOrientation === 'vertical' ? 100 - sliderValue : sliderValue}
							className={`pb-slider ${sliderOrientation === 'vertical' ? 'is-vertical' : ''}`}
							onChange={(e) =>
								sliderOrientation === 'vertical'
									? setSliderValue(100 - Number(e.target.value))
									: setSliderValue(Number(e.target.value))
							}
						/>
						<div
							className="pb-slider-handle"
							style={{
								...(sliderOrientation === 'vertical'
									? { top: `${sliderValue}%` }
									: { left: `${sliderValue}%` }),
								'--pb-slider-color': sliderColor,
								backgroundColor: sliderColor,
							}}
						></div>
					</div>
				) : (
					<CustomPlaceholder
						beforeImage={beforeImage}
						afterImage={afterImage}
						onSelectBefore={handleBeforeSelect}
						onSelectAfter={handleAfterSelect}
					/>
				)}
			</div>
		</>
	);
}
