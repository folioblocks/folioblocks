/**
 * PB Image Block
 * Deprecated JS
 **/
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { useEffect } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';

/**
 * Old attributes, matching the legacy pb-image-block exactly
 */
const legacyAttributes = {
	id: { type: 'number', default: 0 },
	src: { type: 'string', default: '' },
	imageSize: { type: 'string', default: 'large' },
	sizes: { type: 'object', default: {} },
	width: { type: 'number', default: 0 },
	height: { type: 'number', default: 0 },
	borderColor: { type: 'string', default: '' },
	borderWidth: { type: 'number', default: 0 },
	borderRadius: { type: 'number', default: 0 },
	alt: { type: 'string', default: '' },
	caption: { type: 'string', default: '' },
	title: { type: 'string', default: '' },
	class: { type: 'string', default: '' },
	enableLightbox: { type: 'boolean', default: false },
	showCaptionInLightbox: { type: 'boolean', default: false },
	showTitleOnHover: { type: 'boolean', default: false },
	dropshadow: { type: 'boolean', default: false },
	filterCategory: { type: 'string', default: '' },
	enableDownload: { type: 'boolean' },
	downloadOnHover: { type: 'boolean' },
	lazyLoad: { type: 'boolean', default: false },
	wooProductId: { type: 'number', default: 0 },
	wooProductName: { type: 'string', default: '' },
	wooProductPrice: { type: 'string', default: '' },
	wooProductImage: { type: 'string', default: '' },
	wooProductDescription: { type: 'string', default: '' },
	wooProductURL: { type: 'string', default: '' },
};

/**
 * Register the OLD block namespace as a migration shim.
 * This MUST be loaded alongside the new block registration.
 */
registerBlockType('portfolio-blocks/pb-image-block', {
	apiVersion: 3,
	title: 'PB Image Block (Legacy)',
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
				'folioblocks/pb-image-block',
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