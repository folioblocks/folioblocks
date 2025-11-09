/**
 * Justified Gallery Block
 * Save JS
 **/
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
	const { rowHeight = 250, noGap = false } = attributes;
	const classes = 'pb-justified-gallery';

	return (
		<div
			className={classes}
			data-row-height={rowHeight}
			data-no-gap={noGap ? 'true' : 'false'}
		>
			<InnerBlocks.Content />
		</div>
	);
}