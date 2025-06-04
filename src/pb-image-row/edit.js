import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { BlockControls, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { decodeEntities } from '@wordpress/html-entities';
import ModularGalleryIcon from '../pb-helpers/ModularGalleryIcon';

const ALLOWED_BLOCKS = ['portfolio-blocks/pb-image-block', 'portfolio-blocks/pb-image-stack'];

export default function Edit({ clientId, context }) {
	const MAX_IMAGES = 8;
	const { replaceInnerBlocks } = useDispatch('core/block-editor');
	const noGap = context?.['portfolioBlocks/noGap'] || false;
	const layoutVersion = context?.['portfolioBlocks/layoutVersion'];

	const innerBlocks = useSelect(
		(select) => select('core/block-editor').getBlocks(clientId),
		[clientId]
	);

	const containerRef = useRef(null);

	function waitForImages(container, callback) {
		const images = container.querySelectorAll('img');
		if (!images.length) return callback();

		let loaded = 0;
		images.forEach((img) => {
			if (img.complete) {
				loaded++;
			} else {
				img.addEventListener('load', handleLoad, { once: true });
				img.addEventListener('error', handleLoad, { once: true });
			}
		});

		if (loaded === images.length) callback();

		function handleLoad() {
			loaded++;
			if (loaded === images.length) {
				callback();
			}
		}
	}

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'pb-image-row', ref: containerRef },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			orientation: 'horizontal',
		}
	);

	const addImageBlock = async () => {
		if (innerBlocks.length >= MAX_IMAGES) return;

		const mediaFrame = wp.media({
			title: __('Select Image', 'portfolio-blocks'),
			multiple: false,
			library: { type: 'image' },
			button: { text: __('Add Image', 'portfolio-blocks') },
		});

		mediaFrame.on('select', async () => {
			const image = mediaFrame.state().get('selection').first().toJSON();

			// Fetch the full media object to get the title
			try {
				const response = await wp.apiFetch({
					path: `/wp/v2/media/${image.id}`
				});

				const title = decodeEntities(response.title?.rendered || '');

				const newBlock = createBlock('portfolio-blocks/pb-image-block', {
					id: image.id,
					src: image.url,
					alt: image.alt || '',
					title: title,
					caption: image.caption || '',
					sizes: image.sizes || {},
					width: image.width || 0,
					height: image.height || 0,
				});

				replaceInnerBlocks(clientId, [...innerBlocks, newBlock], false);

			} catch (error) {
				console.error("Failed to fetch image title:", error);
			}
		});

		mediaFrame.open();
	};

	useEffect(() => {
		if (innerBlocks.length === 0) {
			const defaultBlock = createBlock('portfolio-blocks/pb-image-block');
			replaceInnerBlocks(clientId, [defaultBlock], false);
		}
	}, [innerBlocks, clientId, replaceInnerBlocks]);

	useEffect(() => {
		if (innerBlocks.length > MAX_IMAGES) {
			const trimmedBlocks = innerBlocks.slice(0, MAX_IMAGES);
			replaceInnerBlocks(clientId, trimmedBlocks, false);
		}
	}, [innerBlocks, clientId, replaceInnerBlocks]);

	useEffect(() => {
		if (!containerRef.current) return;
		const container = containerRef.current;

		const waitForImages = (containerEl, callback) => {
			const images = Array.from(containerEl.querySelectorAll('img'));
			if (images.length === 0) return callback();

			let loadedCount = 0;
			const checkIfDone = () => {
				loadedCount++;
				if (loadedCount === images.length) callback();
			};

			images.forEach((img) => {
				if (img.complete && img.naturalWidth && img.naturalHeight) {
					checkIfDone();
				} else {
					img.onload = checkIfDone;
					img.onerror = checkIfDone;
				}
			});
		};

		const recalculateLayout = () => {
			if (!containerRef.current) return;
			const wrappers = Array.from(containerRef.current.children).filter((child) =>
				child.classList.contains('pb-image-block-wrapper') || child.classList.contains('wp-block-portfolio-blocks-pb-image-stack')
			);

			if (!wrappers.length) return;

			const containerWidth = containerRef.current.clientWidth;
			const gap = noGap ? 0 : 10;
			const totalGaps = gap * (wrappers.length - 1);

			const aspectRatios = [];
			let totalNaturalWidth = 0;

			wrappers.forEach((wrapper) => {
				let ratio;

				if (wrapper.classList.contains('pb-image-block-wrapper')) {
					const img = wrapper.querySelector('img');
					if (img && img.naturalWidth && img.naturalHeight) {
						ratio = img.naturalWidth / img.naturalHeight;
					}
				} else if (wrapper.classList.contains('wp-block-portfolio-blocks-pb-image-stack')) {
					const images = wrapper.querySelectorAll('img');
					let totalStackHeight = 0;
					const stackGaps = noGap ? 0 : (images.length - 1) * 10;

					images.forEach((img) => {
						if (img.naturalWidth && img.naturalHeight) {
							totalStackHeight += img.naturalHeight / img.naturalWidth;
						}
					});

					if (totalStackHeight > 0) {
						ratio = 1 / (totalStackHeight + (stackGaps / containerWidth));
					}
				}

				if (ratio) {
					aspectRatios.push(ratio);
					totalNaturalWidth += ratio;
				}
			});

			if (aspectRatios.length !== wrappers.length || totalNaturalWidth === 0) return;

			const targetHeight = Math.round((containerWidth - totalGaps) / totalNaturalWidth);

			let usedWidth = 0;
			const widths = aspectRatios.map((ratio) => Math.floor(ratio * targetHeight));
			widths.forEach((width) => {
				usedWidth += width;
			});
			const remainingWidth = containerWidth - usedWidth - totalGaps;

			const widthAdjustments = new Array(wrappers.length).fill(0);
			for (let i = 0; i < remainingWidth; i++) {
				widthAdjustments[i % wrappers.length]++;
			}

			wrappers.forEach((wrapper, index) => {
				const finalWidth = widths[index] + widthAdjustments[index];

				if (wrapper.classList.contains('pb-image-block-wrapper')) {
					const figure = wrapper.querySelector('.pb-image-block');
					if (figure) {
						figure.style.width = `${finalWidth}px`;
						figure.style.height = `${targetHeight}px`;
						figure.style.marginRight = index === wrappers.length - 1 ? '0' : `${gap}px`;
					}
				} else if (wrapper.classList.contains('wp-block-portfolio-blocks-pb-image-stack')) {
					wrapper.style.width = `${finalWidth}px`;
					wrapper.style.height = `${targetHeight}px`;
					wrapper.style.marginRight = index === wrappers.length - 1 ? '0' : `${gap}px`;

					const images = wrapper.querySelectorAll('img');
					const stackGaps = noGap ? 0 : 10;
					let totalNaturalHeight = 0;
					const naturalHeights = [];

					images.forEach((img) => {
						if (img.naturalWidth && img.naturalHeight) {
							const ratio = img.naturalHeight / img.naturalWidth;
							naturalHeights.push(ratio);
							totalNaturalHeight += ratio;
						}
					});

					const totalStackGaps = noGap ? 0 : (images.length - 1) * 10;
					const usableHeight = targetHeight - totalStackGaps;

					images.forEach((img, imgIndex) => {
						const figure = img.closest('.pb-image-block');
						if (figure && naturalHeights[imgIndex] !== undefined) {
							const share = naturalHeights[imgIndex] / totalNaturalHeight;
							const scaledHeight = Math.round(share * usableHeight);
							figure.style.height = `${scaledHeight}px`;
							figure.style.marginBottom = (noGap || imgIndex === images.length - 1) ? '0px' : '10px';
						}
					});
				}
			});
		};

		const observer = new MutationObserver(() => {
			waitForImages(container, () => {
				requestAnimationFrame(() => {
					recalculateLayout();
				});
			});
		});
		observer.observe(container, { childList: true, subtree: true, attributes: true });

		waitForImages(container, () => {
			requestAnimationFrame(() => {
				recalculateLayout();
			});
		});

		const onResize = () => {
			waitForImages(container, () => {
				requestAnimationFrame(() => {
					recalculateLayout();
				});
			});
		};
		window.addEventListener('resize', onResize);

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', onResize);
		};
	}, [innerBlocks, noGap, layoutVersion]);

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={plus}
						label={__('Add Image', 'portfolio-blocks')}
						onClick={addImageBlock}
						disabled={innerBlocks.length >= MAX_IMAGES}
					>
						{__('Add Image', 'portfolio-blocks')}
					</ToolbarButton>
					<ToolbarButton
						icon={plus}
						label={__('Add Image Stack', 'portfolio-blocks')}
						onClick={() => {
							const newStackBlock = createBlock('portfolio-blocks/pb-image-stack');
							replaceInnerBlocks(clientId, [...innerBlocks, newStackBlock], false);
						}}
						disabled={innerBlocks.length >= MAX_IMAGES}
					>
						{__('Add Image Stack', 'portfolio-blocks')}
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<div {...useBlockProps()}>
				<div {...innerBlocksProps} />
			</div>
		</>
	);
}