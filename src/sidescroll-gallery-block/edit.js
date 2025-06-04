import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaPlaceholder,
	BlockControls
} from '@wordpress/block-editor';
import { PanelBody, ToggleControl, Button, RangeControl, SelectControl, BaseControl, ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { useEffect, useRef, Fragment } from '@wordpress/element';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
	const { images, scrollDirection, scrollSpeed, slideHeight, pauseOnHover, showCaptionOnHover } = attributes;
	const trackRef = useRef(null);
	const scrollAmount = useRef(0);
	const isPaused = useRef(false); // Track pause state

	const blockProps = useBlockProps({
		style: { '--slide-height': `${slideHeight}px` }
	});

	useEffect(() => {
		const track = trackRef.current;
		let animationFrameId;

		if (!track) return;

		const speed = scrollSpeed * 0.5;

		const scrollGallery = () => {
			if (!isPaused.current) {
				if (scrollDirection === 'left') {
					scrollAmount.current -= speed;
					if (Math.abs(scrollAmount.current) > track.scrollWidth / 2) {
						scrollAmount.current = 0; // Reset for smooth looping
					}
				} else {
					scrollAmount.current += speed;
					if (scrollAmount.current >= 0) {
						scrollAmount.current = -track.scrollWidth / 2; // Loop from last image back to first
					}
				}

				track.style.transform = `translateX(${scrollAmount.current}px)`;

				if (Math.abs(scrollAmount.current) > track.scrollWidth / 2) {
					scrollAmount.current = 0;
				}
			}

			animationFrameId = requestAnimationFrame(scrollGallery);
		};

		animationFrameId = requestAnimationFrame(scrollGallery);

		// Add or remove event listeners based on pauseOnHover
		const handleMouseEnter = () => { isPaused.current = true; };
		const handleMouseLeave = () => { isPaused.current = false; };

		if (pauseOnHover) {
			track.addEventListener('mouseenter', handleMouseEnter);
			track.addEventListener('mouseleave', handleMouseLeave);
		} else {
			track.removeEventListener('mouseenter', handleMouseEnter);
			track.removeEventListener('mouseleave', handleMouseLeave);
		}

		return () => {
			cancelAnimationFrame(animationFrameId);
			track.removeEventListener('mouseenter', handleMouseEnter);
			track.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, [scrollDirection, scrollSpeed, pauseOnHover]);


	useEffect(() => {
		if (!images || images.length === 0) return;

		// Check if captions are already set, to prevent infinite updates
		const hasMissingCaptions = images.some(image => image.id && !image.title);

		if (!hasMissingCaptions) return; // Prevent infinite loop

		const updatedImages = images.map((image) => {
			if (!image.id) return image; // Skip images without an ID

			const media = wp.data.select('core').getMedia(image.id);
			if (media && media.caption) {
				const decodeEntities = (html) => {
					const txt = document.createElement("textarea");
					txt.innerHTML = html;
					return txt.value;
				};

				const cleanCaption = media.caption?.rendered
					? decodeEntities(media.caption.rendered.replace(/<\/?p>/g, ''))
					: image.title;

				return { ...image, title: cleanCaption };
			}
			return image;
		});

		setAttributes({ images: updatedImages });
	}, [images, setAttributes]); //

	const addMoreImages = () => {
		const frame = wp.media({
			title: __('Select Images', 'sidescroll-gallery-block'),
			multiple: true,
			library: { type: 'image' },
			button: { text: __('Add Images', 'sidescroll-gallery-block') }
		});

		frame.on('select', () => {
			const selectedImages = frame.state().get('selection').map((img) => img.toJSON());
			setAttributes({ images: [...images, ...selectedImages] });
		});

		frame.open();
	};

	const reArrangeGallery = () => {
		const frame = wp.media.gallery.edit('[gallery ids="' + images.map(img => img.id).join(',') + '"]');

		frame.on('update', (newSelection) => {
			const updatedImages = newSelection.models.map((img) => img.toJSON());
			setAttributes({ images: updatedImages });
		});

		frame.open();
	};

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={null}
						label={__('Add Images', 'portfolio-blocks')}
						onClick={() => {
							const frame = wp.media({
								title: __('Select Images', 'portfolio-blocks'),
								multiple: true,
								library: { type: 'image' },
								button: { text: __('Add Images', 'portfolio-blocks') }
							});

							frame.on('select', () => {
								const selectedImages = frame.state().get('selection').map((img) => img.toJSON());
								setAttributes({ images: [...images, ...selectedImages] });
							});

							frame.open();
						}}
					>
						{__('Add Images', 'portfolio-blocks')}
					</ToolbarButton>
					<ToolbarButton
						icon={null}
						label={__('Edit', 'portfolio-blocks')}
						onClick={() => {
							const frame = wp.media.gallery.edit('[gallery ids="' + images.map(img => img.id).join(',') + '"]');

							frame.on('update', (newSelection) => {
								const updatedImages = newSelection.models.map((img) => img.toJSON());
								setAttributes({ images: updatedImages });
							});

							frame.open();
						}}
					>
						{__('Edit Gallery', 'portfolio-blocks')}
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={__('Sidescroll Settings', 'portfolio-blocks')} initialOpen={true}>
					{images.length > 0 && (
						<Fragment>
							<div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
								<Button variant="primary" size="default" onClick={addMoreImages}>
									{__('Add Images', 'portfolio-blocks')}
								</Button>
								<Button variant="secondary" size="default" onClick={reArrangeGallery}>
									{__('Edit Gallery', 'portfolio-blocks')}
								</Button>
							</div>
							<BaseControl __nextHasNoMarginBottom>
								{__('Use the buttons to add more images to your gallery or adjust the order of images.', 'portfolio-blocks')}
							</BaseControl>
						</Fragment>
					)}
					<hr style={{ border: '0.5px solid #e0e0e0', margin: '12px 0' }} />

					<RangeControl
						label={__('Slide Height', 'portfolio-blocks')}
						value={slideHeight}
						onChange={(value) => setAttributes({ slideHeight: value })}
						min={100}
						max={800}
						help={__('Set the default height of images in the slideshow.', 'sidescroll-gallery-block')}
					/>
					<SelectControl
						label={__('Scroll Direction', 'portfolio-blocks')}
						value={scrollDirection}
						options={[
							{ label: __('Left', 'portfolio-blocks'), value: 'left' },
							{ label: __('Right', 'portfolio-blocks'), value: 'right' },
						]}
						onChange={(value) => setAttributes({ scrollDirection: value })}
						help={__('Set the default scroll direction of the slideshow.', 'sidescroll-gallery-block')}
						__nextHasNoMarginBottom
					/>
					<RangeControl
						label={__('Scroll Speed', 'portfolio-blocks')}
						value={scrollSpeed}
						onChange={(value) => setAttributes({ scrollSpeed: value })}
						min={1}
						max={20}
						help={__('Randomize image order on front-end.', 'masonry-gallery-block')}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={__('Pause on Hover', 'portfolio-blocks')}
						checked={pauseOnHover}
						onChange={(value) => setAttributes({ pauseOnHover: value })}
						help={__('Pause slideshow on hover.', 'sidescroll-gallery-block')}
						__nextHasNoMarginBottom
					/>
					{pauseOnHover && (
						<ToggleControl
							label={__('Show Caption on Hover', 'portfolio-blocks')}
							checked={showCaptionOnHover}
							onChange={(value) => setAttributes({ showCaptionOnHover: value })}
							help={__('Show image captions only when hovered.', 'sidescroll-gallery-block')}
							__nextHasNoMarginBottom
						/>
					)}
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{images.length === 0 ? (
					<MediaPlaceholder
						icon="format-gallery"
						labels={{ title: __('Add Images', 'portfolio-blocks') }}
						onSelect={(media) => {
							if (!media || media.length === 0) return;
							const newImages = media.map(image => ({
								id: image.id,
								src: image.url,
								alt: image.alt || '',
								title: image.title || '',
							}));
							setAttributes({ images: newImages });
						}}
						allowedTypes={['image']}
						multiple
					/>
				) : (
					<div className="be-pb-sidescroll-gallery">
						<div className="be-pb-sidescroll-gallery-track" ref={trackRef}>
							{images.concat(images).map((image, index) => (
								<figure key={index} className="be-pb-sidescroll-gallery-item">
									<div className="be-pb-sidescroll-gallery-image-wrapper">
										<img src={image.src} alt={image.alt} />
									</div>
									{showCaptionOnHover && image.title && (
										<figcaption className="be-pb-sidescroll-gallery-caption">{image.title}</figcaption>
									)}
								</figure>
							))}
						</div>
					</div>
				)}
			</div>
		</>
	);
}