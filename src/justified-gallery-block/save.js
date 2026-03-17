/**
 * Justified Gallery Block
 * Save JS
 */
import { InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const rowHeight = attributes.rowHeight ?? 250;
	const noGap = attributes.noGap ?? false;
	const tabletRowHeight =
		typeof attributes.tabletRowHeight === 'number'
			? attributes.tabletRowHeight
			: undefined;
	const mobileRowHeight =
		typeof attributes.mobileRowHeight === 'number'
			? attributes.mobileRowHeight
			: undefined;
	const classes = 'pb-justified-gallery';

	return (
		<div
			className={ classes }
			data-row-height={ rowHeight }
			{ ...( typeof tabletRowHeight === 'number'
				? { 'data-tablet-row-height': tabletRowHeight }
				: {} ) }
			{ ...( typeof mobileRowHeight === 'number'
				? { 'data-mobile-row-height': mobileRowHeight }
				: {} ) }
			data-no-gap={ noGap ? 'true' : 'false' }
		>
			<InnerBlocks.Content />
		</div>
	);
}
