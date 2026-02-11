/**
 * Before & After Block
 * Deprecated JS
 */
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { useEffect } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';

/**
 * Old attributes, matching the legacy block exactly
 */
const legacyAttributes = {
	preview: { type: 'boolean', default: false },
	beforeImage: { type: 'object', default: null },
	afterImage: { type: 'object', default: null },
	resolution: { type: 'string', default: 'large' },
	sliderOrientation: { type: 'string', default: 'horizontal' },
	startingPosition: { type: 'number', default: 50 },
	showLabels: { type: 'boolean', default: false },
	labelPosition: { type: 'string', default: 'center' },
	labelTextColor: { type: 'string', default: '#ffffff' },
	labelBackgroundColor: { type: 'string', default: 'rgba(0, 0, 0, 0.6)' },
	sliderColor: { type: 'string', default: '#ffffff' },
	disableRightClick: { type: 'boolean', default: false },
	lazyLoad: { type: 'boolean', default: false },
};

/**
 * Register the OLD block namespace as a migration shim.
 * This MUST be loaded alongside the new block registration.
 */
registerBlockType( 'portfolio-blocks/before-after-block', {
	apiVersion: 3,
	title: 'Before & After (Legacy)',
	category: 'widgets',
	attributes: legacyAttributes,

	supports: {
		inserter: false,
		html: false,
	},

	/**
	 * On mount, immediately replace this legacy block instance
	 * with the new block, preserving attributes and any inner blocks.
	 * @param props
	 */
	edit( props ) {
		const { clientId, attributes, innerBlocks } = props;
		const { replaceBlocks } = useDispatch( 'core/block-editor' );

		useEffect( () => {
			const newBlock = createBlock(
				'folioblocks/before-after-block',
				{ ...attributes },
				innerBlocks
			);
			replaceBlocks( clientId, newBlock );
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [] );

		return null; // No UI – auto-migrates silently
	},

	// No save output so Gutenberg triggers edit() for migration
	save() {
		return null;
	},
} );

export default null;
