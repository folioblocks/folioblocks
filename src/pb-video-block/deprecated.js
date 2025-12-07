/**
 * PB Video Block
 * Deprecated JS
 **/
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { useEffect } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';

/**
 * Old attributes, matching the legacy pb-video-block exactly
 */
const legacyAttributes = {
	videoUrl: { type: 'string', default: '' },
	thumbnail: { type: 'string', default: '' },
	title: { type: 'string', default: '' },
	description: { type: 'string', default: '' },
	aspectRatio: { type: 'string', default: '16:9' },
	playButtonVisibility: { type: 'string', default: 'onHover' },
	titleVisibility: { type: 'string', default: 'onHover' },
	filterCategory: { type: 'string', default: '' },
	thumbnailSize: { type: 'string', default: 'large' },
	thumbnailId: { type: 'number' },
	borderWidth: { type: 'number', default: 0 },
	borderRadius: { type: 'number', default: 0 },
	borderColor: { type: 'string', default: '#ffffff' },
	dropShadow: { type: 'boolean', default: false },
	lazyLoad: { type: 'boolean', default: false },
	lightboxLayout: { type: 'string', default: 'video-only' },
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
registerBlockType('portfolio-blocks/pb-video-block', {
	apiVersion: 3,
	title: 'PB Video Block (Legacy)',
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
				'folioblocks/pb-video-block',
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