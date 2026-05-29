/**
 * Masonry Gallery Block
 * Save JS
 */

import { InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { columns = 6, tabletColumns = 4, mobileColumns = 2 } = attributes;

	const classes = `pb-masonry-gallery cols-d-${ columns } cols-t-${ tabletColumns } cols-m-${ mobileColumns }`;

	return (
		<div className={ classes }>
			<InnerBlocks.Content />
		</div>
	);
}
