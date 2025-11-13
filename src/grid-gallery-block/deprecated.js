/**
 * Grid Gallery Block
 * Deprecated JS
 **/
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { useEffect } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';

/**
 * Old attributes, matching the legacy grid-gallery-block exactly
 */
const legacyAttributes = {
	preview: { type: 'boolean', default: false },
	isGridGallery: { type: 'boolean', default: true },
	columns: { type: 'number', default: 6 },
	tabletColumns: { type: 'number', default: 4 },
	mobileColumns: { type: 'number', default: 2 },
	resolution: { type: 'string', default: 'large' },
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
	filterCategories: { type: 'array', items: { type: 'string' }, default: [] },
	filtersInput: { type: 'string', default: '' },
	filterAlign: { type: 'string', default: 'center' },
	filterTextColor: { type: 'string', default: '#000000' },
	filterBgColor: { type: 'string', default: 'transparent' },
	activeFilterTextColor: { type: 'string', default: '#ffffff' },
	activeFilterBgColor: { type: 'string', default: '#000000' },
	activeFilter: { type: 'string', default: 'All' },
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
 */
registerBlockType('portfolio-blocks/grid-gallery-block', {
	title: 'Grid Gallery (Legacy)',
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
				'folioblocks/grid-gallery-block',
				{ ...attributes },
				innerBlocks
			);
			replaceBlocks(clientId, newBlock);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		return null; // No UI – auto-migrates silently
	},

	save() {
		return null; // No save output so Gutenberg triggers edit() for migration
	},
});

export default null;