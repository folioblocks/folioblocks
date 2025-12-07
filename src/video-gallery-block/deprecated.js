/**
 * Video Gallery Block
 * Deprecated JS
 **/
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { useEffect } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';

/**
 * Old attributes, matching the legacy video-gallery-block exactly
 */
const legacyAttributes = {
	preview: { type: 'boolean', default: false },
	columns: { type: 'number', default: 3 },
	tabletColumns: { type: 'number', default: 2 },
	mobileColumns: { type: 'number', default: 1 },
	gap: { type: 'number', default: 10 },
	enableWooCommerce: { type: 'boolean', default: false },
	wooCartIconDisplay: { type: 'string', enum: ['hover', 'always'], default: 'hover' },
	wooLightboxInfoType: { type: 'string', enum: ['caption', 'product'], default: 'caption' },
	disableRightClick: { type: 'boolean', default: false },
	lazyLoad: { type: 'boolean', default: false },
	borderWidth: { type: 'number', default: 0 },
	borderRadius: { type: 'number', default: 0 },
	borderColor: { type: 'string', default: '#ffffff' },
	dropShadow: { type: 'boolean', default: false },
	aspectRatio: { type: 'string', default: '16:9' },
	playButtonVisibility: { type: 'string', default: 'onHover' },
	titleVisibility: { type: 'string', default: 'onHover' },
	filterCategories: { type: 'array', items: { type: 'string' }, default: [] },
	enableFilter: { type: 'boolean', default: false },
	filterAlign: { type: 'string', default: 'center' },
	lightbox: { type: 'boolean', default: true },
	lightboxLayout: { type: 'string', default: 'video-only' },
	thumbnailSize: { type: 'string', default: 'large' },
	filterTextColor: { type: 'string', default: '#000000' },
	filterBgColor: { type: 'string', default: 'transparent' },
	activeFilterTextColor: { type: 'string', default: '#ffffff' },
	activeFilterBgColor: { type: 'string', default: '#000000' },
	videos: {
		type: 'array',
		default: [],
		items: {
			type: 'object',
			properties: {
				thumbnail: { type: 'string' },
				videoUrl: { type: 'string' },
				title: { type: 'string' },
				aspectRatio: { type: 'string' },
				playButtonVisibility: { type: 'string' },
				titleVisibility: { type: 'string' },
				filterCategory: { type: 'string' },
			},
		},
	},
};

/**
 * Register the OLD block namespace as a migration shim.
 * This MUST be loaded alongside the new block registration.
 */
registerBlockType('portfolio-blocks/video-gallery-block', {
	apiVersion: 3,
	title: 'Video Gallery (Legacy)',
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
				'folioblocks/video-gallery-block',
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