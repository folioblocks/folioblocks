/**
 * Carousel Gallery Block
 * Deprecated JS
 **/
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { useEffect } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';

/**
 * Old attributes, matching the legacy carousel-gallery-block exactly
 */
const legacyAttributes = {
	preview: { type: 'boolean', default: false },
	resolution: { type: 'string', default: 'large' },
	verticalOnMobile: { type: 'boolean', default: false },
	carouselHeight: { type: 'number', default: 300 },
	borderWidth: { type: 'number', default: 0 },
	borderRadius: { type: 'number', default: 0 },
	borderColor: { type: 'string', default: '#ffffff' },
	dropShadow: { type: 'boolean', default: false },
	lightbox: { type: 'boolean', default: false },
	lightboxCaption: { type: 'boolean', default: false },
	onHoverTitle: { type: 'boolean', default: false },
	randomizeOrder: { type: 'boolean', default: false },
	disableRightClick: { type: 'boolean', default: false },
	lazyLoad: { type: 'boolean', default: false },
	enableFilter: { type: 'boolean', default: false },
	enableDownload: { type: 'boolean', default: false },
	downloadOnHover: { type: 'boolean', default: false },
	hasWooCommerce: { type: 'boolean', default: false },
	enableWooCommerce: { type: 'boolean', default: false },
	wooCartIconDisplay: {
		type: 'string',
		enum: ['hover', 'always'],
		default: 'hover',
	},
	wooLightboxInfoType: {
		type: 'string',
		enum: ['caption', 'product'],
		default: 'caption',
	},
	wooProductPriceOnHover: { type: 'boolean', default: true },
	inCarousel: { type: 'boolean', default: true },
	showControls: { type: 'boolean', default: false },
	autoplay: { type: 'boolean', default: false },
	loopSlides: { type: 'boolean', default: false },
	controlsAlignment: { type: 'string', default: 'center' },
	controlsBackgroundColor: { type: 'string', default: 'rgba(0, 0, 0, 0.5)' },
	controlsIconColor: { type: 'string', default: '#ffffff' },
	images: {
		type: 'array',
		default: [],
		items: {
			type: 'object',
			properties: {
				id: { type: 'number' },
				src: { type: 'string' },
				alt: { type: 'string' },
				title: { type: 'string' },
				caption: { type: 'string' },
				sizes: { type: 'object' },
				width: { type: 'number' },
				height: { type: 'number' },
				filterCategory: { type: 'string' },
			},
		},
	},
};

/**
 * Register the OLD block namespace as a migration shim.
 * This MUST be loaded alongside the new block registration.
 */
registerBlockType('portfolio-blocks/carousel-gallery-block', {
	apiVersion: 3,
	title: 'Carousel Gallery (Legacy)',
	category: 'widgets',
	attributes: legacyAttributes,

	supports: {
		inserter: false,
		html: false,
	},

	/**
	 * On mount, immediately replace this legacy block instance
	 * with the new block, preserving attributes and any inner blocks.
	 */
	edit(props) {
		const { clientId, attributes, innerBlocks } = props;
		const { replaceBlocks } = useDispatch('core/block-editor');

		useEffect(() => {
			const newBlock = createBlock(
				'folioblocks/carousel-gallery-block',
				{ ...attributes },
				innerBlocks
			);
			replaceBlocks(clientId, newBlock);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		return null; // No UI – auto-migrates silently
	},

	// No save output so Gutenberg triggers edit() for migration
	save() {
		return null;
	},
});

export default null;