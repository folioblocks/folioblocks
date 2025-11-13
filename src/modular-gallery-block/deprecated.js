/**
 * Modular Gallery Block
 * Deprecated JS
 **/
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { useEffect } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';

/**
 * Old attributes, matching the legacy modular-gallery-block exactly
 */
const legacyAttributes = {
	preview: { type: 'boolean', default: false },
	resolution: { type: 'string', default: 'large' },
	collapseOnMobile: { type: 'boolean', default: false },
	dropShadow: { type: 'boolean', default: false },
	borderWidth: { type: 'number', default: 0 },
	borderRadius: { type: 'number', default: 0 },
	borderColor: { type: 'string', default: '#ffffff' },
	noGap: { type: 'boolean', default: false },
	disableRightClick: { type: 'boolean', default: false },
	lazyLoad: { type: 'boolean', default: false },
	lightbox: { type: 'boolean', default: false },
	lightboxCaption: { type: 'boolean', default: false },
	onHoverTitle: { type: 'boolean', default: false },
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
};

/**
 * Register the OLD block namespace as a migration shim.
 */
registerBlockType('portfolio-blocks/modular-gallery-block', {
	title: 'Modular Gallery (Legacy)',
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
				'folioblocks/modular-gallery-block',
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