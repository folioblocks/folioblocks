/**
 * Masonry Gallery Block
 * Save JS
 */

import { InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { columns = 4, columnsTablet = 3, columnsMobile = 2 } = attributes;

	const classes = `pb-masonry-gallery cols-d-${ columns } cols-t-${ columnsTablet } cols-m-${ columnsMobile }`;

	return (
		<div className={ classes }>
			<InnerBlocks.Content />
		</div>
	);
}
